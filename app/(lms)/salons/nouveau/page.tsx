'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { useSalons } from '@/lib/hooks/useSalons';
import { useAuth } from '@/lib/hooks/useAuth';
import { FiArrowLeft, FiInfo, FiMapPin, FiHash } from 'react-icons/fi';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 2rem;
  transition: color 0.2s;
  
  &:hover {
    color: #8b5cf6;
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

const Form = styled.form`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid #e5e7eb;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.95rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

const HelpText = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const InfoBox = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  
  svg {
    flex-shrink: 0;
    color: #22c55e;
    margin-top: 0.125rem;
  }
`;

const InfoContent = styled.div`
  flex: 1;
  
  h3 {
    font-size: 0.95rem;
    font-weight: 600;
    color: #166534;
    margin-bottom: 0.25rem;
  }
  
  p {
    font-size: 0.875rem;
    color: #15803d;
    line-height: 1.5;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
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
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #991b1b;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  padding: 1rem;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 0.5rem;
  color: #166534;
  margin-bottom: 1rem;
`;

const ShareCodePreview = styled.div`
  padding: 1rem;
  background: #faf5ff;
  border: 1px solid #e9d5ff;
  border-radius: 0.5rem;
  margin-top: 1rem;
  
  .label {
    font-size: 0.875rem;
    color: #6b22c3;
    margin-bottom: 0.25rem;
  }
  
  .code {
    font-family: monospace;
    font-size: 1.1rem;
    color: #7c3aed;
    font-weight: 600;
  }
`;

export default function NouveauSalonPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { createSalon } = useSalons();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    city: ''
  });
  
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [shareCode, setShareCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Le nom du salon est requis');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('La description est requise');
      return;
    }
    
    setCreating(true);
    setError('');
    
    const result = await createSalon({
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      city: formData.city.trim() || undefined
    });
    
    setCreating(false);
    
    if (result.success && result.salon) {
      setShareCode(result.salon.share_code);
      // Rediriger vers le salon après 2 secondes
      setTimeout(() => {
        router.push(`/salons/${result.salon.id}`);
      }, 2000);
    } else {
      setError(result.error || 'Erreur lors de la création du salon');
    }
  };

  const generatePreviewCode = () => {
    if (!formData.name) return '';
    const slug = formData.name.toLowerCase().replace(/\s+/g, '-').substring(0, 20);
    return `${slug}-xxxx`;
  };

  return (
    <Container>
      <BackButton onClick={() => router.push('/salons')}>
        <FiArrowLeft /> Retour aux salons
      </BackButton>

      <Header>
        <Title>Créer un nouveau salon</Title>
        <Subtitle>Créez votre espace de discussion privé et invitez d'autres femmes 50+</Subtitle>
      </Header>

      <Form onSubmit={handleSubmit}>
        <InfoBox>
          <FiInfo size={20} />
          <InfoContent>
            <h3>Salon viral</h3>
            <p>
              Votre salon aura un code unique que vous pourrez partager sur Facebook. 
              Les femmes pourront le rejoindre directement avec ce code !
            </p>
          </InfoContent>
        </InfoBox>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {shareCode && (
          <SuccessMessage>
            ✅ Salon créé avec succès ! Code de partage : <strong>{shareCode}</strong>
          </SuccessMessage>
        )}

        <FormGroup>
          <Label>Nom du salon *</Label>
          <Input
            type="text"
            placeholder="Ex: Femmes de Paris, Yoga 50+, Business au féminin..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            maxLength={50}
            disabled={creating}
          />
          <HelpText>Maximum 50 caractères</HelpText>
        </FormGroup>

        <FormGroup>
          <Label>Description *</Label>
          <Textarea
            placeholder="Décrivez votre salon : son objectif, les sujets abordés, l'ambiance souhaitée..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            maxLength={500}
            disabled={creating}
          />
          <HelpText>{formData.description.length}/500 caractères</HelpText>
        </FormGroup>

        <FormGroup>
          <Label>Catégorie *</Label>
          <Select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            disabled={creating}
          >
            <option value="general">Général</option>
            <option value="local">Local / Régional</option>
            <option value="business">Business / Entrepreneuriat</option>
            <option value="wellness">Bien-être / Santé</option>
            <option value="hobby">Loisirs / Hobbies</option>
            <option value="dating">Rencontres / Amitié</option>
            <option value="other">Autre</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>
            <FiMapPin style={{ display: 'inline', marginRight: '0.25rem' }} />
            Ville (optionnel)
          </Label>
          <Input
            type="text"
            placeholder="Ex: Paris, Lyon, Marseille..."
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            maxLength={50}
            disabled={creating}
          />
          <HelpText>Pour les salons locaux, indiquez votre ville</HelpText>
        </FormGroup>

        {formData.name && (
          <ShareCodePreview>
            <div className="label">Aperçu du code de partage :</div>
            <div className="code">{generatePreviewCode()}</div>
          </ShareCodePreview>
        )}

        <ButtonGroup>
          <CancelButton 
            type="button" 
            onClick={() => router.push('/salons')}
            disabled={creating}
          >
            Annuler
          </CancelButton>
          <SubmitButton type="submit" disabled={creating}>
            {creating ? 'Création...' : 'Créer le salon'}
          </SubmitButton>
        </ButtonGroup>
      </Form>
    </Container>
  );
}
