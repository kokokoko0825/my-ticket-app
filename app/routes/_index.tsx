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
          font-size: 24px;
          font-weight: 600;
          color: #333;
          text-align: center;
          margin: 0 0 24px 0;
        }
        @media (min-width: 600px) {
          .main-title {
            font-size: 32px;
            margin: 0 0 40px 0;
          }
        }
        .section-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          margin-bottom: 24px;
          overflow: hidden;
        }
        @media (min-width: 600px) {
          .section-card {
            margin-bottom: 32px;
          }
        }
        .section-header {
          background: linear-gradient(135deg, #1976d2, #1565c0);
          color: white;
          padding: 16px 20px;
        }
        @media (min-width: 600px) {
          .section-header {
            padding: 20px 24px;
          }
        }
        .section-header.secondary {
          background: linear-gradient(135deg, #dc004e, #b8003d);
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }
        @media (min-width: 600px) {
          .section-title {
            font-size: 20px;
          }
        }
        .section-content {
          padding: 20px;
        }
        @media (min-width: 600px) {
          .section-content {
            padding: 24px;
          }
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          font-family: inherit;
          transition: border-color 0.2s;
          box-sizing: border-box;
          -webkit-appearance: none;
          appearance: none;
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
          padding: 14px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: background 0.2s;
          margin-bottom: 12px;
          min-height: 48px;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        @media (min-width: 600px) {
          .primary-btn {
            padding: 16px 24px;
          }
        }
        .primary-btn:hover {
          background: #1565c0;
        }
        .primary-btn:active {
          background: #1565c0;
          transform: translateY(1px);
        }
        .secondary-btn {
          width: 100%;
          background: #dc004e;
          color: white;
          border: none;
          padding: 14px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: background 0.2s;
          min-height: 48px;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        @media (min-width: 600px) {
          .secondary-btn {
            padding: 16px 24px;
          }
        }
        .secondary-btn:hover {
          background: #b8003d;
        }
        .secondary-btn:active {
          background: #b8003d;
          transform: translateY(1px);
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
          padding: 12px 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 16px;
        }
        @media (min-width: 600px) {
          .index-header {
            padding: 16px 24px;
            margin-bottom: 24px;
          }
        }
        .index-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }
        .index-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          flex: 1;
          min-width: 0;
        }
        @media (min-width: 600px) {
          .index-title {
            font-size: 24px;
          }
        }
        .user-info {
          font-size: 12px;
          opacity: 0.9;
          display: none;
        }
        @media (min-width: 480px) {
          .user-info {
            display: block;
            font-size: 14px;
          }
        }
        .header-btn {
          background: transparent;
          border: 2px solid white;
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
          min-height: 36px;
        }
        @media (min-width: 600px) {
          .header-btn {
            padding: 8px 16px;
            font-size: 14px;
            gap: 8px;
          }
        }
        .header-btn:hover {
          background: white;
          color: #1976d2;
        }
        .content-wrapper {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 16px 32px 16px;
        }
        @media (min-width: 600px) {
          .content-wrapper {
            padding: 0 24px 32px 24px;
          }
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
          padding: '20px', 
          borderRadius: '12px', 
          textAlign: 'center', 
          marginBottom: '24px' 
        }}>
          <h2 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '20px',
            '@media (min-width: 600px)': { fontSize: '24px' }
          }}>✨ 新形式チケットシステム</h2>
          <p style={{ 
            margin: 0, 
            opacity: 0.9,
            fontSize: '14px'
          }}>
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
