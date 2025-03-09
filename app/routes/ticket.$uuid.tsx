import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../root";
import { useState,useEffect } from "react";
import { useParams } from "@remix-run/react";
import * as styles from  "./styles.css"

export default function Ticket() {
  const { uuid } = useParams();
  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => { 
    const fetchTicket = async () => {
      if (!uuid) {
        setStatus("error");
        setMessage("UUIDが必要です。(ホーム画面に戻って「責任者を呼ぶ」を押してください)");
        return;
      }

      const ticketRef = doc(db, "tickets", uuid);
      const ticketSnap = await getDoc(ticketRef);

      if (!ticketSnap.exists()) {
        setStatus("error");
        setMessage("チケットが見つかりません。(ホーム画面に戻って「責任者を呼ぶ」を押してください)");
        return;
      }

      const ticketData = ticketSnap.data();

      if (ticketData.status === "済") {
        setStatus("error");
        setMessage("チケットは既に使用済みです。(ホーム画面に戻って「責任者を呼ぶ」を押してください)");
        return;
      }
    /*
      if (ticketData.createdBy !== auth.currentUser?.uid) { 
        setStatus("error");
        setMessage("Googleアカウントが違います()");
      }
    */

      await updateDoc(ticketRef, { status: "済" });
      setStatus("success");
      setMessage("更新されました。");
    };

    fetchTicket();
  }, [uuid]);

  return (
    <div>
      {status === "success" ? (
        <h1 className={styles.header1}>更新完了</h1>
      ) : (
        <h1 className={styles.header1}>エラー: {message}</h1>
      )}
    </div>
  );
}