import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../root";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@remix-run/react";

interface TicketData {
  uuid: string;
  name: string;
  bandName?: string;
  status: "未" | "済";
  createdBy: string;
  eventTitle?: string;
  eventId?: string;
}

export default function Ticket() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const fetchAndUpdateTicket = async () => {
      if (!uuid) {
        setStatus("error");
        setMessage("QRコードが正しく読み取れませんでした。再度お試しください。");
        return;
      }

      try {
        // まず旧形式（直接ticketsコレクション）をチェック
        let ticketRef = doc(db, "tickets", uuid);
        const ticketSnap = await getDoc(ticketRef);
        let foundTicketData: TicketData | null = null;

        if (ticketSnap.exists()) {
          foundTicketData = ticketSnap.data() as TicketData;
        } else {
          // 新形式（イベントコレクション/イベントUUID/tickets/チケットUUID）を検索
          const collections = await getKnownCollections();
          
          for (const collectionName of collections) {
            const eventSnapshot = await getDocs(collection(db, collectionName));
            
            for (const eventDoc of eventSnapshot.docs) {
              const ticketsRef = collection(db, collectionName, eventDoc.id, "tickets");
              const ticketsSnapshot = await getDocs(ticketsRef);
              
              for (const ticketDoc of ticketsSnapshot.docs) {
                if (ticketDoc.id === uuid) {
                  foundTicketData = ticketDoc.data() as TicketData;
                  ticketRef = ticketDoc.ref;
                  break;
                }
              }
              if (foundTicketData) break;
            }
            if (foundTicketData) break;
          }
        }

        if (!foundTicketData) {
          setStatus("error");
          setMessage("チケットが見つかりません。QRコードが正しいか確認してください。");
          return;
        }

        if (foundTicketData.status === "済") {
          setStatus("error");
          setMessage("このチケットは既に使用済みです。重複入場はできません。");
          setTicketData(foundTicketData);
          return;
        }

        // ステータスを「済」に更新
        await updateDoc(ticketRef, { status: "済" });
        
        setTicketData({ ...foundTicketData, status: "済" });
        setStatus("success");
        setMessage("入場処理が完了しました！");
        
      } catch (error) {
        console.error("Error processing ticket:", error);
        setStatus("error");
        setMessage("チケット処理中にエラーが発生しました。係員にお声がけください。");
      }
    };

    fetchAndUpdateTicket();
  }, [uuid]);

  // 成功時のカウントダウン
  useEffect(() => {
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === "success" && countdown === 0) {
      navigate("/");
    }
  }, [status, countdown, navigate]);

  // 既知のコレクション名を取得する関数
  const getKnownCollections = async (): Promise<string[]> => {
    const baseCollections = ["tickets", "users", "events", "products"];
    const savedCollections = JSON.parse(localStorage.getItem('customCollections') || '[]');
    return [...baseCollections, ...savedCollections].filter(name => 
      !["tickets", "users", "events", "products"].includes(name)
    );
  };

  const handleReturnHome = () => {
    navigate("/");
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px'
    }}>
      <style>{`
        .ticket-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          padding: 40px;
          max-width: 500px;
          width: 100%;
          text-align: center;
        }
        .status-icon {
          font-size: 80px;
          margin-bottom: 24px;
          display: block;
        }
        .status-title {
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: #333;
        }
        .status-message {
          font-size: 16px;
          color: #666;
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .ticket-info {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          border-left: 4px solid #1976d2;
        }
        .ticket-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .ticket-info-row:last-child {
          margin-bottom: 0;
        }
        .ticket-info-label {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }
        .ticket-info-value {
          color: #666;
          font-size: 14px;
        }
        .action-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .btn {
          padding: 12px 24px;
          border-radius: 8px;
          border: none;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
        }
        .btn-primary {
          background: #1976d2;
          color: white;
        }
        .btn-primary:hover {
          background: #1565c0;
        }
        .btn-secondary {
          background: #f5f5f5;
          color: #333;
          border: 2px solid #e0e0e0;
        }
        .btn-secondary:hover {
          background: #e0e0e0;
        }
        .countdown-text {
          font-size: 14px;
          color: #666;
          margin-top: 16px;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e0e0e0;
          border-top: 4px solid #1976d2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 24px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .success-animation {
          animation: successPulse 2s ease-in-out;
        }
        @keyframes successPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div className={`ticket-container ${status === "success" ? "success-animation" : ""}`}>
        {status === "loading" && (
          <>
            <div className="loading-spinner"></div>
            <h1 className="status-title">チケット処理中...</h1>
            <p className="status-message">
              QRコードを確認しています。<br/>
              しばらくお待ちください。
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <span className="status-icon">✅</span>
            <h1 className="status-title" style={{ color: '#4caf50' }}>入場完了！</h1>
            <p className="status-message">
              {message}
              <br/>ライブをお楽しみください！
            </p>
            
            {ticketData && (
              <div className="ticket-info">
                <div className="ticket-info-row">
                  <span className="ticket-info-label">お名前:</span>
                  <span className="ticket-info-value">{ticketData.name}</span>
                </div>
                {ticketData.bandName && (
                  <div className="ticket-info-row">
                    <span className="ticket-info-label">バンド:</span>
                    <span className="ticket-info-value">{ticketData.bandName}</span>
                  </div>
                )}
                {ticketData.eventTitle && (
                  <div className="ticket-info-row">
                    <span className="ticket-info-label">イベント:</span>
                    <span className="ticket-info-value">{ticketData.eventTitle}</span>
                  </div>
                )}
                <div className="ticket-info-row">
                  <span className="ticket-info-label">ステータス:</span>
                  <span className="ticket-info-value" style={{ color: '#4caf50', fontWeight: '600' }}>
                    入場済み
                  </span>
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handleReturnHome}>
                ホームに戻る
              </button>
            </div>
            
            <p className="countdown-text">
              {countdown}秒後に自動的にホームに戻ります
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <span className="status-icon">❌</span>
            <h1 className="status-title" style={{ color: '#f44336' }}>エラー</h1>
            <p className="status-message">{message}</p>
            
            {ticketData && (
              <div className="ticket-info">
                <div className="ticket-info-row">
                  <span className="ticket-info-label">お名前:</span>
                  <span className="ticket-info-value">{ticketData.name}</span>
                </div>
                {ticketData.bandName && (
                  <div className="ticket-info-row">
                    <span className="ticket-info-label">バンド:</span>
                    <span className="ticket-info-value">{ticketData.bandName}</span>
                  </div>
                )}
                <div className="ticket-info-row">
                  <span className="ticket-info-label">現在のステータス:</span>
                  <span className="ticket-info-value" style={{ 
                    color: ticketData.status === "済" ? '#f44336' : '#ff9800', 
                    fontWeight: '600' 
                  }}>
                    {ticketData.status === "済" ? "使用済み" : "未使用"}
                  </span>
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handleReturnHome}>
                ホームに戻る
              </button>
              <button className="btn btn-secondary" onClick={() => window.location.reload()}>
                再試行
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}