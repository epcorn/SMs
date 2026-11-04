import { onForegroundMessage, requestForToken } from '@/firebase';
import { fetchFn } from '@/utils/queryClient';
import { useEffect } from 'react';

function useNotifications(userId) {

  useEffect(() => {
    if (!userId) return;

    let unsubscribe = () => { };
    let cancelled = false;

    (async () => {
      const token = await requestForToken();
      if (token) await fetchFn("token/fcm-token", { method: "POST", body: { token } });

      const unsub = await onForegroundMessage((payload) => {
        const { title, body } = payload.notification || {};
        if (Notification.permission === "granted") {
          new Notification(title || "New Notification", { body, icon: "/vite.svg" });
        }
      });
      if (cancelled) unsub(); else unsubscribe = unsub;
    })().catch((e) => console.error("Notification setup failed:", e));

    return () => { cancelled = true; unsubscribe(); };
  }, [userId]);
}

export default useNotifications;
