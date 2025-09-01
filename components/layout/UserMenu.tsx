'use client'

import { useState, useRef, useEffect } from 'react'
import styled from '@emotion/styled'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'

const MenuContainer = styled.div`
  position: relative;
`

const AvatarButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  color: white;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
  }
`

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
`

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  min-width: 220px;
  padding: 0.5rem;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s ease-out;
  z-index: 50;
  border: 1px solid rgba(0, 0, 0, 0.05);

  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 16px;
    width: 12px;
    height: 12px;
    background: white;
    transform: rotate(45deg);
    border-left: 1px solid rgba(0, 0, 0, 0.05);
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }
`

const UserInfo = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 0.5rem;
`

const UserName = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`

const UserEmail = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`

const MenuItem = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  background: transparent;
  border: none;
  border-radius: 12px;
  color: #4b5563;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    background: #f9fafb;
    color: #1f2937;
  }

  &:focus {
    outline: none;
    background: #f3f4f6;
  }

  &.danger {
    color: #dc2626;
    
    &:hover {
      background: #fef2f2;
      color: #b91c1c;
    }
  }
`

const MenuIcon = styled.span`
  font-size: 1.1rem;
`

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #8B5CF6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

export default function UserMenu() {
  const { user, signOut, loading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fermer le menu avec Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    setIsOpen(false)
    await signOut()
  }

  const handleNavigation = (path: string) => {
    setIsOpen(false)
    router.push(path)
  }

  return (
    <MenuContainer ref={menuRef}>
      <AvatarButton
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu utilisateur"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Avatar 
          userId={user.id}
          fullName={user.user_metadata?.full_name || user.user_metadata?.name}
          avatarUrl={user.user_metadata?.avatar_url}
          size="small"
        />
      </AvatarButton>

      <DropdownMenu isOpen={isOpen} role="menu">
        <UserInfo>
          <UserName>
            {user.user_metadata?.full_name || user.user_metadata?.name || 'Membre Aurora50'}
          </UserName>
          <UserEmail>{user.email}</UserEmail>
        </UserInfo>

        <MenuItem 
          onClick={() => handleNavigation('/profil/moi')}
          role="menuitem"
        >
          <MenuIcon>🌱</MenuIcon>
          Mon profil
        </MenuItem>

        <MenuItem 
          onClick={() => handleNavigation('/profil/modifier')}
          role="menuitem"
        >
          <MenuIcon>⚙️</MenuIcon>
          Mes paramètres
        </MenuItem>

        <MenuItem 
          onClick={handleSignOut}
          className="danger"
          role="menuitem"
        >
          <MenuIcon>🚪</MenuIcon>
          Me déconnecter
        </MenuItem>
      </DropdownMenu>
    </MenuContainer>
  )
}
