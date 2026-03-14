import React from 'react';

interface OverlayProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 8,
  left: 8,
  zIndex: 99999,
  pointerEvents: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  padding: '6px 8px',
  borderRadius: 4,
  background: 'rgba(0, 0, 0, 0.55)',
  color: '#00ff90',
  fontFamily: 'monospace',
  fontSize: 13,
  minWidth: 180,
};

export const Overlay: React.FC<OverlayProps> = ({ children, style }) => {
  return (
    <div style={{ ...overlayStyle, ...style }}>
      {children}
    </div>
  );
};
