import { createBrowserClient } from '@supabase/ssr';

// Données mockées pour le développement
const MOCK_PROFILE = {
  id: 'dev-user-123',
  full_name: 'Marie Dupont',
  email: 'test@aurora50.dev',
  avatar_url: null,
  cover_url: null,
  bio: 'Passionnée par l\'apprentissage continu et le développement personnel. Je découvre Aurora50 avec enthousiasme ! 🌿',
  created_at: '2024-01-15T10:00:00.000Z',
  updated_at: new Date().toISOString(),
};

const MOCK_USER = {
  id: 'dev-user-123',
  email: 'test@aurora50.dev',
  app_metadata: {},
  user_metadata: { 
    full_name: 'Marie Dupont (Dev)' 
  },
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
  confirmed_at: '2024-01-01T00:00:00.000Z',
  email_confirmed_at: '2024-01-01T00:00:00.000Z',
  phone: '',
  last_sign_in_at: new Date().toISOString(),
  role: 'authenticated',
  updated_at: new Date().toISOString(),
};

export function createDevSupabaseClient() {
  const isDev = process.env.NODE_ENV === 'development' && 
                process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true';

  if (isDev) {
    // Retourner un client mocké pour le développement
    return {
      auth: {
        getUser: async () => ({
          data: {
            user: MOCK_USER
          },
          error: null
        }),
        getSession: async () => ({
          data: {
            session: {
              user: MOCK_USER,
              access_token: 'dev-token',
              refresh_token: 'dev-refresh-token',
              expires_in: 3600,
              expires_at: Date.now() + 3600000,
              token_type: 'bearer'
            }
          },
          error: null
        }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: (callback: any) => {
          // Simuler un changement d'état immédiat
          setTimeout(() => {
            callback('SIGNED_IN', {
              user: MOCK_USER,
              access_token: 'dev-token',
              refresh_token: 'dev-refresh-token',
              expires_in: 3600,
              expires_at: Date.now() + 3600000,
              token_type: 'bearer'
            });
          }, 0);
          
          return {
            data: {
              subscription: {
                unsubscribe: () => {}
              }
            }
          };
        }
      },
      from: (table: string) => ({
        select: (columns?: string) => ({
          eq: (column: string, value: any) => ({
            single: async () => {
              if (table === 'profiles') {
                return { data: MOCK_PROFILE, error: null };
              }
              return { data: null, error: null };
            },
            // Pour les listes
            then: async (callback: any) => {
              if (table === 'profiles') {
                return callback({ data: [MOCK_PROFILE], error: null });
              }
              return callback({ data: [], error: null });
            }
          }),
          single: async () => {
            if (table === 'profiles') {
              return { data: MOCK_PROFILE, error: null };
            }
            return { data: null, error: null };
          },
          then: async (callback: any) => {
            if (table === 'profiles') {
              return callback({ data: [MOCK_PROFILE], error: null });
            }
            return callback({ data: [], error: null });
          }
        }),
        update: (data: any) => ({
          eq: (column: string, value: any) => ({
            select: () => ({
              single: async () => ({ 
                data: { ...MOCK_PROFILE, ...data }, 
                error: null 
              })
            }),
            then: async (callback: any) => {
              return callback({ 
                data: { ...MOCK_PROFILE, ...data }, 
                error: null 
              });
            }
          })
        }),
        insert: (data: any) => ({
          select: () => ({
            single: async () => ({ 
              data: { ...MOCK_PROFILE, ...data }, 
              error: null 
            })
          })
        }),
        upsert: (data: any) => ({
          select: () => ({
            single: async () => ({ 
              data: { ...MOCK_PROFILE, ...data }, 
              error: null 
            })
          })
        })
      }),
      storage: {
        from: (bucket: string) => ({
          upload: async (path: string, file: any) => ({
            data: { path },
            error: null
          }),
          getPublicUrl: (path: string) => ({
            data: {
              publicUrl: `https://fake-storage.supabase.co/storage/v1/object/public/${bucket}/${path}`
            }
          }),
          remove: async (paths: string[]) => ({
            data: paths.map(path => ({ path })),
            error: null
          })
        })
      }
    } as any;
  }

  // En production, utiliser le vrai client
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
