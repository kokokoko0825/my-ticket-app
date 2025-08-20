import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@remix-run/react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../root";

interface TicketData {
  uuid: string;
  name: string;
  bandName: string;
  createdBy: string;
  state: "未" | "済";
  status: "未" | "済";
  createdAt: any;
}

export default function NewFormatTicketPage() {
  const { eventCollectionName, eventUuid, ticketUuid } = useParams();
  const navigate = useNavigate();
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!eventCollectionName || !eventUuid || !ticketUuid) {
      setError("無効なURL形式です。");
      setLoading(false);
      return;
    }

    fetchAndUpdateTicket();
  }, [eventCollectionName, eventUuid, ticketUuid]);

  const fetchAndUpdateTicket = async () => {
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
      const currentStatus = data.state || data.status || "未";
      
      if (currentStatus === "未") {
        console.log("🎫 チケット状態を更新中...");
        
        // 両方のフィールドを更新（互換性のため）
        await setDoc(ticketDocRef, {
          state: "済",
          status: "済"
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
      }

    } catch (error) {
      console.error("エラー:", error);
      setError("チケット処理中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleReturnHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif"
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '90%'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px',
            animation: 'spin 2s linear infinite'
          }}>
            🎫
          </div>
          <h2 style={{ color: '#333', marginBottom: '10px' }}>
            チケット確認中...
          </h2>
          <p style={{ color: '#666', margin: 0 }}>
            しばらくお待ちください
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (success && ticketData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif"
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          maxWidth: '500px',
          width: '90%'
        }}>
          <div style={{
            fontSize: '72px',
            marginBottom: '20px',
            color: '#4CAF50'
          }}>
            ✅
          </div>
          <h1 style={{
            color: '#4CAF50',
            marginBottom: '20px',
            fontSize: '28px'
          }}>
            入場完了！
          </h1>
          <div style={{
            background: '#f8f9fa',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#333', marginBottom: '10px' }}>
              {ticketData.name}さん
            </h3>
            <p style={{ color: '#666', margin: '5px 0' }}>
              🎸 バンド: {ticketData.bandName}
            </p>
            <p style={{ color: '#666', margin: '5px 0' }}>
              🎫 コレクション: {eventCollectionName}
            </p>
          </div>
          <p style={{
            color: '#666',
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            {message}
            <br />
            <small>5秒後に自動的にホームページに戻ります</small>
          </p>
          <button
            onClick={handleReturnHome}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '25px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: '600'
            }}
          >
            🏠 ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif"
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          maxWidth: '500px',
          width: '90%'
        }}>
          <div style={{
            fontSize: '72px',
            marginBottom: '20px',
            color: '#f44336'
          }}>
            ❌
          </div>
          <h1 style={{
            color: '#f44336',
            marginBottom: '20px',
            fontSize: '28px'
          }}>
            エラーが発生しました
          </h1>
          <div style={{
            background: '#ffebee',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <p style={{ color: '#c62828', margin: 0, fontWeight: '500' }}>
              {error}
            </p>
          </div>
          <div style={{
            background: '#f8f9fa',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <h4 style={{ color: '#333', marginBottom: '10px' }}>📋 Firestore パス情報:</h4>
            <p style={{ color: '#666', margin: '5px 0', fontSize: '14px' }}>
              コレクション: {eventCollectionName}
            </p>
            <p style={{ color: '#666', margin: '5px 0', fontSize: '14px' }}>
              イベントUUID: {eventUuid}
            </p>
            <p style={{ color: '#666', margin: '5px 0', fontSize: '14px' }}>
              チケットUUID: {ticketUuid}
            </p>
            <p style={{ color: '#666', margin: '5px 0', fontSize: '14px' }}>
              完全パス: {eventCollectionName}/{eventUuid}/tickets/{ticketUuid}
            </p>
          </div>
          <div style={{
            background: '#fff3e0',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '30px',
            textAlign: 'left'
          }}>
            <h4 style={{ color: '#ef6c00', marginBottom: '10px' }}>💡 推奨対策:</h4>
            <ul style={{ color: '#bf360c', margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
              <li>admin.tsx画面でチケットが正しく作成されているか確認</li>
              <li>owner.tsx画面でイベントが存在するか確認</li>
              <li>Firestoreでコレクション「{eventCollectionName}」が存在するか確認</li>
              <li>ネットワーク接続を確認してから再試行</li>
            </ul>
          </div>
          <button
            onClick={handleReturnHome}
            style={{
              background: '#666',
              color: 'white',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '25px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: '600'
            }}
          >
            🏠 ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return null;
}
