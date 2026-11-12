import { useEffect } from "react";
import { onForegroundMessage, requestForToken } from "@/firebase";
import { fetchFn } from "@/utils/queryClient";

export default function useNotifications(userId) {
  useEffect(() => {


    if (!userId) {
      console.log("Skipping notifications: No userId provided yet.");
      return;
    }

    requestForToken().then((token) => {
      if (token) {
        fetchFn("token/fcm-token", { method: "POST", body: { token } }).catch(console.error);
      }
    });

    console.log('Setting up foreground message listener...');
    const unsubscribe = onForegroundMessage((payload) => {
      console.log("Foreground message received:", payload);

      const title = payload?.notification?.title || payload?.data?.title || "Duty Updated";
      const body = payload?.notification?.body || payload?.data?.body || "Your shift schedule has changed.";

      if (Notification.permission === "granted") {
        new Notification(title, {
          body: body,
          icon: "/vite.svg",
        });
      }
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [userId]);
}