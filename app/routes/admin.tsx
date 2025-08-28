import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "@remix-run/react";
import { doc, setDoc, collection, getDocs, query, where, Timestamp, updateDoc } from "firebase/firestore";
import { db, auth } from "../root";
import { signOut, onAuthStateChanged } from "firebase/auth";
import firebase from "firebase/compat/app";
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardContent, 
  Header, 
  PageContainer, 
  ContentWrapper, 
  Modal,
  StatusBadge,
  TicketDisplay
} from "../components";
import * as styles from "../styles/admin.css";

interface TicketData {
  uuid: string;
  name: string;
  bandName: string;
  createdBy: string;
  status: "未" | "済";
  state?: "未" | "済"; // 既存データとの互換性のため一時的に保持
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
  const eventDate = searchParams.get("date") || "";
  const [visitorName, setVisitorName] = useState("");
  const [bandName, setBandName] = useState("");
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<TicketData | null>(null);
  const [showTicketDisplay, setShowTicketDisplay] = useState(false);
  const [currentEventCollectionName, setCurrentEventCollectionName] = useState<string>("");
  const [currentEventUuid, setCurrentEventUuid] = useState<string>("");
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [showSelectedTicketDisplay, setShowSelectedTicketDisplay] = useState(false);
  const [user, setUser] = useState<firebase.User | null>(null);

  // イベントタイトルが空の場合はメインページにリダイレクト
  useEffect(() => {
    if (!eventTitle) {
      navigate("/");
    }
  }, [eventTitle, navigate]);

  // ユーザー認証状態の監視
  useEffect(() => { 
    const unsubscribe = onAuthStateChanged(auth, (user) => setUser(user as firebase.User | null));
    return () => unsubscribe();
  }, []);

