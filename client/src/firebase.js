// src/firebase.js
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging"; // Added for notifications

const firebaseConfig = {
  apiKey: "AIzaSyDhXRpuajlyPLuWN5uZbbMM20YrWs3FGlY",
  authDomain: "project-587c6976-454c-43a7-8f3.firebaseapp.com",
  projectId: "project-587c6976-454c-43a7-8f3",
  storageBucket: "project-587c6976-454c-43a7-8f3.firebasestorage.app",
  messagingSenderId: "236797180014",
  appId: "1:236797180014:web:fcbba90bb4e35afcb30e7f",
  measurementId: "G-P6RMZYW83F",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Initialize Firebase Cloud Messaging (FCM)
export const messaging = getMessaging(app);

// Helper function to ask user for permission and get the FCM device token
export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission not granted:", permission);
      return null;
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );

    const currentToken = await getToken(messaging, {
      vapidKey:
        import.meta.env.VITE_FIREBASE_VAPID_KEY ||
        "BE8a-_VA9WG6pnLmZyhwWg19sDZwwk-cxpbqWVIPHGsiNWM_xp8MK6qyCCpjkjKMz4wNnlc6m3cOD1NEL1_wjq0",
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      console.log("Device FCM Token:", currentToken);
      return currentToken;
    }
    console.log("No registration token available.");
    return null;
  } catch (err) {
    console.error("An error occurred while retrieving token.", err);
    return null;
  }
};
                    
// Listen for notifications when the app is open (Foreground)
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
export const getMessagingIfSupported = async () =>
  (await isSupported()) ? getMessaging(app) : null;

export const onForegroundMessage = (callback) => onMessage(messaging, callback);
