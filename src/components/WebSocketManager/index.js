import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { 
        setConnected, 
        addMessage , 
        addNewDiscussion, 
        addNewDiscussionComment,
        addNewDiscussionLike,
} from "@/store/features/websocketSlice";
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
            if (socketRef.current) return

            const socket = new WebSocket(wsUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log("✅ WebSocket connected");
                retryRef.current = 0;
                dispatch(setConnected(true));
            };

            socket.onmessage = async (event) => {
                console.log(event,"hello event type 1")
                const { event: eventType, data } = JSON.parse(event.data);
                console.log(eventType,data,"hello event type")
                
                switch (eventType) {
                    case "send_notification":
                        dispatch(addNotification(data));
                        await Notifications.scheduleNotificationAsync({
                            content: {
                                title: data.title,
                                body: data.message,
                                data,
                            },
                            trigger: null,
                        });
                        break;

                    case "discussion_created":
                        dispatch(addNewDiscussion(data))
                        break;
                    case "discussion_comment_created":
                        dispatch(addNewDiscussionComment(data));
                        break;
                    case "discussion_liked":
                        dispatch(addNewDiscussionLike(data));
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
