import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";

export default function NotificationHandler() {
  const navigation = useNavigation();

  useEffect(() => {
    const registerForPushNotificationsAsync = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notifications!');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('hello Push Token:', token);
      return token;
    };

    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log("Tapped notification data:", data);

      if (data.type === "discussion") {
        navigation.navigate("DiscussionDetail", { id: data.discussionId });
      }
    });

    return () => subscription.remove();
  }, [navigation]);

  return null;
}
