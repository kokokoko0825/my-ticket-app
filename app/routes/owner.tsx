import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, Timestamp } from "firebase/firestore";
import { db, auth } from "../root";
import { signOut, onAuthStateChanged } from "firebase/auth";
import firebase from "firebase/compat/app";

interface DocumentData {
  id: string;
  name?: string;
  status?: "未" | "済";
  createdBy?: string;
  createdAt?: Timestamp;
  // イベント用フィールド
  title?: string;
  dates?: string[];
  location?: string;
  price?: number;
  bandName?: string; // バンド名フィールドを追加
  eventId?: string; // チケットが属するイベントID
  oneDrink?: boolean; // ワンドリンクの有無
  [key: string]: string | number | boolean | Timestamp | string[] | undefined; // 他のフィールドにも対応
}

// イベント詳細データとそれに関連するチケット情報
interface EventWithTickets {
  eventId: string;
  eventTitle: string;
  eventData: DocumentData;
  ticketCount: number;
  tickets: DocumentData[];
}

export default function OwnerDashboard() {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentData[]>([]);
  const [eventsWithTickets, setEventsWithTickets] = useState<EventWithTickets[]>([]);
  const [filteredEventsWithTickets, setFilteredEventsWithTickets] = useState<EventWithTickets[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState("events_overview");
  const [loading, setLoading] = useState(true);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [newDocumentName, setNewDocumentName] = useState("");
  
  // イベント作成用のstate
  const [eventTitle, setEventTitle] = useState("");
  const [eventDates, setEventDates] = useState<string[]>([""]);
  const [eventLocation, setEventLocation] = useState("");
  const [eventPrice, setEventPrice] = useState("");
  const [eventOneDrink, setEventOneDrink] = useState(true);
  
  // フィルタリング用のstate
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "未" | "済">("all");
  const [creatorFilter, setCreatorFilter] = useState("");
  const [bandNameFilter, setBandNameFilter] = useState("");
  const [showOnlyMyDocuments, setShowOnlyMyDocuments] = useState(false);

  const [selectedEventForTickets, setSelectedEventForTickets] = useState<EventWithTickets | null>(null);
  const [showTicketsModal, setShowTicketsModal] = useState(false);
  const [currentEventTickets, setCurrentEventTickets] = useState<DocumentData[]>([]);
  const [filteredEventTickets, setFilteredEventTickets] = useState<DocumentData[]>([]);
  const [user, setUser] = useState<firebase.User | null>(null);
  
  // イベント編集用のstate
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventWithTickets | null>(null);
  const [editEventLocation, setEditEventLocation] = useState("");
  const [editEventPrice, setEditEventPrice] = useState("");
  const [editEventOneDrink, setEditEventOneDrink] = useState(true);

  // コレクション一覧を取得
  const fetchCollections = async () => {
    try {
      setCollectionsLoading(true);
      
      if (!auth.currentUser) {
        setCollections(["users"]);
        return;
      }

      // 基本コレクション
      const baseCollections = ["users", "events", "products"];
      
      // ユーザーが作成したイベントコレクションを動的に検出
      const userCreatedCollections: string[] = [];
      
      // 1. Firestoreから保存済みのコレクション一覧を取得
      let savedCollections: string[] = [];
      try {
        const userDocSnapshot = await getDocs(query(collection(db, "users"), where("uid", "==", auth.currentUser.uid)));
        
        if (!userDocSnapshot.empty) {
          const userData = userDocSnapshot.docs[0].data();
          savedCollections = userData.customCollections || [];
        } else {
          // ユーザードキュメントが存在しない場合は作成
          const userDocRef = doc(db, "users", auth.currentUser.uid);
          await setDoc(userDocRef, {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            displayName: auth.currentUser.displayName,
            customCollections: [],
            createdAt: Timestamp.now(),
            lastLoginAt: Timestamp.now()
          });
        }
      } catch (error) {
        console.error("Error fetching user collections:", error);
        savedCollections = [];
      }
      
      // 2. 保存済みコレクション名でFirestoreに実際にデータがあるかチェック
      for (const collectionName of savedCollections) {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          if (!snapshot.empty) {
            // このコレクション内に現在のユーザーが作成したドキュメントがあるかチェック
            const userDocuments = snapshot.docs.filter(doc => {
              const data = doc.data();
              return data.createdBy === auth.currentUser?.uid;
            });
            
            if (userDocuments.length > 0) {
              userCreatedCollections.push(collectionName);
            }
          }
        } catch (error) {
          console.log(`Collection ${collectionName} check failed:`, error);
        }
      }
      
      // 3. ユーザーが作成したすべてのコレクションを検出する
      // グローバルなコレクション検出のため、共通のメタデータコレクションを活用
      try {
        // まず、グローバルなコレクション登録簿からユーザーのコレクションを取得
        const globalCollectionsRef = collection(db, "global_collections");
        const globalQuery = query(globalCollectionsRef, where("createdBy", "==", auth.currentUser.uid));
        const globalSnapshot = await getDocs(globalQuery);
        
        globalSnapshot.forEach(doc => {
          const data = doc.data();
          const collectionName = data.collectionName;
          if (collectionName && !userCreatedCollections.includes(collectionName)) {
            userCreatedCollections.push(collectionName);
          }
        });
      } catch (error) {
        console.log("Global collections check failed:", error);
      }
      
      // 4. 既知のパターンでコレクション名の推測検出も追加
      // すべての検出されたコレクション名を統合
      
      // 実際に存在し、ユーザーのデータを含むコレクションのみを含める
      const allKnownCollections = [...baseCollections, ...userCreatedCollections];
      
      // 各コレクションが存在し、アクセス可能かチェック
      const existingCollections = [];
      for (const collectionName of allKnownCollections) {
        // ticketsコレクションは除外
        if (collectionName === "tickets") {
          continue;
        }
        
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          if (!snapshot.empty) {
            existingCollections.push(collectionName);
          }
        } catch (error) {
          console.log(`Collection ${collectionName} does not exist or is not accessible:`, error);
        }
      }
      
      // 重複を排除
      const uniqueCollections = [...new Set(existingCollections)];
      
      console.log("Detected collections for user:", {
        uid: auth.currentUser.uid,
        savedCollections,
        userCreatedCollections,
        finalCollections: uniqueCollections
      });
      
      setCollections(uniqueCollections.length > 0 ? uniqueCollections : ["users"]);
    } catch (error) {
      console.error("Error fetching collections:", error);
      setCollections(["users"]); // フォールバック
    } finally {
      setCollectionsLoading(false);
    }
  };

  // ドキュメント一覧を取得
  const fetchDocuments = useCallback(async (collectionName: string = selectedCollection) => {
    try {
      setLoading(true);
      if (!auth.currentUser) {
        return;
      }

      const querySnapshot = await getDocs(collection(db, collectionName));
      
      const documentList: DocumentData[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as DocumentData;
        documentList.push({
          ...data,
          id: docSnapshot.id,
          // ticketsコレクションの場合、ステータスが未設定なら"未"をデフォルトに設定
          status: collectionName === "tickets" ? (data.status || "未") : data.status,
        });
      });

      // 作成日時でソート（新しい順）
      documentList.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
        }
        return 0;
      });

      setDocuments(documentList);
      setFilteredDocuments(documentList);
    } catch (error) {
      console.error(`Error fetching documents from ${collectionName}:`, error);
      setDocuments([]);
      setFilteredDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCollection]);

  // イベントと関連チケットを統合して取得 (eventName/eventUUID/tickets 構造)
  const fetchEventsWithTickets = useCallback(async () => {
    try {
      setLoading(true);
      if (!auth.currentUser) {
        return;
      }

      const eventCollections = collections.filter(col => 
        col !== "users" && col !== "events" && col !== "products"
      );

      const eventsWithTicketsData: EventWithTickets[] = [];

      // 各イベントコレクションから情報を取得
      for (const collectionName of eventCollections) {
        try {
          const eventSnapshot = await getDocs(collection(db, collectionName));
          
          // 各イベントドキュメントについて
          for (const eventDoc of eventSnapshot.docs) {
            const eventData = eventDoc.data() as DocumentData;
            
            // サブコレクション 'tickets' からチケット情報を取得
            const ticketsCollectionRef = collection(eventDoc.ref, 'tickets');
            const ticketsSnapshot = await getDocs(ticketsCollectionRef);
            
            const tickets: DocumentData[] = [];
            ticketsSnapshot.forEach((ticketDoc) => {
              const ticketData = ticketDoc.data() as DocumentData;
              // _meta ドキュメントは除外
              if (ticketDoc.id !== '_meta') {
                tickets.push({
                  ...ticketData,
                  id: ticketDoc.id,
                  // ステータスが未設定の場合はデフォルトで"未"に設定
                  status: ticketData.status || "未"
                });
              }
            });

            eventsWithTicketsData.push({
              eventId: eventDoc.id,
              eventTitle: eventData.title || collectionName,
              eventData: {
                ...eventData,
                id: eventDoc.id,
              },
              ticketCount: tickets.length,
              tickets: tickets
            });
          }
        } catch (error) {
          console.error(`Error fetching from collection ${collectionName}:`, error);
        }
      }

      // 作成日時でソート（新しい順）
      eventsWithTicketsData.sort((a, b) => {
        if (a.eventData.createdAt && b.eventData.createdAt) {
          return b.eventData.createdAt.toDate().getTime() - a.eventData.createdAt.toDate().getTime();
        }
        return 0;
      });

      setEventsWithTickets(eventsWithTicketsData);
      setFilteredEventsWithTickets(eventsWithTicketsData);

    } catch (error) {
      console.error("Error fetching events with tickets:", error);
      setEventsWithTickets([]);
      setFilteredEventsWithTickets([]);
    } finally {
      setLoading(false);
    }
  }, [collections]);

  // 特定のイベントのチケットを取得
  const fetchEventTickets = useCallback(async (eventCollectionName: string) => {
    try {
      setLoading(true);
      if (!auth.currentUser) {
        return;
      }

      const allTickets: DocumentData[] = [];

      // 指定されたイベントコレクション内の全てのイベントドキュメントを取得
      const eventSnapshot = await getDocs(collection(db, eventCollectionName));
      
      for (const eventDoc of eventSnapshot.docs) {
        const eventData = eventDoc.data() as DocumentData;
        
        // 各イベントドキュメントのサブコレクション 'tickets' からチケット情報を取得
        const ticketsCollectionRef = collection(eventDoc.ref, 'tickets');
        const ticketsSnapshot = await getDocs(ticketsCollectionRef);
        
        ticketsSnapshot.forEach((ticketDoc) => {
          const ticketData = ticketDoc.data() as DocumentData;
          // _meta ドキュメントは除外
          if (ticketDoc.id !== '_meta') {
            const processedTicket = {
              ...ticketData,
              id: ticketDoc.id,
              eventId: eventDoc.id,
              eventTitle: ticketData.eventTitle || eventData.title || eventCollectionName,
              // チケットに直接バンド名が保存されていない場合は、イベントのバンド名を使用
              bandName: ticketData.bandName || eventData.bandName || undefined,
              // ステータスが未設定の場合はデフォルトで"未"に設定
              status: ticketData.status || "未"
            };
            
            allTickets.push(processedTicket);
          }
        });
      }

      // 作成日時でソート（新しい順）
      allTickets.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
        }
        return 0;
      });

      setCurrentEventTickets(allTickets);
      setFilteredEventTickets(allTickets);

    } catch (error) {
      console.error(`Error fetching tickets from event collection ${eventCollectionName}:`, error);
      setCurrentEventTickets([]);
      setFilteredEventTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 新しいドキュメントを作成
  const createNewDocument = async () => {
    if (!newDocumentName.trim()) {
      alert("名前を入力してください。");
      return;
    }

    if (!auth.currentUser) {
      alert("ログインしてください。");
      return;
    }

    try {
      const newUuid = crypto.randomUUID();

      // コレクションに応じた基本データ構造を設定
      const documentData: Record<string, string | Timestamp> = {
        name: newDocumentName,
        id: newUuid,
        createdBy: auth.currentUser.uid,
        createdAt: Timestamp.now(),
      };

      // ticketsコレクションの場合は特別な処理
      if (selectedCollection === "tickets") {
        documentData.status = "未";
        // どのイベントのチケットとして作成するかを選択させる
        await createTicketInEvent(documentData);
        return;
      }

      // 他のコレクションの場合は通常の処理
      // 同じ名前のドキュメントが既に存在するかチェック
      const q = query(
        collection(db, selectedCollection),
        where("name", "==", newDocumentName)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert(`同じ名前の${selectedCollection}が既に存在しています。`);
        return;
      }

      // Firestoreにデータを保存
      await setDoc(doc(db, selectedCollection, newUuid), documentData);

      setNewDocumentName("");
      setOpenDialog(false);
      fetchDocuments(); // リストを更新
      alert(`${selectedCollection}が作成されました。`);
    } catch (error) {
      console.error("Error creating document:", error);
      alert("作成に失敗しました。");
    }
  };

  // イベントのサブコレクションにチケットを作成
  const createTicketInEvent = async (ticketData: Record<string, string | Timestamp>) => {
    if (eventsWithTickets.length === 0) {
      alert("チケットを作成するには、先にイベントを作成してください。");
      return;
    }

    // イベント選択のプロンプト（簡易実装）
    const eventOptions = eventsWithTickets.map((event, index) => 
      `${index + 1}. ${event.eventTitle} (${event.eventId.substring(0, 8)})`
    ).join('\n');
    
    const selectedEventIndex = prompt(
      `どのイベントにチケットを追加しますか？番号を入力してください:\n\n${eventOptions}`
    );

    if (!selectedEventIndex || isNaN(Number(selectedEventIndex))) {
      alert("有効な番号を入力してください。");
      return;
    }

    const eventIndex = Number(selectedEventIndex) - 1;
    if (eventIndex < 0 || eventIndex >= eventsWithTickets.length) {
      alert("有効な番号を入力してください。");
      return;
    }

    const selectedEvent = eventsWithTickets[eventIndex];
    const eventCollectionName = selectedEvent.eventTitle
      .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '')
      .replace(/\s+/g, '');

    try {
      // イベントドキュメントの参照を取得
      const eventDocRef = doc(db, eventCollectionName, selectedEvent.eventId);
      
      // サブコレクション 'tickets' にチケットを追加
      const ticketsCollectionRef = collection(eventDocRef, 'tickets');
      const newTicketDocRef = doc(ticketsCollectionRef, ticketData.id as string);
      
      // イベント情報をチケットデータに追加
      const enhancedTicketData = {
        ...ticketData,
        eventId: selectedEvent.eventId,
        eventTitle: selectedEvent.eventTitle,
        bandName: selectedEvent.eventData.bandName || undefined
      };

      await setDoc(newTicketDocRef, enhancedTicketData);

      setNewDocumentName("");
      setOpenDialog(false);
      
      // 統合ビューを更新
      await fetchEventsWithTickets();
      
      alert(`チケットがイベント「${selectedEvent.eventTitle}」に追加されました。`);
    } catch (error) {
      console.error("Error creating ticket in event:", error);
      alert("チケットの作成に失敗しました。");
    }
  };

  // 新しいイベントを作成
  const createNewEvent = async () => {
    console.log("Creating new event..."); // デバッグログ
    console.log("Current user:", auth.currentUser); // ユーザー情報
    console.log("User UID:", auth.currentUser?.uid); // ユーザーUID
    console.log("User email:", auth.currentUser?.email); // ユーザーメール
    console.log("Firebase app:", db.app); // Firebase app確認
    
    // 認証状態を詳細確認
    if (!auth.currentUser) {
      console.error("No authenticated user found");
      alert("ログインしてください。認証されたユーザーが見つかりません。");
      return;
    }

    console.log("Authentication check passed, user is logged in");
    
    if (!eventTitle.trim()) {
      alert("イベントタイトルを入力してください。");
      return;
    }

    const validDates = eventDates.filter(date => date.trim());
    if (validDates.length === 0) {
      alert("少なくとも1つの開催日を入力してください。");
      return;
    }

    if (!eventLocation.trim()) {
      alert("開催場所を入力してください。");
      return;
    }

    if (!eventPrice.trim() || isNaN(Number(eventPrice)) || Number(eventPrice) < 0) {
      alert("有効な値段を入力してください。");
      return;
    }

    if (!auth.currentUser) {
      alert("ログインしてください。");
      return;
    }

    try {
      const newUuid = crypto.randomUUID();
      console.log("Generated UUID:", newUuid); // デバッグログ

      // イベントデータを作成
      const eventData = {
        id: newUuid,
        title: eventTitle.trim(),
        dates: validDates,
        location: eventLocation.trim(),
        price: Number(eventPrice),
        oneDrink: eventOneDrink,
        createdBy: auth.currentUser.uid,
        createdAt: Timestamp.now(),
        status: "active",
      };

      console.log("Event data to save:", eventData); // デバッグログ

      // イベントタイトルをコレクション名として使用（スペースや特殊文字を除去）
      const collectionName = eventTitle.trim()
        .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '') // 特殊文字除去
        .replace(/\s+/g, '') // スペース除去
        || `event_${Date.now()}`; // フォールバック名

      console.log("Collection name:", collectionName); // デバッグログ

      // Firestoreにイベントデータを保存（イベント名/イベントUUID の構造）
      const eventDocRef = doc(db, collectionName, newUuid);
      console.log("Event document reference:", eventDocRef); // デバッグログ
      
      await setDoc(eventDocRef, eventData);
      console.log("Event saved successfully"); // デバッグログ

      // サブコレクション 'tickets' の初期設定（空のサブコレクションを作成）
      // サブコレクションは最初のドキュメントが追加されるまで存在しないため、
      // プレースホルダーとしてメタデータドキュメントを追加
      const ticketsCollectionRef = collection(eventDocRef, 'tickets');
      const metaDocRef = doc(ticketsCollectionRef, '_meta');
      await setDoc(metaDocRef, {
        createdAt: Timestamp.now(),
        eventId: newUuid,
        eventTitle: eventTitle.trim(),
        ticketCount: 0
      });
      console.log("Tickets subcollection initialized"); // デバッグログ

      // フォームをリセット
      setEventTitle("");
      setEventDates([""]);
      setEventLocation("");
      setEventPrice("");
      setEventOneDrink(true);
      setOpenEventDialog(false);

      // 新しいコレクションをcollections配列に追加（まだ存在しない場合）
      if (!collections.includes(collectionName)) {
        const updatedCollections = [...collections, collectionName];
        setCollections(updatedCollections);
        
        // Firestoreのユーザードキュメントに保存（基本コレクション以外のカスタムコレクション）
        try {
          const baseCollections = ["tickets", "users", "events", "products"];
          const customCollections = updatedCollections.filter(name => !baseCollections.includes(name));
          
          if (auth.currentUser) {
            // 1. ユーザードキュメントに保存
            const userDocRef = doc(db, "users", auth.currentUser.uid);
            await setDoc(userDocRef, {
              uid: auth.currentUser.uid,
              email: auth.currentUser.email,
              displayName: auth.currentUser.displayName,
              customCollections: customCollections,
              lastLoginAt: Timestamp.now()
            }, { merge: true }); // mergeオプションで既存フィールドを保持
            
            // 2. グローバルコレクション登録簿にも登録
            const globalCollectionDocRef = doc(db, "global_collections", `${auth.currentUser.uid}_${collectionName}`);
            await setDoc(globalCollectionDocRef, {
              collectionName: collectionName,
              createdBy: auth.currentUser.uid,
              createdByEmail: auth.currentUser.email,
              createdByName: auth.currentUser.displayName,
              createdAt: Timestamp.now(),
              eventTitle: eventTitle.trim(),
              isActive: true
            });
            
            console.log("Custom collections saved to Firestore:", customCollections);
            console.log("Collection registered globally:", collectionName);
          }
        } catch (error) {
          console.error("Error saving custom collections to Firestore:", error);
        }
      }

      // もし作成したコレクションを表示中の場合はリストを更新
      if (selectedCollection === collectionName) {
        fetchDocuments();
      }

      alert(`新しいイベントが作成されました。「${collectionName}」コレクションで確認できます。`);
    } catch (error) {
      console.error("Error creating event:", error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : 'no-code';
      
      console.error("Error details:", {
        message: errorMessage,
        code: errorCode,
        error: error
      });
      
      alert(`イベントの作成に失敗しました。\nエラー: ${errorMessage}\nコード: ${errorCode}\n詳細はコンソールを確認してください。`);
    }
  };

  // 日付フィールドを追加
  const addDateField = () => {
    setEventDates([...eventDates, ""]);
  };

  // 日付フィールドを削除
  const removeDateField = (index: number) => {
    if (eventDates.length > 1) {
      const newDates = eventDates.filter((_, i) => i !== index);
      setEventDates(newDates);
    }
  };

  // 日付を更新
  const updateDate = (index: number, value: string) => {
    const newDates = [...eventDates];
    newDates[index] = value;
    setEventDates(newDates);
  };

  // Firestoreテスト関数（デバッグ用）
  const testFirestoreConnection = async () => {
    try {
      console.log("Testing Firestore connection...");
      const testDoc = doc(db, "test", "connection-test");
      await setDoc(testDoc, {
        timestamp: Timestamp.now(),
        message: "Test connection"
      });
      console.log("Firestore connection test successful");
      alert("Firestore接続テスト成功");
    } catch (error) {
      console.error("Firestore connection test failed:", error);
      alert(`Firestore接続テスト失敗: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // チケットを削除する関数
  const deleteTicket = async (ticketId: string, eventId?: string, eventCollectionName?: string) => {
    if (!auth.currentUser) {
      alert("ログインしてください。");
      return;
    }

    if (!confirm("本当にこのチケットを削除しますか？この操作は取り消せません。")) {
      return;
    }

    try {
      // イベントコレクション選択時の処理
      if (isEventCollection && eventId) {
        const eventDocRef = doc(db, selectedCollection, eventId);
        const ticketDocRef = doc(collection(eventDocRef, 'tickets'), ticketId);
        await deleteDoc(ticketDocRef);
        
        // ローカル状態を更新
        const updatedTickets = currentEventTickets.filter(t => t.id !== ticketId);
        setCurrentEventTickets(updatedTickets);
        
        // フィルタリングされたデータも更新
        const updatedFilteredTickets = filteredEventTickets.filter(t => t.id !== ticketId);
        setFilteredEventTickets(updatedFilteredTickets);
      } 
      // モーダル内のチケット削除（eventIdとeventCollectionNameが提供されている場合）
      else if (eventId && eventCollectionName) {
        const eventDocRef = doc(db, eventCollectionName, eventId);
        const ticketDocRef = doc(collection(eventDocRef, 'tickets'), ticketId);
        await deleteDoc(ticketDocRef);
        
        // イベント統合ビューのデータを更新
        await fetchEventsWithTickets();
        
        // モーダル表示中のイベント情報も更新
        if (selectedEventForTickets && selectedEventForTickets.eventId === eventId) {
          const updatedEvent = {
            ...selectedEventForTickets,
            tickets: selectedEventForTickets.tickets.filter(t => t.id !== ticketId),
            ticketCount: selectedEventForTickets.tickets.filter(t => t.id !== ticketId).length
          };
          setSelectedEventForTickets(updatedEvent);
        }
      } 
      // 通常のコレクションの処理
      else {
        const docRef = doc(db, selectedCollection, ticketId);
        await deleteDoc(docRef);
        
        // ローカル状態を更新
        const updatedDocuments = documents.filter(doc => doc.id !== ticketId);
        setDocuments(updatedDocuments);
      }
      
      console.log(`Ticket deleted: ${ticketId}`);
      alert("チケットが削除されました。");
    } catch (error) {
      console.error("Error deleting ticket:", error);
      alert("チケットの削除に失敗しました。");
    }
  };

  // 一括チケット削除関数
  const bulkDeleteTickets = async () => {
    if (!auth.currentUser) {
      alert("ログインしてください。");
      return;
    }

    let ticketsToDelete = [];
    let confirmMessage = "";
    
    // イベントコレクション選択時の処理
    if (isEventCollection) {
      ticketsToDelete = filteredEventTickets;
      confirmMessage = `表示中の${filteredEventTickets.length}件のチケットをすべて削除しますか？この操作は取り消せません。`;
    } 
    // 統合ビューの処理
    else if (selectedCollection === "events_overview") {
      alert("統合ビューからは一括削除できません。個別のイベントから削除してください。");
      return;
    } 
    // 通常のコレクションの処理
    else {
      ticketsToDelete = filteredDocuments;
      confirmMessage = `表示中の${filteredDocuments.length}件をすべて削除しますか？この操作は取り消せません。`;
    }

    if (ticketsToDelete.length === 0) {
      alert("削除対象のチケットがありません。");
      return;
    }

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      // イベントコレクションの場合は各チケットのサブコレクションを削除
      if (isEventCollection) {
        const deletePromises = ticketsToDelete.map(async (ticket) => {
          if (ticket.eventId) {
            const eventDocRef = doc(db, selectedCollection, ticket.eventId);
            const ticketDocRef = doc(collection(eventDocRef, 'tickets'), ticket.id);
            return deleteDoc(ticketDocRef);
          }
        });

        await Promise.all(deletePromises.filter(Boolean));

        // ローカル状態を更新
        const remainingTickets = currentEventTickets.filter(ticket => 
          !ticketsToDelete.some(deletedTicket => deletedTicket.id === ticket.id)
        );
        setCurrentEventTickets(remainingTickets);
        setFilteredEventTickets(remainingTickets);
      } else {
        // 通常のコレクションの場合
        const deletePromises = ticketsToDelete.map(async (document) => {
          const docRef = doc(db, selectedCollection, document.id);
          return deleteDoc(docRef);
        });

        await Promise.all(deletePromises);

        // ローカル状態を更新
        const remainingDocuments = documents.filter(document => 
          !ticketsToDelete.some(deletedDoc => deletedDoc.id === document.id)
        );
        setDocuments(remainingDocuments);
      }

      alert(`${ticketsToDelete.length}件のチケットが削除されました。`);
    } catch (error) {
      console.error("Error bulk deleting tickets:", error);
      alert("一括削除に失敗しました。");
    }
  };

  // イベント情報を更新する関数
  const updateEventInfo = async () => {
    if (!editingEvent) {
      alert("編集対象のイベントが選択されていません。");
      return;
    }

    if (!auth.currentUser) {
      alert("ログインしてください。");
      return;
    }

    if (!editEventLocation.trim()) {
      alert("開催場所を入力してください。");
      return;
    }

    if (!editEventPrice.trim() || isNaN(Number(editEventPrice)) || Number(editEventPrice) < 0) {
      alert("有効な値段を入力してください。");
      return;
    }

    try {
      // イベントコレクション名を生成
      const eventCollectionName = editingEvent.eventTitle
        .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '')
        .replace(/\s+/g, '');

      // イベントドキュメントの参照を取得
      const eventDocRef = doc(db, eventCollectionName, editingEvent.eventId);
      
      // 更新するデータ
      const updateData = {
        location: editEventLocation.trim(),
        price: Number(editEventPrice),
        oneDrink: editEventOneDrink,
      };

      // Firestoreに更新を保存
      await setDoc(eventDocRef, updateData, { merge: true });

      // ローカルstateを更新
      const updatedEventsWithTickets = eventsWithTickets.map(event => {
        if (event.eventId === editingEvent.eventId) {
          return {
            ...event,
            eventData: {
              ...event.eventData,
              ...updateData
            }
          };
        }
        return event;
      });
      setEventsWithTickets(updatedEventsWithTickets);

      // フィルタリングされたデータも更新
      const updatedFilteredEvents = filteredEventsWithTickets.map(event => {
        if (event.eventId === editingEvent.eventId) {
          return {
            ...event,
            eventData: {
              ...event.eventData,
              ...updateData
            }
          };
        }
        return event;
      });
      setFilteredEventsWithTickets(updatedFilteredEvents);

      // モーダルを閉じる
      setShowEditEventModal(false);
      setEditingEvent(null);
      setEditEventLocation("");
      setEditEventPrice("");
      setEditEventOneDrink(true);

      alert("イベント情報が更新されました。");
    } catch (error) {
      console.error("Error updating event:", error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : 'no-code';
      
      console.error("Error details:", {
        message: errorMessage,
        code: errorCode,
        error: error
      });
      
      alert(`イベントの更新に失敗しました。\nエラー: ${errorMessage}\nコード: ${errorCode}`);
    }
  };

  // イベント編集モーダルを開く
  const openEditEventModal = (event: EventWithTickets) => {
    setEditingEvent(event);
    setEditEventLocation(event.eventData.location || "");
    setEditEventPrice(event.eventData.price?.toString() || "");
    setEditEventOneDrink(event.eventData.oneDrink !== undefined ? event.eventData.oneDrink : true);
    setShowEditEventModal(true);
  };



  // フィルターが変更されたときに自動的にフィルタリングを実行
  useEffect(() => {
    // 通常のドキュメントフィルタリング
    let filtered = documents;

    // 自分のドキュメントのみ表示フィルター
    if (showOnlyMyDocuments && auth.currentUser) {
      filtered = filtered.filter(doc => 
        doc.createdBy === auth.currentUser?.uid
      );
    }

    // 名前フィルター
    if (nameFilter.trim()) {
      filtered = filtered.filter(doc => 
        doc.name && doc.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    // ステータスフィルター（ステータスフィールドを持つコレクション）
    if (statusFilter !== "all") {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    // 作成者フィルター
    if (creatorFilter.trim()) {
      filtered = filtered.filter(doc => 
        doc.createdBy && doc.createdBy.toLowerCase().includes(creatorFilter.toLowerCase())
      );
    }

    // バンド名フィルター
    if (bandNameFilter.trim()) {
      filtered = filtered.filter(doc => 
        doc.bandName && doc.bandName.toLowerCase().includes(bandNameFilter.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);

    // イベント+チケット統合データのフィルタリング
    let filteredEvents = eventsWithTickets;

    if (showOnlyMyDocuments && auth.currentUser) {
      filteredEvents = filteredEvents.filter(event => 
        event.eventData.createdBy === auth.currentUser?.uid
      );
    }

    if (nameFilter.trim()) {
      filteredEvents = filteredEvents.filter(event => 
        event.eventTitle.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (bandNameFilter.trim()) {
      filteredEvents = filteredEvents.filter(event => 
        event.eventData.bandName && event.eventData.bandName.toLowerCase().includes(bandNameFilter.toLowerCase())
      );
    }

    if (creatorFilter.trim()) {
      filteredEvents = filteredEvents.filter(event => 
        event.eventData.createdBy && event.eventData.createdBy.toLowerCase().includes(creatorFilter.toLowerCase())
      );
    }

    setFilteredEventsWithTickets(filteredEvents);

    // イベントコレクション選択時のチケットフィルタリング
    const baseCollections = ["users", "events", "products", "events_overview"];
    if (!baseCollections.includes(selectedCollection)) {
      let filteredTickets = currentEventTickets;

      if (showOnlyMyDocuments && auth.currentUser) {
        filteredTickets = filteredTickets.filter(ticket => 
          ticket.createdBy === auth.currentUser?.uid
        );
      }

      if (nameFilter.trim()) {
        filteredTickets = filteredTickets.filter(ticket => 
          ticket.name && ticket.name.toLowerCase().includes(nameFilter.toLowerCase())
        );
      }

      if (statusFilter !== "all") {
        filteredTickets = filteredTickets.filter(ticket => ticket.status === statusFilter);
      }

      if (creatorFilter.trim()) {
        filteredTickets = filteredTickets.filter(ticket => 
          ticket.createdBy && ticket.createdBy.toLowerCase().includes(creatorFilter.toLowerCase())
        );
      }

      if (bandNameFilter.trim()) {
        filteredTickets = filteredTickets.filter(ticket => 
          ticket.bandName && ticket.bandName.toLowerCase().includes(bandNameFilter.toLowerCase())
        );
      }

      setFilteredEventTickets(filteredTickets);
    }
  }, [documents, eventsWithTickets, currentEventTickets, nameFilter, statusFilter, creatorFilter, bandNameFilter, selectedCollection, showOnlyMyDocuments]);

  // コレクション変更時にドキュメントを再取得
  useEffect(() => {
    if (selectedCollection) {
      // フィルターをリセット
      setNameFilter("");
      setStatusFilter("all");
      setCreatorFilter("");
      setBandNameFilter("");
      setShowOnlyMyDocuments(false);

      // events_overviewの場合は何もしない（既にfetchEventsWithTicketsで取得済み）
      if (selectedCollection === "events_overview") {
        return;
      }

      // 基本コレクション（tickets, users, events, products）の場合は通常の取得
      const baseCollections = ["tickets", "users", "events", "products"];
      if (baseCollections.includes(selectedCollection)) {
        fetchDocuments(selectedCollection);
      } else {
        // イベントコレクションの場合は特別な取得方法を使用
        fetchEventTickets(selectedCollection);
      }
    }
  }, [selectedCollection, fetchDocuments, fetchEventTickets]);

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user as firebase.User | null);
      if (user) {
        console.log("Auth state changed - User logged in:", {
          email: user.email,
          uid: user.uid,
          displayName: user.displayName
        });
        
        // ユーザーのログイン時刻を更新
        try {
          const userDocRef = doc(db, "users", user.uid);
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            lastLoginAt: Timestamp.now()
          }, { merge: true });
        } catch (error) {
          console.error("Error updating user login time:", error);
        }
      } else {
        console.log("Auth state changed - User logged out");
      }
    });

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

  useEffect(() => {
    fetchCollections();
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    if (collections.length > 0) {
      fetchEventsWithTickets();
    }
  }, [collections, fetchEventsWithTickets]);

  // 統計情報を計算（フィルタリング後のデータで）
  const baseCollections = ["tickets", "users", "events", "products"];
  const isEventCollection = !baseCollections.includes(selectedCollection) && selectedCollection !== "events_overview";
  
  const totalDocuments = selectedCollection === "events_overview" 
    ? filteredEventsWithTickets.length 
    : isEventCollection
    ? filteredEventTickets.length
    : filteredDocuments.length;
    
  const completedDocuments = selectedCollection === "events_overview"
    ? filteredEventsWithTickets.reduce((acc, event) => 
        acc + event.tickets.filter(ticket => ticket.status === "済").length, 0)
    : isEventCollection
    ? filteredEventTickets.filter((d) => d.status === "済").length
    : filteredDocuments.filter((d) => d.status === "済").length;
    
  const pendingDocuments = selectedCollection === "events_overview"
    ? filteredEventsWithTickets.reduce((acc, event) => 
        acc + event.tickets.filter(ticket => ticket.status === "未").length, 0)
    : isEventCollection
    ? filteredEventTickets.filter((d) => d.status === "未").length
    : filteredDocuments.filter((d) => d.status === "未").length;

  const totalTickets = selectedCollection === "events_overview"
    ? filteredEventsWithTickets.reduce((acc, event) => acc + event.ticketCount, 0)
    : isEventCollection
    ? filteredEventTickets.length
    : 0;

  // ステータス変更関数
  const updateDocumentStatus = async (docId: string, newStatus: "未" | "済") => {
    try {
      // イベントコレクション選択時の処理
      if (isEventCollection) {
        // チケット情報を取得してイベントIDを特定
        const ticket = currentEventTickets.find(t => t.id === docId);
        if (ticket && ticket.eventId) {
          const eventDocRef = doc(db, selectedCollection, ticket.eventId);
          const ticketDocRef = doc(collection(eventDocRef, 'tickets'), docId);
          await setDoc(ticketDocRef, { status: newStatus }, { merge: true });
          
          // ローカル状態を更新
          const updatedTickets = currentEventTickets.map(t => 
            t.id === docId ? { ...t, status: newStatus } : t
          );
          setCurrentEventTickets(updatedTickets);
          
          // フィルタリングされたデータも更新
          const updatedFilteredTickets = filteredEventTickets.map(t => 
            t.id === docId ? { ...t, status: newStatus } : t
          );
          setFilteredEventTickets(updatedFilteredTickets);
        }
      } else {
        // 通常のコレクションの処理
        const docRef = doc(db, selectedCollection, docId);
        await setDoc(docRef, { status: newStatus }, { merge: true });
        
        // ローカル状態を更新
        const updatedDocuments = documents.map(document => 
          document.id === docId ? { ...document, status: newStatus } : document
        );
        setDocuments(updatedDocuments);
      }
      
      console.log(`Status updated for ${docId}: ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("ステータスの更新に失敗しました。");
    }
  };

  // 一括ステータス変更関数
  const bulkUpdateStatus = async (newStatus: "未" | "済") => {
    // イベントコレクション選択時の処理
    if (isEventCollection) {
      if (!filteredEventTickets.length) {
        alert("変更対象のチケットがありません。");
        return;
      }

      const confirmMessage = `表示中の${filteredEventTickets.length}件すべてのステータスを「${newStatus === "済" ? "入場済み" : "未入場"}」に変更しますか？`;
      if (!confirm(confirmMessage)) {
        return;
      }

      try {
        // イベントコレクションの場合は各チケットのサブコレクションを更新
        const updatePromises = filteredEventTickets.map(async (ticket) => {
          if (ticket.status !== undefined && ticket.eventId) {
            const eventCollectionName = selectedCollection;
            const eventDocRef = doc(db, eventCollectionName, ticket.eventId);
            const ticketDocRef = doc(collection(eventDocRef, 'tickets'), ticket.id);
            return setDoc(ticketDocRef, { status: newStatus }, { merge: true });
          }
        });

        await Promise.all(updatePromises.filter(Boolean));

        // ローカル状態を更新
        const updatedTickets = currentEventTickets.map(ticket => {
          if (filteredEventTickets.some(filteredTicket => filteredTicket.id === ticket.id)) {
            return { ...ticket, status: newStatus };
          }
          return ticket;
        });
        setCurrentEventTickets(updatedTickets);
        
        // フィルタリングされたデータも更新
        const updatedFilteredTickets = filteredEventTickets.map(ticket => ({
          ...ticket,
          status: newStatus
        }));
        setFilteredEventTickets(updatedFilteredTickets);

        alert(`${filteredEventTickets.length}件のステータスを更新しました。`);
      } catch (error) {
        console.error("Error bulk updating event ticket status:", error);
        alert("一括ステータス更新に失敗しました。");
      }
      return;
    }

    // 通常のコレクションの処理
    if (!filteredDocuments.length) {
      alert("変更対象のドキュメントがありません。");
      return;
    }

    const confirmMessage = `表示中の${filteredDocuments.length}件すべてのステータスを「${newStatus === "済" ? "入場済み" : "未入場"}」に変更しますか？`;
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      // 並列でFirestoreを更新
      const updatePromises = filteredDocuments.map(async (document) => {
        if (document.status !== undefined) { // ステータスフィールドがあるドキュメントのみ
          const docRef = doc(db, selectedCollection, document.id);
          return setDoc(docRef, { status: newStatus }, { merge: true });
        }
      });

      await Promise.all(updatePromises.filter(Boolean));

      // ローカル状態を更新
      const updatedDocuments = documents.map(document => {
        if (filteredDocuments.some(filteredDoc => filteredDoc.id === document.id) && document.status !== undefined) {
          return { ...document, status: newStatus };
        }
        return document;
      });
      setDocuments(updatedDocuments);

      alert(`${filteredDocuments.length}件のステータスを更新しました。`);
    } catch (error) {
      console.error("Error bulk updating status:", error);
      alert("一括ステータス更新に失敗しました。");
    }
  };

  // ステータス表示・編集コンポーネント
  const StatusBadge = ({ status, docId, isEditable = false, eventId, eventCollectionName }: { 
    status?: "未" | "済"; 
    docId?: string; 
    isEditable?: boolean;
    eventId?: string;
    eventCollectionName?: string;
  }) => {
    if (!status) return <span style={{ color: "#999" }}>-</span>;
    
    if (!isEditable || !docId) {
      return (
        <span 
          style={{
            padding: "4px 12px",
            borderRadius: "16px",
            fontSize: "12px",
            fontWeight: "600",
            color: "white",
            backgroundColor: status === "済" ? "#4caf50" : "#ff9800",
            display: "inline-block"
          }}
        >
          {status === "済" ? "✓ 入場済み" : "⏳ 未入場"}
        </span>
      );
    }

    const handleStatusChange = async (newStatus: "未" | "済") => {
      // モーダル内のチケット（eventIdとeventCollectionNameが提供されている場合）
      if (eventId && eventCollectionName) {
        try {
          const eventDocRef = doc(db, eventCollectionName, eventId);
          const ticketDocRef = doc(collection(eventDocRef, 'tickets'), docId);
          await setDoc(ticketDocRef, { status: newStatus }, { merge: true });
          
          // イベント統合ビューのデータを更新
          await fetchEventsWithTickets();
          
          console.log(`Modal ticket status updated for ${docId}: ${newStatus}`);
        } catch (error) {
          console.error("Error updating modal ticket status:", error);
          alert("ステータスの更新に失敗しました。");
        }
      } else {
        // 通常のステータス更新
        updateDocumentStatus(docId, newStatus);
      }
    };

    return (
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value as "未" | "済")}
        style={{
          padding: "4px 8px",
          borderRadius: "8px",
          border: "2px solid #e0e0e0",
          fontSize: "12px",
          fontWeight: "600",
          backgroundColor: status === "済" ? "#4caf50" : "#ff9800",
          color: "white",
          cursor: "pointer"
        }}
      >
        <option value="未" style={{ color: "black" }}>⏳ 未入場</option>
        <option value="済" style={{ color: "black" }}>✓ 入場済み</option>
      </select>
    );
  };

  return (
    <div style={{ 
      maxWidth: "1200px", 
      margin: "0 auto", 
      padding: "24px",
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif"
    }}>
      <style>{`
        .dashboard-container {
          background: #f5f5f5;
          min-height: 100vh;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e0e0e0;
        }
        .dashboard-title {
          font-size: 32px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }
        .refresh-btn {
          background: #1976d2;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s;
        }
        .refresh-btn:hover {
          background: #1565c0;
        }
        .refresh-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }
        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          text-align: center;
        }
        .stat-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }
        .stat-number {
          font-size: 36px;
          font-weight: 700;
          margin: 8px 0;
          color: #333;
        }
        .stat-label {
          color: #666;
          font-size: 14px;
        }
        .visitors-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .visitors-header {
          padding: 24px;
          border-bottom: 1px solid #e0e0e0;
        }
        .visitors-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
          color: #333;
        }
        .visitors-table {
          width: 100%;
          border-collapse: collapse;
        }
        .visitors-table th {
          background: #fafafa;
          padding: 16px;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 1px solid #e0e0e0;
        }
        .visitors-table td {
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        .visitors-table tr:hover {
          background: #f8f9fa;
        }
        .visitor-name {
          font-weight: 500;
          color: #333;
        }
        .ticket-id {
          font-family: monospace;
          color: #666;
          font-size: 12px;
        }
        .creator-id {
          font-family: monospace;
          color: #888;
          font-size: 11px;
        }
        .created-date {
          color: #666;
          font-size: 12px;
        }
        .fab-button {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #1976d2;
          border: none;
          color: white;
          font-size: 32px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.2s;
        }
        .fab-button:hover {
          background: #1565c0;
          transform: scale(1.05);
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 24px;
          border-radius: 12px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
        .modal-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: #333;
        }
        .form-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          margin-bottom: 8px;
          box-sizing: border-box;
        }
        .form-input:focus {
          outline: none;
          border-color: #1976d2;
        }
        .form-note {
          color: #666;
          font-size: 12px;
          margin-bottom: 16px;
        }
        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        .btn-secondary {
          background: #f5f5f5;
          color: #333;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        .btn-primary {
          background: #1976d2;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }
        .btn-primary:hover {
          background: #1565c0;
        }
        .loading-text {
          text-align: center;
          color: #666;
          font-style: italic;
          padding: 40px;
        }
        .empty-state {
          text-align: center;
          color: #666;
          padding: 40px;
        }
        .filters-container {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 24px;
        }
        .filters-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: #333;
        }
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
        }
        .filter-label {
          font-size: 12px;
          font-weight: 500;
          color: #666;
          margin-bottom: 4px;
        }
        .filter-input {
          padding: 8px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
        }
        .filter-input:focus {
          outline: none;
          border-color: #1976d2;
        }
        .filter-select {
          padding: 8px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }
        .filter-select:focus {
          outline: none;
          border-color: #1976d2;
        }
        .clear-filters-btn {
          background: #f5f5f5;
          color: #666;
          border: 1px solid #ddd;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          align-self: flex-end;
        }
        .clear-filters-btn:hover {
          background: #e0e0e0;
        }
        .results-count {
          color: #666;
          font-size: 12px;
          margin-bottom: 16px;
        }
        .collection-selector {
          background: white;
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 24px;
        }
        .collection-selector-title {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: #333;
        }
        .collection-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .collection-tab {
          padding: 8px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 20px;
          background: white;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .collection-tab:hover {
          border-color: #1976d2;
        }
        .collection-tab.active {
          background: #1976d2;
          color: white;
          border-color: #1976d2;
        }
        .event-form-grid {
          display: grid;
          gap: 16px;
        }
        .date-fields-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .date-field-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .date-field-row input {
          flex: 1;
        }
        .remove-date-btn {
          background: #ff5252;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px;
          cursor: pointer;
          font-size: 12px;
        }
        .remove-date-btn:hover {
          background: #f44336;
        }
        .add-date-btn {
          background: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 12px;
          margin-top: 8px;
        }
        .add-date-btn:hover {
          background: #45a049;
        }
        .event-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #ff9800;
          border: none;
          color: white;
          font-size: 32px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.2s;
        }
        .event-fab:hover {
          background: #f57c00;
          transform: scale(1.05);
        }

      `}</style>

      {/* ヘッダー */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">データ管理ダッシュボード</h1>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            {user && `ようこそ、${user.displayName}さん`}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            className="refresh-btn"
            onClick={() => fetchDocuments()}
            disabled={loading}
          >
            🔄 更新
          </button>
          <button
            className="refresh-btn"
            onClick={testFirestoreConnection}
            style={{ background: "#4caf50" }}
            title="Firestore接続テスト"
          >
            🔧 テスト
          </button>
          <button
            className="refresh-btn"
            onClick={signOutUser}
            style={{ 
              background: "#f44336",
              fontSize: "12px",
              padding: "8px 16px"
            }}
            title="ログアウト"
          >
            ログアウト
          </button>
        </div>
      </div>

      {/* コレクション選択 */}
      <div className="collection-selector">
        <h3 className="collection-selector-title">📂 コレクション選択</h3>
        {collectionsLoading ? (
          <div>コレクション読み込み中...</div>
        ) : (
          <div className="collection-tabs">
            <button
              key="events_overview"
              className={`collection-tab ${selectedCollection === "events_overview" ? 'active' : ''}`}
              onClick={() => setSelectedCollection("events_overview")}
            >
              📅 イベント統合ビュー
            </button>
            {collections.map((collectionName) => (
              <button
                key={collectionName}
                className={`collection-tab ${selectedCollection === collectionName ? 'active' : ''}`}
                onClick={() => setSelectedCollection(collectionName)}
              >
                {collectionName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 統計カード */}
      <div className="stats-grid">
        {selectedCollection === "events_overview" ? (
          <>
            <div className="stat-card">
              <div className="stat-icon">🎪</div>
              <div className="stat-number">{totalDocuments}</div>
              <div className="stat-label">総イベント数</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎫</div>
              <div className="stat-number">{totalTickets}</div>
              <div className="stat-label">総チケット数</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-number">{completedDocuments}</div>
              <div className="stat-label">入場済み</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-number">{pendingDocuments}</div>
              <div className="stat-label">未入場</div>
            </div>
          </>
        ) : isEventCollection ? (
          <>
            <div className="stat-card">
              <div className="stat-icon">🎫</div>
              <div className="stat-number">{totalDocuments}</div>
              <div className="stat-label">{selectedCollection} チケット数</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-number">{completedDocuments}</div>
              <div className="stat-label">入場済み</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-number">{pendingDocuments}</div>
              <div className="stat-label">未入場</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-number">{currentEventTickets.length}</div>
              <div className="stat-label">全チケット数</div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-icon">📄</div>
              <div className="stat-number">{totalDocuments}</div>
              <div className="stat-label">総{selectedCollection}数</div>
            </div>
            {selectedCollection === "tickets" ? (
              <>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-number">{completedDocuments}</div>
                  <div className="stat-label">入場済み</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-number">{pendingDocuments}</div>
                  <div className="stat-label">未入場</div>
                </div>
              </>
            ) : (
              <>
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-number">{documents.length}</div>
                  <div className="stat-label">全{selectedCollection}数</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🔍</div>
                  <div className="stat-number">{filteredDocuments.length}</div>
                  <div className="stat-label">表示中</div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* フィルタリング */}
      <div className="filters-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 className="filters-title">🔍 フィルタリング</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label 
              htmlFor="my-documents-toggle"
              style={{ fontSize: "12px", fontWeight: "500", color: "#333" }}
            >
              自分の作成のみ
            </label>
            <button
              id="my-documents-toggle"
              type="button"
              onClick={() => setShowOnlyMyDocuments(!showOnlyMyDocuments)}
              style={{
                width: "44px",
                height: "24px",
                borderRadius: "12px",
                border: "none",
                position: "relative",
                cursor: "pointer",
                backgroundColor: showOnlyMyDocuments ? "#1976d2" : "#e0e0e0",
                transition: "background-color 0.2s"
              }}
              aria-label={showOnlyMyDocuments ? "自分の作成のみ表示中" : "全て表示中"}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  backgroundColor: "white",
                  position: "absolute",
                  top: "3px",
                  left: showOnlyMyDocuments ? "23px" : "3px",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
                }}
              />
            </button>
          </div>
        </div>
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label" htmlFor="name-filter">名前で検索</label>
            <input
              id="name-filter"
              type="text"
              className="filter-input"
              placeholder="来場者名を入力..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>
          {(selectedCollection === "tickets" || selectedCollection === "events_overview" || 
            (!["users", "events", "products"].includes(selectedCollection))) && (
            <div className="filter-group">
              <label className="filter-label" htmlFor="status-filter">ステータス</label>
              <select
                id="status-filter"
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "未" | "済")}
              >
                <option value="all">全て</option>
                <option value="未">未入場</option>
                <option value="済">入場済み</option>
              </select>
            </div>
          )}
          <div className="filter-group">
            <label className="filter-label" htmlFor="creator-filter">作成者ID</label>
            <input
              id="creator-filter"
              type="text"
              className="filter-input"
              placeholder="作成者IDを入力..."
              value={creatorFilter}
              onChange={(e) => setCreatorFilter(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label" htmlFor="band-name-filter">バンド名</label>
            <input
              id="band-name-filter"
              type="text"
              className="filter-input"
              placeholder="バンド名を入力..."
              value={bandNameFilter}
              onChange={(e) => setBandNameFilter(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <span className="filter-label" aria-hidden="true">&nbsp;</span>
            <button
              type="button"
              className="clear-filters-btn"
              onClick={() => {
                setNameFilter("");
                setStatusFilter("all");
                setCreatorFilter("");
                setBandNameFilter("");
                setShowOnlyMyDocuments(false);
              }}
              aria-label="フィルターをクリア"
            >
              🗑️ クリア
            </button>
          </div>
        </div>
      </div>

      {/* データリスト */}
      <div className="visitors-card">
        <div className="visitors-header">
          <h2 className="visitors-title">
            {selectedCollection === "events_overview" 
              ? "イベント統合ビュー" 
              : isEventCollection
              ? `${selectedCollection} チケット一覧`
              : `${selectedCollection} 一覧`
            }
            {showOnlyMyDocuments && (
              <span style={{ 
                fontSize: "12px", 
                color: "#1976d2", 
                marginLeft: "8px",
                fontWeight: "normal"
              }}>
                (自分の作成のみ)
              </span>
            )}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className="results-count">
              {selectedCollection === "events_overview" 
                ? `${filteredEventsWithTickets.length} 件 / 全 ${eventsWithTickets.length} 件`
                : isEventCollection
                ? `${filteredEventTickets.length} 件 / 全 ${currentEventTickets.length} 件`
                : `${filteredDocuments.length} 件 / 全 ${documents.length} 件`
              }
            </div>
            {(selectedCollection === "tickets" || 
              selectedCollection === "events_overview" ||
              (!["users", "events", "products"].includes(selectedCollection)) ||
              filteredDocuments.some(doc => doc.status !== undefined)) && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => bulkUpdateStatus("済")}
                  style={{
                    background: "#4caf50",
                    color: "white",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                  title="表示中の全てを入場済みに"
                >
                  ✓ 全て済
                </button>
                <button
                  onClick={() => bulkUpdateStatus("未")}
                  style={{
                    background: "#ff9800",
                    color: "white",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                  title="表示中の全てを未入場に"
                >
                  ⏳ 全て未
                </button>
                {selectedCollection !== "events_overview" && (
                  <button
                    onClick={bulkDeleteTickets}
                    style={{
                      background: "#f44336",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                    title="表示中のチケットを全て削除"
                  >
                    🗑️ 全て削除
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {loading ? (
          <div className="loading-text">読み込み中...</div>
        ) : selectedCollection === "events_overview" ? (
          eventsWithTickets.length === 0 ? (
            <div className="empty-state">
              イベントがありません。<br/>
              新しいイベントを作成してください。
            </div>
          ) : filteredEventsWithTickets.length === 0 ? (
            <div className="empty-state">
              フィルター条件に一致するイベントがありません。<br/>
              フィルターを変更してください。
            </div>
          ) : (
          <table className="visitors-table">
            <thead>
              <tr>
                <th>EventTitle</th>
                <th>チケット数</th>
                <th>入場済み</th>
                <th>未入場</th>
                <th>開催日時</th>
                <th>場所</th>
                <th>値段</th>
                <th>ワンドリンク</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredEventsWithTickets.map((eventWithTickets) => (
                <tr key={eventWithTickets.eventId}>
                  <td>
                    <div className="visitor-name">
                      <button
                        onClick={() => {
                          setSelectedEventForTickets(eventWithTickets);
                          setShowTicketsModal(true);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#1976d2",
                          textDecoration: "underline",
                          cursor: "pointer",
                          padding: 0,
                          font: "inherit"
                        }}
                        title="チケット詳細を表示"
                      >
                        {eventWithTickets.eventTitle}
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="ticket-count">
                      <span style={{ 
                        padding: "4px 8px", 
                        borderRadius: "12px", 
                        backgroundColor: "#e3f2fd", 
                        color: "#1976d2",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}>
                        {eventWithTickets.ticketCount}枚
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="completed-tickets">
                      <span style={{ 
                        padding: "4px 8px", 
                        borderRadius: "12px", 
                        backgroundColor: "#e8f5e8", 
                        color: "#4caf50",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}>
                        {eventWithTickets.tickets.filter(t => t.status === "済").length}枚
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="pending-tickets">
                      <span style={{ 
                        padding: "4px 8px", 
                        borderRadius: "12px", 
                        backgroundColor: "#fff3e0", 
                        color: "#ff9800",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}>
                        {eventWithTickets.tickets.filter(t => t.status === "未").length}枚
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="event-dates">
                      {eventWithTickets.eventData.dates && Array.isArray(eventWithTickets.eventData.dates) 
                        ? eventWithTickets.eventData.dates.map((date, index) => (
                            <div key={index} style={{ fontSize: "11px", marginBottom: "2px" }}>
                              {new Date(date).toLocaleString("ja-JP")}
                            </div>
                          ))
                        : "日時未設定"
                      }
                    </div>
                  </td>
                  <td>
                    <div className="event-location">
                      {eventWithTickets.eventData.location || "場所未設定"}
                    </div>
                  </td>
                  <td>
                    <div className="event-price">
                      {eventWithTickets.eventData.price !== undefined ? `¥${eventWithTickets.eventData.price.toLocaleString()}` : "未設定"}
                    </div>
                  </td>
                  <td>
                    <div className="one-drink-status">
                      <span style={{ 
                        padding: "4px 8px", 
                        borderRadius: "12px", 
                        backgroundColor: eventWithTickets.eventData.oneDrink !== false ? "#e8f5e8" : "#ffebee", 
                        color: eventWithTickets.eventData.oneDrink !== false ? "#4caf50" : "#f44336",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}>
                        {eventWithTickets.eventData.oneDrink !== false ? "🍹 あり" : "❌ なし"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={() => openEditEventModal(eventWithTickets)}
                        style={{
                          background: "#1976d2",
                          color: "white",
                          border: "none",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          cursor: "pointer",
                          fontWeight: "500"
                        }}
                        title="イベント情報を編集"
                      >
                        ✏️ 編集
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )
        ) : isEventCollection ? (
          currentEventTickets.length === 0 ? (
            <div className="empty-state">
              {selectedCollection}イベントにはチケットがありません。<br/>
              新しいチケットを作成してください。
            </div>
          ) : filteredEventTickets.length === 0 ? (
            <div className="empty-state">
              フィルター条件に一致するチケットがありません。<br/>
              フィルターを変更してください。
            </div>
          ) : (
            <table className="visitors-table">
              <thead>
                <tr>
                  <th>チケット名</th>
                  <th>バンド名</th>
                  <th>ステータス</th>
                  <th>イベントID</th>
                  <th>作成者</th>
                  <th>作成日時</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredEventTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <div className="visitor-name">
                        {ticket.name || "名前なし"}
                      </div>
                    </td>
                    <td>
                      <div className="band-name">
                        {ticket.bandName || "-"}
                      </div>
                    </td>
                    <td>
                      <StatusBadge 
                        status={ticket.status} 
                        docId={ticket.id}
                        isEditable={true}
                      />
                    </td>
                    <td>
                      <div className="ticket-id">
                        {ticket.eventId ? ticket.eventId.substring(0, 8) + "..." : "不明"}
                      </div>
                    </td>
                    <td>
                      <div className="creator-id">
                        {ticket.createdBy ? ticket.createdBy.substring(0, 8) + "..." : "不明"}
                      </div>
                    </td>
                    <td>
                      <div className="created-date">
                        {ticket.createdAt
                          ? ticket.createdAt.toDate().toLocaleString("ja-JP")
                          : "不明"}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => deleteTicket(ticket.id, ticket.eventId)}
                        style={{
                          background: "#f44336",
                          color: "white",
                          border: "none",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          cursor: "pointer",
                          fontWeight: "500"
                        }}
                        title="チケットを削除"
                      >
                        🗑️ 削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : documents.length === 0 ? (
          <div className="empty-state">
            {selectedCollection}がありません。<br/>
            新しい{selectedCollection}を作成してください。
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="empty-state">
            フィルター条件に一致する{selectedCollection}がありません。<br/>
            フィルターを変更してください。
          </div>
        ) : (
          <table className="visitors-table">
            <thead>
              <tr>
                <th>Title/Tickets</th>
                <th>バンド名</th>
                {(selectedCollection === "tickets" || 
                  (!["users", "events", "products"].includes(selectedCollection))) && 
                  <th>ステータス</th>}
                {selectedCollection === "events" && <th>開催日時</th>}
                {selectedCollection === "events" && <th>場所</th>}
                {selectedCollection === "events" && <th>値段</th>}
                <th>作成者</th>
                <th>作成日時</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((document) => (
                <tr key={document.id}>
                  <td>
                    <div className="visitor-name">
                      {selectedCollection === "events" 
                        ? `${document.title || "タイトルなし"}/tickets`
                        : `${document.name || "名前なし"}/tickets`
                      }
                    </div>
                  </td>
                  <td>
                    <div className="band-name">
                      {document.bandName || "-"}
                    </div>
                  </td>
                  {(selectedCollection === "tickets" || 
                    (!["users", "events", "products"].includes(selectedCollection))) && (
                    <td>
                      <StatusBadge 
                        status={document.status} 
                        docId={document.id}
                        isEditable={true}
                      />
                    </td>
                  )}
                  {selectedCollection === "events" && (
                    <td>
                      <div className="event-dates">
                        {document.dates && Array.isArray(document.dates) 
                          ? document.dates.map((date, index) => (
                              <div key={index} style={{ fontSize: "11px", marginBottom: "2px" }}>
                                {new Date(date).toLocaleString("ja-JP")}
                              </div>
                            ))
                          : "日時未設定"
                        }
                      </div>
                    </td>
                  )}
                  {selectedCollection === "events" && (
                    <td>
                      <div className="event-location">
                        {document.location || "場所未設定"}
                      </div>
                    </td>
                  )}
                  {selectedCollection === "events" && (
                    <td>
                      <div className="event-price">
                        {document.price !== undefined ? `¥${document.price.toLocaleString()}` : "未設定"}
                      </div>
                    </td>
                  )}
                  <td>
                    <div className="creator-id">
                      {document.createdBy ? document.createdBy.substring(0, 8) + "..." : "不明"}
                    </div>
                  </td>
                  <td>
                    <div className="created-date">
                      {document.createdAt
                        ? document.createdAt.toDate().toLocaleString("ja-JP")
                        : "不明"}
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => deleteTicket(document.id)}
                      style={{
                        background: "#f44336",
                        color: "white",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: "500"
                      }}
                      title="チケットを削除"
                    >
                      🗑️ 削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* イベント作成FABボタン */}
      <button
        className="event-fab"
        onClick={() => setOpenEventDialog(true)}
        title="新しいイベントを作成"
      >
        📅
      </button>

      {/* 簡単ドキュメント作成ダイアログ */}
      {openDialog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">新しい{selectedCollection}を作成</h3>
            <input
              className="form-input"
              type="text"
              placeholder={selectedCollection === "tickets" ? "フルネーム（漢字）を入力してください" : "名前を入力してください"}
              value={newDocumentName}
              onChange={(e) => setNewDocumentName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  createNewDocument();
                }
              }}
            />
            {selectedCollection === "tickets" && (
              <div className="form-note">
                *名前は必ずフルネーム漢字で入力してください。
              </div>
            )}
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setOpenDialog(false)}
              >
                キャンセル
              </button>
              <button 
                className="btn-primary" 
                onClick={createNewDocument}
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* イベント作成ダイアログ */}
      {openEventDialog && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <h3 className="modal-title">📅 新しいイベントを作成</h3>
            <div className="event-form-grid">
              {/* イベントタイトル */}
              <div>
                <label className="filter-label" htmlFor="event-title">イベントタイトル</label>
                <input
                  id="event-title"
                  className="form-input"
                  type="text"
                  placeholder="イベント名を入力してください"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />
              </div>

              {/* 開催日時 */}
              <div>
                <span className="filter-label">開催日時</span>
                <div className="date-fields-container">
                  {eventDates.map((date, index) => (
                    <div key={index} className="date-field-row">
                      <input
                        className="form-input"
                        type="datetime-local"
                        value={date}
                        onChange={(e) => updateDate(index, e.target.value)}
                        aria-label={`開催日時 ${index + 1}`}
                      />
                      {eventDates.length > 1 && (
                        <button
                          type="button"
                          className="remove-date-btn"
                          onClick={() => removeDateField(index)}
                          title="この日付を削除"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-date-btn"
                    onClick={addDateField}
                  >
                    ➕ 開催日を追加
                  </button>
                </div>
              </div>

              {/* 開催場所 */}
              <div>
                <label className="filter-label" htmlFor="event-location">開催場所</label>
                <input
                  id="event-location"
                  className="form-input"
                  type="text"
                  placeholder="会場名・住所を入力してください"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                />
              </div>

              {/* 値段 */}
              <div>
                <label className="filter-label" htmlFor="event-price">値段（円）</label>
                <input
                  id="event-price"
                  className="form-input"
                  type="number"
                  placeholder="1000"
                  min="0"
                  value={eventPrice}
                  onChange={(e) => setEventPrice(e.target.value)}
                />
              </div>

              {/* ワンドリンク */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span className="filter-label">ワンドリンク</span>
                  <button
                    type="button"
                    onClick={() => setEventOneDrink(!eventOneDrink)}
                    style={{
                      width: "44px",
                      height: "24px",
                      borderRadius: "12px",
                      border: "none",
                      position: "relative",
                      cursor: "pointer",
                      backgroundColor: eventOneDrink ? "#1976d2" : "#e0e0e0",
                      transition: "background-color 0.2s"
                    }}
                    aria-label={eventOneDrink ? "ワンドリンクあり" : "ワンドリンクなし"}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        backgroundColor: "white",
                        position: "absolute",
                        top: "3px",
                        left: eventOneDrink ? "23px" : "3px",
                        transition: "left 0.2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
                      }}
                    />
                  </button>
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    {eventOneDrink ? "🍹 あり" : "❌ なし"}
                  </span>
                </div>
              </div>

            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setOpenEventDialog(false);
                  // フォームをリセット
                  setEventTitle("");
                  setEventDates([""]);
                  setEventLocation("");
                  setEventPrice("");
                  setEventOneDrink(true);
                }}
              >
                キャンセル
              </button>
              <button 
                className="btn-primary" 
                onClick={createNewEvent}
              >
                🎯 イベント作成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* イベント編集モーダル */}
      {showEditEventModal && editingEvent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "400px" }}>
            <h3 className="modal-title">
              ✏️ イベント情報を編集
            </h3>
            <div style={{ marginBottom: "16px", fontSize: "14px", color: "#666" }}>
              イベント: {editingEvent.eventTitle}
            </div>
            
            <div style={{ display: "grid", gap: "16px" }}>
              {/* 開催場所 */}
              <div>
                <label className="filter-label" htmlFor="edit-event-location">開催場所</label>
                <input
                  id="edit-event-location"
                  className="form-input"
                  type="text"
                  placeholder="会場名・住所を入力してください"
                  value={editEventLocation}
                  onChange={(e) => setEditEventLocation(e.target.value)}
                />
              </div>

              {/* 値段 */}
              <div>
                <label className="filter-label" htmlFor="edit-event-price">値段（円）</label>
                <input
                  id="edit-event-price"
                  className="form-input"
                  type="number"
                  placeholder="1000"
                  min="0"
                  value={editEventPrice}
                  onChange={(e) => setEditEventPrice(e.target.value)}
                />
              </div>

              {/* ワンドリンク */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span className="filter-label">ワンドリンク</span>
                  <button
                    type="button"
                    onClick={() => setEditEventOneDrink(!editEventOneDrink)}
                    style={{
                      width: "44px",
                      height: "24px",
                      borderRadius: "12px",
                      border: "none",
                      position: "relative",
                      cursor: "pointer",
                      backgroundColor: editEventOneDrink ? "#1976d2" : "#e0e0e0",
                      transition: "background-color 0.2s"
                    }}
                    aria-label={editEventOneDrink ? "ワンドリンクあり" : "ワンドリンクなし"}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        backgroundColor: "white",
                        position: "absolute",
                        top: "3px",
                        left: editEventOneDrink ? "23px" : "3px",
                        transition: "left 0.2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
                      }}
                    />
                  </button>
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    {editEventOneDrink ? "🍹 あり" : "❌ なし"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowEditEventModal(false);
                  setEditingEvent(null);
                  setEditEventLocation("");
                  setEditEventPrice("");
                  setEditEventOneDrink(true);
                }}
              >
                キャンセル
              </button>
              <button 
                className="btn-primary" 
                onClick={updateEventInfo}
              >
                💾 更新
              </button>
            </div>
          </div>
        </div>
      )}

      {/* チケット詳細モーダル */}
      {showTicketsModal && selectedEventForTickets && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "800px", width: "90%" }}>
            <h3 className="modal-title">
              🎫 {selectedEventForTickets.eventTitle} のチケット一覧
            </h3>
            <div style={{ marginBottom: "16px", fontSize: "12px", color: "#666" }}>
              パス: {selectedEventForTickets.eventTitle}/{selectedEventForTickets.eventId.substring(0, 8)}/tickets
            </div>
            
            {selectedEventForTickets.tickets.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                このイベントにはまだチケットがありません。
              </div>
            ) : (
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                <table className="visitors-table">
                  <thead>
                    <tr>
                      <th>チケット名</th>
                      <th>ステータス</th>
                      <th>作成者</th>
                      <th>作成日時</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEventForTickets.tickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td>
                          <div className="visitor-name">
                            {ticket.name || "名前なし"}
                          </div>
                        </td>
                        <td>
                          <StatusBadge 
                            status={ticket.status} 
                            docId={ticket.id}
                            isEditable={true}
                            eventId={selectedEventForTickets?.eventId}
                            eventCollectionName={selectedEventForTickets?.eventTitle
                              .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '')
                              .replace(/\s+/g, '')
                            }
                          />
                        </td>
                        <td>
                          <div className="creator-id">
                            {ticket.createdBy ? ticket.createdBy.substring(0, 8) + "..." : "不明"}
                          </div>
                        </td>
                        <td>
                          <div className="created-date">
                            {ticket.createdAt
                              ? ticket.createdAt.toDate().toLocaleString("ja-JP")
                              : "不明"}
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => deleteTicket(
                              ticket.id, 
                              selectedEventForTickets?.eventId,
                              selectedEventForTickets?.eventTitle
                                .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '')
                                .replace(/\s+/g, '')
                            )}
                            style={{
                              background: "#f44336",
                              color: "white",
                              border: "none",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              cursor: "pointer",
                              fontWeight: "500"
                            }}
                            title="チケットを削除"
                          >
                            🗑️ 削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowTicketsModal(false);
                  setSelectedEventForTickets(null);
                }}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
