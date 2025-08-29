'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';

// ============================================
// TYPES & INTERFACES
// ============================================
type UserProfile = Database['public']['Tables']['profiles']['Row'];

// ============================================
// STYLED COMPONENTS - Design System Aurora50
// ============================================
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%);
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  margin-bottom: 3rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.125rem;
  color: #4B5563;
  line-height: 1.6;
`;

const FormCard = styled.div`
  background: #FFFFFF;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(139, 92, 246, 0.1);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 16px;
  }
`;

const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #F3F4F6;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  padding: 4px;
  box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.2);
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background: #FFFFFF;
`;

const AvatarInfo = styled.div`
  flex: 1;
`;

const AvatarTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
`;

const AvatarDescription = styled.p`
  color: #4B5563;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const FormSection = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1.25rem;
  font-size: 1rem;
  color: #111827;
  background: #F9FAFB;
  border: 2px solid transparent;
  border-radius: 16px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    background: #FFFFFF;
    border-color: #8B5CF6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
  
  &::placeholder {
    color: #9CA3AF;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.875rem 1.25rem;
  font-size: 1rem;
  color: #111827;
  background: #F9FAFB;
  border: 2px solid transparent;
  border-radius: 16px;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
  font-family: inherit;
  
  &:focus {
    outline: none;
    background: #FFFFFF;
    border-color: #8B5CF6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
  
  &::placeholder {
    color: #9CA3AF;
  }
`;

const CharCount = styled.span`
  font-size: 0.875rem;
  color: #6B7280;
  text-align: right;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #F3F4F6;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SaveButton = styled.button`
  flex: 1;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: #FFFFFF;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: #6B7280;
  background: #F3F4F6;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #E5E7EB;
    color: #4B5563;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #F3F4F6;
  border-top-color: #8B5CF6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: #6B7280;
  font-size: 1rem;
`;

const ErrorMessage = styled.div`
  background: #FEE2E2;
  color: #991B1B;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  font-size: 0.95rem;
  line-height: 1.5;
  border: 1px solid #FCA5A5;
`;

const SuccessMessage = styled.div`
  background: #D1FAE5;
  color: #065F46;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  font-size: 0.95rem;
  line-height: 1.5;
  border: 1px solid #6EE7B7;
`;

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function EditProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  
  // États
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Récupération du profil au chargement
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer l'utilisateur connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setError('Vous devez être connecté pour accéder à cette page.');
        router.push('/connexion');
        return;
      }

      // Récupérer le profil depuis la table profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Erreur lors de la récupération du profil:', profileError);
        setError('Impossible de charger votre profil. Veuillez réessayer.');
        return;
      }

      // Mettre à jour les états avec les données récupérées
      setProfile(profileData);
      setFullName(profileData.full_name || '');
      setBio(profileData.bio || '');
      setEmail(profileData.email || user.email || '');
      
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setError('Une erreur inattendue s\'est produite.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Validation basique
      if (!fullName.trim()) {
        setError('Le nom complet est requis.');
        return;
      }

      // Récupérer l'utilisateur actuel
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setError('Session expirée. Veuillez vous reconnecter.');
        router.push('/connexion');
        return;
      }

      // Mettre à jour le profil avec le timestamp
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          bio: bio.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erreur lors de la mise à jour:', updateError);
        setError('Impossible de mettre à jour votre profil. Veuillez réessayer.');
        return;
      }

      setSuccess('🌿 Votre profil a été mis à jour avec succès !');
      
      // Redirection après 2 secondes
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setError('Une erreur inattendue s\'est produite.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  // Affichage du chargement
  if (loading) {
    return (
      <PageContainer>
        <ContentWrapper>
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Chargement de votre profil...</LoadingText>
          </LoadingContainer>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        {/* En-tête de la page */}
        <HeaderSection>
          <PageTitle>
            🌿 Modifier mon profil
          </PageTitle>
          <PageSubtitle>
            Personnalisez votre espace et partagez qui vous êtes avec la communauté Aurora50.
          </PageSubtitle>
        </HeaderSection>

        {/* Carte du formulaire */}
        <FormCard>
          {/* Messages d'erreur ou de succès */}
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          {/* Section Avatar */}
          <AvatarSection>
            <AvatarWrapper>
              <Avatar 
                src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id}`}
                alt="Avatar du profil"
              />
            </AvatarWrapper>
            <AvatarInfo>
              <AvatarTitle>Photo de profil</AvatarTitle>
              <AvatarDescription>
                Votre avatar actuel. La possibilité de télécharger une photo personnalisée sera bientôt disponible.
              </AvatarDescription>
            </AvatarInfo>
          </AvatarSection>

          {/* Formulaire */}
          <FormSection onSubmit={handleSubmit}>
            {/* Email (lecture seule) */}
            <FormGroup>
              <Label htmlFor="email">
                Adresse email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                style={{ 
                  opacity: 0.7, 
                  cursor: 'not-allowed',
                  background: '#F3F4F6' 
                }}
              />
              <CharCount style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                L'email ne peut pas être modifié pour des raisons de sécurité
              </CharCount>
            </FormGroup>

            {/* Nom complet */}
            <FormGroup>
              <Label htmlFor="fullName">
                Nom complet
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Entrez votre nom complet"
                maxLength={100}
                required
              />
            </FormGroup>

            {/* Biographie */}
            <FormGroup>
              <Label htmlFor="bio">
                Biographie
              </Label>
              <TextArea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Parlez-nous un peu de vous... Vos passions, vos objectifs, ce qui vous inspire..."
                maxLength={500}
              />
              <CharCount>{bio.length}/500 caractères</CharCount>
            </FormGroup>

            {/* Boutons d'action */}
            <ButtonGroup>
              <CancelButton type="button" onClick={handleCancel}>
                Annuler
              </CancelButton>
              <SaveButton type="submit" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </SaveButton>
            </ButtonGroup>
          </FormSection>
        </FormCard>
      </ContentWrapper>
    </PageContainer>
  );
}
