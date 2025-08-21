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
          font-size: 1.25rem;
          font-weight: 600;
          color: #212121;
          text-align: center;
          margin: 0 0 1.25rem 0;
          line-height: 1.3;
        }
        @media (min-width: 37.5rem) {
          .main-title {
            font-size: 1.75rem;
            margin: 0 0 2rem 0;
          }
        }
        
        /* メイングリッドシステム - ownerページと同じ手法 */
        .main-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(18.75rem, 1fr));
          gap: 1.25rem;
          margin-top: 1.5rem;
        }
        
        @media (min-width: 37.5rem) {
          .main-grid {
            grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
          }
        }
        
        .main-grid .section-card {
          width: 100%;
          max-width: none;
        }
        
        .section-card {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 0.125rem 0.75rem rgba(0,0,0,0.08);
          overflow: hidden;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .section-card:hover {
          transform: translateY(-0.25rem);
          box-shadow: 0 0.5rem 1.5625rem rgba(0,0,0,0.15);
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
        
        @media (min-width: 37.5rem) {
          .section-card {
            border-radius: 1.25rem;
          }
        }
        .section-header {
          background: linear-gradient(135deg, #1976d2, #42a5f5);
          color: white;
          padding: 1.125rem 1.25rem;
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
        
        @media (min-width: 37.5rem) {
          .section-header {
            padding: 1.375rem 1.75rem;
          }
        }
        
        .section-header.secondary {
          background: linear-gradient(135deg, #dc004e, #ff5983);
        }
        
        .section-title {
          font-size: 1rem;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          line-height: 1.4;
        }
        
        @media (min-width: 37.5rem) {
          .section-title {
            font-size: 1.125rem;
            gap: 0.625rem;
          }
        }
        
        @media (min-width: 60rem) {
          .section-title {
            font-size: 1.25rem;
            gap: 0.75rem;
          }
        }
        
        .section-content {
          padding: 1.25rem 1.5rem 1.5rem 1.5rem;
          width: 100%;
          box-sizing: border-box;
          overflow: hidden;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        @media (min-width: 37.5rem) {
          .section-content {
            padding: 1.5rem 1.75rem 1.75rem 1.75rem;
          }
        }
        
        @media (min-width: 60rem) {
          .section-content {
            padding: 1.75rem 2rem 2rem 2rem;
          }
        }
        .form-group {
          margin-bottom: 1.125rem;
          width: 100%;
          overflow: hidden;
          position: relative;
        }
        
        .form-input {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 0.125rem solid #e1e5e9;
          border-radius: 1rem;
          font-size: 16px !important; /* 16px以上でズーム防止 */
          font-family: inherit;
          background: #fafbfc;
          transition: all 0.2s ease;
          box-sizing: border-box;
          -webkit-appearance: none;
          appearance: none;
          line-height: 1.5;
          /* iOS Safariのズーム防止の強化 */
          -webkit-text-size-adjust: 100% !important;
          -moz-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
          text-size-adjust: 100%;
          max-width: 100%;
          min-width: 0;
          /* モバイルズーム完全防止 */
          zoom: 1;
          -webkit-user-select: text;
          user-select: text;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #1976d2;
          background: white;
          box-shadow: 0 0 0 0.25rem rgba(25, 118, 210, 0.1);
          transform: translateY(-0.0625rem);
        }
        
        .form-input::placeholder {
          color: #9e9e9e;
          font-weight: 400;
        }
        
        @media (min-width: 37.5rem) {
          .form-input {
            border-radius: 0.75rem;
            padding: 1rem 1.25rem;
          }
        }
        .primary-btn {
          width: 100%;
          background: linear-gradient(135deg, #1976d2, #1565c0);
          color: white;
          border: none;
          padding: 1rem 1.5rem;
          border-radius: 1rem;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 700;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          margin-bottom: 0.75rem;
          min-height: 3.25rem;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0.25rem 0.75rem rgba(25, 118, 210, 0.25);
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
        
        @media (min-width: 37.5rem) {
          .primary-btn {
            padding: 1.125rem 1.75rem;
            border-radius: 0.875rem;
            font-size: 1rem;
            min-height: 3.5rem;
          }
        }
        
        @media (min-width: 60rem) {
          .primary-btn {
            padding: 1.25rem 2rem;
            border-radius: 1rem;
            font-size: 1.0625rem;
            min-height: 3.75rem;
          }
        }
        
        .primary-btn:hover {
          transform: translateY(-0.125rem);
          box-shadow: 0 0.375rem 1rem rgba(25, 118, 210, 0.35);
        }
        
        .primary-btn:active {
          transform: translateY(0);
          box-shadow: 0 0.125rem 0.5rem rgba(25, 118, 210, 0.2);
        }
        
        .secondary-btn {
          width: 100%;
          background: linear-gradient(135deg, #dc004e, #b8003d);
          color: white;
          border: none;
          padding: 1rem 1.5rem;
          border-radius: 1rem;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 700;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          min-height: 3.25rem;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0.25rem 0.75rem rgba(220, 0, 78, 0.25);
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
        
        @media (min-width: 37.5rem) {
          .secondary-btn {
            padding: 1.125rem 1.75rem;
            border-radius: 0.875rem;
            font-size: 1rem;
            min-height: 3.5rem;
          }
        }
        
        @media (min-width: 60rem) {
          .secondary-btn {
            padding: 1.25rem 2rem;
            border-radius: 1rem;
            font-size: 1.0625rem;
            min-height: 3.75rem;
          }
        }
        
        .secondary-btn:hover {
          transform: translateY(-0.125rem);
          box-shadow: 0 0.375rem 1rem rgba(220, 0, 78, 0.35);
        }
        
        .secondary-btn:active {
          transform: translateY(0);
          box-shadow: 0 0.125rem 0.5rem rgba(220, 0, 78, 0.2);
        }
        .form-note {
          font-size: 0.875rem;
          color: #666;
          text-align: center;
          margin-top: 0.75rem;
          font-style: italic;
        }
        .index-header {
          background: linear-gradient(135deg, #1976d2, #42a5f5);
          color: white;
          padding: 1rem 1.25rem;
          box-shadow: 0 0.25rem 1rem rgba(25, 118, 210, 0.2);
          margin-bottom: 1.25rem;
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(0.625rem);
        }
        
        @media (min-width: 37.5rem) {
          .index-header {
            padding: 1.25rem 1.75rem;
            margin-bottom: 1.75rem;
          }
        }
        
        .index-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          max-width: 50rem;
          margin: 0 auto;
        }
        
        .index-title {
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0;
          flex: 1;
          min-width: 0;
          line-height: 1.3;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        @media (min-width: 37.5rem) {
          .index-title {
            font-size: 1.375rem;
            gap: 0.75rem;
          }
        }
        .user-info {
          font-size: 0.75rem;
          opacity: 0.95;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: rgba(255, 255, 255, 0.15);
          padding: 0.375rem 0.75rem;
          border-radius: 1.25rem;
          backdrop-filter: blur(0.625rem);
        }
        
        @media (max-width: 29.9375rem) {
          .user-info {
            display: none;
          }
        }
        
        @media (min-width: 37.5rem) {
          .user-info {
            font-size: 0.8125rem;
            padding: 0.5rem 1rem;
            gap: 0.375rem;
          }
        }
        
        .header-btn {
          background: rgba(255, 255, 255, 0.15);
          border: 0.125rem solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 1.25rem;
          cursor: pointer;
          font-size: 0.8125rem;
          font-weight: 600;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 0.375rem;
          min-height: 2.5rem;
          touch-action: manipulation;
          backdrop-filter: blur(0.625rem);
        }
        
        @media (min-width: 37.5rem) {
          .header-btn {
            padding: 0.625rem 1.25rem;
            font-size: 0.875rem;
            gap: 0.5rem;
            min-height: 2.75rem;
          }
        }
        
        .header-btn:hover {
          background: white;
          color: #1976d2;
          border-color: white;
          transform: translateY(-0.0625rem);
          box-shadow: 0 0.25rem 0.5rem rgba(0,0,0,0.1);
        }
        
        .header-btn:active {
          transform: translateY(0);
        }
        .content-wrapper {
          max-width: 62.5rem;
          margin: 0 auto;
          padding: 0 1rem 2.5rem 1rem;
        }
        
        @media (min-width: 37.5rem) {
          .content-wrapper {
            padding: 0 1.5rem 3rem 1.5rem;
          }
        }
        
        @media (min-width: 60rem) {
          .content-wrapper {
            padding: 0 2rem 3.5rem 2rem;
          }
        }
      `}</style>

      {/* ヘッダー */}
      <div className="index-header">
        <div className="index-nav">
          <div></div>
          <h1 className="index-title">🎫 チケット管理システム</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user && (
              <>
                <div className="user-info">
                  {user.displayName}さん
                </div>
                <button 
                  className="header-btn"
                  onClick={signOutUser}
                  style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
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
          padding: '2rem 1.5rem', 
          borderRadius: '1.5rem', 
          textAlign: 'center', 
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 0.5rem 2rem rgba(25, 118, 210, 0.25)'
        }}>
          <div style={{
            position: 'absolute',
            top: '-30%',
            right: '-15%',
            width: '12.5rem',
            height: '12.5rem',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-20%',
            left: '-10%',
            width: '9.375rem',
            height: '9.375rem',
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>
          <h2 style={{ 
            margin: '0 0 1rem 0', 
            fontSize: '1.5rem',
            fontWeight: 700,
            lineHeight: 1.2,
            position: 'relative',
            zIndex: 1
          }}>✨ 新形式チケットシステム</h2>
          <p style={{ 
            margin: 0, 
            opacity: 0.95,
            fontSize: '1rem',
            lineHeight: 1.5,
            fontWeight: 400,
            position: 'relative',
            zIndex: 1,
            maxWidth: '31.25rem',
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
                <p style={{ marginBottom: '1.5rem', color: '#757575', lineHeight: '1.6', fontSize: '0.875rem' }}>
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
                <p style={{ marginBottom: '1.5rem', color: '#757575', lineHeight: '1.6', fontSize: '0.875rem' }}>
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
                <p style={{ marginBottom: '1.5rem', color: '#757575', lineHeight: '1.6', fontSize: '0.875rem' }}>
                  チケットのQRコードをスキャンして入場確認を行います
                </p>
              </div>
              <div>
                <button 
                  className="primary-btn"
                  onClick={navigateToQRReader}
                  style={{ 
                    background: 'linear-gradient(135deg, #388e3c, #66bb6a)',
                    boxShadow: '0 0.25rem 0.75rem rgba(56, 142, 60, 0.25)',
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
          borderRadius: '1.25rem', 
          boxShadow: '0 0.125rem 0.75rem rgba(0,0,0,0.08)',
          margin: '2rem 0 0 0',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            padding: '1.25rem 1.5rem',
            borderBottom: '0.0625rem solid #e1e5e9'
          }}>
            <h3 style={{ 
              color: '#212121', 
              margin: 0,
              fontSize: '1.125rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>📋 システムの使い方</h3>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ 
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: '1fr',
            }}>
              <div style={{
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '0.75rem',
                borderLeft: '0.25rem solid #1976d2'
              }}>
                <strong style={{ color: '#1976d2' }}>1. イベント管理者:</strong>
                <span style={{ color: '#757575', marginLeft: '0.5rem' }}>新しいイベントを作成し、基本情報を設定</span>
              </div>
              <div style={{
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '0.75rem',
                borderLeft: '0.25rem solid #dc004e'
              }}>
                <strong style={{ color: '#dc004e' }}>2. チケット発行担当:</strong>
                <span style={{ color: '#757575', marginLeft: '0.5rem' }}>来場者にチケットを発行・QRコード生成</span>
              </div>
              <div style={{
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '0.75rem',
                borderLeft: '0.25rem solid #388e3c'
              }}>
                <strong style={{ color: '#388e3c' }}>3. QRコード読み取り:</strong>
                <span style={{ color: '#757575', marginLeft: '0.5rem' }}>来場者のチケットをスキャンして入場確認</span>
              </div>
              <div style={{
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '0.75rem',
                borderLeft: '0.25rem solid #ff9800'
              }}>
                <strong style={{ color: '#ff9800' }}>4. 入場時:</strong>
                <span style={{ color: '#757575', marginLeft: '0.5rem' }}>QRコードをスキャンして入場処理を完了</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
