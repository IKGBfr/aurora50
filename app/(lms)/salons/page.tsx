'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { useSalons } from '@/lib/hooks/useSalons';
import { useAuth } from '@/lib/hooks/useAuth';
import { FiPlus, FiUsers, FiMapPin, FiHash, FiLock, FiCompass } from 'react-icons/fi';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1.1rem;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
  }
`;

const ExploreButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  color: #8b5cf6;
  border: 2px solid #8b5cf6;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #8b5cf6;
    color: white;
  }
`;

const StatsSection = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  flex: 1;
  min-width: 200px;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #8b5cf6;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const SalonsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SalonCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border-color: #8b5cf6;
  }
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
`;

const SalonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
`;

const SalonInfo = styled.div`
  flex: 1;
`;

const SalonName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const SalonCategory = styled.span<{ $category: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  background: ${props => {
    switch(props.$category) {
      case 'local': return '#fef3c7';
      case 'business': return '#dbeafe';
      case 'wellness': return '#d1fae5';
      case 'hobby': return '#fce7f3';
      case 'dating': return '#fce7f3';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch(props.$category) {
      case 'local': return '#92400e';
      case 'business': return '#1e40af';
      case 'wellness': return '#065f46';
      case 'hobby': return '#9f1239';
      case 'dating': return '#9f1239';
      default: return '#374151';
    }
  }};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
`;

const SalonDescription = styled.p`
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const SalonMeta = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
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

const LastActivity = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
  color: #9ca3af;
  font-size: 0.875rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.3;
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const EmptyDescription = styled.p`
  color: #6b7280;
  margin-bottom: 2rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
`;

export default function SalonsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { mySalons, loading } = useSalons();
  const [profile, setProfile] = useState<any>(null);

  // Récupérer le profil de l'utilisateur
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      // En mode dev, simuler un profil premium
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true') {
        setProfile({
          id: user.id,
          subscription_type: 'premium'
        });
        return;
      }
      
      // En production, récupérer le profil depuis Supabase
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
      }
    };
    
    loadProfile();
  }, [user]);

  const isPremium = profile?.subscription_type === 'premium' || 
                    profile?.subscription_type === 'founder' || 
                    profile?.subscription_type === 'trial';

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'local': return <FiMapPin size={14} />;
      case 'business': return <FiHash size={14} />;
      default: return <FiHash size={14} />;
    }
  };

  // Calculer les statistiques
  const ownedSalons = mySalons.filter(salon => salon.owner_id === user?.id);
  const totalMembers = mySalons.reduce((acc, salon) => acc + (salon.member_count || 0), 0);

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Chargement de vos salons...</Title>
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Mes Salons</Title>
        <Subtitle>Gérez vos espaces de discussion privés</Subtitle>
      </Header>

      <ActionBar>
        {isPremium ? (
          <CreateButton onClick={() => router.push('/salons/nouveau')}>
            <FiPlus /> Créer un salon
          </CreateButton>
        ) : (
          <CreateButton onClick={() => router.push('/upgrade')}>
            <FiLock /> Devenir Premium pour créer
          </CreateButton>
        )}
        
        <ExploreButton onClick={() => router.push('/explorer')}>
          <FiCompass /> Explorer les salons
        </ExploreButton>
      </ActionBar>

      {mySalons.length > 0 && (
        <StatsSection>
          <StatCard>
            <StatValue>{mySalons.length}</StatValue>
            <StatLabel>Salons rejoints</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{ownedSalons.length}</StatValue>
            <StatLabel>Salons créés</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{totalMembers}</StatValue>
            <StatLabel>Membres total</StatLabel>
          </StatCard>
        </StatsSection>
      )}

      {mySalons.length > 0 ? (
        <SalonsGrid>
          {mySalons.map(salon => (
            <SalonCard key={salon.id} onClick={() => router.push(`/salons/${salon.id}`)}>
              {salon.owner_id === user?.id && <OwnerBadge>Propriétaire</OwnerBadge>}
              
              <SalonHeader>
                <SalonInfo>
                  <SalonName>{salon.name}</SalonName>
                  <SalonCategory $category={salon.category}>
                    {getCategoryIcon(salon.category)}
                    {salon.category}
                  </SalonCategory>
                </SalonInfo>
              </SalonHeader>
              
              {salon.description && (
                <SalonDescription>{salon.description}</SalonDescription>
              )}
              
              <SalonMeta>
                <MetaItem>
                  <FiUsers />
                  {salon.member_count} membres
                </MetaItem>
                {salon.city && (
                  <MetaItem>
                    <FiMapPin />
                    {salon.city}
                  </MetaItem>
                )}
              </SalonMeta>
              
              <LastActivity>
                Dernière activité il y a 2 heures
              </LastActivity>
            </SalonCard>
          ))}
        </SalonsGrid>
      ) : (
        <EmptyState>
          <EmptyIcon>💬</EmptyIcon>
          <EmptyTitle>Aucun salon rejoint</EmptyTitle>
          <EmptyDescription>
            Vous n'avez pas encore rejoint de salon. Explorez les salons disponibles pour rencontrer d'autres femmes 50+ partageant vos centres d'intérêt.
          </EmptyDescription>
          <ExploreButton onClick={() => router.push('/explorer')}>
            <FiCompass /> Explorer les salons
          </ExploreButton>
        </EmptyState>
      )}
    </Container>
  );
}
