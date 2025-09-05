'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AuthProvider, useAuth } from '@/components/providers/AuthProvider'
import UserMenu from '@/components/layout/UserMenu'
import styled from '@emotion/styled'
import { useResponsiveSidebar, useDeviceType } from '@/lib/hooks/useMediaQuery'
import { devices, heights, zIndex, sidebarSizes } from '@/lib/utils/breakpoints'
import { DevModeIndicator } from '@/components/DevModeIndicator'
import { useAutoPresence } from '@/lib/hooks/useActivityTracker'
import { EmailVerificationOverlay } from 'components/EmailVerificationOverlay'
import { createClient } from 'lib/supabase/client'
import { usePageScroll } from '@/lib/hooks/usePageScroll'
import { StatusProvider } from '@/contexts/StatusContext'

// Container principal
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  position: relative;
  
  @media ${devices.tablet} {
    height: 100vh;
    overflow: hidden;
  }
  
  @media ${devices.laptop} {
    height: 100vh;
    overflow: hidden;
  }
`

// Header Mobile
const MobileHeader = styled.header`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${heights.mobileHeader};
  background: white;
  border-bottom: 1px solid #e5e7eb;
  z-index: ${zIndex.mobileHeader}; // z-index: 90
  padding: 0 1rem;
  align-items: center;
  justify-content: space-between;
  
  @media ${devices.mobile} {
    display: flex;
  }
`

// Bouton Hamburger
const HamburgerButton = styled.button<{ $isOpen: boolean }>`
  width: 44px;
  height: 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  -webkit-tap-highlight-color: transparent;
  
  span {
    width: 24px;
    height: 2px;
    background: #4b5563;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 2px;
    display: block;
  }
  
  ${props => props.$isOpen && `
    span:first-of-type {
      transform: rotate(45deg) translate(5px, 5px);
    }
    span:nth-of-type(2) {
      opacity: 0;
      transform: translateX(-10px);
    }
    span:last-of-type {
      transform: rotate(-45deg) translate(5px, -5px);
    }
  `}
