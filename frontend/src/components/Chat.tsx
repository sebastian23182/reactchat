import React from "react";
import { Logout } from "../icons/Logout";
import { useChat } from "../hooks/useChat";
import io from "socket.io-client";

const socket = io("https://reactchat-backend.onrender.com");

interface Message {
  body: { 
    text: string,
    name: string
  },
  from: string
}

function Chat() {
  const { user, chat, logged, room, roomCount, onChat, onClearChat, onUser, onLogin, onRoom, onRoomCount } = useChat();
  const name = React.useRef<HTMLInputElement>(null);
  const text = React.useRef<HTMLTextAreaElement>(null);
  const messagesRef = React.useRef<HTMLUListElement>(null);
  const otherPersonName = React.useRef("");
  const otherPersonSocket = React.useRef("");

  const receiveMessage = (message: Message): void => {
    otherPersonName.current = message.body.name != otherPersonName.current ? message.body.name : otherPersonName.current;
    otherPersonSocket.current = message.from;
    onChat(otherPersonSocket.current, decodeURIComponent(message.body.text));
    setTimeout(() => {
      if(messagesRef.current){
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      } 
    }, 0); 
  }

  const receiveCount = (count: number): void => {
    onRoomCount(count);
  }

  const receiveRoom = (room: string): void => {
    onRoom(room);
  }

  const leaveRoom = (): void => {
    onClearChat();
  }

  React.useEffect(() => {
    socket.on("message", receiveMessage);
    socket.on("join", receiveRoom);
    socket.on("roomCount", receiveCount);
    socket.on("leaveRoom", leaveRoom);

    return () => {
      socket.off("message", receiveMessage);
    };
  }, []);

  const startChat = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if(name.current) {
      const cleanName = name.current.value.replace(/^\s+/, "");
      const withoutSpaces = cleanName.replace(/\s{2,}/g, " ");
      if(withoutSpaces && withoutSpaces.length <= 30) {
        onLogin();
        onUser(socket.id, withoutSpaces);
        socket.emit("join");
      }
    }
  }

  const sendMessage = (e: React.FormEvent<HTMLFormElement>): void => { 
    e.preventDefault();
    if(text.current) {
      if(text.current.value.trim() && text.current.value.length <= 2000) {
        const newMessage = {
          text: encodeURIComponent(text.current.value.trim()),
          name: user.name,
          room: room
        }
        onChat(socket.id, decodeURIComponent(newMessage.text));
        text.current.value = "";
        socket.emit("message", newMessage);
        setTimeout(() => {
          if(messagesRef.current){
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
          } 
        }, 0);
      }
    }
  }

  const sendKeyMessage = (): void => { 
    if(text.current) {
      if(text.current.value.trim() && text.current.value.length <= 2000) {
        const newMessage = {
          text: encodeURIComponent(text.current.value.trim()),
          name: user.name,
          room: room
        }
        onChat(socket.id, decodeURIComponent(newMessage.text));
        text.current.value = "";
        socket.emit("message", newMessage);
        setTimeout(() => {
          if(messagesRef.current){
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
          } 
        }, 0);
      }
    }
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendKeyMessage();
    }
  }

  const limitName = (): void => {
    if(name.current) {
      if(name.current.value.length > 30) {
        name.current.value = name.current.value.slice(0, 30);
      }
    }
  }

  const limitText = (): void => {
    if(text.current) {
      if(text.current.value.length > 2000) {
        text.current.value = text.current.value.slice(0, 2000);
      }
    }
  }

  return (
    <>
    {logged && roomCount !== 2 && (
      <div>
        <h1>Room: {roomCount}/2</h1>
        <small>Waiting for users<span className="loading-dots"></span></small>
      </div>
    )}

    {logged && roomCount === 2 && (
    <div className="chat">
      <div className="title">
        <h1>Chat</h1>
        <Logout
        socket={socket}
        room={room}/>
      </div>
      <div className="messages">
        <ul ref={messagesRef}>
          {chat.map((message) => (
            <li key={crypto.randomUUID()} className={`message-${message.autor === socket.id ? "mine" : "other"}`}><p className={`message-${message.autor === socket.id ? "mine-p" : "other-p"}`}><b>{message.autor === socket.id ? "" : otherPersonName.current}</b>{message.text}</p></li>
          ))}
        </ul>
      </div>
      <form onSubmit={sendMessage}>
        <span>
          <textarea ref={text} onChange={limitText} onKeyDown={handleKeyDown} placeholder="Write something..."/>
            <button>Send</button>
        </span>
      </form>
    </div>
    )}

    {!logged && (
      <form className="userName" onSubmit={startChat}>
        <h1>Select your name</h1>
        <span>
          <input type="text" ref={name} onChange={limitName} placeholder="Your name..." />
          <button>Send</button>
        </span>
      </form>
    )}
    </>
  );    
}

export { Chat };
