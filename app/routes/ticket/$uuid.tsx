import { useLoaderData, json } from "@remix-run/react";
import type { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import {
  initializeApp,
  getApps,
  FirebaseApp,
} from "firebase/app";

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

const db = getFirestore(firebaseApp);

export const loader: LoaderFunction = async ({ params }: LoaderFunctionArgs) => {
  const { uuid } = params;

  if (!uuid) {
    throw new Error("UUID is required");
  }

  const ticketRef = doc(db, "tickets", uuid);
  const ticketSnap = await getDoc(ticketRef);

  if (!ticketSnap.exists()) {
    return json({ status: "error", message: "Ticket not found" });
  }

  const ticketData = ticketSnap.data();

  if (ticketData.status === "済") {
    return json({ status: "error", message: "Ticket already used" });
  }

  await updateDoc(ticketRef, { status: "済" });

  return json({ status: "success", message: "Ticket updated" });
};

export default function Ticket() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      {data.status === "success" ? (
        <h1>更新完了</h1>
      ) : (
        <h1>エラー: {data.message}</h1>
      )}
    </div>
  );
}