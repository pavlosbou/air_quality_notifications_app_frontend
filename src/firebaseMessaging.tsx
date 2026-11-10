import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";


const firebaseConfig = import.meta.env.VITE_FIREBASE_CONFIG;
const vapidKey = import.meta.env.VITE_VAPID_KEY;

// Initialize Firebase app
const firebaseApp = initializeApp(firebaseConfig);


if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
            console.error('Service Worker registration failed:', error);
        });
    }

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(firebaseApp);

export const getFcmToken = async (setToken: (token: string) => void) => {
    try {
        const token = await getToken(messaging, { vapidKey: vapidKey });
        if (token) {
            console.log('FCM Token:', token);
            setToken(token);
            return token; // Return the token
        } else {
            console.log('No registration token available.');
            return null; // Return null if no token
        }
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null; // Return null in case of error
    }
};


// Function to handle incoming messages
export const onMessageListener = (callback: (payload: any) => void) => {
    onMessage(messaging, (payload) => {
        console.log('Message received: ', payload);
        callback(payload);
    });
};
