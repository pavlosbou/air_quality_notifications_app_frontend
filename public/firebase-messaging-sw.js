importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId
firebase.initializeApp({
    apiKey: "AIzaSyBj2PWAoTyz8Vgy1aqkRZgqCCLZH4-9RPQ",

    authDomain: "airqualitynotificationsapp.firebaseapp.com",
    projectId: "airqualitynotificationsapp",
    storageBucket: "airqualitynotificationsapp.appspot.com",
    messagingSenderId: "811200398280",
    appId: "1:811200398280:web:7e86c7a4b3fb43c0a476fd",
    measurementId: "G-4G28PC88ZB"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    console.log('Received background message ', payload);

  // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
    body: payload.notification.body,
    icon: payload.data.icon,
    data: { url: payload.data.click_action }    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Close the notification
  const clickActionUrl = event.notification.data?.url;

  if (clickActionUrl) {
      // Ensure it opens in a new tab if app is in the background
      event.waitUntil(
          clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
              for (const client of clientList) {
                  if (client.url === clickActionUrl && 'focus' in client) {
                      return client.focus();
                  }
              }
              if (clients.openWindow) {
                  return clients.openWindow(clickActionUrl);
              }
          })
      );
  }
});
