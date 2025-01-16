import { useState, useEffect } from "react";
import {
  initializeApp,
  getApps,
  FirebaseApp,
} from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import type { MetaFunction } from "@remix-run/node";

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import "./tailwind.css";
import firebase from "firebase/compat/app";

const firebaseConfig = {
  apiKey: "AIzaSyCNs9z34dPvegE073RHwmZw3CLYmJ-NsC8",
  authDomain: "ic-ticket-6fadc.firebaseapp.com",
  projectId: "ic-ticket-6fadc",
  storageBucket: "ic-ticket-6fadc.firebasestorage.app",
  messagingSenderId: "241041666640",
  appId: "1:241041666640:web:d487ab32df6beda2f01755",
  measurementId: "G-12ST14XL4P"
};

let firebaseApp: FirebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);

export const meta: MetaFunction = () => {
  return[
    { charset: "utf-8" },
    { title: "電子チケット" },
    { viewport: "width=device-width,initial-scale=1"},
  ]
}

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export default function App() {
  const [user, setUser] = useState<firebase.User | null>(null);

  useEffect(() => { 
    const unsubscribe = onAuthStateChanged(auth, (user) => setUser(user as firebase.User | null));
    return () => unsubscribe();
  }, []);
  
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <html lang="ja">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {user ? (
          <div>
            <p>Welcome {user.displayName}!</p>
            <button onClick={signOutUser}>サインアウトする？</button>
            <Outlet />
          </div>
        ) : (
            <div>
              <p>ログインしてね</p>
              <button onClick={signInWithGoogle}>ここをクリックでサインイン</button>
            </div>
        )}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}