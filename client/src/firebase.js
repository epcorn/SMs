import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const EXPECTED_KEY_B64 =
  "BFvAIhcFnJUO37L+1cu7dG2Igj/GIiWvqMxQyoK/6FQiJhR2M9E0Fn0Iq7aRmjPNwjdIpECli1MCNTYhuhl9ZCo=";

const app = initializeApp({
  apiKey: "AIzaSyDhXRpuajlyPLuWN5uZbbMM20YrWs3FGlY",
  authDomain: "project-587c6976-454c-43a7-8f3.firebaseapp.com",
  projectId: "project-587c6976-454c-43a7-8f3",
  storageBucket: "project-587c6976-454c-43a7-8f3.firebasestorage.app",
  messagingSenderId: "236797180014",
  appId: "1:236797180014:web:fcbba90bb4e35afcb30e7f",
  measurementId: "G-P6RMZYW83F",
});

const toBase64 = (buffer) =>
  buffer ? btoa(String.fromCharCode(...new Uint8Array(buffer))) : null;

export const requestForToken = async () => {
  try {
    const vapidKey =
      "BFvAIhcFnJUO37L-1cu7dG2Igj_GIiWvqMxQyoK_6FQiJhR2M9E0Fn0Iq7aRmjPNwjdIpECli1MCNTYhuhl9ZCo";

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" },
    );

    const existingSub = await registration.pushManager.getSubscription();
    if (
      existingSub &&
      toBase64(existingSub.options?.applicationServerKey) !== EXPECTED_KEY_B64
    ) {
      await existingSub.unsubscribe();
    }
    console.log(
      "Actual applicationServerKey:",
      existingSub?.options?.applicationServerKey
        ? btoa(
            String.fromCharCode(
              ...new Uint8Array(existingSub.options.applicationServerKey),
            ),
          )
        : null,
    );
    const messaging = getMessaging(app);
    return await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
  } catch (error) {
    console.error("FCM error:", error);
    return null;
  }
};

export const onForegroundMessage = (callback) => {
  const messaging = getMessaging(app);
  return onMessage(messaging, callback);
};
