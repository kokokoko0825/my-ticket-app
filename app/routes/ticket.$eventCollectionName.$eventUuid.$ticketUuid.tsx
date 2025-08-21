import { useState, useEffect, useCallback } from "react";
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
          borderRadius: '1.25rem',
          padding: '1.25rem',
          textAlign: 'center',
          boxShadow: '0 1rem 2rem rgba(0,0,0,0.12)',
          maxWidth: '25rem',
          width: '100%',
          margin: '0 0.75rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1.25rem',
            animation: 'spin 2s linear infinite'
          }}>
            🎫
          </div>
          <h2 style={{ color: '#333', marginBottom: '0.625rem' }}>
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
        padding: '1rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '1.25rem',
          padding: '1.5rem',
          textAlign: 'center',
          boxShadow: '0 16px 32px rgba(0,0,0,0.12)',
          maxWidth: '500px',
          width: '100%',
          margin: '0 12px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            color: '#4CAF50'
          }}>
            ✅
          </div>
          <h1 style={{
            color: '#4CAF50',
            marginBottom: '1rem',
            fontSize: '1.5rem'
          }}>
            入場完了！
          </h1>
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            borderRadius: '1rem',
            padding: '1.25rem',
            marginBottom: '1.25rem',
            position: 'relative',
            border: '2px solid #e1e5e9'
          }}>
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: '#4CAF50',
              color: 'white',
              borderRadius: '1.25rem',
              padding: '0.25rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              入場済み
            </div>
            <h3 style={{ 
              color: '#212121', 
              marginBottom: '0.75rem', 
              fontSize: '1.25rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              👤 {ticketData.name}さん
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              textAlign: 'left'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '0.75rem'
              }}>
                <span style={{ fontSize: '1rem' }}>🎸</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1976d2' }}>
                  {ticketData.bandName}
                </span>
              </div>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '0.75rem'
              }}>
                <span style={{ fontSize: '1rem' }}>🎫</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#757575' }}>
                  {eventCollectionName}
                </span>
              </div>
            </div>
          </div>
          <p style={{
            color: '#666',
            marginBottom: '1.25rem',
            lineHeight: '1.6',
            fontSize: '0.875rem'
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
              padding: '1rem 2rem',
              borderRadius: '1.875rem',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontWeight: '700',
              minHeight: '3.5rem',
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
        padding: '1rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '1.25rem',
          padding: '1.5rem',
          textAlign: 'center',
          boxShadow: '0 16px 32px rgba(0,0,0,0.12)',
          maxWidth: '500px',
          width: '100%',
          margin: '0 12px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            color: '#f44336'
          }}>
            ❌
          </div>
          <h1 style={{
            color: '#f44336',
            marginBottom: '1rem',
            fontSize: '1.5rem'
          }}>
            エラーが発生しました
          </h1>
          <div style={{
            background: '#ffebee',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '1.25rem'
          }}>
            <p style={{ color: '#c62828', margin: 0, fontWeight: '500' }}>
              {error}
            </p>
          </div>
          <div style={{
            background: '#f8f9fa',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '1.25rem',
            textAlign: 'left'
          }}>
            <h4 style={{ color: '#333', marginBottom: '0.625rem' }}>📋 Firestore パス情報:</h4>
            <p style={{ color: '#666', margin: '0.3125rem 0', fontSize: '0.875rem' }}>
              コレクション: {eventCollectionName}
            </p>
            <p style={{ color: '#666', margin: '0.3125rem 0', fontSize: '0.875rem' }}>
              イベントUUID: {eventUuid}
            </p>
            <p style={{ color: '#666', margin: '0.3125rem 0', fontSize: '0.875rem' }}>
              チケットUUID: {ticketUuid}
            </p>
            <p style={{ color: '#666', margin: '0.3125rem 0', fontSize: '0.875rem' }}>
              完全パス: {eventCollectionName}/{eventUuid}/tickets/{ticketUuid}
            </p>
          </div>
          <div style={{
            background: '#fff3e0',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '1.875rem',
            textAlign: 'left'
          }}>
            <h4 style={{ color: '#ef6c00', marginBottom: '0.625rem' }}>💡 推奨対策:</h4>
            <ul style={{ color: '#bf360c', margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
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
              padding: '1rem 2rem',
              borderRadius: '1.875rem',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontWeight: '700',
              minHeight: '3.5rem',
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
