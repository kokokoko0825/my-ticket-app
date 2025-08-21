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

// MUIテーマの作成（モバイルファースト設計）
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    // モバイルファーストなフォントサイズ
    h1: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.2,
      '@media (min-width:600px)': {
        fontSize: '2.25rem',
      },
      '@media (min-width:960px)': {
        fontSize: '2.75rem',
      },
    },
    h2: {
      fontSize: '1.375rem',
      fontWeight: 600,
      lineHeight: 1.3,
      '@media (min-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h3: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      '@media (min-width:600px)': {
        fontSize: '1.375rem',
      },
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      '@media (min-width:600px)': {
        fontSize: '1rem',
      },
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.5,
      '@media (min-width:600px)': {
        fontSize: '0.875rem',
      },
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
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
  spacing: 0.5, // 0.5rem基準のスペーシング
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          // モバイルでの縦向きロック時の拡大を防ぐ
          textSizeAdjust: '100%',
          WebkitTextSizeAdjust: '100%',
        },
        body: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          margin: 0,
          padding: 0,
          backgroundColor: '#f8f9fa',
          // タッチデバイスでのスクロール改善
          WebkitOverflowScrolling: 'touch',
          // モバイルでのタップハイライト色を調整
          WebkitTapHighlightColor: 'rgba(25, 118, 210, 0.15)',
          // モバイルでのスクロールバー非表示
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '0.25rem',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '0.125rem',
          },
        },
        '*': {
          boxSizing: 'border-box',
        },
        // モバイルでの拡大縮小を防ぐ（1rem以上でズーム防止）
        'input, textarea, select': {
          fontSize: '1rem !important',
          fontFamily: 'inherit',
          maxWidth: '100%',
          width: '100%',
          WebkitTextSizeAdjust: '100%',
          textSizeAdjust: '100%',
        },
        // フォーカス時のアウトライン改善
        'button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible': {
          outline: '0.125rem solid #1976d2',
          outlineOffset: '0.125rem',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '12px',
          fontWeight: 600,
          // モバイルでのタッチ操作最適化
          minHeight: '3rem',
          minWidth: '3rem',
          padding: '0.75rem 1.5rem',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          // タッチデバイスでのhover無効化
          '@media (hover: none)': {
            '&:hover': {
              backgroundColor: 'inherit',
            },
          },
          // タッチフィードバック
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        sizeSmall: {
          minHeight: '2.5rem',
          padding: '0.5rem 1rem',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          minHeight: '3.5rem',
          padding: '1rem 2rem',
          fontSize: '1rem',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '1rem',
          paddingRight: '1rem',
          '@media (min-width:37.5rem)': {
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '1rem',
          boxShadow: '0 0.125rem 0.5rem rgba(0,0,0,0.08)',
          '@media (max-width:37.5rem)': {
            borderRadius: '0.75rem',
            margin: '0 0.5rem',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.75rem',
            fontSize: '1rem', // ズーム防止
            '@media (max-width:37.5rem)': {
              borderRadius: '0.5rem',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1976d2',
          boxShadow: '0 0.125rem 0.5rem rgba(0,0,0,0.12)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          // モバイルでのFABサイズ調整
          '@media (max-width:37.5rem)': {
            width: '4rem',
            height: '4rem',
          },
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