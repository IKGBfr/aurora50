'use client';

import styled from '@emotion/styled';
import { FiGlobe, FiLock, FiUsers, FiMapPin, FiHash } from 'react-icons/fi';

interface SalonCardProps {
  salon: {
    id: string;
    name: string;
    description?: string | null;
    emoji?: string;
    cover_url?: string | null;
    theme_color?: string;
    visibility?: 'public' | 'private';
    category?: string;
    city?: string | null;
    member_count?: number;
    tags?: string[];
    owner_name?: string;
    owner_avatar?: string | null;
    owner_id?: string;
  };
  onClick?: () => void;
  showOwnerBadge?: boolean;
  currentUserId?: string;
}

// STYLED COMPONENTS
const CardContainer = styled.div`
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  /* Animation d'entrée */
  animation: slideUp 0.5s ease;
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    border-color: #8b5cf6;
  }
  
  /* Effet de shine au hover */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgba(139, 92, 246, 0.1) 50%,
      transparent 60%
    );
    transform: translateX(-100%);
    transition: transform 0.6s;
    pointer-events: none;
  }
  
  &:hover::before {
    transform: translateX(100%);
  }
`;

const CoverImage = styled.div<{ $url?: string | null }>`
  height: 140px;
  background: ${props => {
    if (props.$url) {
      return `url(${props.$url})`;
    }
    // Dégradé Aurora50 par défaut si pas d'image
    return 'linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%)';
  }};
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.1));
  }
`;

const Content = styled.div`
  padding: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const Emoji = styled.div`
  font-size: 1.5rem;
  line-height: 1;
`;

const Title = styled.h3`
  flex: 1;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Badge = styled.span<{ $type: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  background: ${props => props.$type === 'public' ? '#dbeafe' : '#fef3c7'};
  color: ${props => props.$type === 'public' ? '#1e40af' : '#92400e'};
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
`;

const Description = styled.p`
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Meta = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6b7280;
  font-size: 0.875rem;
  
  svg {
    color: #9ca3af;
  }
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  padding: 0.125rem 0.5rem;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 0.25rem;
  font-size: 0.75rem;
`;

const OwnerBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

// Skeleton components pour le chargement
const SkeletonContainer = styled.div`
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  animation: pulse 1.5s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const SkeletonCover = styled.div`
  height: 140px;
  background: #f3f4f6;
`;

const SkeletonContent = styled.div`
  padding: 1.5rem;
`;

const SkeletonLine = styled.div<{ width?: string }>`
  height: ${props => props.width === '60%' ? '1.5rem' : '1rem'};
  background: #f3f4f6;
  border-radius: 0.25rem;
  margin-bottom: 0.75rem;
  width: ${props => props.width || '100%'};
`;

export function SalonCard({ salon, onClick, showOwnerBadge = false, currentUserId }: SalonCardProps) {
  const getCategoryLabel = (category?: string) => {
    const labels: Record<string, string> = {
      general: 'Général',
      local: 'Local',
      business: 'Business',
      wellness: 'Bien-être',
      hobby: 'Loisirs',
      dating: 'Rencontres',
      other: 'Autre'
    };
    return labels[category || 'general'] || 'Général';
  };

  const isOwner = showOwnerBadge && currentUserId && salon.owner_id === currentUserId;

  return (
    <CardContainer onClick={onClick}>
      {isOwner && <OwnerBadge>Propriétaire</OwnerBadge>}
      
      <CoverImage $url={salon.cover_url} />
      <Content>
        <Header>
          <Emoji>{salon.emoji || '💬'}</Emoji>
          <Title>{salon.name}</Title>
          <Badge $type={salon.visibility || 'public'}>
            {salon.visibility === 'public' ? (
              <>
                <FiGlobe size={12} /> Public
              </>
            ) : (
              <>
                <FiLock size={12} /> Privé
              </>
            )}
          </Badge>
        </Header>
        
        {salon.description && (
          <Description>{salon.description}</Description>
        )}
        
        <Meta>
          {salon.city && (
            <MetaItem>
              <FiMapPin size={14} /> {salon.city}
            </MetaItem>
          )}
          <MetaItem>
            <FiHash size={14} /> {getCategoryLabel(salon.category)}
          </MetaItem>
          <MetaItem>
            <FiUsers size={14} /> {salon.member_count || 0} membres
          </MetaItem>
        </Meta>
        
        {salon.tags && salon.tags.length > 0 && (
          <Tags>
            {salon.tags.map(tag => (
              <Tag key={tag}>#{tag}</Tag>
            ))}
          </Tags>
        )}
      </Content>
    </CardContainer>
  );
}

export function SalonCardSkeleton() {
  return (
    <SkeletonContainer>
      <SkeletonCover />
      <SkeletonContent>
        <SkeletonLine width="60%" />
        <SkeletonLine width="90%" />
        <SkeletonLine width="40%" />
      </SkeletonContent>
    </SkeletonContainer>
  );
}