  // ログアウト処理
  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // イベント情報の取得
  const fetchEventData = useCallback(async () => {
    if (!eventTitle || !auth.currentUser) return;
    
    try {
      const eventCollectionName = eventTitle.trim()
        .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '')
        .replace(/\s+/g, '') || `event_${Date.now()}`;
      
      const eventDocs = await getDocs(collection(db, eventCollectionName));
      if (!eventDocs.empty) {
        // 厳密一致: title と dates[0] がどちらも一致
        const matchingDoc = eventDocs.docs.find(d => {
          const data = d.data() as { title?: string; dates?: string[] };
          const dates = data?.dates || [];
          const firstDate = dates.length > 0 ? String(dates[0]) : '';
          return data?.title === eventTitle && firstDate === eventDate;
        });
        if (!matchingDoc) {
          setEventData(null);
          return;
        }
        const eventDoc = matchingDoc;
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
  }, [eventTitle, eventDate]);

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
      // 厳密一致: title と dates[0] がどちらも一致
      const matchingDoc = eventDocs.docs.find(d => {
        const data = d.data() as { title?: string; dates?: string[] };
        const dates = data?.dates || [];
        const firstDate = dates.length > 0 ? String(dates[0]) : '';
        return data?.title === eventTitle && firstDate === eventDate;
      });
      if (!matchingDoc) {
        setTickets([]);
        setEventData(null);
        return;
      }
      const eventDoc = matchingDoc;
      const eventUuid = eventDoc.id;
      
      // tickets サブコレクションから取得
      const ticketsCollection = collection(db, eventCollectionName, eventUuid, "tickets");
      const ticketsSnapshot = await getDocs(ticketsCollection);
      
      const ticketsList: TicketData[] = [];
      
      ticketsSnapshot.docs.forEach(docSnapshot => {
        const data = docSnapshot.data();
        // status または state のいずれかが存在し、必要なフィールドがある場合
        if (data.uuid && data.name && (data.status || data.state) && data.createdBy) {
          // statusを優先し、なければstateを使用
          const ticketStatus = data.status || data.state;
          ticketsList.push({
            uuid: data.uuid,
            name: data.name,
            bandName: data.bandName || "未設定", // 既存データ対応
            createdBy: data.createdBy,
            status: ticketStatus,
            state: data.state, // 既存データとの互換性のため保持
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
  }, [eventTitle, eventDate]);

  // 初回読み込み時とイベントタイトル変更時にデータを取得
  useEffect(() => {
    fetchEventData();
    fetchTickets();
  }, [eventTitle, eventDate, fetchEventData, fetchTickets]);

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

  // 既存チケットの表示処理
  const handleTicketNameClick = async (ticket: TicketData) => {
    try {
      // イベント情報とコレクション名を設定
      const eventCollectionName = eventTitle.trim()
        .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '')
        .replace(/\s+/g, '') || `event_${Date.now()}`;
      
      // イベントUUIDを取得
      const eventDocs = await getDocs(collection(db, eventCollectionName));
      if (!eventDocs.empty) {
        const eventDoc = eventDocs.docs[0];
        const eventUuid = eventDoc.id;
        
        setSelectedTicket(ticket);
        setCurrentEventCollectionName(eventCollectionName);
        setCurrentEventUuid(eventUuid);
        setShowSelectedTicketDisplay(true);
        
        console.log("Selected ticket for display:", ticket);
      } else {
        alert("イベント情報が見つかりません。");
      }
    } catch (error) {
      console.error("Error displaying ticket:", error);
      alert("チケット表示中にエラーが発生しました。");
    }
  };

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
        status: "未",
        createdAt: Timestamp.now()
      };

      console.log("Ticket data to save:", ticketData);
      console.log("Firestore path:", `${eventCollectionName}/${eventUuid}/tickets/${newTicketUuid}`);

      // owner.tsxと統合された構造: eventCollection/eventUuid/tickets/ticketUuid
      await setDoc(doc(db, eventCollectionName, eventUuid, "tickets", newTicketUuid), ticketData);
      
      // 既存データでstateフィールドがある場合のマイグレーション処理
      await migrateStateToStatus(eventCollectionName, eventUuid);
      
      console.log("Ticket created successfully");
      
      // 作成されたチケット情報を保存してチケット表示を有効化
      console.log("Setting created ticket:", ticketData);
      console.log("Event data available:", eventData);
      console.log("Current showTicketDisplay state:", showTicketDisplay);
      console.log("Current createdTicket state:", createdTicket);
      
      setCreatedTicket(ticketData);
      setCurrentEventCollectionName(eventCollectionName);
      setCurrentEventUuid(eventUuid);
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

  // 既存データのstateをstatusに移行する関数
  const migrateStateToStatus = async (eventCollectionName: string, eventUuid: string) => {
    try {
      const ticketsCollection = collection(db, eventCollectionName, eventUuid, "tickets");
      const ticketsSnapshot = await getDocs(ticketsCollection);
      
      const migrationPromises: Promise<void>[] = [];
      
      ticketsSnapshot.docs.forEach(docSnapshot => {
        const data = docSnapshot.data();
        
        // stateフィールドはあるがstatusフィールドがない場合
        if (data.state && !data.status) {
          console.log(`Migrating ticket ${docSnapshot.id}: state -> status`);
          
          const migrationPromise = updateDoc(docSnapshot.ref, {
            status: data.state,
            // stateフィールドを削除
            state: null
          }).then(() => {
            console.log(`✅ Migrated ticket ${docSnapshot.id}`);
          }).catch((error) => {
            console.error(`❌ Failed to migrate ticket ${docSnapshot.id}:`, error);
          });
          
          migrationPromises.push(migrationPromise);
        }
      });
      
      if (migrationPromises.length > 0) {
        console.log(`🔄 Migrating ${migrationPromises.length} tickets from state to status...`);
        await Promise.all(migrationPromises);
        console.log(`✅ Migration completed for ${migrationPromises.length} tickets`);
      }
    } catch (error) {
      console.error("Error during state to status migration:", error);
    }
  };

  return (
    <PageContainer background="#f5f5f5">

      {/* ヘッダー */}
      <Header
        title={`${eventTitle} - 管理画面`}
        user={user}
        onSignOut={signOutUser}
        showBackButton
        type="primary"
      />

      {/* メインコンテンツ */}
      <ContentWrapper maxWidth="1000px">
        {/* イベント情報セクション */}
        {eventData ? (
          <Card style={{ marginBottom: '24px' }} className={styles.responsiveCard}>
            <CardHeader type="primary">
              <h2 className={styles.sectionTitle}>📅 イベント情報</h2>
            </CardHeader>
            <CardContent>
              <div className={styles.eventInfoGrid}>
                <div className={styles.eventInfoText}>
                  <strong>タイトル:</strong> {eventData.title}
                </div>
                {eventData.dates && eventData.dates.length > 0 && (
                  <div className={styles.eventInfoText}>
                    <strong>開催日:</strong> {eventData.dates.join(', ')}
                  </div>
                )}
                {eventData.location && (
                  <div className={styles.eventInfoText}>
                    <strong>場所:</strong> {eventData.location}
                  </div>
                )}
                {eventData.price !== undefined && (
                  <div className={styles.eventInfoText}>
                    <strong>料金:</strong> ¥{eventData.price.toLocaleString()}
                  </div>
                )}
                <div className={styles.eventInfoText}>
                  <strong>ステータス:</strong> {eventData.status || '不明'}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card style={{ marginBottom: '24px' }} className={styles.responsiveCard}>
            <CardHeader type="primary">
              <h2 className={styles.sectionTitle}>⚠️ イベントが見つかりません</h2>
            </CardHeader>
            <CardContent>
              <div className={styles.errorMessage}>
                <p>「{eventTitle}」というイベントが見つかりませんでした。</p>
                <p>先にownerページでイベントを作成してください。</p>
                <Button 
                  className={styles.navigationButton}
                  onClick={() => navigate("/owner")}
                >
                  ownerページへ移動
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* チケット作成セクション */}
        <Card>
          <CardHeader type="primary">
            <h2 className={styles.sectionTitle}>🎫 新しいチケット作成</h2>
          </CardHeader>
          <CardContent>
            <div className={styles.ticketForm}>
              <Input
                placeholder="来場者の名前（フルネーム・漢字）を入力してください"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
              />
              <Input
                placeholder="バンド名を入力してください"
                value={bandName}
                onChange={(e) => setBandName(e.target.value)}
              />
              <Button 
                onClick={createTicket}
                disabled={loading}
                style={{ marginTop: '8px' }}
              >
                {loading ? "🔄 作成中..." : "✨ チケット作成"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* チケット一覧セクション */}
        <Card>
          <CardHeader type="primary">
            <div className={styles.ticketsHeader}>
              <h2 className={styles.sectionTitle}>📋 発行済みチケット一覧</h2>
              <div className={styles.buttonGroup}>
                <Button 
                  size="sm"
                  onClick={fetchTickets} 
                  disabled={loading}
                  style={{ background: '#ff9800' }}
                >
                  🔄 更新
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className={styles.loadingState}>読み込み中...</div>
            ) : tickets.length > 0 ? (
              <ul className={styles.ticketList}>
                {tickets.map((ticket) => (
                  <li key={ticket.uuid} className={styles.ticketItem}>
                    <div className={styles.ticketInfo}>
                      <button 
                        className={styles.ticketName}
                        onClick={() => handleTicketNameClick(ticket)}
                        title="クリックしてチケットを表示"
                        aria-label={`${ticket.name}さんのチケットを表示`}
                        style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', textAlign: 'left', width: '100%' }}
                      >
                        {ticket.name}
                      </button>
                      <p className={styles.ticketDetails}>
                        🎸 バンド: {ticket.bandName} | UUID: {ticket.uuid} | 作成者: {ticket.createdBy}
                      </p>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.emptyState}>
                まだチケットが発行されていません
              </div>
            )}
          </CardContent>
        </Card>
      </ContentWrapper>

      {/* 新規作成チケット表示オーバーレイ */}
      {showTicketDisplay && createdTicket && eventData && (
        <Modal
          isOpen={showTicketDisplay}
          onClose={() => setShowTicketDisplay(false)}
          title="📱 生成されたチケット"
        >
          <div className={styles.modalContent}>
            <strong>下記の画像をスクリーンショットしてください。</strong>
          </div>
          
          <TicketDisplay
            ticket={createdTicket}
            event={eventData}
            eventTitle={eventTitle}
            eventCollectionName={currentEventCollectionName}
            eventUuid={currentEventUuid}
          />
        </Modal>
      )}

      {/* 既存チケット表示オーバーレイ */}
      {showSelectedTicketDisplay && selectedTicket && eventData && (
        <Modal
          isOpen={showSelectedTicketDisplay}
          onClose={() => setShowSelectedTicketDisplay(false)}
          title={`📱 ${selectedTicket.name}さんのチケット`}
        >
          <div className={styles.modalContent}>
            <strong>発行済みチケットの再表示</strong>
          </div>
          
          <TicketDisplay
            ticket={selectedTicket}
            event={eventData}
            eventTitle={eventTitle}
            eventCollectionName={currentEventCollectionName}
            eventUuid={currentEventUuid}
          />
          
          <div className={styles.ticketStatusDisplay}
            style={{
              backgroundColor: selectedTicket.status === "済" ? '#ffebee' : '#e8f5e8',
              borderColor: selectedTicket.status === "済" ? '#f44336' : '#4caf50'
            }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 'bold',
              color: selectedTicket.status === "済" ? '#c62828' : '#2e7d32',
              marginBottom: '8px'
            }}>
              {selectedTicket.status === "済" ? "⚠️ 入場済みチケット" : "✅ 未使用チケット"}
            </div>
            <div style={{ 
              fontSize: '14px',
              color: selectedTicket.status === "済" ? '#d32f2f' : '#388e3c'
            }}>
              {selectedTicket.status === "済" 
                ? "このチケットは既に使用されています" 
                : "このチケットはまだ使用されていません"}
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}