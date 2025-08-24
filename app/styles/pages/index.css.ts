import { style } from '@vanilla-extract/css';

export const indexPage = style({
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
});

export const responsiveGrid = style({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  gap: "24px",
  marginTop: "32px",
  marginBottom: "32px",
  
  '@media': {
    '(min-width: 768px) and (max-width: 1024px)': {
      
    },
    '(max-width: 767px)': { //スマホ
      flexDirection: 'column',
      width: "100%",
      gap: '20px',
      marginTop: '24px',
    },
  },
});

export const heroSection = style({
  background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
  color: 'white',
  padding: '1.5rem 1rem',
  borderRadius: '1rem',
  textAlign: 'center',
  marginBottom: '1.5rem',
  overflow: 'hidden',
  boxShadow: '0 0.5rem 2rem rgba(25, 118, 210, 0.25)',
});

export const heroTitle = style({
  margin: '0 0 1rem 0',
  fontSize: '1.25rem',
  fontWeight: 700,
  lineHeight: 1.2,
  zIndex: 1,
});

export const heroText = style({
  margin: 0,
  opacity: 0.95,
  fontSize: '1rem',
  lineHeight: 1.5,
  fontWeight: 400,
  zIndex: 1,
  maxWidth: '31.25rem',
  marginLeft: 'auto',
  marginRight: 'auto',
});

export const sectionTitle = style({
  fontSize: '1.25rem',
  fontWeight: '700',
  margin: '0 0 1rem 0',
  color: '#FFF',
});

export const featureDescription = style({
  color: '#64748b',
  lineHeight: '1.6',
  margin: '0 0 1.5rem 0',
  fontSize: '0.95rem',
  flex: '1', // 残りのスペースを埋める
});

export const usageGuide = style({
  // 使い方ガイド用のコンテナ
});

export const usageGuideHeader = style({
  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
  padding: '1.5rem 2rem',
  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
});

export const usageGuideTitle = style({
  color: '#212121',
  margin: 0,
  fontSize: '1.25rem',
  fontWeight: '700',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

export const stepBadge = style({
  fontSize: '0.75rem',
  background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
  color: 'white',
  padding: '0.25rem 0.75rem',
  borderRadius: '1rem',
  fontWeight: '500',
});

export const usageGuideContent = style({
  padding: '2rem',
});

export const usageStepsGrid = style({
  display: 'grid',
  gap: '1.25rem',
  gridTemplateColumns: '1fr',
});

export const usageStep = style({
  // 基本のステップスタイル
});

export const usageStepBlue = style([usageStep, {
  borderLeft: '4px solid #3b82f6',
}]);

export const usageStepPink = style([usageStep, {
  borderLeft: '4px solid #ec4899',
}]);

export const usageStepGreen = style([usageStep, {
  borderLeft: '4px solid #10b981',
}]);

export const usageStepOrange = style([usageStep, {
  borderLeft: '4px solid #f59e0b',
}]);

export const stepContainer = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1.25rem',
});

export const stepNumber = style({
  color: 'white',
  width: '2.5rem',
  height: '2.5rem',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1rem',
  fontWeight: '800',
  flexShrink: 0,
});

export const stepNumberBlue = style([stepNumber, {
  background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
}]);

export const stepNumberPink = style([stepNumber, {
  background: 'linear-gradient(135deg, #ec4899, #f472b6)',
  boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
}]);

export const stepNumberGreen = style([stepNumber, {
  background: 'linear-gradient(135deg, #10b981, #34d399)',
  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
}]);

export const stepNumberOrange = style([stepNumber, {
  background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
}]);

export const stepTitle = style({
  fontSize: '1.1rem',
  fontWeight: '700',
});

export const stepTitleBlue = style([stepTitle, {
  color: '#1e40af',
}]);

export const stepTitlePink = style([stepTitle, {
  color: '#be185d',
}]);

export const stepTitleGreen = style([stepTitle, {
  color: '#047857',
}]);

export const stepTitleOrange = style([stepTitle, {
  color: '#d97706',
}]);

export const stepDescription = style({
  color: '#64748b',
  margin: '0.75rem 0 0 0',
  lineHeight: '1.7',
  fontSize: '0.95rem',
});

// セクションカード用のスタイル
export const sectionCard = style({
  display: 'flex',
  flexDirection: 'column',
  width: "30%",
  alignItems: 'stretch',
  
  '@media': {
    '(max-width: 767px)': {
      width: "100%",
    },
  },
});
