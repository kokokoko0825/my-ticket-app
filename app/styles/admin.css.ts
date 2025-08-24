import { style } from '@vanilla-extract/css';

export const ticketsHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginBottom: '20px',
  
  '@media': {
    '(min-width: 600px)': {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '16px',
    },
  },
});

export const ticketList = style({
  listStyle: 'none',
  padding: 0,
  margin: 0,
});

export const ticketItem = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '16px 0',
  borderBottom: '1px solid #f0f0f0',
  
  selectors: {
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  
  '@media': {
    '(min-width: 600px)': {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '16px',
    },
  },
});

export const ticketInfo = style({
  flex: 1,
});

export const ticketName = style({
  fontSize: '16px',
  fontWeight: 700,
  color: '#1976d2',
  margin: '0 0 6px 0',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textDecoration: 'none',
  borderBottom: '2px solid transparent',
  display: 'inline-block',
  paddingBottom: '2px',
  
  selectors: {
    '&:hover': {
      color: '#1565c0',
      borderBottomColor: '#1565c0',
    },
  },
});

export const ticketDetails = style({
  fontSize: '13px',
  color: '#757575',
  margin: 0,
  lineHeight: 1.4,
  
  '@media': {
    '(max-width: 480px)': {
      fontSize: '12px',
    },
  },
});

export const emptyState = style({
  textAlign: 'center',
  padding: '40px 20px',
  color: '#666',
  fontSize: '16px',
  
  '@media': {
    '(max-width: 480px)': {
      padding: '20px 16px',
      fontSize: '14px',
    },
  },
});

export const loadingState = style({
  textAlign: 'center',
  padding: '20px',
  color: '#666',
  fontSize: '16px',
  
  '@media': {
    '(max-width: 480px)': {
      padding: '16px',
      fontSize: '14px',
    },
  },
});

// イベント情報セクションのレスポンシブスタイル
export const eventInfoGrid = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '16px',
  
  '@media': {
    '(min-width: 480px)': {
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    },
    '(min-width: 768px)': {
      gap: '20px',
    },
  },
});

// チケット作成フォームのレスポンシブスタイル
export const ticketForm = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  
  '@media': {
    '(min-width: 480px)': {
      gap: '20px',
    },
  },
});

// ボタングループのレスポンシブスタイル
export const buttonGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  
  '@media': {
    '(min-width: 600px)': {
      flexDirection: 'row',
      gap: '12px',
    },
  },
});

// セクションタイトルのレスポンシブスタイル
export const sectionTitle = style({
  fontSize: '18px',
  fontWeight: 600,
  margin: 0,
  
  '@media': {
    '(min-width: 480px)': {
      fontSize: '20px',
    },
    '(min-width: 768px)': {
      fontSize: '22px',
    },
  },
});

// カードのレスポンシブスタイル
export const responsiveCard = style({
  marginBottom: '24px',
  
  '@media': {
    '(max-width: 480px)': {
      marginBottom: '16px',
    },
  },
});

// モーダル内のチケット表示エリアのレスポンシブスタイル
export const modalContent = style({
  textAlign: 'center',
  marginBottom: '20px',
  
  '@media': {
    '(max-width: 480px)': {
      marginBottom: '16px',
    },
  },
});

// チケットステータス表示エリアのレスポンシブスタイル
export const ticketStatusDisplay = style({
  textAlign: 'center',
  marginTop: '20px',
  padding: '16px',
  borderRadius: '8px',
  border: '2px solid',
  
  '@media': {
    '(max-width: 480px)': {
      marginTop: '16px',
      padding: '12px',
    },
  },
});

// イベント情報のレスポンシブテキスト
export const eventInfoText = style({
  fontSize: '14px',
  lineHeight: 1.5,
  
  '@media': {
    '(min-width: 480px)': {
      fontSize: '15px',
    },
    '(min-width: 768px)': {
      fontSize: '16px',
    },
  },
});

// エラーメッセージエリアのレスポンシブスタイル
export const errorMessage = style({
  textAlign: 'center',
  padding: '20px',
  color: '#666',
  
  '@media': {
    '(max-width: 480px)': {
      padding: '16px',
    },
  },
});

// ナビゲーションボタンのレスポンシブスタイル
export const navigationButton = style({
  background: '#666',
  marginTop: '12px',
  
  '@media': {
    '(max-width: 480px)': {
      marginTop: '8px',
      width: '100%',
    },
  },
});
