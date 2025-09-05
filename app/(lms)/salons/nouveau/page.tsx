'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import imageCompression from 'browser-image-compression';
import { useSalons } from '@/lib/hooks/useSalons';
import { useAuth } from '@/lib/hooks/useAuth';
import supabase from '@/lib/supabase/client';
import { 
  FiArrowLeft, FiImage, FiGlobe, FiLock, FiX,
  FiMapPin, FiHash, FiUsers
} from 'react-icons/fi';
import { useToast } from '@/lib/hooks/useToast';

// CONSTANTES
const SUGGESTED_EMOJIS = ['💬', '🌿', '💜', '🌸', '☕', '🧘‍♀️', '📚', '🎨', '🌟', '🦋'];

const THEME_COLORS = [
  '#8B5CF6', // Violet Aurora (défaut)
  '#EC4899', // Rose
  '#10B981', // Vert
  '#3B82F6', // Bleu
  '#F59E0B', // Orange
  '#EF4444', // Rouge
  '#6B7280', // Gris
  '#14B8A6', // Turquoise
];

const CATEGORIES = [
  { value: 'general', label: 'Général' },
  { value: 'local', label: 'Local / Régional' },
  { value: 'business', label: 'Business / Entrepreneuriat' },
  { value: 'wellness', label: 'Bien-être / Santé' },
  { value: 'hobby', label: 'Loisirs / Hobbies' },
  { value: 'dating', label: 'Rencontres / Amitié' },
  { value: 'other', label: 'Autre' }
];

// STYLED COMPONENTS
const Container = styled.div`
  max-width: 1200px;
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

const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainColumn = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid #e5e7eb;
`;

const PreviewColumn = styled.div`
  @media (max-width: 1024px) {
    display: none;
  }
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
  
  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
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
  
  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
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
  
  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }
`;

const CoverUploadZone = styled.div<{ $isDragging: boolean; $hasImage: boolean }>`
  position: relative;
  width: 100%;
  height: 200px;
  border: 2px dashed ${props => props.$isDragging ? '#8b5cf6' : '#e5e7eb'};
  border-radius: 0.75rem;
  background: ${props => props.$isDragging ? '#faf5ff' : props.$hasImage ? 'transparent' : '#fafafa'};
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s;
  
  &:hover {
    border-color: #8b5cf6;
    background: ${props => props.$hasImage ? 'transparent' : '#faf5ff'};
  }
`;

const CoverPreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UploadPlaceholder = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  
  p {
    margin-top: 0.5rem;
    font-weight: 500;
  }
  
  span {
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
`;

const RemoveCoverButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const VisibilitySection = styled.div`
  margin-bottom: 1.5rem;
`;

const VisibilityToggle = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const VisibilityCard = styled.button<{ $active: boolean }>`
  padding: 1rem;
  border: 2px solid ${props => props.$active ? '#8b5cf6' : '#e5e7eb'};
  border-radius: 0.75rem;
  background: ${props => props.$active ? '#faf5ff' : 'white'};
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;
  
  &:hover {
    border-color: #8b5cf6;
  }
  
  svg {
    color: ${props => props.$active ? '#8b5cf6' : '#6b7280'};
    margin-bottom: 0.5rem;
  }
  
  h4 {
    font-size: 1rem;
    font-weight: 600;
    color: ${props => props.$active ? '#7c3aed' : '#374151'};
    margin: 0 0 0.25rem 0;
  }
  
  p {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0;
  }
`;

const CustomizationRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const EmojiSection = styled.div`
  width: 100%;
`;

const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, minmax(48px, 1fr));
  gap: 0.5rem;
  
  @media (max-width: 640px) {
    grid-template-columns: repeat(5, 1fr);
  }
`;

const EmojiButton = styled.button<{ $selected: boolean }>`
  width: 48px;
  height: 48px;
  font-size: 1.5rem;
  border: 2px solid ${props => props.$selected ? '#8b5cf6' : '#e5e7eb'};
  background: ${props => props.$selected ? '#faf5ff' : 'white'};
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
    border-color: #8b5cf6;
  }
`;

const ColorSection = styled.div`
  width: 100%;
`;

const ColorGrid = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 640px) {
    gap: 0.5rem;
  }
