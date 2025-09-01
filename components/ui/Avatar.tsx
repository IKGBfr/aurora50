'use client'

import styled from '@emotion/styled'
import { useState } from 'react'

interface AvatarProps {
  userId: string
  fullName?: string | null
  size?: 'small' | 'medium' | 'large'
  className?: string
  avatarUrl?: string | null
}

const AvatarImage = styled.img<{ $size: string }>`
  width: ${props => props.$size};
  height: ${props => props.$size};
  border-radius: 50%;
  background-color: #f3f4f6;
  object-fit: cover;
`

const AvatarFallback = styled.div<{ $size: string }>`
  width: ${props => props.$size};
  height: ${props => props.$size};
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: ${props => {
    if (props.$size === '32px') return '14px';
    if (props.$size === '48px') return '18px';
    return '24px';
  }};
`

export default function Avatar({ userId, fullName, size = 'medium', className, avatarUrl }: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  
  const sizeMap = {
    small: '32px',
    medium: '48px',
    large: '64px'
  }
  
  // Si un avatar uploadé existe, l'utiliser en priorité
  if (avatarUrl && !imageError) {
    return (
      <AvatarImage
        src={avatarUrl}
        alt={fullName || 'Avatar'}
        $size={sizeMap[size]}
        className={className}
        onError={() => setImageError(true)}
      />
    )
  }
  
  // Générer une seed stable basée sur l'userId
  const seed = userId || 'default'
  const avatarUrl2 = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
  
  // Fonction pour obtenir les initiales en cas d'erreur
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '??'
    const words = name.trim().split(' ').filter(w => w.length > 0)
    if (words.length >= 2) {
      return words[0][0].toUpperCase() + words[1][0].toUpperCase()
    } else if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase()
    }
    return '??'
  }
  
  if (imageError) {
    // Fallback aux initiales si DiceBear échoue
    return (
      <AvatarFallback $size={sizeMap[size]} className={className}>
        {getInitials(fullName)}
      </AvatarFallback>
    )
  }
  
  return (
    <AvatarImage
      src={avatarUrl2}
      alt={fullName || 'Avatar'}
      $size={sizeMap[size]}
      className={className}
      onError={() => setImageError(true)}
    />
  )
}
