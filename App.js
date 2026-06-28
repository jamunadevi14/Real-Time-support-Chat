import React, { useState, useEffect } from "react";
import io from "socket.io-client";

// Connect to the Backend server running on port 5000
const socket = io("http://localhost:5000");

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [sender, setSender] = useState("");

  useEffect(() => {
    // Listen for incoming messages from the server
    socket.on("receive_message", (newMessage) => {
      setChat((prevChat) => [...prevChat, newMessage]);
    });

    // Clean up the socket connection on unmount
    return () => socket.off("receive_message");
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && sender.trim()) {
      const msgData = { sender, text: message };
      
      // Emit the message to the backend server
      socket.emit("send_message", msgData);
      
      // Instantly show the message on the sender's screen
      setChat((prevChat) => [...prevChat, msgData]);
      setMessage("");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto", fontFamily: "Arial" }}>
      <h2>Real-Time Chat Application</h2>
      
      {/* Chat Display Window */}
      <div style={{ border: "1px solid #ccc", height: "300px", overflowY: "scroll", padding: "10px", marginBottom: "10px", borderRadius: "5px" }}>
        {chat.map((msg, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <span style={{ color: msg.sender === sender ? "#28a745" : "#007bff", fontWeight: "bold" }}>
              {msg.sender}: 
            </span>
            <span> {msg.text}</span>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Enter Your Name"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "8px", boxSizing: "border-box" }}
          required
        />
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: "78%", padding: "8px", boxSizing: "border-box" }}
          required
        />
        <button type="submit" style={{ width: "20%", padding: "8px", marginLeft: "2%", backgroundColor: "#28a745", color: "#fff", border: "none", cursor: "pointer" }}>
          Send
        </button>
      </form>
    </div>
  );
}

export default App;