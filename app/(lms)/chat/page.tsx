'use client';

import ChatRoom from '@/components/chat/ChatRoom';
import styled from '@emotion/styled';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
  
  h1 {
    font-size: 32px;
    font-weight: 700;
    background: linear-gradient(135deg, #10B981, #8B5CF6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 8px;
  }
  
  p {
    color: #6B7280;
    font-size: 16px;
  }
`;

export default function ChatPage() {
  return (
    <PageContainer>
      <PageHeader>
        <h1>Espace Communautaire 🌿</h1>
        <p>Échangez avec les autres membres de la communauté Aurora50</p>
      </PageHeader>
      <ChatRoom />
    </PageContainer>
  );
}
