import { useEffect, useState } from 'react';
import io from "socket.io-client";
import { v4 } from 'uuid';

const PORT = 3001;
const socket = io(`http://localhost:${PORT}`);

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState('');
  const [room, setRoom] = useState('');
  const [chatIsVisible, setChatIsVisible] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  useEffect(() => {
    socket.on('receive_msg', ({ user, message }) => {
      const msg = `${user} sent: ${message}`;
      setMessages((prevState) => [msg, ...prevState]);
    });
    return () => {
      socket.off('receive_msg');
    };
  }, []);

  const handleEnterChatRoom = () => {
    if (user && room) {
      setChatIsVisible(true);
      socket.emit("join_room", { user, room });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsgData = { room, user, message: newMessage };

      socket.emit("send_msg", newMsgData);

      const msg = `${user} sent: ${newMessage}`;
      setMessages((prevState) => [msg, ...prevState]);
      setNewMessage("");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {!chatIsVisible ? (
        <>
          <input
            type="text"
            placeholder="Username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <br />
          <input
            type="text"
            placeholder="Room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <br />
          <button onClick={handleEnterChatRoom}>Enter Chat Room</button>
        </>
      ) : (
        <>
          <h5>Room: {room} | User: {user}</h5>
          <div
            style={{
              height: 200,
              width: 250,
              border: "1px solid #000",
              overflowY: "scroll",
              marginBottom: 10,
              padding: 10,
            }}
          >
            {messages.map((el) => (
              <div key={v4()}>{el}</div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={handleSendMessage}>Send Message</button>
        </>
      )}
    </div>
  );
}

export default App;
