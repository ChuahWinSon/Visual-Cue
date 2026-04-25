import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// Set this to your Railway backend URL after deploying
// In development it uses localhost:3001
const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:3001";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SERVER_URL, { autoConnect: true, reconnection: true });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    return () => socket.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