`

// Logo Mobile
const MobileLogo = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  background: linear-gradient(to right, #9333ea, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

// Sidebar Wrapper
const SidebarWrapper = styled.aside<{ $isOpen: boolean; $isMobile: boolean; $isTablet: boolean }>`
  width: ${sidebarSizes.expanded};
  background: linear-gradient(to bottom, #faf5ff, #fdf2f8);
  border-right: 1px solid #e9d5ff;
  height: 100vh;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
  
  @media ${devices.mobile} {
    position: fixed;
    left: 0;
    top: ${heights.mobileHeader};
    height: calc(100vh - ${heights.mobileHeader});
    z-index: 50; // Plus élevé que l'overlay (25) pour mobile
    transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
    box-shadow: ${props => props.$isOpen ? '4px 0 20px rgba(0,0,0,0.1)' : 'none'};
  }
  
  @media ${devices.tablet} {
    width: ${props => props.$isOpen ? sidebarSizes.expanded : sidebarSizes.collapsed};
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    z-index: ${zIndex.sidebar}; // z-index: 30
    
    .sidebar-text {
      opacity: ${props => props.$isOpen ? '1' : '0'};
      display: ${props => props.$isOpen ? 'inline' : 'none'};
      transition: opacity 0.2s;
    }
    
    .nav-label {
      display: ${props => props.$isOpen ? 'block' : 'none'};
    }
  }
  
  @media ${devices.laptop} {
    position: fixed;
    left: 0;
    top: 0;
    width: ${sidebarSizes.expanded};
    height: 100vh;
    overflow-y: auto;
    z-index: ${zIndex.sidebar}; // z-index: 30
    
    .sidebar-text {
      opacity: 1;
      display: inline;
    }
    
    .nav-label {
      display: block;
    }
  }
`

// Overlay pour mobile
const Overlay = styled.div<{ $isVisible: boolean }>`
  display: ${props => props.$isVisible ? 'block' : 'none'};
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: ${zIndex.overlay}; // z-index: 95
  animation: ${props => props.$isVisible ? 'fadeIn 0.3s' : 'none'};
  
  @media ${devices.tablet} {
    display: none;
  }
  
  @media ${devices.laptop} {
    display: none;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`

// Header de la sidebar
const SidebarHeader = styled.div<{ $isCollapsed?: boolean }>`
  padding: 1.5rem;
  text-align: ${props => props.$isCollapsed ? 'center' : 'left'};
  
  @media ${devices.tablet} {
    padding: ${props => props.$isCollapsed ? '1.5rem 0.5rem' : '1.5rem'};
  }
`

// Logo Sidebar
const Logo = styled.h1<{ $isCollapsed?: boolean }>`
  font-size: ${props => props.$isCollapsed ? '1.25rem' : '1.5rem'};
  font-weight: bold;
  background: linear-gradient(to right, #9333ea, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: font-size 0.3s;
  
  @media ${devices.tablet} {
    .full-text {
      display: ${props => props.$isCollapsed ? 'none' : 'inline'};
    }
    
    .short-text {
      display: ${props => props.$isCollapsed ? 'inline' : 'none'};
    }
  }
  
  @media ${devices.laptop} {
    .full-text { display: inline; }
    .short-text { display: none; }
  }
`

// Navigation
const Nav = styled.nav<{ $isCollapsed?: boolean }>`
  padding: 0 1rem 1.5rem;
  
  @media ${devices.tablet} {
    padding: ${props => props.$isCollapsed ? '0 0.5rem 1.5rem' : '0 1rem 1.5rem'};
  }
`

// Lien de navigation
const NavLink = styled(Link, {
  shouldForwardProp: (prop) => prop !== '$isActive' && prop !== '$isCollapsed'
})<{ $isActive: boolean; $isCollapsed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  text-decoration: none;
  min-height: 44px;
  -webkit-tap-highlight-color: transparent;
  
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
  
  @media ${devices.mobile} {
    padding: 1rem;
    font-size: 1rem;
  }
  
  @media ${devices.tablet} {
    justify-content: ${props => props.$isCollapsed ? 'center' : 'flex-start'};
    padding: ${props => props.$isCollapsed ? '0.75rem' : '0.75rem 1rem'};
  }
`

// Icône de navigation
const NavIcon = styled.span`
  font-size: 1.25rem;
  flex-shrink: 0;
`

// Label de navigation
const NavLabel = styled.span`
  font-weight: 500;
`

// Bouton Toggle pour tablette
const ToggleButton = styled.button`
  display: none;
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  @media ${devices.tablet} {
    display: flex;
  }
  
  @media ${devices.laptop} {
    display: none;
  }
`

// Contenu principal
const MainContent = styled.div<{ $sidebarOpen: boolean; $isMobile: boolean; $isTablet: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; // Permet au contenu de se rétrécir si nécessaire
  
  @media ${devices.mobile} {
    margin-left: 0;
    width: 100%;
  }
  
  @media ${devices.tablet} {
    margin-left: ${props => props.$isTablet && props.$sidebarOpen ? sidebarSizes.expanded : props.$isTablet ? sidebarSizes.collapsed : '0'};
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  @media ${devices.laptop} {
    margin-left: ${sidebarSizes.expanded};
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
`

// Header Desktop
const Header = styled.header<{ $isMobile: boolean }>`
  height: ${heights.desktopHeader};
  border-bottom: 1px solid #e5e7eb;
  background: white;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media ${devices.mobile} {
    display: none;
  }
`

// Texte de bienvenue
const WelcomeText = styled.div`
  color: #6b7280;
  
  @media ${devices.mobile} {
    display: none;
  }
  
  @media ${devices.tablet} {
    font-size: 0.875rem;
  }
`

// Actions du header
const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

// Zone principale
const Main = styled.main<{ $isMobile: boolean; $isChat?: boolean }>`
  flex: 1;
  padding: ${props => props.$isChat ? '0' : '1.5rem'};
  background: #f9fafb;
  ${props => props.$isChat && `
    display: flex;
    flex-direction: column;
    height: 100%;
  `}
  
  @media ${devices.mobile} {
    padding: ${props => props.$isChat ? '0' : '1rem'};
    padding-top: ${props => props.$isChat ? '0' : `calc(${heights.mobileHeader} + 1rem)`};
    min-height: 100vh;
  }
  
  @media ${devices.tablet} {
    flex: 1;
    overflow-y: ${props => props.$isChat ? 'hidden' : 'auto'};
    overflow-x: hidden;
    padding: ${props => props.$isChat ? '0' : '1.25rem'};
    padding-top: 0;
  }
  
  @media ${devices.laptop} {
    flex: 1;
    overflow-y: ${props => props.$isChat ? 'hidden' : 'auto'};
    overflow-x: hidden;
    padding: ${props => props.$isChat ? '0' : '1.5rem'};
  }
`

// Container de chargement
const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0fdf4 0%, #fdf4ff 50%, #fef3f2 100%);
`

// Spinner de chargement
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
  const { user, loading: authLoading } = useAuth()
  const { isMobile, isTablet, isDesktop } = useDeviceType()
  const sidebar = useResponsiveSidebar()
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  
  // Activer le tracking d'activité pour la présence automatique
  useAutoPresence()
  
  // Activer la gestion du scroll sélectif par page
  usePageScroll()

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()

        setOnboardingCompleted(profile?.onboarding_completed || false)
      }
      setLoading(false)
    }

    if (!authLoading) {
      checkOnboardingStatus()
    }
  }, [user, authLoading, supabase])
  
  const navItems = [
    { href: '/dashboard', label: 'Tableau de Bord', icon: '🏠' },
    { href: '/salons', label: 'Mes Salons', icon: '💬' },
    { href: '/explorer', label: 'Explorer', icon: '🔍' },
    { href: '/messages', label: 'Messages', icon: '✉️' },
    { href: '/membres', label: 'Membres', icon: '👥' },
    { href: '/profil/moi', label: 'Mon Profil', icon: '👤' },
  ]

  // Gestion du swipe pour ouvrir/fermer la sidebar sur mobile
  useEffect(() => {
    if (!isMobile) return

    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartX(e.touches[0].clientX)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX === null) return
      
      const touchEndX = e.changedTouches[0].clientX
      const swipeDistance = touchEndX - touchStartX
      
      // Swipe right depuis le bord gauche pour ouvrir
      if (swipeDistance > 100 && touchStartX < 50 && !sidebar.isOpen) {
        sidebar.open()
      }
      // Swipe left pour fermer
      else if (swipeDistance < -100 && sidebar.isOpen) {
        sidebar.close()
      }
      
      setTouchStartX(null)
    }

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMobile, sidebar.isOpen, touchStartX])

  // Fermer la sidebar après navigation sur mobile
  useEffect(() => {
    if (isMobile) {
      sidebar.close()
    }
  }, [pathname])

  if (authLoading || loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
      </LoadingContainer>
    )
  }

  return (
    <Container>
      <EmailVerificationOverlay onboardingCompleted={onboardingCompleted} />
      {/* Header Mobile */}
      <MobileHeader>
        <HamburgerButton 
          onClick={sidebar.toggle} 
          $isOpen={sidebar.isOpen}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </HamburgerButton>
        
        <MobileLogo>Aurora50</MobileLogo>
        
        <HeaderActions>
          <UserMenu />
        </HeaderActions>
      </MobileHeader>

      {/* Overlay pour fermer la sidebar sur mobile uniquement */}
      {isMobile && (
        <Overlay 
          $isVisible={sidebar.shouldShowOverlay} 
          onClick={sidebar.close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <SidebarWrapper 
        ref={sidebarRef}
        $isOpen={sidebar.isOpen} 
        $isMobile={isMobile}
        $isTablet={isTablet}
      >
        <SidebarHeader $isCollapsed={isTablet && !sidebar.isOpen}>
          <Logo $isCollapsed={isTablet && !sidebar.isOpen}>
            <span className="full-text">Aurora50</span>
            <span className="short-text">A50</span>
          </Logo>
        </SidebarHeader>
        
        {isTablet && (
          <ToggleButton onClick={sidebar.toggle} aria-label="Toggle sidebar">
            {sidebar.isOpen ? '◀' : '▶'}
          </ToggleButton>
        )}
        
        <Nav $isCollapsed={isTablet && !sidebar.isOpen}>
          {navItems.map(item => (
            <NavLink
              key={item.href}
              href={item.href}
              $isActive={pathname === item.href}
              $isCollapsed={isTablet && !sidebar.isOpen}
              title={isTablet && !sidebar.isOpen ? item.label : undefined}
            >
              <NavIcon>{item.icon}</NavIcon>
              <NavLabel className="nav-label">{item.label}</NavLabel>
            </NavLink>
          ))}
          
          {/* Séparateur */}
          <div style={{ 
            height: '1px', 
            background: 'linear-gradient(to right, transparent, #e9d5ff, transparent)', 
            margin: '1rem 0' 
          }} />
          
          {/* Bouton Créer un salon */}
          <NavLink
            href="/salons/nouveau"
            $isActive={pathname === '/salons/nouveau'}
            $isCollapsed={isTablet && !sidebar.isOpen}
            title={isTablet && !sidebar.isOpen ? 'Créer un salon' : undefined}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 600,
              textAlign: 'center',
              justifyContent: isTablet && !sidebar.isOpen ? 'center' : 'flex-start'
            }}
          >
            <NavIcon>✨</NavIcon>
            <NavLabel className="nav-label">Créer un Salon</NavLabel>
          </NavLink>
        </Nav>
      </SidebarWrapper>

      {/* Contenu principal */}
      <MainContent 
        $sidebarOpen={sidebar.isOpen} 
        $isMobile={isMobile}
        $isTablet={isTablet}
      >
        {!isMobile && pathname !== '/chat' && !pathname.startsWith('/salons/') && (
          <Header $isMobile={isMobile}>
            <WelcomeText>
              Bienvenue dans votre hub de salons privés
            </WelcomeText>
            <HeaderActions>
              <UserMenu />
            </HeaderActions>
          </Header>
        )}

        <Main $isMobile={isMobile} $isChat={pathname === '/chat' || pathname.startsWith('/salons/')}>
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
      <StatusProvider>
        <LMSContent>{children}</LMSContent>
        <DevModeIndicator />
      </StatusProvider>
    </AuthProvider>
  )
}