`;

const ColorDot = styled.button<{ $color: string; $selected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$color};
  border: 3px solid ${props => props.$selected ? '#1f2937' : 'transparent'};
  box-shadow: ${props => props.$selected ? '0 0 0 2px white' : 'none'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const TagsSection = styled.div`
  margin-bottom: 1.5rem;
`;

const TagsInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  min-height: 50px;
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  border-radius: 2rem;
  font-size: 0.875rem;
  color: #4b5563;
  
  button {
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    font-size: 1.25rem;
    line-height: 1;
    padding: 0;
    margin-left: 0.25rem;
    
    &:hover {
      color: #ef4444;
    }
  }
`;

const TagInput = styled.input`
  flex: 1;
  min-width: 100px;
  border: none;
  outline: none;
  font-size: 0.875rem;
`;

const HelpText = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
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

const PreviewCard = styled.div`
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 2rem;
`;

const PreviewLabel = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  padding: 0 1.5rem;
  padding-top: 1.5rem;
`;

const PreviewCover = styled.div<{ $url?: string }>`
  height: 120px;
  background: ${props => props.$url ? `url(${props.$url})` : '#f3f4f6'};
  background-size: cover;
  background-position: center;
`;

const PreviewContent = styled.div`
  padding: 1.5rem;
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const PreviewEmoji = styled.div`
  font-size: 1.5rem;
`;

const PreviewTitle = styled.h3`
  flex: 1;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
`;

