console.log("[sw] loaded");

// Use the compat builds: service workers can't use ES modules via importScripts
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "project-587c6976-454c-43a7-8f3.firebaseapp.com", // was "://firebaseapp.com"
  projectId: "project-587c6976-454c-43a7-8f3",
  storageBucket: "project-587c6976-454c-43a7-8f3.firebasestorage.app",
  messagingSenderId: "236797180014",
  appId: "1:236797180014:web:fcbba90bb4e35afcb30e7f",
  measurementId: "G-P6RMZYW83F"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);

  const title = payload.notification?.title || 'New Notification';
  const options = {
    body: payload.notification?.body || 'You have a new message.',
    icon: '/vite.svg',
  };

  self.registration.showNotification(title, options);
});