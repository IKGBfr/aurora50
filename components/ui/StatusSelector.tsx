'use client';

import { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { createClient } from '@/lib/supabase/client';
import { createDevSupabaseClient } from '@/lib/supabase/client-dev';

// Configuration des statuts
export const statusConfig = {
  online: { 
    color: '#10b981', 
    label: 'En ligne', 
    emoji: '🟢',
    bgColor: 'rgba(16, 185, 129, 0.1)'
  },
  busy: { 
    color: '#f59e0b', 
    label: 'Occupée', 
    emoji: '🟡',
    bgColor: 'rgba(245, 158, 11, 0.1)'
  },
  dnd: { 
    color: '#ef4444', 
    label: 'Ne pas déranger', 
    emoji: '🔴',
    bgColor: 'rgba(239, 68, 68, 0.1)'
  },
  offline: { 
    color: '#6b7280', 
    label: 'Hors ligne', 
    emoji: '⚫',
    bgColor: 'rgba(107, 114, 128, 0.1)'
  }
};

export type UserStatus = keyof typeof statusConfig;

const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const StatusButton = styled.button<{ $color: string; $bgColor: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: ${props => props.$bgColor};
  border: 1px solid ${props => props.$color}33;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  
  &:hover {
    background: ${props => props.$color}22;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  .emoji {
    font-size: 16px;
  }
  
  .label {
    @media (max-width: 640px) {
      display: none;
    }
  }
`;

const Dropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 180px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s ease;
  z-index: 1000;
  overflow: hidden;
`;

const StatusOption = styled.button<{ $color: string; $bgColor: string; $isActive: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: ${props => props.$isActive ? props.$bgColor : 'transparent'};
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 14px;
  color: #111827;
  text-align: left;
  
  &:hover {
    background: ${props => props.$bgColor};
  }
  
  .emoji {
    font-size: 18px;
  }
  
  .label {
    flex: 1;
    font-weight: ${props => props.$isActive ? 600 : 400};
  }
  
  .check {
    color: ${props => props.$color};
    font-size: 16px;
    opacity: ${props => props.$isActive ? 1 : 0};
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
`;

interface StatusSelectorProps {
  userId: string;
  initialStatus?: UserStatus;
  onStatusChange?: (status: UserStatus) => void;
}

export default function StatusSelector({ 
  userId, 
  initialStatus = 'offline',
  onStatusChange 
}: StatusSelectorProps) {
  const [status, setStatus] = useState<UserStatus>(initialStatus);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const isDevMode = process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true';
  const supabase = isDevMode ? createDevSupabaseClient() : createClient();
  
  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Charger le statut initial depuis la base de données
  useEffect(() => {
    const loadStatus = async () => {
      if (isDevMode) {
        // En mode dev, utiliser un statut par défaut
        setStatus('online');
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', userId)
          .single();
        
        if (data && data.status) {
          setStatus(data.status as UserStatus);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du statut:', error);
      }
    };
    
    loadStatus();
  }, [userId, supabase, isDevMode]);
  
  // Écouter les changements de statut en temps réel
  useEffect(() => {
    if (isDevMode) return;
    
    const channel = supabase
      .channel(`status-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload: any) => {
          if (payload.new && payload.new.status) {
            setStatus(payload.new.status as UserStatus);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, isDevMode]);
  
  const handleStatusChange = async (newStatus: UserStatus) => {
    if (newStatus === status || isUpdating) return;
    
    setIsUpdating(true);
    setIsOpen(false);
    
    // Mise à jour optimiste
    const oldStatus = status;
    setStatus(newStatus);
    
    if (isDevMode) {
      // En mode dev, simuler un délai
      setTimeout(() => {
        setIsUpdating(false);
        if (onStatusChange) {
          onStatusChange(newStatus);
        }
      }, 300);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          status: newStatus,
          status_updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      // Revenir au statut précédent en cas d'erreur
      setStatus(oldStatus);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const currentConfig = statusConfig[status];
  
  return (
    <Container ref={dropdownRef}>
      <StatusButton
        onClick={() => setIsOpen(!isOpen)}
        $color={currentConfig.color}
        $bgColor={currentConfig.bgColor}
        disabled={isUpdating}
        aria-label="Changer le statut"
      >
        <span className="emoji">{currentConfig.emoji}</span>
        <span className="label">{currentConfig.label}</span>
      </StatusButton>
      
      <Dropdown $isOpen={isOpen}>
        {Object.entries(statusConfig).map(([key, config]) => (
          <StatusOption
            key={key}
            onClick={() => handleStatusChange(key as UserStatus)}
            $color={config.color}
            $bgColor={config.bgColor}
            $isActive={status === key}
          >
            <span className="emoji">{config.emoji}</span>
            <span className="label">{config.label}</span>
            <span className="check">✓</span>
          </StatusOption>
        ))}
      </Dropdown>
    </Container>
  );
}
