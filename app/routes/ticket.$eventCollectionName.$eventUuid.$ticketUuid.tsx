import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "@remix-run/react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../root";
import { Button, PageContainer } from "../components";
import {
  ticketPageContainer,
  ticketCard,
  loadingCard,
  ticketIcon,
  successIcon,
  errorIcon,
  ticketTitle,
  successTitle,
  errorTitle,
  ticketDescription,
  successDescription,
  ticketInfoCard,
  statusBadge,
  ticketName,
  ticketDetails,
  detailItem,
  bandName,
  eventName,
  errorMessage,
  errorText,
  homeButton,
  errorHomeButton,
} from "../styles/pages/ticket-detail.css";

interface TicketData {
  uuid: string;
  name: string;
  bandName: string;
  createdBy: string;
  status: "未" | "済";
  state?: "未" | "済"; // 既存データとの互換性のため一時的に保持
  createdAt: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function NewFormatTicketPage() {
  const { eventCollectionName, eventUuid, ticketUuid } = useParams();
  const navigate = useNavigate();
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<string>("");

  const fetchAndUpdateTicket = useCallback(async () => {
    if (!eventCollectionName || !eventUuid || !ticketUuid) return;

    try {
      setLoading(true);
      setError(null);

      console.log("🔍 新形式チケット検索開始:", { eventCollectionName, eventUuid, ticketUuid });

      // チケットドキュメントを取得（直接的なFirestoreパス）
      const ticketDocRef = doc(db, eventCollectionName, eventUuid, "tickets", ticketUuid);
      const ticketSnapshot = await getDoc(ticketDocRef);

      if (!ticketSnapshot.exists()) {
        console.log("❌ チケットが見つかりません");
        setError("チケットが見つかりません。QRコードが正しいか確認してください。");
        setLoading(false);
        return;
      }

      const data = ticketSnapshot.data() as TicketData;
      console.log("✅ チケット発見:", data);

      setTicketData(data);

      // チケットが未使用の場合のみステータスを更新
      const currentStatus = data.status || data.state || "未";
      
      if (currentStatus === "未") {
        console.log("🎫 チケット状態を更新中...");
        
        // statusフィールドに統一し、stateフィールドは削除
        await setDoc(ticketDocRef, {
          status: "済",
          state: null // stateフィールドを削除
        }, { merge: true });

        console.log("✅ チケット更新完了");
        setSuccess(true);
        setMessage(`${data.name}さん、入場処理が完了しました！`);

        // 5秒後にホームページにリダイレクト
        setTimeout(() => {
          navigate("/");
        }, 5000);
      } else {
        console.log("⚠️ チケットは既に使用済み");
        setError("このチケットは既に使用済みです。");
        
        // 5秒後にホームページにリダイレクト
        setTimeout(() => {
          navigate("/");
        }, 5000);
      }

    } catch (error) {
      console.error("エラー:", error);
      setError("チケット処理中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }, [eventCollectionName, eventUuid, ticketUuid, navigate]);

  useEffect(() => {
    if (!eventCollectionName || !eventUuid || !ticketUuid) {
      setError("無効なURL形式です。");
      setLoading(false);
      return;
    }

    fetchAndUpdateTicket();
  }, [eventCollectionName, eventUuid, ticketUuid, fetchAndUpdateTicket]);

  const handleReturnHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <PageContainer className={ticketPageContainer}>
        <div className={loadingCard}>
          <div className={ticketIcon}>
            🎫
          </div>
          <h2 className={ticketTitle}>
            チケット確認中...
          </h2>
          <p className={ticketDescription}>
            しばらくお待ちください
          </p>
        </div>
      </PageContainer>
    );
  }

  if (success && ticketData) {
    return (
      <PageContainer className={ticketPageContainer}>
        <div className={ticketCard}>
          <div className={successIcon}>
            ✅
          </div>
          <h1 className={successTitle}>
            入場完了！
          </h1>
          <div className={ticketInfoCard}>
            <div className={statusBadge}>
              入場済み
            </div>
            <h3 className={ticketName}>
              👤 {ticketData.name}さん
            </h3>
            <div className={ticketDetails}>
              <div className={detailItem}>
                <span>🎸</span>
                <span className={bandName}>
                  {ticketData.bandName}
                </span>
              </div>
              <div className={detailItem}>
                <span>🎫</span>
                <span className={eventName}>
                  {eventCollectionName}
                </span>
              </div>
            </div>
          </div>
          <p className={successDescription}>
            {message}
            <br />
            <small>5秒後に自動的にホームページに戻ります</small>
          </p>
          <Button
            onClick={handleReturnHome}
            className={homeButton}
          >
            🏠 ホームに戻る
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer className={ticketPageContainer}>
        <div className={ticketCard}>
          <div className={errorIcon}>
            ❌
          </div>
          <h1 className={errorTitle}>
            エラーが発生しました
          </h1>
          <div className={errorMessage}>
            <p className={errorText}>
              {error}
            </p>
          </div>
          <p className={successDescription}>
            5秒後に自動的にホームページに戻ります
          </p>
          <Button
            onClick={handleReturnHome}
            className={errorHomeButton}
          >
            🏠 ホームに戻る
          </Button>
        </div>
      </PageContainer>
    );
  }

  return null;
}
