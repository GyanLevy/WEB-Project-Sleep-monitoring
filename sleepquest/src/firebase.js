// Firebase configuration for SleepQuest
// Project: web-sleep-monitoring
//
// IMPORTANT: You need to get the web API key from Firebase Console:
// 1. Go to https://console.firebase.google.com
// 2. Select project "web-sleep-monitoring"
// 3. Go to Project Settings > General > Your apps
// 4. If no web app exists, click "Add app" > Web
// 5. Copy the apiKey value and paste it below

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZt_nOqZXaVQskg9H6u8fSj-42gmySOIY",
  authDomain: "web-sleep-monitoring.firebaseapp.com",
  projectId: "web-sleep-monitoring",
  storageBucket: "web-sleep-monitoring.firebasestorage.app",
  messagingSenderId: "729693086116",
  appId: "1:729693086116:web:66bc46b74d91bd4b652131",
  measurementId: "G-V2G8YRFTFP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
