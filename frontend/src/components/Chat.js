// src/components/Chat.js

import React, { useState } from 'react';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    // Add user message and a placeholder for the bot's response
    setMessages(prev => [...prev, userMessage, { role: 'assistant', content: '' }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8002/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
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
            lastMessage.content += contentChunk;
            return [...prev.slice(0, -1), lastMessage];
          });
        }
      }
    } catch (error) {
      console.error('Error fetching chat response:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Przepraszam, wystąpił błąd.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.chatContainer}>
      <div style={styles.messageList}>
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
          placeholder="Zapytaj o coś..."
          style={styles.input}
          disabled={isLoading}
        />
        <button type="submit" style={styles.button} disabled={isLoading}>
          {isLoading ? '...' : 'Wyślij'}
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
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f1f1',
    color: 'black',
    padding: '10px 15px',
    borderRadius: '20px',
    maxWidth: '70%',
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
  }
};

export default Chat;