import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function usePageScroll() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Liste des pages qui NE sont PAS des chats
    const nonChatPages = [
      '/salons',          // Liste des salons
      '/salons/nouveau'   // Création de salon
    ];
    
    // Un chat est une page /salons/[id] SAUF les pages explicitement exclues
    const isChatPage = pathname?.startsWith('/salons/') && 
                      !nonChatPages.includes(pathname);
    
    if (isChatPage) {
      // CHAT : Bloquer le scroll bounce
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      document.body.setAttribute('data-scroll-locked', 'true');
    } else {
      // AUTRES PAGES : Scroll normal
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
      document.body.removeAttribute('data-scroll-locked');
    }
    
    // Cleanup au démontage ou changement de route
    return () => {
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
      document.body.removeAttribute('data-scroll-locked');
    };
  }, [pathname]);
}