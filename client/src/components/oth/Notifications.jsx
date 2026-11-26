import { useEffect } from "react";
import { onForegroundMessage, requestForToken } from "@/firebase";
import { fetchFn } from "@/utils/queryClient";
import { getCreateDeviceId, getDeviceLabel } from "@/utils/device";

export default function useNotifications(userId) {
  useEffect(() => {
    if (!userId) return;

    const deviceId = getCreateDeviceId();
    const deviceName = getDeviceLabel();

    requestForToken()
      .then((token) => {
        if (!token) return;
        return fetchFn("token/fcm-token", {
          method: "POST",
          body: { token, deviceId, deviceName },
        });
      })
      .catch(console.error);

    const unsubscribe = onForegroundMessage(async (payload) => {
      if (Notification.permission !== "granted") return;

      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(
        payload.notification?.title || "Duty Updated",
        {
          body: payload.notification?.body || "Your shift schedule has changed.",
          icon: "/vite.svg",
        },
      );
    });

    return unsubscribe;
  }, [userId]);
}