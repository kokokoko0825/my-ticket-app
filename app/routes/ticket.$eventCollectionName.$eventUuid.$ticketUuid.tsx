import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@remix-run/react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../root";

interface TicketData {
  uuid: string;
  name: string;
  bandName: string;
  createdBy: string;
  status: "未" | "済";
  state?: "未" | "済"; // 既存データとの互換性のため一時的に保持
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
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 16px 32px rgba(0,0,0,0.12)',
          maxWidth: '400px',
          width: '100%',
          margin: '0 12px',
          position: 'relative',
          overflow: 'hidden'
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
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        padding: '16px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          textAlign: 'center',
          boxShadow: '0 16px 32px rgba(0,0,0,0.12)',
          maxWidth: '500px',
          width: '100%',
          margin: '0 12px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            color: '#4CAF50'
          }}>
            ✅
          </div>
          <h1 style={{
            color: '#4CAF50',
            marginBottom: '16px',
            fontSize: '24px'
          }}>
            入場完了！
          </h1>
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            position: 'relative',
            border: '2px solid #e1e5e9'
          }}>
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: '#4CAF50',
              color: 'white',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              入場済み
            </div>
            <h3 style={{ 
              color: '#212121', 
              marginBottom: '12px', 
              fontSize: '20px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              👤 {ticketData.name}さん
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              textAlign: 'left'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '12px'
              }}>
                <span style={{ fontSize: '16px' }}>🎸</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1976d2' }}>
                  {ticketData.bandName}
                </span>
              </div>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '12px'
              }}>
                <span style={{ fontSize: '16px' }}>🎫</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#757575' }}>
                  {eventCollectionName}
                </span>
              </div>
            </div>
          </div>
          <p style={{
            color: '#666',
            marginBottom: '20px',
            lineHeight: '1.6',
            fontSize: '14px'
          }}>
            {message}
            <br />
            <small>5秒後に自動的にホームページに戻ります</small>
          </p>
          <button
            onClick={handleReturnHome}
            style={{
              background: 'linear-gradient(135deg, #4CAF50, #2e7d32)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '30px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontWeight: '700',
              minHeight: '56px',
              touchAction: 'manipulation',
              boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(76, 175, 80, 0.3)';
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
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        padding: '16px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          textAlign: 'center',
          boxShadow: '0 16px 32px rgba(0,0,0,0.12)',
          maxWidth: '500px',
          width: '100%',
          margin: '0 12px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            color: '#f44336'
          }}>
            ❌
          </div>
          <h1 style={{
            color: '#f44336',
            marginBottom: '16px',
            fontSize: '24px'
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
              background: 'linear-gradient(135deg, #757575, #616161)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '30px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontWeight: '700',
              minHeight: '56px',
              touchAction: 'manipulation',
              boxShadow: '0 4px 16px rgba(117, 117, 117, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(117, 117, 117, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(117, 117, 117, 0.3)';
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
