// Breakpoints pour le design responsive
export const breakpoints = {
  mobile: '640px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1280px',
  wide: '1536px'
} as const

// Media queries prédéfinies
export const devices = {
  mobile: `(max-width: ${breakpoints.tablet})`,
  tablet: `(min-width: ${breakpoints.tablet}) and (max-width: ${breakpoints.laptop})`,
  laptop: `(min-width: ${breakpoints.laptop})`,
  desktop: `(min-width: ${breakpoints.desktop})`,
  wide: `(min-width: ${breakpoints.wide})`
} as const

// Tailles de sidebar
export const sidebarSizes = {
  mobile: '280px',
  collapsed: '80px',
  expanded: '280px'
} as const

// Hauteurs
export const heights = {
  mobileHeader: '60px',
  desktopHeader: '64px'
} as const

// Z-index layers
export const zIndex = {
  mobileHeader: 90,    // Header principal mobile
  salonHeader: 80,     // Header du salon - sous le header mobile
  mobileSidebar: 100,  // Sidebar membres
  overlay: 25,         // Overlay SOUS la sidebar pour mobile
  dropdown: 60,
  sidebar: 30          // Sidebar principale
} as const
