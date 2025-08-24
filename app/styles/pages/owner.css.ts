import { style } from '@vanilla-extract/css';

export const dashboardContainer = style({
  background: '#f5f5f5',
  minHeight: '100vh',
  fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
});

export const dashboardHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  paddingBottom: '1rem',
  borderBottom: '0.125rem solid #e0e0e0',
});

export const dashboardTitle = style({
  fontSize: '2rem',
  fontWeight: 600,
  color: '#333',
  margin: 0,
});

export const refreshBtn = style({
  background: '#1976d2',
  color: 'white',
  border: 'none',
  padding: '0.625rem 1.25rem',
  borderRadius: '0.5rem',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 500,
  transition: 'background 0.2s',
  
  selectors: {
    '&:hover': {
      background: '#1565c0',
    },
    '&:disabled': {
      background: '#ccc',
      cursor: 'not-allowed',
    },
  },
});

export const statsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(12.5rem, 1fr))',
  gap: '1rem',
  marginBottom: '1.5rem',
  
  '@media': {
    '(min-width: 37.5rem)': {
      gridTemplateColumns: 'repeat(auto-fit, minmax(15.625rem, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
  },
});

export const statCard = style({
  background: 'white',
  padding: '1rem',
  borderRadius: '0.75rem',
  boxShadow: '0 0.125rem 0.5rem rgba(0,0,0,0.1)',
  textAlign: 'center',
  
  '@media': {
    '(min-width: 37.5rem)': {
      padding: '1.5rem',
    },
  },
});

export const statIcon = style({
  fontSize: '2.25rem',
  marginBottom: '0.5rem',
  
  '@media': {
    '(min-width: 37.5rem)': {
      fontSize: '3rem',
      marginBottom: '0.75rem',
    },
  },
});

export const statNumber = style({
  fontSize: '1.75rem',
  fontWeight: 700,
  margin: '0.375rem 0',
  color: '#333',
  
  '@media': {
    '(min-width: 600px)': {
      fontSize: '36px',
      margin: '8px 0',
    },
  },
});

export const statLabel = style({
  color: '#666',
  fontSize: '14px',
});

export const visitorsCard = style({
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 0.125rem 8px rgba(0,0,0,0.1)',
  overflow: 'hidden',
});

export const visitorsHeader = style({
  padding: '24px',
  borderBottom: '0.0625rem solid #e0e0e0',
});

export const visitorsTitle = style({
  fontSize: '20px',
  fontWeight: 600,
  margin: 0,
  color: '#333',
});

export const visitorsTable = style({
  width: '100%',
  borderCollapse: 'collapse',
  display: 'block',
  overflowX: 'auto',
  whiteSpace: 'nowrap',
  
  '@media': {
    '(min-width: 768px)': {
      display: 'table',
      whiteSpace: 'normal',
    },
  },
});

export const visitorsTableTh = style({
  background: '#fafafa',
  padding: '12px 8px',
  textAlign: 'left',
  fontWeight: 600,
  color: '#333',
  borderBottom: '0.0625rem solid #e0e0e0',
  fontSize: '13px',
  minWidth: '100px',
  
  '@media': {
    '(min-width: 768px)': {
      padding: '16px',
      fontSize: '14px',
      minWidth: 'auto',
    },
  },
});

export const visitorsTableTd = style({
  padding: '12px 8px',
  borderBottom: '0.0625rem solid #f0f0f0',
  fontSize: '13px',
  minWidth: '100px',
  
  '@media': {
    '(min-width: 768px)': {
      padding: '16px',
      fontSize: '14px',
      minWidth: 'auto',
    },
  },
});

export const visitorsTableTr = style({
  selectors: {
    '&:hover': {
      background: '#f8f9fa',
    },
  },
});

export const visitorsTableThead = style({
  display: 'block',
  
  '@media': {
    '(min-width: 768px)': {
      display: 'table-header-group',
    },
  },
});

export const visitorsTableTbody = style({
  display: 'block',
  
  '@media': {
    '(min-width: 768px)': {
      display: 'table-row-group',
    },
  },
});

export const visitorsTableTheadTr = style({
  display: 'table',
  tableLayout: 'fixed',
  width: '100%',
  
  '@media': {
    '(min-width: 768px)': {
      display: 'table-row',
      tableLayout: 'auto',
    },
  },
});

export const visitorsTableTbodyTr = style({
  display: 'table',
  tableLayout: 'fixed',
  width: '100%',
  
  '@media': {
    '(min-width: 768px)': {
      display: 'table-row',
      tableLayout: 'auto',
    },
  },
});

export const visitorName = style({
  fontWeight: 500,
  color: '#333',
});

export const ticketId = style({
  fontFamily: 'monospace',
  color: '#666',
  fontSize: '12px',
});

export const creatorId = style({
  fontFamily: 'monospace',
  color: '#888',
  fontSize: '11px',
});

export const createdDate = style({
  color: '#666',
  fontSize: '12px',
});

export const fabButton = style({
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #1976d2, #1565c0)',
  border: 'none',
  color: 'white',
  fontSize: '24px',
  cursor: 'pointer',
  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  zIndex: 1000,
  touchAction: 'manipulation',
  
  '@media': {
    '(min-width: 600px)': {
      bottom: '24px',
      right: '24px',
      width: '72px',
      height: '72px',
      fontSize: '28px',
    },
  },
  
  selectors: {
    '&:hover': {
      transform: 'translateY(-0.125rem) scale(1.05)',
      boxShadow: '0 8px 20px rgba(25, 118, 210, 0.4)',
    },
    '&:active': {
      transform: 'translateY(0) scale(1.02)',
    },
  },
});
