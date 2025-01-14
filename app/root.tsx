import {
  initializeApp,
  getApps,
  FirebaseApp,
} from "firebase/app";
import { getFirestore } from "firebase/firestore";
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
/*
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
*/

export default function App() {
  return (
    <html lang="ja">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}