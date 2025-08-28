'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AuthProvider, useAuth } from '@/components/providers/AuthProvider'
import UserMenu from '@/components/layout/UserMenu'
import styled from '@emotion/styled'

const Container = styled.div`
  min-height: 100vh;
  display: flex;
`

const Sidebar = styled.aside`
  width: 16rem;
  background: linear-gradient(to bottom, #faf5ff, #fdf2f8);
  border-right: 1px solid #e9d5ff;
`

const SidebarHeader = styled.div`
  padding: 1.5rem;
`

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(to right, #9333ea, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const Nav = styled.nav`
  padding: 0 1rem 1.5rem;
`

const NavLink = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  text-decoration: none;
  
  ${props => props.$isActive ? `
    background: white;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    color: #7c3aed;
  ` : `
    color: #4b5563;
    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  `}
`

const NavIcon = styled.span`
  font-size: 1.25rem;
`

const NavLabel = styled.span`
  font-weight: 500;
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`

const Header = styled.header`
  height: 4rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const WelcomeText = styled.div`
  color: #6b7280;
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const Main = styled.main`
  flex: 1;
  padding: 1.5rem;
  background: #f9fafb;
`

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0fdf4 0%, #fdf4ff 50%, #fef3f2 100%);
`

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #8B5CF6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

function LMSContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  
  const navItems = [
    { href: '/dashboard', label: 'Tableau de Bord', icon: '🏠' },
    { href: '/cours', label: 'Mon Parcours', icon: '📚' },
    { href: '/chat', label: 'Salle de Chat', icon: '💬' },
    { href: '/messages', label: 'Messages', icon: '✉️' },
    { href: '/membres', label: 'Membres', icon: '👥' },
    { href: '/profil/moi', label: 'Mon Profil', icon: '👤' },
  ]

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
      </LoadingContainer>
    )
  }

  return (
    <Container>
      <Sidebar>
        <SidebarHeader>
          <Logo>Aurora50 LMS</Logo>
        </SidebarHeader>
        <Nav>
          {navItems.map(item => (
            <NavLink
              key={item.href}
              href={item.href}
              $isActive={pathname === item.href}
            >
              <NavIcon>{item.icon}</NavIcon>
              <NavLabel>{item.label}</NavLabel>
            </NavLink>
          ))}
        </Nav>
      </Sidebar>

      <MainContent>
        <Header>
          <WelcomeText>
            Bienvenue dans votre espace d'apprentissage
          </WelcomeText>
          <HeaderActions>
            <UserMenu />
          </HeaderActions>
        </Header>

        <Main>
          {children}
        </Main>
      </MainContent>
    </Container>
  )
}

export default function LMSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <LMSContent>{children}</LMSContent>
    </AuthProvider>
  )
}
