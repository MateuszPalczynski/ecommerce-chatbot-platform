// src/components/Chat.js

import React, { useState } from 'react';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const conversationStarters = [
    "What t-shirts sizes are available?",
    "Tell me about new products.",
    "What are your payment options?",
    "Can I return my order?",
    "What are the delivery costs?",
  ];

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = { role: 'user', content: messageText };
    // Add user message and a placeholder for the bot's response
    setMessages(prev => [...prev, userMessage, { role: 'assistant', content: '' }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8002/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        // The backend sends newline-delimited JSON, so we split by newline
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          const parsed = JSON.parse(line);
          const contentChunk = parsed.response_chunk;
          
          // Append the new chunk to the last message (the bot's response)
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            // Ensure lastMessage exists before trying to modify it
            if (lastMessage) {
                lastMessage.content += contentChunk;
                return [...prev.slice(0, -1), lastMessage];
            }
            return prev;
          });
        }
      }
    } catch (error) {
      console.error('Error fetching chat response:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, an error has occurred.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
    setInput('');
  };

  const handleStarterClick = (starterText) => {
    sendMessage(starterText);
  };


  return (
    <div style={styles.chatContainer}>
      <div style={styles.messageList}>
        {/* --- NEW: Show starters only if the chat is empty --- */}
        {messages.length === 0 && (
          <div style={styles.startersContainer}>
            <p style={{textAlign: 'center', color: '#666'}}>How can I help you?</p>
            {conversationStarters.map((starter, index) => (
              <button key={index} onClick={() => handleStarterClick(starter)} style={styles.starterButton}>
                {starter}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} style={msg.role === 'user' ? styles.userMessage : styles.botMessage}>
            <p style={{ margin: 0 }}>{msg.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} style={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me a question..."
          style={styles.input}
          disabled={isLoading}
        />
        <button type="submit" style={styles.button} disabled={isLoading}>
          {isLoading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

// Basic styles to make it look like a chat window
const styles = {
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '80vh',
    maxWidth: '700px',
    margin: 'auto',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  },
  messageList: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 15px',
    borderRadius: '20px',
    maxWidth: '70%',
    wordWrap: 'break-word',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f1f1',
    color: 'black',
    padding: '10px 15px',
    borderRadius: '20px',
    maxWidth: '70%',
    wordWrap: 'break-word',
  },
  inputForm: {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #ddd',
  },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '20px',
    border: '1px solid #ccc',
    marginRight: '10px',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
  },
  startersContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    padding: '20px 0'
  },
  starterButton: {
    padding: '10px 15px',
    border: '1px solid #007bff',
    borderRadius: '20px',
    backgroundColor: 'white',
    color: '#007bff',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'background-color 0.2s, color 0.2s',
  }
};

export default Chat;