// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "project-587c6976-454c-43a7-8f3.firebaseapp.com",
  projectId: "project-587c6976-454c-43a7-8f3",
  storageBucket: "project-587c6976-454c-43a7-8f3.firebasestorage.app",
  messagingSenderId: "236797180014",
  appId: "1:236797180014:web:fcbba90bb4e35afcb30e7f",
  measurementId: "G-P6RMZYW83F",
};

const app = initializeApp(firebaseConfig);

let messagingPromise = null;
const getMessagingSafe = () => {
  if (!messagingPromise) {
    messagingPromise = isSupported()
      .then((ok) => (ok ? getMessaging(app) : null))
      .catch(() => null);
  }
  return messagingPromise;
};

export const requestForToken = async () => {
  try {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return null;

    const messaging = await getMessagingSafe();
    if (!messaging) return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    return (
      (await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      })) || null
    );
  } catch (err) {
    console.error("Failed to get FCM token:", err);
    return null;
  }
};

// returns an unsubscribe function (async, so handle it in the hook)
export const onForegroundMessage = async (callback) => {
  const messaging = await getMessagingSafe();
  return messaging ? onMessage(messaging, callback) : () => {};
};