import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { auth } from "../root";
import { signOut, onAuthStateChanged } from "firebase/auth";
import firebase from "firebase/compat/app";

export const meta: MetaFunction = () => {
  return [
    { charSet: "utf-8"},
    { title: "チケット管理システム" },
    { name: "description", content: "イベントチケット管理システム" },
  ];
};

export default function Index() {
  const [eventTitle, setEventTitle] = useState(""); // イベントタイトル入力フィールドの状態
  const [user, setUser] = useState<firebase.User | null>(null);
  const navigate = useNavigate();

  const navigateToAdmin = () => {
    if (!eventTitle.trim()) {
      alert("イベントタイトルを入力してください。");
      return;
    }
    // イベントタイトルをURLパラメータとして渡してadminページに遷移
    navigate(`/admin?title=${encodeURIComponent(eventTitle)}`);
  };

  const navigateToOwner = () => {
    navigate("/owner");
  };

  const navigateToQRReader = () => {
    navigate("/qr-reader");
  };

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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif"
    }}>
      <style>{`

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
        .index-header {
          background: #1976d2;
          color: white;
          padding: 16px 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 24px;
        }
        .index-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .index-title {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
        }
        .user-info {
          font-size: 14px;
          opacity: 0.9;
        }
        .header-btn {
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
        .header-btn:hover {
          background: white;
          color: #1976d2;
        }
        .content-wrapper {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 24px 32px 24px;
        }
      `}</style>

      {/* ヘッダー */}
      <div className="index-header">
        <div className="index-nav">
          <div></div>
          <h1 className="index-title">🎫 チケット管理システム</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user && (
              <>
                <div className="user-info">
                  {user.displayName}さん
                </div>
                <button 
                  className="header-btn"
                  onClick={signOutUser}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  ログアウト
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="content-wrapper">
        
        <div style={{ 
          background: 'linear-gradient(135deg, #1976d2, #1565c0)', 
          color: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          textAlign: 'center', 
          marginBottom: '32px' 
        }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>✨ 新形式チケットシステム</h2>
          <p style={{ margin: 0, opacity: 0.9 }}>
            イベント作成からチケット発行まで、すべて統合管理
          </p>
        </div>
        
        {/* イベント管理者向けセクション */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">👑 イベント管理者</h2>
          </div>
          <div className="section-content">
            <p style={{ marginBottom: '20px', color: '#666', lineHeight: '1.6' }}>
              イベントの作成・編集・全体管理を行います
            </p>
            <button 
              className="primary-btn"
              onClick={navigateToOwner}
            >
              イベント管理画面
            </button>
          </div>
        </div>

        <hr className="divider" />
        
        {/* チケット発行担当者向けセクション */}
        <div className="section-card">
          <div className="section-header secondary">
            <h2 className="section-title">🎫 チケット発行担当</h2>
          </div>
          <div className="section-content">
            <p style={{ marginBottom: '20px', color: '#666', lineHeight: '1.6' }}>
              特定のイベントでチケットを発行・管理します
            </p>
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                placeholder="担当するイベント名を入力してください"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />
            </div>
            <button 
              className="secondary-btn"
              onClick={navigateToAdmin}
            >
              チケット発行画面
            </button>
          </div>
        </div>

        {/* QRコード読み取りセクション */}
        <div className="section-card">
          <div className="section-header" style={{ background: 'linear-gradient(135deg, #388e3c, #2e7d32)' }}>
            <h2 className="section-title">📱 QRコード読み取り</h2>
          </div>
          <div className="section-content">
            <p style={{ marginBottom: '20px', color: '#666', lineHeight: '1.6' }}>
              チケットのQRコードをスキャンして入場確認を行います
            </p>
            <button 
              className="primary-btn"
              onClick={navigateToQRReader}
              style={{ 
                background: '#388e3c',
                marginBottom: '12px'
              }}
              onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = '#2e7d32'}
              onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = '#388e3c'}
              onFocus={(e) => (e.target as HTMLButtonElement).style.background = '#2e7d32'}
              onBlur={(e) => (e.target as HTMLButtonElement).style.background = '#388e3c'}
            >
              📸 QRコードを読み取る
            </button>
          </div>
        </div>

        <hr className="divider" />

        {/* 説明セクション */}
        <div className="section-card">
          <div className="section-content">
            <h3 style={{ color: '#333', marginBottom: '16px' }}>📋 システムの使い方</h3>
            <div style={{ color: '#666', lineHeight: '1.8' }}>
              <p><strong>1. イベント管理者:</strong> 新しいイベントを作成し、基本情報を設定</p>
              <p><strong>2. チケット発行担当:</strong> 来場者にチケットを発行・QRコード生成</p>
              <p><strong>3. QRコード読み取り:</strong> 来場者のチケットをスキャンして入場確認</p>
              <p><strong>4. 入場時:</strong> QRコードをスキャンして入場処理を完了</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
