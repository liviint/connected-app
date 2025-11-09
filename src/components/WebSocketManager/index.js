import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setConnected, addMessage } from "@/store/features/websocketSlice"

export default function WebSocketManager() {
    const dispatch = useDispatch();
    const socketRef = useRef(null);
    const retryRef = useRef(0);
    const maxRetries = 10;

    useEffect(() => {
        const wsUrl = process.env.EXPO_PUBLIC_WSS_URL;

        const connect = () => {
            if (socketRef.current) return; 

            const socket = new WebSocket(wsUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log("✅ WebSocket connected");
                retryRef.current = 0;
                dispatch(setConnected(true));
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                dispatch(addMessage(data));
            };

            socket.onclose = () => {
                console.log("⚠ WebSocket closed");
                dispatch(setConnected(false));
                socketRef.current = null;

                if (retryRef.current < maxRetries) {
                    const timeout = Math.pow(2, retryRef.current) * 1000; 
                    console.log(`🔁 Reconnecting in ${timeout / 1000}s...`);
                    setTimeout(() => {
                        retryRef.current += 1;
                        connect();
                    }, timeout);
                } else {
                    console.error("❌ Max retry attempts reached");
                }
            };

            socket.onerror = (err) => {
                console.error("❗ WebSocket error", err);
                socket.close();
            };
        };

        connect();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [dispatch]);

    return null;
}
