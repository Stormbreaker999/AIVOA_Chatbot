import React, { useState } from "react";
import axios from "axios";
import "./ChatApp.css"; // Ensure you import the updated CSS

const ChatApp = () => {
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Handle sending messages
  const sendMessage = async () => {
    if (userMessage.trim()) {
      try {
        // Send user message to backend
        const response = await axios.post("http://localhost:5000/send-message", { message: userMessage });

        // Update messages with user message and bot response
        setMessages((prevMessages) => [
          ...prevMessages,
          { user: userMessage },
          { bot: response.data.bot_response },
        ]);

        // Clear the input field
        setUserMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { bot: "Sorry, there was an error. Please try again later." },
        ]);
      }
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className="message-container">
            {/* User message */}
            {msg.user && (
              <div className="message user-message">
                <div className="avatar user-avatar"></div>
                <div className="message-content">{msg.user}</div>
              </div>
            )}
            {/* Bot response */}
            {msg.bot && (
              <div className="message bot-message">
                <div className="avatar bot-avatar"></div>
                <div className="message-content">{msg.bot}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="input-box">
        <input
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatApp;
