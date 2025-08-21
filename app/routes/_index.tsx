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
      backgroundColor: '#f8f9fa',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif"
    }}>
      <style>{`
        /* モバイルファーストのレスポンシブデザイン */
        * {
          box-sizing: border-box;
        }
        
        /* タッチ操作の改善 */
        button, .clickable {
          cursor: pointer;
          user-select: none;
          -webkit-user-select: none;
          -webkit-tap-highlight-color: rgba(25, 118, 210, 0.15);
          touch-action: manipulation;
        }
        
        /* スムーズなアニメーション */
        button, .section-card, .form-input {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .main-title {
          font-size: 20px;
          font-weight: 600;
          color: #212121;
          text-align: center;
          margin: 0 0 20px 0;
          line-height: 1.3;
        }
        @media (min-width: 600px) {
          .main-title {
            font-size: 28px;
            margin: 0 0 32px 0;
          }
        }
        
        /* メイングリッドシステム */
        .main-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 24px;
          align-items: center;
        }
        
        .main-grid .section-card {
          width: 90%;
          max-width: 400px;
        }
        
        @media (min-width: 768px) {
          .main-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
            margin-top: 32px;
            align-items: stretch;
          }
          
          .main-grid .section-card {
            width: 100%;
            max-width: none;
          }
        }
        
        @media (min-width: 1024px) {
          .main-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 28px;
          }
        }
        
        .section-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          overflow: hidden;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .section-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .section-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(25, 118, 210, 0.02), rgba(25, 118, 210, 0.05));
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }
        
        .section-card:active::before {
          opacity: 1;
        }
        
        @media (min-width: 600px) {
          .section-card {
            border-radius: 20px;
          }
        }
        .section-header {
          background: linear-gradient(135deg, #1976d2, #42a5f5);
          color: white;
          padding: 18px 20px;
          position: relative;
          overflow: hidden;
        }
        
        .section-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.5s ease;
        }
        
        .section-card:hover .section-header::before {
          left: 100%;
        }
        
        @media (min-width: 600px) {
          .section-header {
            padding: 22px 28px;
          }
        }
        
        .section-header.secondary {
          background: linear-gradient(135deg, #dc004e, #ff5983);
        }
        
        .section-title {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          line-height: 1.4;
        }
        
        @media (min-width: 600px) {
          .section-title {
            font-size: 18px;
            gap: 10px;
          }
        }
        
        @media (min-width: 960px) {
          .section-title {
            font-size: 20px;
            gap: 12px;
          }
        }
        
        .section-content {
          padding: 20px 24px 24px 24px;
          width: 100%;
          box-sizing: border-box;
          overflow: hidden;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        @media (min-width: 600px) {
          .section-content {
            padding: 24px 28px 28px 28px;
          }
        }
        
        @media (min-width: 960px) {
          .section-content {
            padding: 28px 32px 32px 32px;
          }
        }
        .form-group {
          margin-bottom: 18px;
          width: 100%;
          overflow: hidden;
          position: relative;
        }
        
        .form-input {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid #e1e5e9;
          border-radius: 16px;
          font-size: 16px;
          font-family: inherit;
          background: #fafbfc;
          transition: all 0.2s ease;
          box-sizing: border-box;
          -webkit-appearance: none;
          appearance: none;
          line-height: 1.5;
          /* iOS Safariのズーム防止の強化 */
          -webkit-text-size-adjust: 100%;
          -moz-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
          text-size-adjust: 100%;
          max-width: 100%;
          min-width: 0;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #1976d2;
          background: white;
          box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.1);
          transform: translateY(-1px);
        }
        
        .form-input::placeholder {
          color: #9e9e9e;
          font-weight: 400;
        }
        
        @media (min-width: 600px) {
          .form-input {
            border-radius: 12px;
            padding: 16px 20px;
          }
        }
        .primary-btn {
          width: 100%;
          background: linear-gradient(135deg, #1976d2, #1565c0);
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 16px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 700;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          margin-bottom: 12px;
          min-height: 52px;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(25, 118, 210, 0.25);
        }
        
        .primary-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        
        .primary-btn:active::before {
          left: 100%;
        }
        
        @media (min-width: 600px) {
          .primary-btn {
            padding: 18px 28px;
            border-radius: 14px;
            font-size: 16px;
            min-height: 56px;
          }
        }
        
        @media (min-width: 960px) {
          .primary-btn {
            padding: 20px 32px;
            border-radius: 16px;
            font-size: 17px;
            min-height: 60px;
          }
        }
        
        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(25, 118, 210, 0.35);
        }
        
        .primary-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
        }
        
        .secondary-btn {
          width: 100%;
          background: linear-gradient(135deg, #dc004e, #b8003d);
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 16px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 700;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          min-height: 52px;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(220, 0, 78, 0.25);
        }
        
        .secondary-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        
        .secondary-btn:active::before {
          left: 100%;
        }
        
        @media (min-width: 600px) {
          .secondary-btn {
            padding: 18px 28px;
            border-radius: 14px;
            font-size: 16px;
            min-height: 56px;
          }
        }
        
        @media (min-width: 960px) {
          .secondary-btn {
            padding: 20px 32px;
            border-radius: 16px;
            font-size: 17px;
            min-height: 60px;
          }
        }
        
        .secondary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(220, 0, 78, 0.35);
        }
        
        .secondary-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(220, 0, 78, 0.2);
        }
        .form-note {
          font-size: 14px;
          color: #666;
          text-align: center;
          margin-top: 12px;
          font-style: italic;
        }
        .index-header {
          background: linear-gradient(135deg, #1976d2, #42a5f5);
          color: white;
          padding: 16px 20px;
          box-shadow: 0 4px 16px rgba(25, 118, 210, 0.2);
          margin-bottom: 20px;
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
        }
        
        @media (min-width: 600px) {
          .index-header {
            padding: 20px 28px;
            margin-bottom: 28px;
          }
        }
        
        .index-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .index-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          flex: 1;
          min-width: 0;
          line-height: 1.3;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        @media (min-width: 600px) {
          .index-title {
            font-size: 22px;
            gap: 12px;
          }
        }
        .user-info {
          font-size: 12px;
          opacity: 0.95;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(255, 255, 255, 0.15);
          padding: 6px 12px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        
        @media (max-width: 479px) {
          .user-info {
            display: none;
          }
        }
        
        @media (min-width: 600px) {
          .user-info {
            font-size: 13px;
            padding: 8px 16px;
            gap: 6px;
          }
        }
        
        .header-btn {
          background: rgba(255, 255, 255, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 6px;
          min-height: 40px;
          touch-action: manipulation;
          backdrop-filter: blur(10px);
        }
        
        @media (min-width: 600px) {
          .header-btn {
            padding: 10px 20px;
            font-size: 14px;
            gap: 8px;
            min-height: 44px;
          }
        }
        
        .header-btn:hover {
          background: white;
          color: #1976d2;
          border-color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .header-btn:active {
          transform: translateY(0);
        }
        .content-wrapper {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 16px 40px 16px;
        }
        
        @media (min-width: 600px) {
          .content-wrapper {
            padding: 0 24px 48px 24px;
          }
        }
        
        @media (min-width: 960px) {
          .content-wrapper {
            padding: 0 32px 56px 32px;
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
          background: 'linear-gradient(135deg, #1976d2, #42a5f5)', 
          color: 'white', 
          padding: '32px 24px', 
          borderRadius: '24px', 
          textAlign: 'center', 
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(25, 118, 210, 0.25)'
        }}>
          <div style={{
            position: 'absolute',
            top: '-30%',
            right: '-15%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-20%',
            left: '-10%',
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>
          <h2 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '24px',
            fontWeight: 700,
            lineHeight: 1.2,
            position: 'relative',
            zIndex: 1
          }}>✨ 新形式チケットシステム</h2>
          <p style={{ 
            margin: 0, 
            opacity: 0.95,
            fontSize: '16px',
            lineHeight: 1.5,
            fontWeight: 400,
            position: 'relative',
            zIndex: 1,
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            イベント作成からチケット発行まで、すべて統合管理
          </p>
        </div>
        
        {/* メイン機能グリッド */}
        <div className="main-grid">
          {/* イベント管理者向けセクション */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">👑 イベント管理者</h2>
            </div>
            <div className="section-content">
              <div>
                <p style={{ marginBottom: '24px', color: '#757575', lineHeight: '1.6', fontSize: '14px' }}>
                  イベントの作成・編集・全体管理を行います
                </p>
              </div>
              <div>
                <button 
                  className="primary-btn"
                  onClick={navigateToOwner}
                >
                  📋 イベント管理画面
                </button>
              </div>
            </div>
          </div>
          
          {/* チケット発行担当者向けセクション */}
          <div className="section-card">
            <div className="section-header secondary">
              <h2 className="section-title">🎫 チケット発行担当</h2>
            </div>
            <div className="section-content">
              <div>
                <p style={{ marginBottom: '24px', color: '#757575', lineHeight: '1.6', fontSize: '14px' }}>
                  特定のイベントでチケットを発行・管理します
                </p>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="担当するイベント名を入力してください"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    inputMode="text"
                    autoComplete="off"
                    style={{
                      fontSize: '16px',
                      WebkitTextSizeAdjust: '100%',
                      textSizeAdjust: '100%'
                    }}
                  />
                </div>
              </div>
              <div>
                <button 
                  className="secondary-btn"
                  onClick={navigateToAdmin}
                >
                  🎫 チケット発行画面
                </button>
              </div>
            </div>
          </div>

          {/* QRコード読み取りセクション */}
          <div className="section-card">
            <div className="section-header" style={{ background: 'linear-gradient(135deg, #388e3c, #66bb6a)' }}>
              <h2 className="section-title">📱 QRコード読み取り</h2>
            </div>
            <div className="section-content">
              <div>
                <p style={{ marginBottom: '24px', color: '#757575', lineHeight: '1.6', fontSize: '14px' }}>
                  チケットのQRコードをスキャンして入場確認を行います
                </p>
              </div>
              <div>
                <button 
                  className="primary-btn"
                  onClick={navigateToQRReader}
                  style={{ 
                    background: 'linear-gradient(135deg, #388e3c, #66bb6a)',
                    boxShadow: '0 4px 12px rgba(56, 142, 60, 0.25)',
                    marginBottom: '0'
                  }}
                >
                  📸 QRコードを読み取る
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 説明セクション - フル幅 */}
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          margin: '32px 0 0 0',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            padding: '20px 24px',
            borderBottom: '1px solid #e1e5e9'
          }}>
            <h3 style={{ 
              color: '#212121', 
              margin: 0,
              fontSize: '18px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>📋 システムの使い方</h3>
          </div>
          <div style={{ padding: '24px' }}>
            <div style={{ 
              display: 'grid',
              gap: '16px',
              gridTemplateColumns: '1fr',
            }}>
              <div style={{
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '12px',
                borderLeft: '4px solid #1976d2'
              }}>
                <strong style={{ color: '#1976d2' }}>1. イベント管理者:</strong>
                <span style={{ color: '#757575', marginLeft: '8px' }}>新しいイベントを作成し、基本情報を設定</span>
              </div>
              <div style={{
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '12px',
                borderLeft: '4px solid #dc004e'
              }}>
                <strong style={{ color: '#dc004e' }}>2. チケット発行担当:</strong>
                <span style={{ color: '#757575', marginLeft: '8px' }}>来場者にチケットを発行・QRコード生成</span>
              </div>
              <div style={{
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '12px',
                borderLeft: '4px solid #388e3c'
              }}>
                <strong style={{ color: '#388e3c' }}>3. QRコード読み取り:</strong>
                <span style={{ color: '#757575', marginLeft: '8px' }}>来場者のチケットをスキャンして入場確認</span>
              </div>
              <div style={{
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '12px',
                borderLeft: '4px solid #ff9800'
              }}>
                <strong style={{ color: '#ff9800' }}>4. 入場時:</strong>
                <span style={{ color: '#757575', marginLeft: '8px' }}>QRコードをスキャンして入場処理を完了</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
