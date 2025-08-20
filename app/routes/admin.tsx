import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "@remix-run/react";
import { doc, setDoc, collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db, auth } from "../root";
import { QRCodeCanvas } from "qrcode.react";

interface TicketData {
  uuid: string;
  name: string;
  bandName: string;
  createdBy: string;
  state: "未" | "済";
  createdAt: Timestamp;
}



interface EventData {
  id: string;
  title: string;
  dates?: string[];
  location?: string;
  price?: number;
  createdBy: string;
  createdAt: Timestamp;
  status?: string;
  oneDrink?: boolean;
  openTime?: string;
}

export default function AdminPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const eventTitle = searchParams.get("title") || "";
  const [visitorName, setVisitorName] = useState("");
  const [bandName, setBandName] = useState("");
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<TicketData | null>(null);
  const [showTicketDisplay, setShowTicketDisplay] = useState(false);

  // イベントタイトルが空の場合はメインページにリダイレクト
  useEffect(() => {
    if (!eventTitle) {
      navigate("/");
    }
  }, [eventTitle, navigate]);

  // イベント情報の取得
  const fetchEventData = useCallback(async () => {
    if (!eventTitle || !auth.currentUser) return;
    
    try {
      const eventCollectionName = eventTitle.trim()
        .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '')
        .replace(/\s+/g, '') || `event_${Date.now()}`;
      
      const eventDocs = await getDocs(collection(db, eventCollectionName));
      if (!eventDocs.empty) {
        const eventDoc = eventDocs.docs[0];
        const data = eventDoc.data();
        console.log('🔍 Raw event data from Firestore:', data);
        console.log('🔍 oneDrink value:', data.oneDrink, 'type:', typeof data.oneDrink);
        
        setEventData({
          id: eventDoc.id,
          title: data.title || eventTitle,
          dates: data.dates,
          location: data.location,
          price: data.price,
          createdBy: data.createdBy,
          createdAt: data.createdAt,
          status: data.status,
          oneDrink: data.oneDrink !== undefined ? data.oneDrink : true, // デフォルトはtrue
          openTime: data.openTime
        } as EventData);
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  }, [eventTitle]);

  // チケット一覧の取得
  const fetchTickets = useCallback(async () => {
    if (!eventTitle || !auth.currentUser) return;
    
    setLoading(true);
    try {
      // owner.tsxと統合された構造: eventTitle コレクション内の tickets サブコレクション
      const eventCollectionName = eventTitle.trim()
        .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '')
        .replace(/\s+/g, '') || `event_${Date.now()}`;
      
      // まずイベントが存在するかチェック
      const eventDocs = await getDocs(collection(db, eventCollectionName));
      if (eventDocs.empty) {
        console.warn(`Event collection ${eventCollectionName} not found`);
        setTickets([]);
        setEventData(null);
        return;
      }

      // イベントUUID（最初のドキュメント）を取得
      const eventDoc = eventDocs.docs[0];
      const eventUuid = eventDoc.id;
      
      // tickets サブコレクションから取得
      const ticketsCollection = collection(db, eventCollectionName, eventUuid, "tickets");
      const ticketsSnapshot = await getDocs(ticketsCollection);
      
      const ticketsList: TicketData[] = [];
      
      ticketsSnapshot.docs.forEach(docSnapshot => {
        const data = docSnapshot.data();
        if (data.uuid && data.name && data.state && data.createdBy) {
          ticketsList.push({
            uuid: data.uuid,
            name: data.name,
            bandName: data.bandName || "未設定", // 既存データ対応
            createdBy: data.createdBy,
            state: data.state,
            createdAt: data.createdAt
          } as TicketData);
        }
      });
      
      setTickets(ticketsList.sort((a, b) => {
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      }));
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [eventTitle]);

  // 初回読み込み時とイベントタイトル変更時にデータを取得
  useEffect(() => {
    fetchEventData();
    fetchTickets();
  }, [eventTitle, fetchEventData, fetchTickets]);

  // デバッグ用: showTicketDisplayの状態変化を監視
  useEffect(() => {
    console.log("🔍 showTicketDisplay 状態変化:", showTicketDisplay);
    if (showTicketDisplay) {
      console.log("🎫 チケット表示モーダルがアクティブになりました");
    }
  }, [showTicketDisplay]);

  // デバッグ用: createdTicketの状態変化を監視
  useEffect(() => {
    console.log("🔍 createdTicket 状態変化:", createdTicket);
  }, [createdTicket]);

  // レンダリング時のオーバーレイ状態をログ出力
  console.log("🎭 Render check - Overlay should display:", { 
    showTicketDisplay, 
    hasCreatedTicket: !!createdTicket, 
    hasEventData: !!eventData 
  });

  // チケット作成
  const createTicket = async () => {
    if (!visitorName.trim()) {
      alert("来場者の名前を入力してください。");
      return;
    }

    if (!bandName.trim()) {
      alert("バンド名を入力してください。");
      return;
    }

    if (!auth.currentUser) {
      alert("ログインしてください。");
      return;
    }

    try {
      // owner.tsxと同じコレクション名生成ロジックを使用
      const eventCollectionName = eventTitle.trim()
        .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '')
        .replace(/\s+/g, '') || `event_${Date.now()}`;
      
      console.log("Creating ticket with:", {
        eventTitle,
        eventCollectionName,
        visitorName: visitorName.trim()
      });
      
      // まずイベントが存在するかチェック
      const eventDocs = await getDocs(collection(db, eventCollectionName));
      if (eventDocs.empty) {
        alert("イベントが見つかりません。先にowner画面でイベントを作成してください。");
        return;
      }

      // イベントUUID（最初のドキュメント）を取得
      const eventDoc = eventDocs.docs[0];
      const eventUuid = eventDoc.id;
      
      // tickets サブコレクション内での重複チェック
      const ticketsCollection = collection(db, eventCollectionName, eventUuid, "tickets");
      const existingTicketSnap = await getDocs(query(ticketsCollection, where("name", "==", visitorName.trim())));

      if (!existingTicketSnap.empty) {
        alert("同じ名前のチケットが既に発行されています。");
        return;
      }

      const newTicketUuid = crypto.randomUUID();
      const ticketData: TicketData = {
        uuid: newTicketUuid,
        name: visitorName.trim(),
        bandName: bandName.trim(),
        createdBy: auth.currentUser.uid,
        state: "未",
        createdAt: Timestamp.now()
      };

      console.log("Ticket data to save:", ticketData);
      console.log("Firestore path:", `${eventCollectionName}/${eventUuid}/tickets/${newTicketUuid}`);

      // owner.tsxと統合された構造: eventCollection/eventUuid/tickets/ticketUuid
      await setDoc(doc(db, eventCollectionName, eventUuid, "tickets", newTicketUuid), ticketData);
      
      console.log("Ticket created successfully");
      
      // 作成されたチケット情報を保存してチケット表示を有効化
      console.log("Setting created ticket:", ticketData);
      console.log("Event data available:", eventData);
      console.log("Current showTicketDisplay state:", showTicketDisplay);
      console.log("Current createdTicket state:", createdTicket);
      
      setCreatedTicket(ticketData);
      setShowTicketDisplay(true);
      
      console.log("Ticket display should now be visible");
      console.log("✅ チケット作成が完了しました！モーダルが表示されるはずです。");
      
      setVisitorName("");
      setBandName("");
      
      // チケット一覧を再読み込み
      fetchTickets();
    } catch (error) {
      console.error("Error creating ticket:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: error && typeof error === 'object' && 'code' in error ? error.code : 'no-code',
        stack: error instanceof Error ? error.stack : 'no-stack'
      });
      alert(`チケットの作成に失敗しました。\nエラー: ${error instanceof Error ? error.message : 'Unknown error'}\n詳細はコンソールを確認してください。`);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif"
    }}>
      <style>{`
        .admin-container {
          background: #f5f5f5;
          min-height: 100vh;
        }
        .admin-header {
          background: #1976d2;
          color: white;
          padding: 16px 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .admin-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .back-btn {
          background: transparent;
          border: 2px solid white;
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .back-btn:hover {
          background: white;
          color: #1976d2;
        }
        .admin-title {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
        }
        .user-info {
          font-size: 14px;
          opacity: 0.9;
        }
        .content-wrapper {
          max-width: 1000px;
          margin: 0 auto;
          padding: 32px 24px;
        }
        .section-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          margin-bottom: 24px;
          overflow: hidden;
        }
        .section-header {
          background: #fafafa;
          padding: 20px 24px;
          border-bottom: 1px solid #e0e0e0;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }
        .section-content {
          padding: 24px;
        }
        .form-row {
          display: flex;
          gap: 16px;
          align-items: end;
        }
        .form-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .form-input:focus {
          outline: none;
          border-color: #1976d2;
        }
        .create-btn {
          background: #1976d2;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: background 0.2s;
          min-width: 120px;
        }
        .create-btn:hover {
          background: #1565c0;
        }
        .create-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .tickets-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .refresh-btn {
          background: #666;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }
        .refresh-btn:hover {
          background: #555;
        }
        .refresh-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .ticket-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .ticket-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .ticket-item:last-child {
          border-bottom: none;
        }
        .ticket-info {
          flex: 1;
        }
        .ticket-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin: 0 0 4px 0;
        }
        .ticket-details {
          font-size: 12px;
          color: #666;
          margin: 0;
        }
        .status-badge {
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          display: inline-block;
        }
        .status-pending {
          background: #ff9800;
        }
        .status-completed {
          background: #4caf50;
        }
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #666;
          font-size: 16px;
        }
        .loading-state {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 16px;
        }
        .ticket-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .ticket-modal {
          background: white;
          border-radius: 16px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          position: relative;
          z-index: 1001;
        }
        .ticket-modal-header {
          background: #1976d2;
          color: white;
          padding: 20px 24px;
          border-radius: 16px 16px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ticket-modal-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }
        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          cursor: pointer;
          font-size: 18px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
        }
        .ticket-modal-content {
          padding: 24px;
        }
      `}</style>

      {/* ヘッダー */}
      <div className="admin-header">
        <div className="admin-nav">
          <button className="back-btn" onClick={() => navigate("/")}>
            ← 戻る
          </button>
          <h1 className="admin-title">{eventTitle} - 管理画面</h1>
          <div className="user-info">
            {auth.currentUser?.displayName}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="content-wrapper">
        {/* イベント情報セクション */}
        {eventData ? (
          <div className="section-card" style={{ marginBottom: '24px' }}>
            <div className="section-header">
              <h2 className="section-title">📅 イベント情報</h2>
            </div>
            <div className="section-content">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <strong>タイトル:</strong> {eventData.title}
                </div>
                {eventData.dates && eventData.dates.length > 0 && (
                  <div>
                    <strong>開催日:</strong> {eventData.dates.join(', ')}
                  </div>
                )}
                {eventData.location && (
                  <div>
                    <strong>場所:</strong> {eventData.location}
                  </div>
                )}
                {eventData.price !== undefined && (
                  <div>
                    <strong>料金:</strong> ¥{eventData.price.toLocaleString()}
                  </div>
                )}
                <div>
                  <strong>ステータス:</strong> {eventData.status || '不明'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="section-card" style={{ marginBottom: '24px' }}>
            <div className="section-header">
              <h2 className="section-title">⚠️ イベントが見つかりません</h2>
            </div>
            <div className="section-content">
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                <p>「{eventTitle}」というイベントが見つかりませんでした。</p>
                <p>先にownerページでイベントを作成してください。</p>
                <button 
                  style={{
                    background: '#666',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginTop: '12px'
                  }}
                  onClick={() => navigate("/owner")}
                >
                  ownerページへ移動
                </button>
              </div>
            </div>
          </div>
        )}

        {/* チケット作成セクション */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">新しいチケット作成</h2>
          </div>
          <div className="section-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="来場者の名前（フルネーム・漢字）を入力してください"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
              />
              <input
                type="text"
                className="form-input"
                placeholder="バンド名を入力してください"
                value={bandName}
                onChange={(e) => setBandName(e.target.value)}
              />
              <button 
                className="create-btn"
                onClick={createTicket}
                disabled={loading}
                style={{ marginTop: '8px' }}
              >
                {loading ? "作成中..." : "作成"}
              </button>
            </div>
          </div>
        </div>



        {/* チケット一覧セクション */}
        <div className="section-card">
          <div className="section-header">
            <div className="tickets-header">
              <h2 className="section-title">発行済みチケット一覧</h2>
              <button 
                className="refresh-btn" 
                onClick={fetchTickets} 
                disabled={loading}
              >
                更新
              </button>
            </div>
          </div>
          <div className="section-content">
            {loading ? (
              <div className="loading-state">読み込み中...</div>
            ) : tickets.length > 0 ? (
              <ul className="ticket-list">
                {tickets.map((ticket) => (
                  <li key={ticket.uuid} className="ticket-item">
                    <div className="ticket-info">
                      <h3 className="ticket-name">{ticket.name}</h3>
                      <p className="ticket-details">
                        🎸 バンド: {ticket.bandName} | UUID: {ticket.uuid} | 作成者: {ticket.createdBy}
                      </p>
                    </div>
                    <span 
                      className={`status-badge ${ticket.state === "済" ? "status-completed" : "status-pending"}`}
                    >
                      {ticket.state === "済" ? "✓ 入場済み" : "⏳ 未入場"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                まだチケットが発行されていません
              </div>
            )}
          </div>
        </div>
      </div>

      {/* チケット表示オーバーレイ */}
      {showTicketDisplay && createdTicket && (
        <div 
          className="ticket-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ticket-modal-title"
        >
          <button 
            className="overlay-backdrop"
            onClick={() => setShowTicketDisplay(false)}
            aria-label="モーダルを閉じる"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          />
          <div className="ticket-modal">
            <div className="ticket-modal-header">
              <h2 id="ticket-modal-title" className="ticket-modal-title">📱 生成されたチケット</h2>
              <button 
                className="close-btn"
                onClick={() => setShowTicketDisplay(false)}
                title="閉じる"
              >
                ×
              </button>
            </div>
            <div className="ticket-modal-content">
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <strong>下記の画像をスクリーンショットしてください。</strong>
              </div>
              
              <div style={{ 
                backgroundColor: 'white', 
                color: 'black', 
                padding: '20px', 
                borderRadius: '8px',
                marginBottom: '16px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                border: '2px solid black'
              }}>
                <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                  {createdTicket.name}さん用入場チケット
                </div>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: '600',
                  textAlign: 'center', 
                  margin: '16px 0',
                  fontFamily: 'Irish Grover, cursive' 
                }}>
                  {eventData?.title || eventTitle}
                </div>
                <div style={{ fontSize: '14px', textAlign: 'right', marginBottom: '16px' }}>
                  {eventData?.location ? `in ${eventData.location}` : 'in Suzuka Sound Stage'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    {eventData?.dates && eventData.dates.length > 0 && (
                      <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                        Date: {eventData.dates.map(date => {
                          // 日付文字列から月日のみを抽出（例：2024-12-25T18:00 → 12/25）
                          try {
                            const dateObj = new Date(date);
                            return `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
                          } catch {
                            return date;
                          }
                        }).join(', ')}
                      </div>
                    )}
                    <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                      Open: {(() => {
                        // datesから時間を抽出してHH:MM形式で表示
                        if (eventData?.dates && eventData.dates.length > 0) {
                          try {
                            const firstDate = eventData.dates[0];
                            if (firstDate.includes('T')) {
                              // datetime-local形式（YYYY-MM-DDTHH:MM）から時間部分を抽出
                              const timePart = firstDate.split('T')[1];
                              return timePart || '18:00';
                            } else {
                              // 時間情報がない場合は日付から時間を抽出
                              const dateObj = new Date(firstDate);
                              const hours = dateObj.getHours().toString().padStart(2, '0');
                              const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                              return `${hours}:${minutes}`;
                            }
                          } catch {
                            return '18:00';
                          }
                        }
                        return eventData?.openTime || '18:00';
                      })()}
                    </div>
                    <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                      バンド: {createdTicket.bandName}
                    </div>
                    {eventData?.price !== undefined && (
                      <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                        Price: ¥{eventData.price.toLocaleString()}{(() => {
                          // oneDrinkがundefinedの場合はデフォルトでtrueとして扱う（owner.tsxと同じ）
                          const isOneDrink = eventData?.oneDrink !== undefined ? eventData.oneDrink : true;
                          console.log('🍺 oneDrink check:', { 
                            original: eventData?.oneDrink, 
                            processed: isOneDrink,
                            shouldShow: isOneDrink ? 'YES' : 'NO'
                          });
                          return isOneDrink ? ' + 1dr' : '';
                        })()}
                      </div>
                    )}
                  </div>
                  <QRCodeCanvas 
                    value={`${window.location.origin}/ticket/${createdTicket.uuid}`} 
                    size={75} 
                    level="H" 
                  />
                </div>
              </div>
              
              <div style={{ 
                backgroundColor: 'white', 
                color: 'black', 
                padding: '20px', 
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                border: '2px solid black'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '14px' }}>
                  *注意事項*
                </div>
                <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                  ・当日はドリンク代として500円を持ってきてください。
                </div>
                <div style={{ fontSize: '14px', marginBottom: '16px' }}>
                  ・ライブハウスには駐車場がないので電車、バスの利用をお願いします。
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                    会場の場所はこちら↓
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    {eventData?.location || '〒510-0256 三重県鈴鹿市磯山1-9-8'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}