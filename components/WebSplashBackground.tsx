import React from 'react';

const backgroundStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'white',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const floatingElement1Styles: React.CSSProperties = {
  position: 'absolute',
  top: '10%',
  left: '10%',
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.1)',
  animation: 'float 6s ease-in-out infinite',
};

const floatingElement2Styles: React.CSSProperties = {
  position: 'absolute',
  bottom: '15%',
  right: '15%',
  width: '150px',
  height: '150px',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.05)',
  animation: 'float 8s ease-in-out infinite reverse',
};

export function SplashBackground() {
  return (
    <div style={backgroundStyles}>
      <div style={floatingElement1Styles} />
      <div style={floatingElement2Styles} />
    </div>
  );
}
