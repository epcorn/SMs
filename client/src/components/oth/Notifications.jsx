import { onForegroundMessage, requestForToken } from '@/firebase';
import { useEffect } from 'react';

function useNotifications() {
  useEffect(() => {
    // 1. Request token and send to backend
    const initializeNotifications = async () => {
      try {
        // Request FCM token (handles permission prompt internally)
        const token = await requestForToken();

        if (token) {
          await fetch("/api/fcm-token", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            credentials: "include", 
            body: JSON.stringify({ token }) 
          });
        }
      } catch (error) {
        console.error("Failed to set up notifications:", error);
      }
    };

    initializeNotifications();

    // 2. Listen for foreground messages
    const unsubscribe = onForegroundMessage((payload) => {
      console.log("Foreground notification received:", payload);
      
      const { title, body } = payload.notification || {};
      
      // Native browser notification fall-back if tab is active
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
