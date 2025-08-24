import { useState, useEffect } from "react";
import {
  initializeApp,
  getApps,
  FirebaseApp,
} from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import type { MetaFunction, LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import firebase from "firebase/compat/app";
import { Button, Container } from "./components";

// Vanilla ExtractスタイルをインポートしてCSSを生成
import "~/styles/global.css";
import "~/styles/admin.css";
import "~/styles/qr-reader.css";
import "~/styles/ui/card.css";
import "~/styles/ui/button.css";
import "~/styles/ui/input.css";
import "~/styles/ui/container.css";
import "~/styles/ui/modal.css";
import "~/styles/ui/status-badge.css";
import "~/styles/layout/header.css";
import "~/styles/layout/page-container.css";
import "~/styles/layout/content-wrapper.css";
import "~/styles/forms/form-group.css";
import "~/styles/forms/form-row.css";
import "~/styles/pages/index.css";
import "~/styles/pages/ticket.css";
import "~/styles/pages/owner.css";
import "~/styles/pages/owner-modal.css";
import "~/styles/pages/ticket-detail.css";

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

// アプリケーションテーマ設定（プレーンなCSS変数として定義）
export const appTheme = {
  colors: {
    primary: '#1976d2',
    primaryLight: '#42a5f5',
    primaryDark: '#1565c0',
    secondary: '#dc004e',
    secondaryLight: '#ff5983',
    secondaryDark: '#9a0036',
    success: '#388e3c',
    error: '#d32f2f',
    warning: '#ff9800',
    background: '#f8f9fa',
    paper: '#ffffff',
    textPrimary: '#212121',
    textSecondary: '#757575',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
  },
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
};

export const meta: MetaFunction = () => {
  return[
    { charset: "utf-8" },
    { title: "電子チケット" },
    { name: "viewport", content: "width=device-width, initial-scale=1.0, viewport-fit=auto" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "default" },
    { name: "theme-color", content: "#1976d2" },
    { name: "msapplication-TileColor", content: "#1976d2" },
    { name: "format-detection", content: "telephone=no" },
    { name: "mobile-web-app-capable", content: "yes" },
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
    href: "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap",
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



  return (
    <html lang="ja">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <style>{`
          *, *::before, *::after {
            box-sizing: border-box;
          }
          html {
            font-size: 16px;
            line-height: 1.5;
            -webkit-text-size-adjust: 100%;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
            color: #212121;
            background-color: #f8f9fa;
          }
          button {
            font-family: inherit;
            cursor: pointer;
            touch-action: manipulation;
          }
          input {
            font-family: inherit;
            font-size: 16px;
          }
        `}</style>
        {user ? (
          <Outlet />
        ) : (
          <Container 
            maxWidth="sm" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '100vh',
              textAlign: 'center'
            }}
          >
            <Button 
              onClick={signInWithGoogle}
              size="lg"
            >
              ログイン
            </Button>
          </Container>
        )}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}