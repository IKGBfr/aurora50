'use client';

import styled from '@emotion/styled';

const Indicator = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #FCD34D, #F59E0B);
  color: #7C2D12;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  z-index: 9999;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 8px;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  @media (max-width: 768px) {
    bottom: 10px;
    right: 10px;
    font-size: 12px;
    padding: 6px 12px;
  }
`;

export function DevModeIndicator() {
  const isDev = process.env.NODE_ENV === 'development' && 
                process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true';

  if (!isDev) return null;

  return (
    <Indicator>
      ⚠️ Mode Dev - Auth simulée
    </Indicator>
  );
}
