import { useState } from "react";
import { doc, setDoc, query, where, getDocs, collection } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { db, auth } from "../root";

export const meta: MetaFunction = () => {
  return [
    { charSet: "utf-8"},
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const [name, setName] = useState(""); // 名前入力フィールドの状態
  const [qrCode, setQrCode] = useState(""); // 生成されたQRコードのURL
  const [eventTitle, setEventTitle] = useState(""); // イベントタイトル入力フィールドの状態
  const navigate = useNavigate();

  const generateTicket = async () => {
    if (!name.trim()) { // 空白のみの名前入力を防ぐ
      alert("名前を入力してください。");
      return;
    }

    if (!auth.currentUser) { 
    alert("ログインしてください。");
    return;
    }

    try {
      const q = query(collection(db, "tickets"), where("name", "==", name), where("createdBy", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) { 
        alert("同じ名前のチケットが既に発行されています。");
        return;
      }

      const newUuid = crypto.randomUUID(); // UUIDの生成

      // Firestoreにデータを保存
      await setDoc(doc(db, "tickets", newUuid), {
        name: name,
        id: newUuid,
        status: "未",
        createdBy: auth.currentUser.uid,
      });

      // QRコードの生成
      setQrCode(window.location.origin + "/ticket/" + newUuid);
      //setName(""); // 入力フィールドをクリア
    } catch (error) {
      console.error("Error creating ticket:", error);
      alert("チケットの発行に失敗しました。"); // エラーメッセージを表示
    }
  };

  const navigateToAdmin = () => {
    if (!eventTitle.trim()) {
      alert("イベントタイトルを入力してください。");
      return;
    }
    // イベントタイトルをURLパラメータとして渡してadminページに遷移
    navigate(`/admin?title=${encodeURIComponent(eventTitle)}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      padding: '32px 24px'
    }}>
      <style>{`
        .main-container {
          max-width: 800px;
          margin: 0 auto;
        }
        .main-title {
          font-size: 32px;
          font-weight: 600;
          color: #333;
          text-align: center;
          margin: 0 0 40px 0;
        }
        .section-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          margin-bottom: 32px;
          overflow: hidden;
        }
        .section-header {
          background: linear-gradient(135deg, #1976d2, #1565c0);
          color: white;
          padding: 20px 24px;
        }
        .section-header.secondary {
          background: linear-gradient(135deg, #dc004e, #b8003d);
        }
        .section-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }
        .section-content {
          padding: 24px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-input {
          width: 100%;
          padding: 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          font-family: inherit;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .form-input:focus {
          outline: none;
          border-color: #1976d2;
        }
        .primary-btn {
          width: 100%;
          background: #1976d2;
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: background 0.2s;
          margin-bottom: 12px;
        }
        .primary-btn:hover {
          background: #1565c0;
        }
        .secondary-btn {
          width: 100%;
          background: #dc004e;
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: background 0.2s;
        }
        .secondary-btn:hover {
          background: #b8003d;
        }
        .form-note {
          font-size: 14px;
          color: #666;
          text-align: center;
          margin-top: 12px;
          font-style: italic;
        }
        .divider {
          height: 2px;
          background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
          margin: 24px 0;
          border: none;
        }
      `}</style>

      <div className="main-container">
        <h1 className="main-title">チケット管理システム</h1>
        
        {/* イベント管理セクション */}
        <div className="section-card">
          <div className="section-header secondary">
            <h2 className="section-title">🎪 イベント管理</h2>
          </div>
          <div className="section-content">
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                placeholder="イベント名を入力してください"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />
            </div>
            <button 
              className="secondary-btn"
              onClick={navigateToAdmin}
            >
              管理画面へ移動
            </button>
          </div>
        </div>

        <hr className="divider" />
        
        {/* チケット発行セクション */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">🎫 個人チケット発行</h2>
          </div>
          <div className="section-content">
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                placeholder="フルネーム（漢字）を入力してください"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <button 
              className="primary-btn"
              onClick={generateTicket}
            >
              チケット発行
            </button>
            <div className="form-note">
              *名前は必ずフルネーム漢字で入力して下さい。
            </div>
          </div>
        </div>
      
        {/* QRコードの表示 */}
        {qrCode && (
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">📱 生成されたチケット</h2>
            </div>
            <div className="section-content">
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <strong>下記の画像をスクリーンショットしてください。</strong>
              </div>
              
              <div style={{ 
                backgroundColor: '#2c2c2c', 
                color: 'white', 
                padding: '20px', 
                borderRadius: '8px',
                marginBottom: '16px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}>
                <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                  {name}さん用入場チケット
                </div>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: '600',
                  textAlign: 'center', 
                  margin: '16px 0',
                  fontFamily: 'Irish Grover, cursive' 
                }}>
                  title
                </div>
                <div style={{ fontSize: '14px', textAlign: 'right', marginBottom: '16px' }}>
                  in place
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', lineHeight: '1.4' }}>Date: 3/8 ,3/9</div>
                    <div style={{ fontSize: '14px', lineHeight: '1.4' }}>Open:</div>
                    <div style={{ fontSize: '14px', lineHeight: '1.4' }}>/ Day1, 14:30 ~ /</div>
                    <div style={{ fontSize: '14px', lineHeight: '1.4' }}>/ Day2, 15:30 ~ /</div>
                    <div style={{ fontSize: '14px', lineHeight: '1.4' }}>Price: 1000円 + 1dr</div>
                  </div>
                  <QRCodeCanvas value={qrCode} size={75} level="H" />
                </div>
              </div>
              
              <div style={{ 
                backgroundColor: '#2c2c2c', 
                color: 'white', 
                padding: '20px', 
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
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
                    〒510-0256 三重県鈴鹿市磯山1-9-8
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
