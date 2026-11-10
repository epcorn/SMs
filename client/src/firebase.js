import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const app = initializeApp({
  apiKey: "AIzaSyDhXRpuajlyPLuWN5uZbbMM20YrWs3FGlY",
  authDomain: "project-587c6976-454c-43a7-8f3.firebaseapp.com",
  projectId: "project-587c6976-454c-43a7-8f3",
  storageBucket: "project-587c6976-454c-43a7-8f3.firebasestorage.app",
  messagingSenderId: "236797180014",
  appId: "1:236797180014:web:fcbba90bb4e35afcb30e7f",
  measurementId: "G-P6RMZYW83F",
});

export const requestForToken = async () => {
  try {
    if ((await Notification.requestPermission()) !== "granted") return null;
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );
    return await getToken(getMessaging(app), {
      vapidKey:
        "BFvAIhcFnJUO37L-1cu7dG2Igj_GIiWvqMxQyoK_6FQiJhR2M9E0Fn0Iq7aRmjPNwjdIpECli1MCNTYhuhl9ZCo",
      serviceWorkerRegistration: registration,
    });
  } catch (e) {
    console.error("FCM token error:", e.code, e.message);
    return () => {};
  }
};

export const onForegroundMessage = (cb) => {
  try {
    return onMessage(getMessaging(app), cb);
  } catch {
    return () => {};
  }
};
