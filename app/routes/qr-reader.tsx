import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { Html5QrcodeScanner } from "html5-qrcode";
// import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
// import { db } from "../root";

export const meta: MetaFunction = () => {
  return [
    { charSet: "utf-8"},
    { title: "QRコード読み取り - チケット管理システム" },
    { name: "description", content: "QRコードをスキャンしてチケット情報を確認" },
  ];
};

interface RedirectResult {
  success: boolean;
  message: string;
}

export default function QRReader() {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [redirectResult, setRedirectResult] = useState<RedirectResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // QRスキャナーを開始する関数
  const startScanner = async () => {
    // DOM要素の存在確認
    const container = document.getElementById("qr-reader-container");
    if (!container) {
      console.error("QR reader container not found");
      setError("スキャナーコンテナが見つかりません。ページを再読み込みしてください。");
      return;
    }

    try {
      setError(null);
      setIsScanning(true);

      const qrScanner = new Html5QrcodeScanner(
        "qr-reader-container",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          rememberLastUsedCamera: true,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        },
        /* verbose= */ false
      );

      // 成功コールバック
      const qrCodeSuccessCallback = (decodedText: string) => {
        console.log(`QR Code detected: ${decodedText}`);
        handleScanResult(decodedText);
        // スキャン成功後にスキャナーをクリア
        qrScanner.clear().catch(console.error);
      };

      // エラーコールバック（必要に応じて処理）
      const qrCodeErrorCallback = (errorMessage: string) => {
        // 通常のスキャンエラーは無視（カメラが何も検出しない場合など）
        if (!errorMessage.includes("QR code parse error")) {
          console.warn("QR scan error:", errorMessage);
        }
      };

      // スキャナーをレンダリング
      await qrScanner.render(qrCodeSuccessCallback, qrCodeErrorCallback);
      setScanner(qrScanner);

    } catch (err) {
      console.error("QR Scanner initialization error:", err);
      let errorMsg = "QRスキャナーの初期化に失敗しました。";
      
      if (err instanceof Error) {
        if (err.message.includes("Permission")) {
          errorMsg = "カメラの使用許可が必要です。ブラウザの設定でカメラを許可してください。";
        } else if (err.message.includes("NotFound")) {
          errorMsg = "カメラが見つかりません。デバイスにカメラが接続されているか確認してください。";
        } else if (err.message.includes("NotSupported")) {
          errorMsg = "このブラウザではQRスキャン機能がサポートされていません。";
        }
      }
      
      setError(errorMsg);
      setIsScanning(false);
    }
  };

  // スキャナーを停止する関数
  const stopScanner = () => {
    if (scanner) {
      scanner.clear().catch((err) => console.error("Error clearing scanner:", err));
      setScanner(null);
    }
    setIsScanning(false);
  };



  // QRコードからチケットページのパスを抽出して遷移する
  const redirectToTicketPage = (ticketUrl: string): boolean => {
    try {
      const url = new URL(ticketUrl);
      const pathname = url.pathname;
      
      // URLパスからパラメータを抽出
      const pathParts = pathname.split('/').filter(Boolean);
      
      if (pathParts[0] !== 'ticket') {
        console.log("❌ チケットURL以外のQRコードです");
        return false;
      }

      console.log(`🔍 チケットURL検出: ${pathname}`);

      // パスをそのまま使ってリダイレクト
      navigate(pathname);
      return true;

    } catch (error) {
      console.error("URL解析エラー:", error);
      return false;
    }
  };

  // スキャン結果を処理する関数
  const handleScanResult = (data: string) => {
    setIsScanning(false);
    setProcessing(true);
    stopScanner();

    console.log("📱 QRコード読み取り完了:", data);

    try {
      // チケットURLの場合はリダイレクト
      if (data.startsWith('http') && data.includes('/ticket/')) {
        const success = redirectToTicketPage(data);
        
        if (success) {
          console.log("✅ チケットページに遷移中...");
          // リダイレクトが成功した場合、処理完了メッセージを表示して即座に遷移
          setRedirectResult({ 
            success: true, 
            message: "チケットページに移動します..." 
          });
          return; // 即座に遷移するため、以降の処理は不要
        } else {
          // リダイレクトに失敗した場合
          setRedirectResult({ 
            success: false, 
            message: "無効なチケットQRコードです。正しいチケットをスキャンしてください。" 
          });
        }
      } else {
        // チケットURL以外の場合
        setRedirectResult({ 
          success: false, 
          message: "これはチケットのQRコードではありません。正しいチケットをスキャンしてください。" 
        });
      }

      // エラーの場合は3秒後にホームページに遷移
      setCountdown(3);
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            navigate('/');
            return null;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      console.error("QRコード処理エラー:", error);
      setRedirectResult({ 
        success: false, 
        message: "QRコードの処理中にエラーが発生しました。" 
      });
      
      // エラーの場合は3秒後にホームページに遷移
      setCountdown(3);
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            navigate('/');
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // ページ読み込み時に自動でスキャナーを開始
  useEffect(() => {
    let isMounted = true;
    
    // DOMの準備とコンポーネントマウントを待つ
    const timer = setTimeout(async () => {
      if (isMounted) {
        await startScanner();
      }
    }, 500); // 少し長めの遅延でDOMの準備を確実に待つ
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scanner) {
        scanner.clear().catch((err) => console.error("Error clearing scanner:", err));
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear().catch((err) => console.error("Error clearing scanner:", err));
      }
    };
  }, [scanner]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif"
    }}>
      <style>{`
        .qr-header {
          background: linear-gradient(135deg, #388e3c, #2e7d32);
          color: white;
          padding: 12px 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 16px;
        }
        @media (min-width: 600px) {
          .qr-header {
            padding: 16px 24px;
            margin-bottom: 24px;
          }
        }
        .qr-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }
        .qr-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          flex: 1;
          min-width: 0;
        }
        @media (min-width: 600px) {
          .qr-title {
            font-size: 24px;
          }
        }
        .back-btn {
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
          touch-action: manipulation;
        }
        @media (min-width: 600px) {
          .back-btn {
            padding: 8px 16px;
            font-size: 14px;
            gap: 8px;
          }
        }
        .back-btn:hover {
          background: white;
          color: #388e3c;
        }
        .camera-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 0 16px;
        }
        @media (min-width: 600px) {
          .camera-container {
            padding: 0 24px;
          }
        }
        .camera-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          overflow: hidden;
          margin-bottom: 16px;
        }
        @media (min-width: 600px) {
          .camera-card {
            margin-bottom: 24px;
          }
        }
        #qr-reader-container {
          min-height: 280px;
          width: 100%;
          background: #f8f9fa;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }
        
        @media (min-width: 600px) {
          #qr-reader-container {
            min-height: 400px;
            border-radius: 16px;
          }
        }
        
        #qr-reader-container video {
          width: 100% !important;
          height: auto !important;
          max-width: 100% !important;
          border-radius: inherit;
          object-fit: cover;
        }
        
        #qr-reader-container canvas {
          border-radius: inherit;
        }
        
        /* QRスキャナーの枠線スタイル改善 */
        #qr-reader-container > div {
          border-radius: inherit !important;
        }
        
        /* html5-qrcode のボタンスタイル改善 */
        #qr-reader-container button {
          background: linear-gradient(135deg, #1976d2, #1565c0) !important;
          border: none !important;
          border-radius: 12px !important;
          color: white !important;
          font-weight: 600 !important;
          padding: 12px 20px !important;
          margin: 8px 4px !important;
          transition: all 0.2s ease !important;
          min-height: 44px !important;
        }
        
        #qr-reader-container button:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3) !important;
        }
        .camera-controls {
          padding: 16px;
          text-align: center;
        }
        @media (min-width: 600px) {
          .camera-controls {
            padding: 24px;
          }
        }
        .control-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          margin: 4px;
          transition: all 0.2s;
          min-height: 48px;
          touch-action: manipulation;
        }
        @media (min-width: 600px) {
          .control-btn {
            padding: 16px 32px;
            margin: 0 8px;
          }
        }
        .stop-btn {
          background: #d32f2f;
          color: white;
        }
        .stop-btn:hover {
          background: #c62828;
        }
        .error-card {
          background: #ffebee;
          border: 1px solid #ef5350;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          color: #c62828;
        }
        .info-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          padding: 16px;
          margin-bottom: 16px;
        }
        @media (min-width: 600px) {
          .info-card {
            padding: 24px;
            margin-bottom: 24px;
          }
        }
        .result-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
          margin-bottom: 16px;
          overflow: hidden;
          border-left: 6px solid #2e7d32;
        }
        @media (min-width: 600px) {
          .result-card {
            margin-bottom: 24px;
          }
        }
        .result-card.error {
          border-left-color: #d32f2f;
        }
        .result-header {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          padding: 16px;
          border-bottom: 1px solid #e0e0e0;
        }
        @media (min-width: 600px) {
          .result-header {
            padding: 24px;
          }
        }
        .result-content {
          padding: 16px;
        }
        @media (min-width: 600px) {
          .result-content {
            padding: 24px;
          }
        }
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }
        @media (min-width: 600px) {
          .overlay {
            padding: 24px;
          }
        }
        .overlay-content {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .overlay-header {
          padding: 16px 16px 12px 16px;
          border-bottom: 1px solid #e0e0e0;
          position: relative;
        }
        @media (min-width: 600px) {
          .overlay-header {
            padding: 24px 24px 16px 24px;
          }
        }
        .overlay-body {
          padding: 16px;
        }
        @media (min-width: 600px) {
          .overlay-body {
            padding: 24px;
          }
        }
        .scanning-indicator {
          text-align: center;
          padding: 16px 20px;
          background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
          border-radius: 16px;
          margin-bottom: 16px;
          color: #1b5e20;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(76, 175, 80, 0.15);
          position: relative;
          overflow: hidden;
        }
        
        .scanning-indicator::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: scanning-animation 2s infinite;
        }
        
        @keyframes scanning-animation {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @media (min-width: 600px) {
          .scanning-indicator {
            border-radius: 12px;
            padding: 18px 24px;
          }
        }
      `}</style>

      {/* ヘッダー */}
      <div className="qr-header">
        <div className="qr-nav">
          <button 
            className="back-btn"
            onClick={() => navigate('/')}
          >
            ← 戻る
          </button>
          <h1 className="qr-title">🎫 QRコードリーダー</h1>
          <div></div>
        </div>
      </div>

      <div className="camera-container">
        {/* エラー表示 */}
        {error && (
          <div className="error-card">
            <div style={{ marginBottom: '16px' }}>
              ⚠️ {error}
            </div>
            <button 
              className="control-btn"
              onClick={() => {
                setError(null);
                startScanner();
              }}
              style={{ 
                background: '#1976d2',
                color: 'white',
                padding: '12px 24px',
                fontSize: '14px'
              }}
            >
              🔄 再試行
            </button>
          </div>
        )}

        {/* スキャン中インジケーター */}
        {isScanning && !error && !processing && !redirectResult && (
          <div className="scanning-indicator">
            📸 チケットをスキャン中... QRコードをカメラに向けてください
          </div>
        )}

        {/* 初期化中インジケーター */}
        {!isScanning && !error && !processing && !redirectResult && (
          <div className="scanning-indicator">
            🔄 QRコードリーダーを初期化中...
          </div>
        )}

        {/* 処理中インジケーター */}
        {processing && (
          <div className="scanning-indicator" style={{ background: '#fff3cd', color: '#856404' }}>
            ⏳ QRコードを処理中... しばらくお待ちください
          </div>
        )}

        {/* QRスキャナー */}
        <div className="camera-card">
          {!isScanning && !error && (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
              color: '#0d47a1',
              borderRadius: '12px',
              margin: '0 0 16px 0'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📱</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                QRコードスキャン準備中
              </h3>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
                カメラの使用許可を確認してください
              </p>
            </div>
          )}
          
          <div 
            id="qr-reader-container"
            ref={scannerRef}
            style={{ width: '100%' }}
          />
          
          {isScanning && (
            <>
              <div style={{
                padding: '16px 20px',
                background: '#f8f9fa',
                borderTop: '1px solid #e1e5e9',
                textAlign: 'center'
              }}>
                <p style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '14px', 
                  color: '#1976d2',
                  fontWeight: '600'
                }}>
                  📸 QRコードをカメラの中央に合わせてください
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '12px', 
                  color: '#757575' 
                }}>
                  チケットのQRコードが自動的に認識されます
                </p>
              </div>
              
              <div className="camera-controls">
                <button 
                  className="control-btn stop-btn"
                  onClick={stopScanner}
                >
                  ⏹️ スキャン停止
                </button>
              </div>
            </>
          )}
        </div>

        {/* リダイレクト結果オーバーレイ */}
        {redirectResult && (
          <div className="overlay">
            <div className="overlay-content">
              <div className="overlay-header">
                {redirectResult.success ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      fontSize: '48px',
                      background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
                      borderRadius: '50%',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      ✅
                    </div>
                    <div>
                      <h2 style={{ 
                        margin: 0, 
                        color: '#2e7d32', 
                        fontSize: '28px',
                        fontWeight: 'bold'
                      }}>
                        リダイレクト成功
                      </h2>
                      <p style={{ margin: '4px 0 0 0', fontSize: '16px', opacity: 0.8, color: '#4caf50' }}>
                        チケットページに移動中...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      fontSize: '48px',
                      background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                      borderRadius: '50%',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      ❌
                    </div>
                    <div>
                      <h2 style={{ 
                        margin: 0, 
                        color: '#d32f2f',
                        fontSize: '28px',
                        fontWeight: 'bold'
                      }}>
                        QRコード読み取りエラー
                      </h2>
                      <p style={{ 
                        margin: '4px 0 0 0', 
                        fontSize: '16px', 
                        opacity: 0.8,
                        color: '#f44336'
                      }}>
                        Invalid QR Code
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="overlay-body">
                <div style={{ 
                  fontSize: '18px', 
                  margin: '0 0 24px 0', 
                  lineHeight: '1.6',
                  textAlign: 'center',
                  color: '#333'
                }}>
                  {redirectResult.message}
                </div>
                
                {!redirectResult.success && (
                  <div style={{ 
                    textAlign: 'center',
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '2px dashed #dee2e6'
                  }}>
                    <div style={{ fontSize: '16px', marginBottom: '16px', color: '#666' }}>
                      ホームページに戻ります
                    </div>
                    <div style={{ 
                      fontSize: '32px', 
                      fontWeight: 'bold', 
                      color: '#d32f2f',
                      background: '#ffebee',
                      borderRadius: '50%',
                      width: '70px',
                      height: '70px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: '3px solid #f44336'
                    }}>
                      {countdown}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 使用方法（結果表示中は非表示） */}
        {!redirectResult && !processing && (
          <div className="info-card">
            <h3 style={{ color: '#333', marginBottom: '16px' }}>🎫 QRコードリーダー</h3>
            <div style={{ color: '#666', lineHeight: '1.8' }}>
              <p><strong>1.</strong> カメラが自動的に起動します</p>
              <p><strong>2.</strong> チケットのQRコードをカメラに向ける</p>
              <p><strong>3.</strong> 自動的にチケットページに遷移します</p>
              <p><strong>4.</strong> チケット詳細ページで入場処理が行われます</p>
              <p style={{ color: '#2e7d32', fontWeight: 'bold', marginTop: '12px' }}>
                ✅ チケットページで入場状況が確認できます
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

