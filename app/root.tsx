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
import Button from "@mui/material/Button";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
// Material UIのスタイルはentry.client.tsxとentry.server.tsxで管理

import Container from "@mui/material/Container";

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

// MUIテーマの作成（レスポンシブ対応強化）
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    // レスポンシブなフォントサイズ
    h1: {
      fontSize: '2rem',
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
      '@media (min-width:960px)': {
        fontSize: '3rem',
      },
    },
    h2: {
      fontSize: '1.5rem',
      '@media (min-width:600px)': {
        fontSize: '2rem',
      },
    },
    body1: {
      fontSize: '0.875rem',
      '@media (min-width:600px)': {
        fontSize: '1rem',
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          margin: 0,
          padding: 0,
          backgroundColor: '#f5f5f5',
          // タッチデバイスでのスクロール改善
          '-webkit-overflow-scrolling': 'touch',
          // モバイルでのタップハイライト色を調整
          '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0.1)',
        },
        '*': {
          // ボックスサイジングをborder-boxに統一
          boxSizing: 'border-box',
        },
        // モバイルでの拡大縮小を防ぐ
        'input, textarea, select': {
          fontSize: '16px !important',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          // モバイルでのタッチ操作を改善
          minHeight: '44px',
          minWidth: '44px',
          '@media (hover: none)': {
            '&:hover': {
              backgroundColor: 'inherit',
            },
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          '@media (min-width:600px)': {
            paddingLeft: '24px',
            paddingRight: '24px',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1976d2',
        },
      },
    },
  },
});

export const meta: MetaFunction = () => {
  return[
    { charset: "utf-8" },
    { title: "電子チケット" },
    { name: "viewport", content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "default" },
    { name: "theme-color", content: "#1976d2" },
    { name: "msapplication-TileColor", content: "#1976d2" },
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
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/icon?family=Material+Icons",
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
        <ThemeProvider theme={theme}>
          <CssBaseline />
            {user ? (
              <Outlet />
            ) : (
              <Container maxWidth="sm" sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: '100vh',
                textAlign: 'center'
              }}>
                <Button 
                  variant="contained" 
                  onClick={signInWithGoogle}
                  size="large"
                >
                  ログイン
                </Button>
              </Container>
            )}
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
        </ThemeProvider>
      </body>
    </html>
  );
}