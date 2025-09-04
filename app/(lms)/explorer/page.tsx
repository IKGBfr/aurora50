'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { useSalons } from '@/lib/hooks/useSalons';
import { useAuth } from '@/lib/hooks/useAuth';
import { FiPlus, FiUsers, FiMapPin, FiHash, FiLock, FiShare2, FiSearch } from 'react-icons/fi';

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

const SearchBar = styled.div`
  flex: 1;
  min-width: 250px;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
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

const JoinButton = styled.button`
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

const FilterSection = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterChip = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  border: 1px solid ${props => props.$active ? '#8b5cf6' : '#e5e7eb'};
  background: ${props => props.$active ? '#8b5cf6' : 'white'};
  color: ${props => props.$active ? 'white' : '#6b7280'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #8b5cf6;
    background: ${props => props.$active ? '#7c3aed' : '#f9fafb'};
  }
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
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border-color: #8b5cf6;
  }
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

const OwnerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
`;

const OwnerAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const OwnerName = styled.span`
  color: #6b7280;
  font-size: 0.875rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.3;
`;

const Modal = styled.div<{ $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`;

const CancelButton = styled(Button)`
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  
  &:hover {
    background: #e5e7eb;
  }
`;

const SubmitButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
  }
`;

const categories = [
  { value: 'all', label: 'Toutes' },
  { value: 'local', label: 'Local' },
  { value: 'business', label: 'Business' },
  { value: 'wellness', label: 'Bien-être' },
  { value: 'hobby', label: 'Loisirs' },
  { value: 'dating', label: 'Rencontres' },
];

export default function ExplorerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { salons, loading, joinSalonViaCode } = useSalons();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
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

  // Filtrer les salons
  const filteredSalons = salons.filter(salon => {
    const matchesSearch = salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          salon.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          salon.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || salon.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleJoinSalon = async () => {
    if (!joinCode.trim()) return;
    
    setJoining(true);
    const result = await joinSalonViaCode(joinCode.trim());
    setJoining(false);
    
    if (result.success) {
      setJoinModalOpen(false);
      setJoinCode('');
      if (result.salon_id) {
        router.push(`/salons/${result.salon_id}`);
      }
    } else {
      alert(result.error || 'Impossible de rejoindre le salon');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'local': return <FiMapPin size={14} />;
      case 'business': return <FiHash size={14} />;
      default: return <FiHash size={14} />;
    }
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Chargement des salons...</Title>
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Explorer les salons</Title>
        <Subtitle>Découvrez et rejoignez des espaces de discussion avec d'autres femmes 50+</Subtitle>
      </Header>

      <ActionBar>
        <SearchBar>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Rechercher par nom, description ou ville..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBar>
        
        {isPremium ? (
          <CreateButton onClick={() => router.push('/salons/nouveau')}>
            <FiPlus /> Créer un salon
          </CreateButton>
        ) : (
          <CreateButton onClick={() => router.push('/upgrade')}>
            <FiLock /> Devenir Premium
          </CreateButton>
        )}
        
        <JoinButton onClick={() => setJoinModalOpen(true)}>
          <FiShare2 /> Rejoindre avec un code
        </JoinButton>
      </ActionBar>

      <FilterSection>
        {categories.map(category => (
          <FilterChip
            key={category.value}
            $active={selectedCategory === category.value}
            onClick={() => setSelectedCategory(category.value)}
          >
            {category.label}
          </FilterChip>
        ))}
      </FilterSection>

      {filteredSalons.length > 0 ? (
        <SalonsGrid>
          {filteredSalons.map(salon => (
            <SalonCard key={salon.id} onClick={() => router.push(`/salons/${salon.id}`)}>
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
              
              {salon.owner_name && (
                <OwnerInfo>
                  {salon.owner_avatar && (
                    <OwnerAvatar src={salon.owner_avatar} alt={salon.owner_name} />
                  )}
                  <OwnerName>Créé par {salon.owner_name}</OwnerName>
                </OwnerInfo>
              )}
            </SalonCard>
          ))}
        </SalonsGrid>
      ) : (
        <EmptyState>
          <EmptyIcon>🔍</EmptyIcon>
          <h3>Aucun salon trouvé</h3>
          <p>
            Essayez de modifier vos critères de recherche ou créez votre propre salon !
          </p>
        </EmptyState>
      )}

      <Modal $isOpen={joinModalOpen}>
        <ModalContent>
          <ModalTitle>Rejoindre un salon</ModalTitle>
          <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
            Entrez le code d'invitation que vous avez reçu
          </p>
          <Input
            type="text"
            placeholder="Ex: femmes-paris-a1b2"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJoinSalon()}
          />
          <ModalButtons>
            <CancelButton onClick={() => {
              setJoinModalOpen(false);
              setJoinCode('');
            }}>
              Annuler
            </CancelButton>
            <SubmitButton onClick={handleJoinSalon} disabled={joining}>
              {joining ? 'Connexion...' : 'Rejoindre'}
            </SubmitButton>
          </ModalButtons>
        </ModalContent>
      </Modal>
    </Container>
  );
}
