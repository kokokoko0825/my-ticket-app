import { doc, getDoc, updateDoc, collection, getDocs, DocumentData, CollectionReference, QuerySnapshot } from "firebase/firestore";
import { db, auth } from "../root";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@remix-run/react";

interface TicketData {
  uuid?: string;
  name: string;
  bandName?: string;
  status: "未" | "済";
  state?: "未" | "済"; // 既存データとの互換性のため一時的に保持
  createdBy: string;
  eventTitle?: string;
  eventId?: string;
  id?: string; // 一部のチケットで使用される可能性
}

export default function Ticket() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  useEffect(() => { 
    const fetchAndUpdateTicket = async () => {
      if (!uuid) {
        setStatus("error");
        setMessage("QRコードが正しく読み取れませんでした。再度お試しください。");
        return;
      }

      try {
        console.log("🔍 Searching for ticket UUID:", uuid);
        
        let ticketRef = doc(db, "tickets", uuid);
        let foundTicketData: TicketData | null = null;
        const searchDetails: string[] = [];

        // 最初に新形式（イベントコレクション/イベントUUID/tickets/チケットUUID）を検索
        console.log("🚀 Starting with comprehensive new format search...");
        const allCollections = await discoverAllCollections();
        console.log("🔍 Searching in all discovered collections:", allCollections);
        
        for (const collectionName of allCollections) {
          console.log(`🔍 Checking collection: ${collectionName}`);
          try {
            const collectionSnapshot = await getDocs(collection(db, collectionName));
            console.log(`📁 Collection ${collectionName} has ${collectionSnapshot.docs.length} documents`);
            
            // 直接チケットとして保存されている可能性もチェック
            for (const docSnapshot of collectionSnapshot.docs) {
              console.log(`📄 Checking document: ${docSnapshot.id} in collection ${collectionName}`);
              
              // ドキュメントIDがUUIDと一致するかチェック
              if (docSnapshot.id === uuid) {
                foundTicketData = docSnapshot.data() as TicketData;
                ticketRef = docSnapshot.ref;
                console.log("✅ Found ticket as direct document:", foundTicketData);
                searchDetails.push(`New format: Found as direct document in ${collectionName}/${docSnapshot.id}`);
                break;
              }
              
              // サブコレクション 'tickets' の中もチェック
              try {
                const ticketsRef: CollectionReference<DocumentData> = collection(db, collectionName, docSnapshot.id, "tickets");
                const ticketsSnapshot: QuerySnapshot<DocumentData> = await getDocs(ticketsRef);
                
                // _metaドキュメントを除外してチケット数をカウント
                const actualTickets = ticketsSnapshot.docs.filter((doc: DocumentData) => doc.id !== '_meta');
                console.log(`📋 Document ${docSnapshot.id} has ${actualTickets.length} actual tickets (${ticketsSnapshot.docs.length} total docs)`);
                
                for (const ticketDoc of actualTickets) {
                  console.log(`🎟️ Checking ticket: ${ticketDoc.id} in ${collectionName}/${docSnapshot.id}/tickets`);
                  if (ticketDoc.id === uuid) {
                    foundTicketData = ticketDoc.data() as TicketData;
                    ticketRef = ticketDoc.ref;
                    console.log("✅ Found ticket in subcollection:", foundTicketData);
                    searchDetails.push(`New format: Found in ${collectionName}/${docSnapshot.id}/tickets/${ticketDoc.id}`);
                    break;
                  }
                }
                if (foundTicketData) break;
              } catch (_subCollectionError) {
                // サブコレクションが存在しない場合は無視
                console.log(`📋 No tickets subcollection in ${collectionName}/${docSnapshot.id}`);
              }
            }
            if (foundTicketData) break;
          } catch (collectionError: unknown) {
            const errorMessage = collectionError instanceof Error ? collectionError.message : 'Unknown error';
            console.warn(`⚠️ Error accessing collection ${collectionName}:`, collectionError);
            searchDetails.push(`Collection ${collectionName}: Error accessing - ${errorMessage}`);
          }
        }

        // 新形式で見つからない場合のみ旧形式をチェック
        if (!foundTicketData) {
          console.log("🔄 New format search failed, trying legacy format...");
      const ticketSnap = await getDoc(ticketRef);

          if (ticketSnap.exists()) {
            foundTicketData = ticketSnap.data() as TicketData;
            console.log("✅ Found ticket in legacy format (tickets collection):", foundTicketData);
            searchDetails.push("Legacy format: Found");
          } else {
            console.log("❌ Ticket not found in legacy format (tickets collection)");
            searchDetails.push("Legacy format: Not found");
          }
        } else {
          searchDetails.push("Legacy format: Skipped (found in new format)");
        }

        if (!foundTicketData) {
          const debugDetails = [
            `UUID: ${uuid}`,
            `Current URL: ${window.location.href}`,
            `User Agent: ${navigator.userAgent}`,
            `Timestamp: ${new Date().toLocaleString('ja-JP')}`,
            ``,
            `検索詳細:`,
            ...searchDetails,
            ``,
            `検索したコレクション数: ${allCollections.length}`,
            `見つかったコレクション: ${allCollections.join(', ') || 'なし'}`,
            ``,
            `Routing Check:`,
            `- Current pathname: ${window.location.pathname}`,
            `- Expected pattern: /ticket/[uuid]`,
            `- UUID param: ${uuid || 'undefined'}`,
            `- UUID format: ${uuid ? (uuid.length === 36 ? 'Valid UUID format' : 'Invalid UUID format') : 'No UUID'}`,
            ``,
            `Firebase 接続:`,
            `- Auth: ${auth.currentUser ? 'Logged in' : 'Not logged in'}`,
            `- User ID: ${auth.currentUser?.uid || 'Not available'}`,
            `- User Email: ${auth.currentUser?.email || 'Not available'}`,
            `- DB: ${db ? 'Connected' : 'Not connected'}`,
            ``,
            `LocalStorage情報:`,
            `- customCollections: ${localStorage.getItem('customCollections') || 'Empty'}`,
            ``,
            `推奨対策:`,
            `1. admin.tsx画面でチケットが正しく作成されているか確認`,
            `2. owner.tsx画面でイベントが存在するか確認`,  
            `3. 作成したイベント名とコレクション名が一致しているか確認`,
            `4. このUUID ${uuid} でチケットを再作成してみる`
          ];
          
          console.error("❌ Ticket not found anywhere. Debug info:", debugDetails);
          setDebugInfo(debugDetails);
        setStatus("error");
          setMessage("チケットが見つかりません。\n\n「デバッグ情報を表示」をタップして詳細を確認してください。");
        return;
      }

        // statusフィールドを優先し、なければstateフィールドをチェック
        const currentStatus = foundTicketData.status || foundTicketData.state || "未";
        console.log("📊 Current ticket status:", currentStatus);

        if (currentStatus === "済") {
        setStatus("error");
          setMessage("このチケットは既に使用済みです。重複入場はできません。");
          setTicketData({ ...foundTicketData, status: currentStatus });
        return;
      }

        // ステータスを「済」に更新（statusフィールドを優先、既存のstateフィールドがあれば削除）
        const updateData: Record<string, string | null> = {
          status: "済"
        };
        
        // 既存のstateフィールドがある場合は削除
        if (foundTicketData.state !== undefined) {
          updateData.state = null;
        }
        
        console.log("💾 Updating ticket with:", updateData);
        await updateDoc(ticketRef, updateData);
        
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

  // より包括的なコレクション検索を行う関数
  const discoverAllCollections = async (): Promise<string[]> => {
    const discoveredCollections: string[] = [];
    const baseCollections = ["tickets", "users", "events", "products", "test"];
    
    try {
      // LocalStorageから既知のコレクションを取得
      const savedCollections = JSON.parse(localStorage.getItem('customCollections') || '[]');
      console.log("📂 Saved collections from localStorage:", savedCollections);
      
      // 拡張されたイベント名パターンリスト
      const eventPatterns = [
        ...savedCollections,
        // 基本的なパターン
        "testEvent", "テストイベント", "ライブ", "コンサート", "演奏会", "発表会",
        // 英語パターン
        "live", "concert", "event", "show", "performance", "gig",
        // 日本語パターン
        "イベント", "ショー", "パフォーマンス", "音楽会", "ミニライブ",
        // 特殊文字除去されたパターン
        "testlive", "テストライブ", "newlive", "ニューライブ", "firstlive", "ファーストライブ",
        // 数字付きパターン
        "live1", "live2", "live3", "event1", "event2", "event3",
        // よくある組み合わせ
        "grasslive", "forestlive", "springlive", "summerlive", "autumnlive", "winterlive",
        // 草通り越して林関連
        "草", "林", "tree", "forest", "grass", "nature",
        // ひらがなパターン
        "あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ", "が", "ぎ", "ぐ", "げ", "ご",
        "さ", "し", "す", "せ", "そ", "ざ", "じ", "ず", "ぜ", "ぞ", "た", "ち", "つ", "て", "と",
        "だ", "ぢ", "づ", "で", "ど", "な", "に", "ぬ", "ね", "の", "は", "ひ", "ふ", "へ", "ほ",
        "ば", "び", "ぶ", "べ", "ぼ", "ぱ", "ぴ", "ぷ", "ぺ", "ぽ", "ま", "み", "む", "め", "も",
        "や", "ゆ", "よ", "ら", "り", "る", "れ", "ろ", "わ", "ゐ", "ゑ", "を", "ん",
        // よくあるひらがな組み合わせ
        "あい", "いち", "うた", "えん", "おと", "かお", "きみ", "くに", "げん", "こころ",
        "さくら", "しお", "すず", "せん", "その", "たか", "ちか", "つき", "てん", "とも",
        "なな", "にじ", "ぬま", "ねこ", "のぞ", "はな", "ひめ", "ふゆ", "へい", "ほし",
        "まち", "みず", "むら", "めぐ", "もり", "やま", "ゆき", "よる", "らん", "りん",
        "るい", "れい", "ろく", "わか", "じゃに", "じゃにー", "じゃん", "ちゃん", "くん",
        // 特定のイベント名
        "じゃに", "ジャニ", "jannie", "jani", "JANI", "JANNIE"
      ];
      
      // 各パターンを試行
      for (const collectionName of eventPatterns) {
        if (!baseCollections.includes(collectionName) && collectionName.trim()) {
          try {
            const snapshot = await getDocs(collection(db, collectionName));
            if (!snapshot.empty) {
              console.log(`✅ Found collection: ${collectionName} (${snapshot.docs.length} documents)`);
              discoveredCollections.push(collectionName);
            }
          } catch (_error) {
            // 存在しないコレクションは無視
          }
        }
      }
      
      // さらに包括的な検索: 一般的なFirestoreコレクション名パターン
      const additionalPatterns = [
        // admin.tsxで作成される可能性のあるパターン
        "Admin", "admin", "ADMIN", "Management", "management",
        // Remixアプリで一般的なパターン
        "collections", "data", "items", "records", "documents"
      ];
      
      for (const pattern of additionalPatterns) {
        try {
          const snapshot = await getDocs(collection(db, pattern));
          if (!snapshot.empty && !discoveredCollections.includes(pattern)) {
            console.log(`✅ Found additional collection: ${pattern} (${snapshot.docs.length} documents)`);
            discoveredCollections.push(pattern);
          }
        } catch (_error) {
          // 存在しないコレクションは無視
        }
      }
      
      console.log("🔍 All discovered collections:", discoveredCollections);
      
      // もし何も見つからない場合、より広範囲な検索を実行
      if (discoveredCollections.length === 0) {
        console.log("🔍 No collections found with patterns, trying broader search...");
        
        // より包括的な文字パターンで検索
        const broadPatterns = [];
        
        // ひらがな3文字まで総当たり（よくある組み合わせ）
        const hiraganaChars = ["あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ", "が", "ぎ", "ぐ", "げ", "ご",
          "さ", "し", "す", "せ", "そ", "ざ", "じ", "ず", "ぜ", "ぞ", "た", "ち", "つ", "て", "と",
          "だ", "ぢ", "づ", "で", "ど", "な", "に", "ぬ", "ね", "の", "は", "ひ", "ふ", "へ", "ほ",
          "ば", "び", "ぶ", "べ", "ぼ", "ぱ", "ぴ", "ぷ", "ぺ", "ぽ", "ま", "み", "む", "め", "も",
          "や", "ゆ", "よ", "ら", "り", "る", "れ", "ろ", "わ", "を", "ん"];
        
        // よくあるひらがな2文字組み合わせ
        const commonPairs = ["じゃ", "ちゃ", "しゃ", "にゃ", "ひゃ", "みゃ", "りゃ", "ぎゃ", "びゃ", "ぴゃ",
          "じゅ", "ちゅ", "しゅ", "にゅ", "ひゅ", "みゅ", "りゅ", "ぎゅ", "びゅ", "ぴゅ",
          "じょ", "ちょ", "しょ", "にょ", "ひょ", "みょ", "りょ", "ぎょ", "びょ", "ぴょ"];
        
        for (const pair of commonPairs) {
          for (const char of hiraganaChars.slice(0, 20)) { // パフォーマンスのため制限
            broadPatterns.push(pair + char);
          }
        }
        
        // さらに、カタカナパターンも追加
        const katakanaPatterns = ["ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ", "ガ", "ギ", "グ", "ゲ", "ゴ",
          "サ", "シ", "ス", "セ", "ソ", "ザ", "ジ", "ズ", "ゼ", "ゾ", "タ", "チ", "ツ", "テ", "ト",
          "ダ", "ヂ", "ヅ", "デ", "ド", "ナ", "ニ", "ヌ", "ネ", "ノ", "ハ", "ヒ", "フ", "ヘ", "ホ",
          "バ", "ビ", "ブ", "ベ", "ボ", "パ", "ピ", "プ", "ペ", "ポ", "マ", "ミ", "ム", "メ", "モ",
          "ヤ", "ユ", "ヨ", "ラ", "リ", "ル", "レ", "ロ", "ワ", "ヲ", "ン"];
        
        broadPatterns.push(...katakanaPatterns.slice(0, 30)); // パフォーマンスのため制限
        
        console.log("🔍 Trying broader patterns:", broadPatterns.length, "patterns");
        
        for (const pattern of broadPatterns) {
          try {
            const snapshot = await getDocs(collection(db, pattern));
            if (!snapshot.empty) {
              console.log(`✅ Found collection with broad search: ${pattern} (${snapshot.docs.length} documents)`);
              discoveredCollections.push(pattern);
              // パフォーマンスのため、いくつか見つかったら停止
              if (discoveredCollections.length >= 10) break;
            }
          } catch (_error) {
            // 存在しないコレクションは無視
          }
        }
      }
      
      console.log("🔍 Final discovered collections:", discoveredCollections);
      return discoveredCollections;
    } catch (error) {
      console.error("Error discovering collections:", error);
      return [];
    }
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
        .debug-toggle-btn {
          background: #ff9800;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          margin: 16px 0;
          transition: all 0.2s;
        }
        .debug-toggle-btn:hover {
          background: #f57c00;
        }
        .debug-info-panel {
          background: #f8f9fa;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
          margin-top: 16px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          max-height: 300px;
          overflow-y: auto;
          white-space: pre-line;
          text-align: left;
        }
        .copy-debug-btn {
          background: #666;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          margin-top: 8px;
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
            <p className="status-message" style={{ whiteSpace: 'pre-line' }}>{message}</p>
            
            {/* デバッグ情報表示 */}
            {debugInfo.length > 0 && (
              <>
                <button 
                  className="debug-toggle-btn"
                  onClick={() => setShowDebugInfo(!showDebugInfo)}
                >
                  {showDebugInfo ? '📋 デバッグ情報を隠す' : '🔍 デバッグ情報を表示'}
                </button>
                
                {showDebugInfo && (
                  <div className="debug-info-panel">
                    {debugInfo.join('\n')}
                    <button 
                      className="copy-debug-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(debugInfo.join('\n')).then(() => {
                          alert('デバッグ情報をクリップボードにコピーしました');
                        }).catch(() => {
                          alert('コピーに失敗しました');
                        });
                      }}
                    >
                      📋 コピー
                    </button>
                  </div>
                )}
              </>
            )}
            
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