# ./backend/chat-service/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama

# Pydantic model to define the structure of the request body
class ChatMessage(BaseModel):
    message: str

app = FastAPI()

# Add CORS middleware to allow requests from our frontend
origins = [
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat_with_ollama(chat_message: ChatMessage):
    """
    Receives a message, sends it to Ollama, and returns the full response.
    """
    # The 'host' parameter is crucial for connecting from a Docker container
    # to the Ollama server running on your host machine.
    client = ollama.Client(host='host.docker.internal')
    
    response = client.chat(
        model='llama3:8b', 
        messages=[
            {
                'role': 'user',
                'content': chat_message.message,
            },
        ]
    )
    
    # Extract and return the message content from the response
    return {"response": response['message']['content']}