import { onForegroundMessage, requestForToken } from '@/firebase';
import { fetchFn } from '@/utils/queryClient';
import { useEffect } from 'react';

function useNotifications(user) {
  console.log(user)
  useEffect(() => {
    if (!user) return;
    // 1. Request token and send to backend
    const initializeNotifications = async () => {
      try {
        // Request FCM token (handles permission prompt internally)
        const token = await requestForToken();

        if (token) {
          await fetchFn("/fcm-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: token
          });
        }
      } catch (error) {
        console.error("Failed to set up notifications:", error);
      }
    };

    initializeNotifications();

    // 2. Listen for foreground messages
    const unsubscribe = onForegroundMessage((payload) => {

      const { title, body } = payload.notification || {};

      if (Notification.permission === "granted") {
        new Notification(title || "New Notification", {
          body,
          icon: "/vite.svg"
        });
      }
    });

    // 3. Clean up subscription on unmount
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);
}

export default useNotifications;
