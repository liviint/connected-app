import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { useRouter } from "expo-router";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function NotificationHandler() {
  const navigation = useNavigation();
  const router = useRouter()

  useEffect(() => {
    const registerForPushNotificationsAsync = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        alert("Failed to get notification permissions!");
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("✅ Push Token:", token);
      return token;
    };

    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data.type === "discussion_comment") {
        router.push(`discussions/${data.data.discussion_slug}/${data.data.discussion_id}`)
      }
      else if (data.type === "discussion") {
        router.push(`discussions/${data.data.discussion_slug}/${data.data.discussion_id}`)
      }
      else if (data.type === "dicussion_like") {
        router.push(`discussions/${data.data.discussion_slug}/${data.data.discussion_id}`)
      }
    });

    return () => sub.remove();
  }, [navigation]);

  return null;
}
