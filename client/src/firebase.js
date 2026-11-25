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
    const vapidKey =
      "BFvAIhcFnJUO37L-1cu7dG2Igj_GIiWvqMxQyoK_6FQiJhR2M9E0Fn0Iq7aRmjPNwjdIpECli1MCNTYhuhl9ZCo";

    console.log("Firebase project:", app.options.projectId);
    console.log("VAPID key:", vapidKey);

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" },
    );

    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    const subscription = await registration.pushManager.getSubscription();

    console.log(
      "Actual applicationServerKey:",
      subscription?.options?.applicationServerKey
        ? btoa(
            String.fromCharCode(
              ...new Uint8Array(subscription.options.applicationServerKey),
            ),
          )
        : null,
    );

    return token;
  } catch (error) {
    console.error("FCM error:", error);
    return null;
  }
};

export const onForegroundMessage = (callback) => {
  const messaging = getMessaging(app);

  return onMessage(messaging, (payload) => {
    console.log("FCM MESSAGE RECEIVED:", payload);

    callback(payload);
  });
};
