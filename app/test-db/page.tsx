'use client';

import { useState } from 'react';
import supabase from '@/lib/supabase/client';
import styled from '@emotion/styled';

const Container = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #111827;
  margin-bottom: 24px;
  font-size: 24px;
`;

const Section = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #10B981, #8B5CF6);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-right: 12px;
  margin-bottom: 12px;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Result = styled.pre`
  background: #1f2937;
  color: #10b981;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
  margin-top: 12px;
`;

const ErrorBox = styled.div`
  background: #fee;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
  border: 1px solid #fca5a5;
`;

const SuccessBox = styled.div`
  background: #f0fdf4;
  color: #16a34a;
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
  border: 1px solid #86efac;
`;

export default function TestDB() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<string | null>(null);

  const addResult = (key: string, data: any) => {
    setResults((prev: any) => ({ ...prev, [key]: data }));
  };

  // Test 1: Connexion et authentification
  const testAuth = async () => {
    setLoading('auth');
    try {
      const startTime = Date.now();
      const { data: { user }, error } = await supabase.auth.getUser();
      const duration = Date.now() - startTime;
      
      addResult('auth', {
        success: !error,
        duration,
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.role
        } : null,
        error: error?.message
      });
    } catch (err: any) {
      addResult('auth', { success: false, error: err.message });
    }
    setLoading(null);
  };

  // Test 2: Query simple sur profiles
  const testSimpleQuery = async () => {
    setLoading('simple');
    try {
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .limit(1);
      const duration = Date.now() - startTime;
      
      addResult('simple', {
        success: !error,
        duration,
        count: data?.length || 0,
        data,
        error: error?.message
      });
    } catch (err: any) {
      addResult('simple', { success: false, error: err.message });
    }
    setLoading(null);
  };

  // Test 3: Query avec timeout
  const testWithTimeout = async () => {
    setLoading('timeout');
    try {
      const startTime = Date.now();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout après 3s')), 3000)
      );
      
      const queryPromise = supabase
        .from('profiles')
        .select('id, full_name, status, avatar_url')
        .limit(10);
      
      const result = await Promise.race([queryPromise, timeoutPromise]) as any;
      const duration = Date.now() - startTime;
      
      addResult('timeout', {
        success: !result.error,
        duration,
        count: result.data?.length || 0,
        data: result.data,
        error: result.error?.message
      });
    } catch (err: any) {
      const duration = Date.now() - Date.now();
      addResult('timeout', { 
        success: false, 
        error: err.message,
        duration,
        note: 'Query a timeout ou échoué'
      });
    }
    setLoading(null);
  };

  // Test 4: Vérifier les colonnes
  const testColumns = async () => {
    setLoading('columns');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        const requiredColumns = ['id', 'full_name', 'status', 'last_activity', 'presence_status'];
        const missingColumns = requiredColumns.filter(col => !columns.includes(col));
        
        addResult('columns', {
          success: missingColumns.length === 0,
          existingColumns: columns,
          missingColumns,
          sampleData: data[0],
          error: error?.message
        });
      } else {
        addResult('columns', {
          success: false,
          error: error?.message || 'Aucune donnée trouvée'
        });
      }
    } catch (err: any) {
      addResult('columns', { success: false, error: err.message });
    }
    setLoading(null);
  };

  // Test 5: Performance avec différentes tailles
  const testPerformance = async () => {
    setLoading('performance');
    const tests = [
      { limit: 1, name: '1 row' },
      { limit: 10, name: '10 rows' },
      { limit: 50, name: '50 rows' }
    ];
    
    const results = [];
    
    for (const test of tests) {
      const startTime = Date.now();
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .limit(test.limit);
        
        results.push({
          ...test,
          duration: Date.now() - startTime,
          success: !error,
          count: data?.length || 0
        });
      } catch (err) {
        results.push({
          ...test,
          duration: Date.now() - startTime,
          success: false,
          error: err
        });
      }
    }
    
    addResult('performance', {
      success: results.every(r => r.success),
      tests: results
    });
    setLoading(null);
  };

  return (
    <Container>
      <Title>Test de la base de données</Title>
      <Section>
        <Button onClick={testAuth} disabled={loading === 'auth'}>
          {loading === 'auth' ? 'Chargement...' : '1. Tester l\'authentification'}
        </Button>
        <Button onClick={testSimpleQuery} disabled={loading === 'simple'}>
          {loading === 'simple' ? 'Chargement...' : '2. Tester une query simple'}
        </Button>
        <Button onClick={testWithTimeout} disabled={loading === 'timeout'}>
          {loading === 'timeout' ? 'Chargement...' : '3. Tester avec timeout'}
        </Button>
        <Button onClick={testColumns} disabled={loading === 'columns'}>
          {loading === 'columns' ? 'Chargement...' : '4. Vérifier les colonnes'}
        </Button>
        <Button onClick={testPerformance} disabled={loading === 'performance'}>
          {loading === 'performance' ? 'Chargement...' : '5. Tester la performance'}
        </Button>
      </Section>

      {Object.keys(results).map(key => (
        <Section key={key}>
          <h2>Résultats pour: {key}</h2>
          {results[key].success ? (
            <SuccessBox>Succès</SuccessBox>
          ) : (
            <ErrorBox>Échec</ErrorBox>
          )}
          <Result>{JSON.stringify(results[key], null, 2)}</Result>
        </Section>
      ))}
    </Container>
  );
}
