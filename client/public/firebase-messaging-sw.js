console.log("[sw] loaded");

//eslint-disable-next-line
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js",
);

//eslint-disable-next-line
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyDhXRpuajlyPLuWN5uZbbMM20YrWs3FGlY",
  authDomain: "project-587c6976-454c-43a7-8f3.firebaseapp.com",
  projectId: "project-587c6976-454c-43a7-8f3",
  storageBucket: "project-587c6976-454c-43a7-8f3.firebasestorage.app",
  messagingSenderId: "236797180014",
  appId: "1:236797180014:web:fcbba90bb4e35afcb30e7f",
  measurementId: "G-P6RMZYW83F",
};

//eslint-disable-next-line
firebase.initializeApp(firebaseConfig);

//eslint-disable-next-line
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message",
    payload,
  );

  // Safely extract title and body from notification or data payloads
  const title =
    payload?.notification?.title ||
    payload?.data?.title ||
    "Hello! Your Duty time has changed";

  const body =
    payload?.notification?.body ||
    payload?.data?.body ||
    "Your shift has been updated.";

  const options = {
    body: body,
    icon: "/vite.svg",
    badge: "/vite.svg",
  };

  self.registration.showNotification(title, options);
});
