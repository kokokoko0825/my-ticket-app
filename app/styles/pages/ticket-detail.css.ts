import { style, keyframes } from '@vanilla-extract/css';

// スピンアニメーション
export const spinAnimation = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' }
});

// 共通のページコンテナスタイル
export const ticketPageContainer = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  minHeight: '100vh',
  padding: '1rem',
});

// 共通のカードスタイル
export const ticketCard = style({
  background: 'white',
  borderRadius: '1.25rem',
  padding: '1.5rem',
  textAlign: 'center',
  boxShadow: '0 16px 32px rgba(0,0,0,0.12)',
  maxWidth: '500px',
  width: '100%',
  margin: '0 12px',
  position: 'relative',
  overflow: 'hidden',
  
  '@media': {
    '(max-width: 37.5rem)': {
      padding: '1.25rem',
      margin: '0 0.75rem',
      maxWidth: '25rem',
    },
  },
});

// ローディング状態のカード
export const loadingCard = style({
  background: 'white',
  borderRadius: '1.25rem',
  padding: '1.25rem',
  textAlign: 'center',
  boxShadow: '0 1rem 2rem rgba(0,0,0,0.12)',
  maxWidth: '25rem',
  width: '100%',
  margin: '0 0.75rem',
  position: 'relative',
  overflow: 'hidden',
});

// アイコンエリア
export const ticketIcon = style({
  fontSize: '3rem',
  marginBottom: '1.25rem',
  
  selectors: {
    [`${loadingCard} &`]: {
      animation: `${spinAnimation} 2s linear infinite`,
    },
  },
});

// 成功状態のアイコン
export const successIcon = style({
  fontSize: '3rem',
  marginBottom: '1rem',
  color: '#4CAF50',
});

// エラー状態のアイコン
export const errorIcon = style({
  fontSize: '3rem',
  marginBottom: '1rem',
  color: '#f44336',
});

// タイトル
export const ticketTitle = style({
  marginBottom: '1rem',
  fontSize: '1.5rem',
  fontWeight: '600',
  
  selectors: {
    [`${loadingCard} &`]: {
      color: '#333',
      marginBottom: '0.625rem',
    },
  },
});

// 成功状態のタイトル
export const successTitle = style({
  color: '#4CAF50',
  marginBottom: '1rem',
  fontSize: '1.5rem',
  fontWeight: '600',
});

// エラー状態のタイトル
export const errorTitle = style({
  color: '#f44336',
  marginBottom: '1rem',
  fontSize: '1.5rem',
  fontWeight: '600',
});

// 説明文
export const ticketDescription = style({
  color: '#666',
  margin: 0,
  lineHeight: '1.6',
  
  selectors: {
    [`${loadingCard} &`]: {
      margin: 0,
    },
  },
});

// 成功状態の説明文
export const successDescription = style({
  color: '#666',
  marginBottom: '1.25rem',
  lineHeight: '1.6',
  fontSize: '0.875rem',
});

// チケット情報カード
export const ticketInfoCard = style({
  background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
  borderRadius: '1rem',
  padding: '1.25rem',
  marginBottom: '1.25rem',
  position: 'relative',
  border: '2px solid #e1e5e9',
});

// ステータスバッジ
export const statusBadge = style({
  position: 'absolute',
  top: '8px',
  right: '8px',
  background: '#4CAF50',
  color: 'white',
  borderRadius: '1.25rem',
  padding: '0.25rem 0.75rem',
  fontSize: '0.75rem',
  fontWeight: '600',
});

// チケット名
export const ticketName = style({
  color: '#212121',
  marginBottom: '0.75rem',
  fontSize: '1.25rem',
  fontWeight: '700',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
});

// チケット詳細情報
export const ticketDetails = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  textAlign: 'left',
});

// 詳細項目
export const detailItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 0.75rem',
  background: 'rgba(255,255,255,0.7)',
  borderRadius: '0.75rem',
});

// バンド名
export const bandName = style({
  fontSize: '0.875rem',
  fontWeight: '600',
  color: '#1976d2',
});

// イベント名
export const eventName = style({
  fontSize: '0.875rem',
  fontWeight: '600',
  color: '#757575',
});

// エラーメッセージ
export const errorMessage = style({
  background: '#ffebee',
  borderRadius: '0.75rem',
  padding: '1.25rem',
  marginBottom: '1.25rem',
});

export const errorText = style({
  color: '#c62828',
  margin: 0,
  fontWeight: '500',
});

// Firestore情報
export const firestoreInfo = style({
  background: '#f8f9fa',
  borderRadius: '0.75rem',
  padding: '1.25rem',
  marginBottom: '1.25rem',
  textAlign: 'left',
});

export const firestoreTitle = style({
  color: '#333',
  marginBottom: '0.625rem',
  fontSize: '1rem',
  fontWeight: '600',
});

export const firestoreItem = style({
  color: '#666',
  margin: '0.3125rem 0',
  fontSize: '0.875rem',
});

// 推奨対策
export const recommendations = style({
  background: '#fff3e0',
  borderRadius: '0.75rem',
  padding: '1.25rem',
  marginBottom: '1.875rem',
  textAlign: 'left',
});

export const recommendationsTitle = style({
  color: '#ef6c00',
  marginBottom: '0.625rem',
  fontSize: '1rem',
  fontWeight: '600',
});

export const recommendationsList = style({
  color: '#bf360c',
  margin: 0,
  paddingLeft: '1.25rem',
  fontSize: '0.875rem',
});

export const recommendationsItem = style({
  marginBottom: '0.5rem',
  
  ':last-child': {
    marginBottom: 0,
  },
});

// ボタン
export const homeButton = style({
  borderRadius: '1.875rem',
  minHeight: '3.5rem',
  boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)',
  background: 'linear-gradient(135deg, #4CAF50, #2e7d32)',
  border: 'none',
  color: 'white',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
  },
  
  ':active': {
    transform: 'translateY(0)',
  },
});

export const errorHomeButton = style({
  borderRadius: '1.875rem',
  minHeight: '3.5rem',
  boxShadow: '0 4px 16px rgba(117, 117, 117, 0.3)',
  background: 'linear-gradient(135deg, #757575, #616161)',
  border: 'none',
  color: 'white',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(117, 117, 117, 0.4)',
  },
  
  ':active': {
    transform: 'translateY(0)',
  },
});
