import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {addNotification} from "../../../../store/features/notificationSlice"
import * as Notifications from "expo-notifications";
import { safeLocalStorage } from "@/utils/storage";

export default function WebSocketManagerNotifications() {
    const dispatch = useDispatch();
    const socketRef = useRef(null);
    const retryRef = useRef(0);
    const maxRetries = 10;


useEffect(() => {
    const connect = async() => {
        const token = await safeLocalStorage.getItem("token")
        const wsUrl = `${process.env.EXPO_PUBLIC_WSS_NOTIFICATIONS}?token=${token}`;
        if (socketRef.current) return
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("✅ Notifications WebSocket connected");
            retryRef.current = 0;
        };

        socket.onmessage = async (event) => {
            const { event: eventType, data } = JSON.parse(event.data);
            console.log(eventType,"hello event 123")

            switch (eventType) {
                case "send_notification":
                    dispatch(addNotification(data));
                    await Notifications.scheduleNotificationAsync({
                        content: { title: data.title, body: data.message, data },
                        trigger: { seconds: 0 }
                    });
                break;
            }
        };

        socket.onclose = () => {
            console.log("⚠ Notifications WebSocket closed");
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
            console.error("❗ Notifications WebSocket error", err);
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
