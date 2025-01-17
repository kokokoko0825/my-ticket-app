import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../root";
import { useState,useEffect } from "react";
import { useParams } from "@remix-run/react";

export default function Ticket() {
  const { uuid } = useParams();
  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => { 
    const fetchTicket = async () => {
      if (!uuid) {
        setStatus("error");
        setMessage("UUID is required");
        return;
      }

      const ticketRef = doc(db, "tickets", uuid);
      const ticketSnap = await getDoc(ticketRef);

      if (!ticketSnap.exists()) {
        setStatus("error");
        setMessage("Ticket not found");
        return;
      }

      const ticketData = ticketSnap.data();

      if (ticketData.status === "済") {
        setStatus("error");
        setMessage("Ticket already used");
        return;
      }

      if (ticketData.createdBy !== auth.currentUser?.uid) { 
        setStatus("error");
        setMessage("Googleアカウントが違います");
      }

      await updateDoc(ticketRef, { status: "済" });
      setStatus("success");
      setMessage("Ticket updated");
    };

    fetchTicket();
  }, [uuid]);

  return (
    <div>
      {status === "success" ? (
        <h1>更新完了</h1>
      ) : (
        <h1>エラー: {message}</h1>
      )}
    </div>
  );
}