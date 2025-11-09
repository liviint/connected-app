import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setConnected, addMessage } from "@/store/features/websocketSlice";
import { addNotification } from "@/store/features/notificationSlice";
import * as Notifications from "expo-notifications";

export default function WebSocketManager() {
    const dispatch = useDispatch();
    const socketRef = useRef(null);
    const retryRef = useRef(0);
    const maxRetries = 10;

    useEffect(() => {
        const wsUrl = process.env.EXPO_PUBLIC_WSS_URL;

        const connect = () => {
            if (socketRef.current) return; // already connected

            const socket = new WebSocket(wsUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log("✅ WebSocket connected");
                retryRef.current = 0;
                dispatch(setConnected(true));
            };

            socket.onmessage = async (event) => {
                const { event: eventType, data } = JSON.parse(event.data);

                switch (eventType) {
                    case "notification":
                        dispatch(addNotification(data));

                        // Schedule a local push notification
                        await Notifications.scheduleNotificationAsync({
                            content: {
                                title: data.title,
                                body: data.message,
                                data, // include payload for navigation
                            },
                            trigger: null,
                        });
                        break;

                    case "discussion_created":
                    case "discussion_comment_created":
                        dispatch(addMessage(data));

                        // Optionally create a notification for mobile users
                        const mobileNotification = {
                            title: eventType === "discussion_created"
                                ? "New Discussion"
                                : "New Comment",
                            message: eventType === "discussion_created"
                                ? `${data.author} started: ${data.title?.slice(0, 50)}`
                                : `${data.author_name} commented: ${data.content?.slice(0, 50)}`,
                            type: eventType,
                            discussionId: data.discussion || data.id,
                        };
                        dispatch(addNotification(mobileNotification));

                        await Notifications.scheduleNotificationAsync({
                            content: {
                                title: mobileNotification.title,
                                body: mobileNotification.message,
                                data: mobileNotification,
                            },
                            trigger: null,
                        });
                        break;

                    default:
                        dispatch(addMessage(data));
                        break;
                }
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
