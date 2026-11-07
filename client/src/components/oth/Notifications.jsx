import { useEffect } from "react";
import { onForegroundMessage, requestForToken } from "@/firebase";
import { fetchFn } from "@/utils/queryClient";

export default function useNotifications(userId) {
  useEffect(() => {
    if (!userId) return;

    requestForToken().then((token) => {
      console.log(token)
      if (token) fetchFn("token/fcm-token", { method: "POST", body: { token } }).catch(console.error);
    });

    return onForegroundMessage(({ notification }) => {
      if (Notification.permission === "granted") {
        new Notification(notification?.title || "Notification", {
          body: notification?.body,
          icon: "/vite.svg",
        });
      }
    });
  }, [userId]);
}