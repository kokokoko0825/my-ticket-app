import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { Html5QrcodeScanner } from "html5-qrcode";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../root";

export const meta: MetaFunction = () => {
  return [
    { charSet: "utf-8"},
    { title: "QRコード読み取り - チケット管理システム" },
    { name: "description", content: "QRコードをスキャンしてチケット情報を確認" },
  ];
};

interface TicketData {
  uuid: string;
  name: string;
  bandName: string;
  createdBy: string;
  status: "未" | "済";
  state?: "未" | "済"; // 既存データとの互換性
  createdAt: unknown;
}

interface EntranceResult {
  success: boolean;
  ticketData?: TicketData;
  message: string;
  alreadyUsed?: boolean;
}

export default function QRReader() {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [entranceResult, setEntranceResult] = useState<EntranceResult | null>(null);
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



  // チケット入場処理を実行
  const processTicketEntrance = async (ticketUrl: string): Promise<EntranceResult> => {
    try {
      const url = new URL(ticketUrl);
      const pathname = url.pathname;
      
      // URLパスからパラメータを抽出
      const pathParts = pathname.split('/').filter(Boolean);
      
      if (pathParts[0] !== 'ticket') {
        return { success: false, message: "無効なチケットQRコードです。" };
      }

      let ticketDocRef;
      let searchDescription = "";

      if (pathParts.length === 4) {
        // 新形式: /ticket/eventCollectionName/eventUuid/ticketUuid
        const [, eventCollectionName, eventUuid, ticketUuid] = pathParts;
        ticketDocRef = doc(db, eventCollectionName, eventUuid, "tickets", ticketUuid);
        searchDescription = `新形式 (${eventCollectionName}/${eventUuid}/${ticketUuid})`;
      } else if (pathParts.length === 2) {
        // 旧形式: /ticket/uuid
        const [, ticketUuid] = pathParts;
        ticketDocRef = doc(db, "tickets", ticketUuid);
        searchDescription = `旧形式 (${ticketUuid})`;
      } else {
        return { success: false, message: "無効なチケットURL形式です。" };
      }

      console.log(`🔍 チケット検索開始: ${searchDescription}`);

      // チケットデータを取得
      const ticketSnapshot = await getDoc(ticketDocRef);
      
      if (!ticketSnapshot.exists()) {
        console.log("❌ チケットが見つかりません");
        return { success: false, message: "チケットが見つかりません。QRコードが正しいか確認してください。" };
      }

      const ticketData = ticketSnapshot.data() as TicketData;
      console.log("✅ チケット発見:", ticketData);

      // チケットの使用状況をチェック
      const currentStatus = ticketData.status || ticketData.state || "未";
      
      if (currentStatus === "済") {
        console.log("⚠️ チケットは既に使用済み");
        return { 
          success: false, 
          message: "このチケットは既に使用済みです。", 
          ticketData,
          alreadyUsed: true 
        };
      }

      // チケットのステータスを「済」に更新
      console.log("🎫 チケット状態を更新中...");
      await setDoc(ticketDocRef, {
        status: "済",
        state: null, // 旧フィールドを削除
        processedAt: Timestamp.now() // 処理時刻を記録
      }, { merge: true });

      console.log("✅ 入場処理完了");
      return { 
        success: true, 
        message: `${ticketData.name}さん、入場処理が完了しました！`, 
        ticketData 
      };

    } catch (error) {
      console.error("入場処理エラー:", error);
      return { success: false, message: "入場処理中にエラーが発生しました。再度お試しください。" };
    }
  };

  // スキャン結果を処理する関数
  const handleScanResult = async (data: string) => {
    setIsScanning(false);
    setProcessing(true);
    stopScanner();

    console.log("📱 QRコード読み取り完了:", data);

    try {
      // チケットURLの場合のみ処理
      if (data.startsWith('http') && data.includes('/ticket/')) {
        const result = await processTicketEntrance(data);
        setEntranceResult(result);
        
        if (result.success) {
          // 成功時は5秒後にホームページに遷移（カウントダウン付き）
          setCountdown(5);
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
        } else {
          // 失敗時も5秒後にホームページに遷移（カウントダウン付き）
          setCountdown(5);
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
      } else {
        // チケットURL以外の場合
        setEntranceResult({ 
          success: false, 
          message: "これはチケットのQRコードではありません。正しいチケットをスキャンしてください。" 
        });
        setCountdown(5);
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
    } catch (error) {
      console.error("QRコード処理エラー:", error);
      setEntranceResult({ 
        success: false, 
        message: "QRコードの処理中にエラーが発生しました。" 
      });
      setCountdown(5);
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
          padding: 16px 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 24px;
        }
        .qr-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .qr-title {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
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
          color: #388e3c;
        }
        .camera-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .camera-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          overflow: hidden;
          margin-bottom: 24px;
        }
        #qr-reader-container {
          min-height: 400px;
          width: 100%;
        }
        #qr-reader-container video {
          width: 100% !important;
          height: auto !important;
        }
        .camera-controls {
          padding: 24px;
          text-align: center;
        }
        .control-btn {
          padding: 16px 32px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          margin: 0 8px;
          transition: all 0.2s;
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
          padding: 24px;
          margin-bottom: 24px;
        }
        .result-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
          margin-bottom: 24px;
          overflow: hidden;
          border-left: 6px solid #2e7d32;
        }
        .result-card.error {
          border-left-color: #d32f2f;
        }
        .result-header {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          padding: 24px;
          border-bottom: 1px solid #e0e0e0;
        }
        .result-content {
          padding: 24px;
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
          padding: 24px;
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
          padding: 24px 24px 16px 24px;
          border-bottom: 1px solid #e0e0e0;
          position: relative;
        }
        .overlay-body {
          padding: 24px;
        }
        .scanning-indicator {
          text-align: center;
          padding: 16px;
          background: #e8f5e8;
          border-radius: 8px;
          margin-bottom: 16px;
          color: #2e7d32;
          font-weight: 500;
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
          <h1 className="qr-title">🎫 チケット入場処理</h1>
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
        {isScanning && !error && !processing && !entranceResult && (
          <div className="scanning-indicator">
            📸 チケットをスキャン中... QRコードをカメラに向けてください
          </div>
        )}

        {/* 初期化中インジケーター */}
        {!isScanning && !error && !processing && !entranceResult && (
          <div className="scanning-indicator">
            🔄 入場処理システムを初期化中...
          </div>
        )}

        {/* 処理中インジケーター */}
        {processing && (
          <div className="scanning-indicator" style={{ background: '#fff3cd', color: '#856404' }}>
            ⏳ チケットを処理中... しばらくお待ちください
          </div>
        )}

        {/* QRスキャナー */}
        <div className="camera-card">
          <div 
            id="qr-reader-container"
            ref={scannerRef}
            style={{ width: '100%' }}
          />
          {isScanning && (
            <div className="camera-controls">
              <button 
                className="control-btn stop-btn"
                onClick={stopScanner}
              >
                ⏹️ スキャン停止
              </button>
            </div>
          )}
        </div>

        {/* 入場処理結果オーバーレイ */}
        {entranceResult && (
          <div className="overlay">
            <div className="overlay-content">
              <div className="overlay-header">
                {entranceResult.success ? (
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
                        入場処理完了
                      </h2>
                      <p style={{ margin: '4px 0 0 0', fontSize: '16px', opacity: 0.8, color: '#4caf50' }}>
                        Welcome! ご入場ください
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      fontSize: '48px',
                      background: entranceResult.alreadyUsed 
                        ? 'linear-gradient(135deg, #ff9800, #f57c00)'
                        : 'linear-gradient(135deg, #f44336, #d32f2f)',
                      borderRadius: '50%',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {entranceResult.alreadyUsed ? '⚠️' : '❌'}
                    </div>
                    <div>
                      <h2 style={{ 
                        margin: 0, 
                        color: entranceResult.alreadyUsed ? '#f57c00' : '#d32f2f',
                        fontSize: '28px',
                        fontWeight: 'bold'
                      }}>
                        {entranceResult.alreadyUsed ? '使用済みチケット' : '入場処理失敗'}
                      </h2>
                      <p style={{ 
                        margin: '4px 0 0 0', 
                        fontSize: '16px', 
                        opacity: 0.8,
                        color: entranceResult.alreadyUsed ? '#ff9800' : '#f44336'
                      }}>
                        {entranceResult.alreadyUsed ? 'Already Used' : 'Entry Denied'}
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
                  {entranceResult.message}
                </div>
                
                {entranceResult.ticketData && (
                  <div style={{ 
                    background: entranceResult.success 
                      ? 'linear-gradient(135deg, #e8f5e8, #c8e6c9)'
                      : 'linear-gradient(135deg, #ffebee, #ffcdd2)',
                    padding: '20px', 
                    borderRadius: '12px',
                    marginBottom: '24px',
                    border: entranceResult.success 
                      ? '2px solid #4caf50'
                      : '2px solid #f44336'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ 
                          fontWeight: 'bold', 
                          fontSize: '22px', 
                          marginBottom: '8px',
                          color: '#333'
                        }}>
                          👤 {entranceResult.ticketData.name}
                        </div>
                        <div style={{ 
                          color: '#666', 
                          fontSize: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          🎵 {entranceResult.ticketData.bandName}
                        </div>
                      </div>
                      <div style={{ 
                        background: entranceResult.success ? '#2e7d32' : '#d32f2f',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: '25px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                      }}>
                        {entranceResult.success ? '✓ 入場済み' : '✗ 未処理'}
                      </div>
                    </div>
                  </div>
                )}
                
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
                    color: entranceResult.success ? '#2e7d32' : '#d32f2f',
                    background: entranceResult.success ? '#e8f5e8' : '#ffebee',
                    borderRadius: '50%',
                    width: '70px',
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: `3px solid ${entranceResult.success ? '#4caf50' : '#f44336'}`
                  }}>
                    {countdown}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 使用方法（結果表示中は非表示） */}
        {!entranceResult && !processing && (
          <div className="info-card">
            <h3 style={{ color: '#333', marginBottom: '16px' }}>🎫 入場処理システム</h3>
            <div style={{ color: '#666', lineHeight: '1.8' }}>
              <p><strong>1.</strong> カメラが自動的に起動します</p>
              <p><strong>2.</strong> チケットのQRコードをカメラに向ける</p>
              <p><strong>3.</strong> 自動的に入場処理が実行されます</p>
              <p><strong>4.</strong> 処理完了後、次のチケットをスキャンできます</p>
              <p style={{ color: '#f57c00', fontWeight: 'bold', marginTop: '12px' }}>
                ⚠️ 使用済みチケットは再度入場できません
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
