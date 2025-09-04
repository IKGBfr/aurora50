'use client';

import { useState } from 'react';
import supabase from '@/lib/supabase/client';
import styled from '@emotion/styled';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 30px;
  background: linear-gradient(135deg, #10B981, #8B5CF6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const TestSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TestTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 15px;
  color: #111827;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #10B981, #8B5CF6);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-right: 10px;
  margin-bottom: 10px;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultBox = styled.pre`
  background: #f3f4f6;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 400px;
  overflow-y: auto;
`;

const StatusBadge = styled.span<{ $status: 'success' | 'error' | 'loading' | 'idle' }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 10px;
  
  ${props => {
    switch (props.$status) {
      case 'success':
        return 'background: #10B981; color: white;';
      case 'error':
        return 'background: #EF4444; color: white;';
      case 'loading':
        return 'background: #F59E0B; color: white;';
      default:
        return 'background: #6B7280; color: white;';
    }
  }}
`;

export default function TestSupabaseDebug() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  
  const updateResult = (key: string, data: any) => {
    setResults(prev => ({ ...prev, [key]: data }));
  };
  
  const setLoadingState = (key: string, state: boolean) => {
    setLoading(prev => ({ ...prev, [key]: state }));
  };
  
  // Test 1: Connexion basique
  const testConnection = async () => {
    const key = 'connection';
    setLoadingState(key, true);
    const startTime = Date.now();
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      const duration = Date.now() - startTime;
      
      updateResult(key, {
        success: !error,
        duration: `${duration}ms`,
        user: user ? { id: user.id, email: user.email } : null,
        error: error?.message,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      updateResult(key, {
        success: false,
        error: err.message,
        duration: `${Date.now() - startTime}ms`
      });
    } finally {
      setLoadingState(key, false);
    }
  };
  
  // Test 2: Query profiles avec timeout
  const testProfilesQuery = async () => {
    const key = 'profiles';
    setLoadingState(key, true);
    const startTime = Date.now();
    
    try {
      // Test avec timeout de 5 secondes
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout après 5s')), 5000)
      );
      
      const queryPromise = supabase
        .from('profiles')
        .select('id, full_name, status')
        .limit(10);
      
      const result = await Promise.race([queryPromise, timeoutPromise]) as any;
      const duration = Date.now() - startTime;
      
      if (result.error) {
        throw result.error;
      }
      
      updateResult(key, {
        success: true,
        duration: `${duration}ms`,
        count: result.data?.length || 0,
        data: result.data?.slice(0, 3), // Afficher seulement les 3 premiers
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      updateResult(key, {
        success: false,
        error: err.message,
        duration: `${Date.now() - startTime}ms`,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoadingState(key, false);
    }
  };
  
  // Test 3: Query très légère
  const testLightQuery = async () => {
    const key = 'lightQuery';
    setLoadingState(key, true);
    const startTime = Date.now();
    
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      const duration = Date.now() - startTime;
      
      if (error) throw error;
      
      updateResult(key, {
        success: true,
        duration: `${duration}ms`,
        totalProfiles: count,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      updateResult(key, {
        success: false,
        error: err.message,
        duration: `${Date.now() - startTime}ms`
      });
    } finally {
      setLoadingState(key, false);
    }
  };
  
  // Test 4: Vérifier les colonnes
  const testColumns = async () => {
    const key = 'columns';
    setLoadingState(key, true);
    
    try {
      // Récupérer un seul profil pour voir sa structure
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // Ignorer l'erreur "no rows"
        throw error;
      }
      
      const columns = data ? Object.keys(data) : [];
      const requiredColumns = ['id', 'full_name', 'avatar_url', 'status', 'last_activity', 'is_manual_status', 'presence_status'];
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));
      
      updateResult(key, {
        success: missingColumns.length === 0,
        existingColumns: columns,
        missingColumns,
        sampleData: data ? { ...data, email: '***' } : null, // Masquer l'email
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      updateResult(key, {
        success: false,
        error: err.message
      });
    } finally {
      setLoadingState(key, false);
    }
  };
  
  // Test 5: Realtime subscription
  const testRealtime = async () => {
    const key = 'realtime';
    setLoadingState(key, true);
    
    try {
      const channel = supabase
        .channel('test-channel')
        .on('presence', { event: 'sync' }, () => {
          updateResult(key, {
            success: true,
            status: 'Connected to realtime',
            timestamp: new Date().toISOString()
          });
        })
        .subscribe((status) => {
          updateResult(key, {
            success: status === 'SUBSCRIBED',
            status,
            timestamp: new Date().toISOString()
          });
          
          if (status === 'SUBSCRIBED') {
            // Se désabonner après 2 secondes
            setTimeout(() => {
              channel.unsubscribe();
              setLoadingState(key, false);
            }, 2000);
          }
        });
      
      // Timeout après 10 secondes
      setTimeout(() => {
        if (loading[key]) {
          channel.unsubscribe();
          updateResult(key, {
            success: false,
            error: 'Timeout après 10s',
            timestamp: new Date().toISOString()
          });
          setLoadingState(key, false);
        }
      }, 10000);
    } catch (err: any) {
      updateResult(key, {
        success: false,
        error: err.message
      });
      setLoadingState(key, false);
    }
  };
  
  // Test 6: Performance test
  const testPerformance = async () => {
    const key = 'performance';
    setLoadingState(key, true);
    
    const tests = [
      { name: 'Auth check', fn: () => supabase.auth.getUser() },
      { name: 'Count profiles', fn: () => supabase.from('profiles').select('*', { count: 'exact', head: true }) },
      { name: 'Get 1 profile', fn: () => supabase.from('profiles').select('id, full_name').limit(1) },
      { name: 'Get 10 profiles', fn: () => supabase.from('profiles').select('id, full_name').limit(10) },
      { name: 'Get 50 profiles', fn: () => supabase.from('profiles').select('id, full_name').limit(50) }
    ];
    
    const results: any[] = [];
    
    for (const test of tests) {
      const startTime = Date.now();
      try {
        await test.fn();
        const duration = Date.now() - startTime;
        results.push({
          name: test.name,
          duration: `${duration}ms`,
          status: duration > 3000 ? '⚠️ Lent' : '✅ OK'
        });
      } catch (err) {
        results.push({
          name: test.name,
          duration: `${Date.now() - startTime}ms`,
          status: '❌ Erreur'
        });
      }
    }
    
    updateResult(key, {
      success: true,
      tests: results,
      timestamp: new Date().toISOString()
    });
    
    setLoadingState(key, false);
  };
  
  // Lancer tous les tests
  const runAllTests = async () => {
    await testConnection();
    await testLightQuery();
    await testColumns();
    await testProfilesQuery();
    await testPerformance();
    await testRealtime();
  };
  
  const getStatus = (key: string): 'success' | 'error' | 'loading' | 'idle' => {
    if (loading[key]) return 'loading';
    if (!results[key]) return 'idle';
    return results[key].success ? 'success' : 'error';
  };
  
  return (
    <Container>
      <Title>🔍 Diagnostic Supabase - Debug Complet</Title>
      
      <TestSection>
        <Button onClick={runAllTests} disabled={Object.values(loading).some(l => l)}>
          🚀 Lancer tous les tests
        </Button>
      </TestSection>
      
      <TestSection>
        <TestTitle>
          Test 1: Connexion & Authentification
          <StatusBadge $status={getStatus('connection')}>
            {getStatus('connection')}
          </StatusBadge>
        </TestTitle>
        <Button onClick={testConnection} disabled={loading.connection}>
          Tester la connexion
        </Button>
        {results.connection && (
          <ResultBox>{JSON.stringify(results.connection, null, 2)}</ResultBox>
        )}
      </TestSection>
      
      <TestSection>
        <TestTitle>
          Test 2: Query Profiles (avec timeout)
          <StatusBadge $status={getStatus('profiles')}>
            {getStatus('profiles')}
          </StatusBadge>
        </TestTitle>
        <Button onClick={testProfilesQuery} disabled={loading.profiles}>
          Tester query profiles
        </Button>
        {results.profiles && (
          <ResultBox>{JSON.stringify(results.profiles, null, 2)}</ResultBox>
        )}
      </TestSection>
      
      <TestSection>
        <TestTitle>
          Test 3: Query légère (count only)
          <StatusBadge $status={getStatus('lightQuery')}>
            {getStatus('lightQuery')}
          </StatusBadge>
        </TestTitle>
        <Button onClick={testLightQuery} disabled={loading.lightQuery}>
          Tester query légère
        </Button>
        {results.lightQuery && (
          <ResultBox>{JSON.stringify(results.lightQuery, null, 2)}</ResultBox>
        )}
      </TestSection>
      
      <TestSection>
        <TestTitle>
          Test 4: Vérification des colonnes
          <StatusBadge $status={getStatus('columns')}>
            {getStatus('columns')}
          </StatusBadge>
        </TestTitle>
        <Button onClick={testColumns} disabled={loading.columns}>
          Vérifier les colonnes
        </Button>
        {results.columns && (
          <ResultBox>{JSON.stringify(results.columns, null, 2)}</ResultBox>
        )}
      </TestSection>
      
      <TestSection>
        <TestTitle>
          Test 5: Realtime Connection
          <StatusBadge $status={getStatus('realtime')}>
            {getStatus('realtime')}
          </StatusBadge>
        </TestTitle>
        <Button onClick={testRealtime} disabled={loading.realtime}>
          Tester Realtime
        </Button>
        {results.realtime && (
          <ResultBox>{JSON.stringify(results.realtime, null, 2)}</ResultBox>
        )}
      </TestSection>
      
      <TestSection>
        <TestTitle>
          Test 6: Performance globale
          <StatusBadge $status={getStatus('performance')}>
            {getStatus('performance')}
          </StatusBadge>
        </TestTitle>
        <Button onClick={testPerformance} disabled={loading.performance}>
          Tester les performances
        </Button>
        {results.performance && (
          <ResultBox>{JSON.stringify(results.performance, null, 2)}</ResultBox>
        )}
      </TestSection>
      
      <TestSection style={{ background: '#FEF3C7', borderColor: '#F59E0B' }}>
        <TestTitle>📝 Instructions</TestTitle>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.8 }}>
          <li>Exécutez d'abord le script SQL dans Supabase pour vérifier/ajouter les colonnes manquantes</li>
          <li>Lancez "Test 1" pour vérifier la connexion</li>
          <li>Lancez "Test 4" pour identifier les colonnes manquantes</li>
          <li>Si des colonnes manquent, exécutez le script SQL fourni</li>
          <li>Lancez tous les tests pour un diagnostic complet</li>
          <li>Partagez les résultats pour analyse</li>
        </ol>
      </TestSection>
    </Container>
  );
}
