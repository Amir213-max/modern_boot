
import { initializeApp } from 'firebase/app';

// إعدادات Firebase الخاصة بمشروع E-stock Chat
const firebaseConfig = {
  apiKey: "AIzaSyA51VaFUc1NPZEM2rMCVULlNbnwNTk-oMs",
  authDomain: "e-stock-chat.firebaseapp.com",
  projectId: "e-stock-chat",
  storageBucket: "e-stock-chat.firebasestorage.app",
  messagingSenderId: "582264119212",
  appId: "1:582264119212:web:6e8617470fccb905cda409",
  measurementId: "G-1KS53NBLFS"
};

// تهيئة التطبيق والاتصال بـ Firebase
export const app = initializeApp(firebaseConfig);