const PreviewBadge = styled.span<{ $type: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  background: ${props => props.$type === 'public' ? '#dbeafe' : '#fef3c7'};
  color: ${props => props.$type === 'public' ? '#1e40af' : '#92400e'};
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
`;

const PreviewDescription = styled.p`
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const PreviewMeta = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const PreviewMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6b7280;
  font-size: 0.875rem;
  
  svg {
    color: #9ca3af;
  }
`;

const PreviewTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const PreviewTag = styled.span`
  padding: 0.125rem 0.5rem;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 0.25rem;
  font-size: 0.75rem;
`;

export default function NouveauSalonPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { createSalon } = useSalons();
  const toast = useToast();
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // États
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    city: '',
    visibility: 'public' as 'public' | 'private',
    emoji: '💬',
    themeColor: '#8B5CF6',
    tags: [] as string[]
  });
  
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [creating, setCreating] = useState(false);
  
  // Gestion du drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  };
  
  // Gestion du fichier
  const handleFile = async (file: File) => {
    try {
      // Vérifier la taille
      if (file.size > 5242880) {
        toast.error('L\'image ne doit pas dépasser 5MB');
        return;
      }
      
      // Compression si nécessaire
      let processedFile = file;
      if (file.size > 2097152) { // Si > 2MB
        const options = {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        };
        processedFile = await imageCompression(file, options);
      }
      
      // Créer preview
      const preview = URL.createObjectURL(processedFile);
      
      setCoverFile(processedFile);
      setCoverPreview(preview);
      toast.success('Image ajoutée avec succès');
    } catch (err) {
      console.error('Erreur traitement image:', err);
      toast.error('Erreur lors du traitement de l\'image');
    }
  };
  
  // Upload vers Supabase
  const uploadCoverToSupabase = async (file: File, salonId: string) => {
    const fileName = `cover-${Date.now()}.${file.name.split('.').pop()}`;
    const filePath = `${salonId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('salon-covers')
      .upload(filePath, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('salon-covers')
      .getPublicUrl(filePath);
    
    return publicUrl;
  };
  
  // Gestion des tags
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      
      if (!tag) {
        toast.error('Tag invalide');
        return;
      }
      
      if (formData.tags.includes(tag)) {
        toast.error('Ce tag existe déjà');
        return;
      }
      
      if (formData.tags.length >= 5) {
        toast.error('Maximum 5 tags autorisés');
        return;
      }
      
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
      setTagInput('');
      toast.success(`Tag "${tag}" ajouté`);
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
    toast.info(`Tag "${tagToRemove}" supprimé`);
  };
  
  // Validation du formulaire
  const validateForm = () => {
    if (!formData.name || formData.name.length < 3) {
      toast.error('Le nom doit faire au moins 3 caractères');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    
    if (!formData.description || formData.description.length < 20) {
      toast.error('La description doit faire au moins 20 caractères');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    
    if (formData.tags.length > 5) {
      toast.error('Maximum 5 tags autorisés');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    
    return true;
  };
  
  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setCreating(true);
    const loadingToast = toast.loading('Création du salon en cours...');
    
    try {
      // Générer un ID temporaire pour l'upload
      const tempId = crypto.randomUUID();
      
      // Upload de la cover si présente
      let coverUrl = null;
      if (coverFile) {
        coverUrl = await uploadCoverToSupabase(coverFile, tempId);
      }
      
      // Créer le salon avec les nouveaux paramètres
      const result = await createSalon({
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        city: formData.city.trim() || undefined,
        visibility: formData.visibility,
        cover_url: coverUrl,
        emoji: formData.emoji,
        theme_color: formData.themeColor,
        tags: formData.tags
      } as any);
      
      if (result.success && result.salon) {
        toast.dismiss(loadingToast);
        toast.success(`Salon "${formData.name}" créé avec succès !`);
        
        // Attendre un peu pour que l'utilisateur voie le message
        setTimeout(() => {
          router.push(`/salons/${result.salon.id}`);
        }, 2000);
      } else {
        toast.dismiss(loadingToast);
        toast.error(result.error || 'Erreur lors de la création du salon');
      }
    } catch (err: any) {
      console.error('Erreur création salon:', err);
      toast.dismiss(loadingToast);
      
      // Message d'erreur plus spécifique selon le type
      if (err.message?.includes('premium')) {
        toast.error('Seuls les membres premium peuvent créer des salons');
      } else if (err.message?.includes('network')) {
        toast.error('Problème de connexion. Vérifiez votre internet');
      } else {
        toast.error(err.message || 'Une erreur inattendue est survenue');
      }
    } finally {
      setCreating(false);
    }
  };
  
  return (
    <Container>
      <BackButton onClick={() => router.push('/salons')}>
        <FiArrowLeft /> Retour aux salons
      </BackButton>
      
      <Header>
        <Title>Créer un nouveau salon</Title>
        <Subtitle>Construisez votre communauté de femmes 50+</Subtitle>
      </Header>
      
      <TwoColumnLayout>
        <MainColumn>
          <form onSubmit={handleSubmit}>
            {/* Nom du salon EN PREMIER */}
            <FormGroup>
              <Label>Nom du salon *</Label>
              <Input
                type="text"
                placeholder="Ex: Femmes de Paris, Yoga 50+..."
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                maxLength={50}
                disabled={creating}
                required
              />
              <HelpText>{formData.name.length}/50 caractères</HelpText>
            </FormGroup>
            
            {/* Upload de cover */}
            <FormGroup>
              <Label>Image de couverture (optionnelle)</Label>
              <CoverUploadZone
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                $isDragging={isDragging}
                $hasImage={!!coverPreview}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  hidden
                />
                {coverPreview ? (
                  <>
                    <CoverPreview src={coverPreview} alt="Cover" />
                    <RemoveCoverButton
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoverFile(null);
                        setCoverPreview('');
                      }}
                    >
                      <FiX />
                    </RemoveCoverButton>
                  </>
                ) : (
                  <UploadPlaceholder>
                    <FiImage size={40} />
                    <p>Cliquez ou glissez une image ici</p>
                    <span>JPG, PNG ou WebP • Max 5MB</span>
                  </UploadPlaceholder>
                )}
              </CoverUploadZone>
              <HelpText>Une belle image attire plus de membres</HelpText>
            </FormGroup>
            
            {/* Type de salon */}
            <VisibilitySection>
              <Label>Type de salon</Label>
              <VisibilityToggle>
                <VisibilityCard
                  type="button"
                  $active={formData.visibility === 'public'}
                  onClick={(e) => {
                    e.preventDefault();
                    setFormData({...formData, visibility: 'public'})
                  }}
                >
                  <FiGlobe size={24} />
                  <h4>Public</h4>
                  <p>Visible par tous, ouvert à tous</p>
                </VisibilityCard>
                
                <VisibilityCard
                  type="button"
                  $active={formData.visibility === 'private'}
                  onClick={(e) => {
                    e.preventDefault();
                    setFormData({...formData, visibility: 'private'})
                  }}
                >
                  <FiLock size={24} />
                  <h4>Privé</h4>
                  <p>Sur invitation uniquement</p>
                </VisibilityCard>
              </VisibilityToggle>
            </VisibilitySection>
            
            {/* Personnalisation */}
            <CustomizationRow>
              <EmojiSection>
                <Label>Emoji</Label>
                <EmojiGrid>
                  {SUGGESTED_EMOJIS.map(emoji => (
                    <EmojiButton
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({...formData, emoji})}
                      $selected={formData.emoji === emoji}
                    >
                      {emoji}
                    </EmojiButton>
                  ))}
                </EmojiGrid>
              </EmojiSection>
              
              <ColorSection>
                <Label>Couleur thème</Label>
                <ColorGrid>
                  {THEME_COLORS.map(color => (
                    <ColorDot
                      key={color}
                      type="button"
                      $color={color}
                      $selected={formData.themeColor === color}
                      onClick={() => setFormData({...formData, themeColor: color})}
                    />
                  ))}
                </ColorGrid>
              </ColorSection>
            </CustomizationRow>
            
            {/* Description */}
            <FormGroup>
              <Label>Description *</Label>
              <Textarea
                placeholder="Décrivez votre salon : son objectif, les sujets abordés, l'ambiance..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                maxLength={500}
                disabled={creating}
                required
              />
              <HelpText>{formData.description.length}/500 caractères</HelpText>
            </FormGroup>
            
            {/* Catégorie */}
            <FormGroup>
              <Label>Catégorie *</Label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                disabled={creating}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </Select>
            </FormGroup>
            
            {/* Ville */}
            <FormGroup>
              <Label>
                <FiMapPin style={{ display: 'inline', marginRight: '0.25rem' }} />
                Ville (optionnel)
              </Label>
              <Input
                type="text"
                placeholder="Ex: Paris, Lyon, Marseille..."
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                maxLength={50}
                disabled={creating}
              />
            </FormGroup>
            
            {/* Tags */}
            <TagsSection>
              <Label>Mots-clés (aide à la découverte)</Label>
              <TagsInput>
                {formData.tags.map(tag => (
                  <Tag key={tag}>
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)}>×</button>
                  </Tag>
                ))}
                {formData.tags.length < 5 && (
                  <TagInput
                    type="text"
                    placeholder="Ajouter un tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value.toLowerCase())}
                    onKeyPress={handleAddTag}
                    disabled={creating}
                  />
                )}
              </TagsInput>
              <HelpText>
                {formData.tags.length}/5 tags • Appuyez sur Entrée pour ajouter
              </HelpText>
            </TagsSection>
            
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
          </form>
        </MainColumn>
        
        <PreviewColumn>
          <PreviewLabel>Aperçu en temps réel</PreviewLabel>
          <PreviewCard>
            <PreviewCover $url={coverPreview} />
            <PreviewContent>
              <PreviewHeader>
                <PreviewEmoji>{formData.emoji}</PreviewEmoji>
                <PreviewTitle>{formData.name || 'Nom du salon'}</PreviewTitle>
                <PreviewBadge $type={formData.visibility}>
                  {formData.visibility === 'public' ? (
                    <>
                      <FiGlobe size={12} /> Public
                    </>
                  ) : (
                    <>
                      <FiLock size={12} /> Privé
                    </>
                  )}
                </PreviewBadge>
              </PreviewHeader>
              
              <PreviewDescription>
                {formData.description || 'Description du salon...'}
              </PreviewDescription>
              
              <PreviewMeta>
                {formData.city && (
                  <PreviewMetaItem>
                    <FiMapPin size={14} /> {formData.city}
                  </PreviewMetaItem>
                )}
                <PreviewMetaItem>
                  <FiHash size={14} /> {CATEGORIES.find(c => c.value === formData.category)?.label}
                </PreviewMetaItem>
                <PreviewMetaItem>
                  <FiUsers size={14} /> 0 membres
                </PreviewMetaItem>
              </PreviewMeta>
              
              {formData.tags.length > 0 && (
                <PreviewTags>
                  {formData.tags.map(tag => (
                    <PreviewTag key={tag}>#{tag}</PreviewTag>
                  ))}
                </PreviewTags>
              )}
            </PreviewContent>
          </PreviewCard>
        </PreviewColumn>
      </TwoColumnLayout>
    </Container>
  );
}
