import { style } from '@vanilla-extract/css';

// グローバル共通スタイル
export const mainTitle = style({
  fontSize: '20px',
  fontWeight: 600,
  color: '#212121',
  textAlign: 'center',
  margin: '0 0 20px 0',
  lineHeight: 1.3,
  
  '@media': {
    '(min-width: 600px)': {
      fontSize: '28px',
      margin: '0 0 32px 0',
    },
  },
});

export const formNote = style({
  fontSize: '14px',
  color: '#666',
  textAlign: 'center',
  marginTop: '12px',
  fontStyle: 'italic',
  
  '@media': {
    '(max-width: 599px)': {
      fontSize: '13px',
      marginTop: '8px',
    },
  },
});
