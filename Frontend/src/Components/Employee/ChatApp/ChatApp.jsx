import React, { useEffect, useState, useMemo, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import "./ChatApp.css";

const ChatApp = ({ userId }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [unread, setUnread] = useState({});
  const messagesEndRef = useRef(null);

  const socket = useMemo(() => io("http://localhost:5000"), []);

  // ✅ Fetch all users
  useEffect(() => {
    if (!userId) return;
    axios
      .get("http://localhost:5000/api/users")
      .then((res) => {
        const list = res.data.filter((u) => u._id !== userId);
        setUsers(list);

        const unreadObj = {};
        list.forEach((u) => (unreadObj[u._id] = 0));
        setUnread(unreadObj);
      })
      .catch((err) => console.error("Failed to fetch users:", err));
  }, [userId]);

  // ✅ Socket register + incoming message
  useEffect(() => {
    if (!userId) return;

    socket.emit("register", { id: userId });

    socket.on("receiveMessage", (msg) => {
      const chatId = msg.senderId === userId ? msg.receiverId : msg.senderId;

      setMessages((prev) => ({
        ...prev,
        [chatId]: prev[chatId] ? [...prev[chatId], msg] : [msg],
      }));

      if (!activeChat || activeChat._id !== chatId) {
        setUnread((prev) => ({ ...prev, [chatId]: (prev[chatId] || 0) + 1 }));
      }
    });

    return () => socket.off("receiveMessage");
  }, [socket, userId, activeChat]);

  // ✅ Fetch conversation history when selecting a chat
  useEffect(() => {
    if (!activeChat || !userId) return;
    axios
      .get(
        `http://localhost:5000/api/messages?senderId=${userId}&receiverId=${activeChat._id}`
      )
      .then((res) => {
        setMessages((prev) => ({ ...prev, [activeChat._id]: res.data }));
        setUnread((prev) => ({ ...prev, [activeChat._id]: 0 }));
      })
      .catch((err) => console.error("Failed to fetch messages:", err));
  }, [activeChat, userId]);

  // ✅ Auto scroll down on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChat]);

  const handleSend = () => {
    if (!newMessage.trim() || !activeChat) return;

    const msg = {
      senderId: userId,
      receiverId: activeChat._id,
      text: newMessage,
      createdAt: new Date(),
    };

    socket.emit("sendMessage", msg);

    setMessages((prev) => {
      const chatId = activeChat._id;
      return {
        ...prev,
        [chatId]: prev[chatId] ? [...prev[chatId], msg] : [msg],
      };
    });

    setNewMessage("");
  };

  // ✅ Safe filtering (handle users without name)
  const filteredUsers = users.filter((u) =>
    (u.name || u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-app">
      {/* Left Sidebar = All members */}
      <div className="chat-sidebar">
        <h3>Company Members</h3>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ul>
          {filteredUsers.map((u) => {
            const lastMsg =
              messages[u._id]?.slice(-1)[0]?.text || "No messages yet";
            return (
              <li
                key={u._id}
                className={activeChat?._id === u._id ? "active" : ""}
                onClick={() => setActiveChat(u)}
              >
                <div className="chat-title">
                  {u.name || u.email}{" "}
                  <span className="role">({u.role || "Unknown"})</span>
                </div>
                <div className="chat-last">{lastMsg}</div>
                {unread[u._id] > 0 && (
                  <span className="badge">{unread[u._id]}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right Chat Window */}
      <div className="chat-window">
        {activeChat ? (
          <>
            <div className="chat-header">
              <h4>
                {activeChat.name || activeChat.email}{" "}
                {activeChat.role && `(${activeChat.role})`}
              </h4>
            </div>
            <div className="chat-messages">
              {messages[activeChat._id]?.map((msg, idx) => (
                <div
                  key={idx}
                  className={`message ${
                    msg.senderId === userId ? "you" : "other"
                  }`}
                >
                  <div className="bubble">{msg.text}</div>
                  <span className="time">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button onClick={handleSend}>Send</button>
            </div>
          </>
        ) : (
          <div className="no-chat">Select a user to start chatting</div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
