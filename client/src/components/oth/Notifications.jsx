import { onForegroundMessage, requestForToken } from '@/firebase';
import { useEffect } from 'react'

function useNotifications() {
  useEffect(() => {
    const getToken = async () => {
      const token = await requestForToken();

      if (token) await fetch("/api/fcm-token", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ token }) })
    }
    getToken();

    const unsubscribe = onForegroundMessage((payload) => {
      console.log("Foreground notification:", payload);
      // show a toast / update UI here
      const { title, body } = payload.notification || {};
      new Notification(title, { body, icon: "/vite.svg" })
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>

    </div>
  )
}

export default useNotifications;
