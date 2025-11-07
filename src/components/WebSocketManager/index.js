'use client'
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setConnected, addMessage } from "@/store/features/websocketSlice"

export default function WebSocketManager() {
    const dispatch = useDispatch();

    useEffect(() => {
        const wsUrl = process.env.EXPO_PUBLIC_WSS_URL
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log("WebSocket connected");
            dispatch(setConnected(true));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            dispatch(addMessage(data));
        };

        socket.onclose = () => {
            console.log("WebSocket closed");
            dispatch(setConnected(false));
        };

        socket.onerror = (err) => {
            console.log("WebSocket error", err);
        };

        return () => socket.close();
    }, [dispatch]);

    return null;
}
