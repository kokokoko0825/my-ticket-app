import { style } from '@vanilla-extract/css';

export const modalOverlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
});

export const modalContent = style({
  background: 'white',
  padding: '20px',
  borderRadius: '16px',
  maxWidth: '400px',
  width: '90%',
  boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
  maxHeight: '90vh',
  overflowY: 'auto',
  
  '@media': {
    '(min-width: 600px)': {
      padding: '24px',
      borderRadius: '20px',
    },
  },
});

export const modalTitle = style({
  fontSize: '20px',
  fontWeight: 600,
  margin: '0 0 16px 0',
  color: '#333',
});

export const formInput = style({
  width: '100%',
  padding: '16px 20px',
  border: '0.125rem solid #e1e5e9',
  borderRadius: '16px',
  fontSize: '16px',
  background: '#fafbfc',
  transition: 'all 0.2s ease',
  marginBottom: '12px',
  boxSizing: 'border-box',
  WebkitAppearance: 'none',
  appearance: 'none',
  lineHeight: 1.5,
  
  selectors: {
    '&:focus': {
      outline: 'none',
      borderColor: '#1976d2',
      background: 'white',
      boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.1)',
      transform: 'translateY(-0.0625rem)',
    },
    '&::placeholder': {
      color: '#9e9e9e',
      fontWeight: 400,
    },
  },
  
  '@media': {
    '(min-width: 600px)': {
      borderRadius: '12px',
      padding: '14px 18px',
    },
  },
});

export const formNote = style({
  color: '#666',
  fontSize: '12px',
  marginBottom: '16px',
});

export const modalActions = style({
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
});

export const btnSecondary = style({
  background: '#f5f5f5',
  color: '#333',
  border: 'none',
  padding: '10px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
});

export const btnPrimary = style({
  background: 'linear-gradient(135deg, #1976d2, #1565c0)',
  color: 'white',
  border: 'none',
  padding: '14px 20px',
  borderRadius: '12px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 600,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  minHeight: '48px',
  touchAction: 'manipulation',
  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
  
  selectors: {
    '&:hover': {
      transform: 'translateY(-0.125rem)',
      boxShadow: '0 6px 16px rgba(25, 118, 210, 0.35)',
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 0.125rem 8px rgba(25, 118, 210, 0.2)',
    },
  },
});

export const loadingText = style({
  textAlign: 'center',
  color: '#666',
  fontStyle: 'italic',
  padding: '40px',
});

export const emptyState = style({
  textAlign: 'center',
  color: '#666',
  padding: '40px',
});

export const filtersContainer = style({
  background: 'white',
  padding: '20px',
  borderRadius: '12px',
  boxShadow: '0 0.125rem 8px rgba(0,0,0,0.1)',
  marginBottom: '24px',
});

export const filtersTitle = style({
  fontSize: '16px',
  fontWeight: 600,
  margin: '0 0 16px 0',
  color: '#333',
});

export const filtersGrid = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '12px',
  
  '@media': {
    '(min-width: 600px)': {
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
    },
  },
});

export const filterGroup = style({
  display: 'flex',
  flexDirection: 'column',
});

export const filterLabel = style({
  fontSize: '12px',
  fontWeight: 500,
  color: '#666',
  marginBottom: '4px',
});

export const filterInput = style({
  padding: '8px 12px',
  border: '0.125rem solid #e0e0e0',
  borderRadius: '6px',
  fontSize: '14px',
  
  selectors: {
    '&:focus': {
      outline: 'none',
      borderColor: '#1976d2',
    },
  },
});

export const filterSelect = style({
  padding: '8px 12px',
  border: '0.125rem solid #e0e0e0',
  borderRadius: '6px',
  fontSize: '14px',
  background: 'white',
  cursor: 'pointer',
  
  selectors: {
    '&:focus': {
      outline: 'none',
      borderColor: '#1976d2',
    },
  },
});

export const clearFiltersBtn = style({
  background: '#f5f5f5',
  color: '#666',
  border: '0.0625rem solid #ddd',
  padding: '8px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  alignSelf: 'flex-end',
  
  selectors: {
    '&:hover': {
      background: '#e0e0e0',
    },
  },
});

export const resultsCount = style({
  color: '#666',
  fontSize: '12px',
  marginBottom: '16px',
});

export const collectionSelector = style({
  background: 'white',
  padding: '16px',
  borderRadius: '12px',
  boxShadow: '0 0.125rem 8px rgba(0,0,0,0.1)',
  marginBottom: '24px',
});

export const collectionSelectorTitle = style({
  fontSize: '14px',
  fontWeight: 600,
  margin: '0 0 12px 0',
  color: '#333',
});

export const collectionTabs = style({
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
});

export const collectionTab = style({
  padding: '8px 16px',
  border: '0.125rem solid #e0e0e0',
  borderRadius: '20px',
  background: 'white',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 500,
  transition: 'all 0.2s',
  
  selectors: {
    '&:hover': {
      borderColor: '#1976d2',
    },
    '&.active': {
      background: '#1976d2',
      color: 'white',
      borderColor: '#1976d2',
    },
  },
});

export const eventFormGrid = style({
  display: 'grid',
  gap: '16px',
});

export const dateFieldsContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const dateFieldRow = style({
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
});

export const dateFieldRowInput = style({
  flex: 1,
});

export const removeDateBtn = style({
  background: '#ff5252',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '8px',
  cursor: 'pointer',
  fontSize: '12px',
  
  selectors: {
    '&:hover': {
      background: '#f44336',
    },
  },
});

export const addDateBtn = style({
  background: '#4caf50',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '8px 12px',
  cursor: 'pointer',
  fontSize: '12px',
  marginTop: '8px',
  
  selectors: {
    '&:hover': {
      background: '#45a049',
    },
  },
});

export const eventFab = style({
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  width: '72px',
  height: '72px',
  borderRadius: '50%',
  background: '#ff9800',
  border: 'none',
  color: 'white',
  fontSize: '32px',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  transition: 'all 0.2s',
  
  selectors: {
    '&:hover': {
      background: '#f57c00',
      transform: 'scale(1.05)',
    },
  },
});
