import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = localStorage.getItem("accessToken"); 
    
    // Derive base URL from VITE_API_BASE_URL (remove /api/v1 suffix)
    // or fallback to localhost:5000 if not set
    let url = "http://localhost:5000";
    if (import.meta.env.VITE_API_BASE_URL) {
        try {
            const apiUrl = new URL(import.meta.env.VITE_API_BASE_URL);
            url = apiUrl.origin; // This gives http://localhost:5000 from http://localhost:5000/api/v1
        } catch (e) {
            console.error("Invalid VITE_API_BASE_URL", e);
        }
    }
    
    console.log("Connecting socket to:", url); // Debug log

    socket = io(url, {
      auth: { token },
      autoConnect: false,
      transports: ['websocket'], // Force websocket only to avoid polling issues with some setups
      path: '/socket.io/', // Explicitly set default path
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
    });
    
    socket.on("connect", () => {
        console.log("Socket connected:", socket?.id);
    });

    socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
    });
  }
  return socket;
};

export const connectSocket = () => {
  const socket = getSocket();
  if (!socket.connected) {
    const token = localStorage.getItem("accessToken");
    if (token) {
        socket.auth = { token };
        socket.connect();
    }
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
