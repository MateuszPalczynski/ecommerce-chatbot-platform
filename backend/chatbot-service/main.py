# ./backend/chatbot-service/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from starlette.responses import StreamingResponse
import ollama
import json
import asyncio
import os

class ChatMessage(BaseModel):
    message: str

app = FastAPI()

origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def is_topic_relevant(user_message: str) -> bool:
    ollama_host = os.getenv("OLLAMA_HOST", "http://ollama:11434")
    client = ollama.AsyncClient(host=ollama_host)
    
    # --- NEW JSON-BASED PROMPT ---
    system_prompt = (
        "You are a topic classifier. Your task is to determine if the user's question is about an e-commerce store, "
        "its products, clothing, orders, shipping, or payments. "
        "Your response MUST be a valid JSON object with a single key 'is_relevant' which is a boolean (true or false). "
        "Example 1: User asks 'What t-shirt sizes do you have?' -> Your response: {\"is_relevant\": true}. "
        "Example 2: User asks 'What is the weather in Warsaw?' -> Your response: {\"is_relevant\": false}."
    )
    
    try:
        response = await client.chat(
            model='gemma:2b',
            # Ask the model to output JSON
            format='json', 
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_message}
            ],
            options={"temperature": 0.0}
        )
        
        # Parse the JSON response
        answer_json = json.loads(response['message']['content'])
        is_relevant = answer_json.get('is_relevant', False)

        print(f"Topic classification for '{user_message}': {is_relevant}")
        return is_relevant

    except (json.JSONDecodeError, KeyError, Exception) as e:
        # If the model fails to produce valid JSON or another error occurs, fail safely
        print(f"Error during topic classification (defaulting to False): {e}")
        return False

# The rest of the file (ollama_stream_generator, etc.) remains the same
async def ollama_stream_generator(chat_message: ChatMessage):
    ollama_host = os.getenv("OLLAMA_HOST", "http://ollama:11434")
    client = ollama.Client(host=ollama_host)
    
    main_bot_prompt = (
    "You are a helpful and friendly assistant for an online clothing store named 'StyleSphere'. "
    "Your ONLY goal is to answer customer questions about products, sizes, stock, orders, shipping, and payments. "
    "If a user asks about anything else, you MUST politely refuse to answer and gently guide the conversation back to the store. "
    "When the conversation seems to be ending, or if the user says thank you or goodbye, end with a friendly closing remark. "
    "Here are 5 examples of good closing remarks you can use: "
    "1. 'You're welcome! Is there anything else I can help you with today?', "
    "2. 'Glad I could help! Have a great day!', "
    "3. 'Happy to assist! Let me know if you need anything else.', "
    "4. 'No problem! Enjoy your shopping.', "
    "5. 'You got it! Reach out anytime.'"
)

    stream = client.chat(
        model='gemma:2b',
        messages=[
            {'role': 'system', 'content': main_bot_prompt},
            {'role': 'user', 'content': chat_message.message}
        ],
        stream=True
    )

    for chunk in stream:
        content = chunk['message']['content']
        yield json.dumps({"response_chunk": content}) + "\n"

async def off_topic_response_generator():
    canned_response = "I apologize, but I can only discuss topics related to our store, products, and orders. How may I assist you?"
    for word in canned_response.split():
        yield json.dumps({"response_chunk": word + " "}) + "\n"
        await asyncio.sleep(0.05)

@app.post("/chat")
async def chat_with_ollama_stream(chat_message: ChatMessage):
    is_relevant = await is_topic_relevant(chat_message.message)
    
    if is_relevant:
        return StreamingResponse(
            ollama_stream_generator(chat_message), 
            media_type="application/x-ndjson"
        )
    else:
        return StreamingResponse(
            off_topic_response_generator(),
            media_type="application/x-ndjson"
        )