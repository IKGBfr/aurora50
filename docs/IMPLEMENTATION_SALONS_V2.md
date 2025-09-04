# 🚀 PLAN D'IMPLÉMENTATION - PIVOT SALONS PRIVÉS AURORA50

## 📝 CONTEXTE DU PIVOT

### Situation Actuelle
- Application LMS avec système de cours (7 piliers)
- 13 utilisateurs en base, tous gratuits
- Chat global fonctionnel avec réactions
- Groupe Facebook de 24 000 membres
- Besoin urgent de monétisation

### Nouveau Concept
**Aurora50 devient une plateforme où les femmes 50+ créent et animent leurs propres salons de discussion privés**, avec un modèle freemium viral.

### Objectifs
1. Permettre aux membres premium de créer des salons privés
2. Générer des liens de partage uniques pour viralité Facebook
3. Monétiser via abonnement 9,90€/mois (100 premières) puis 29,90€
4. Atteindre 500-1000 membres payants en 1 mois

---

## 🗓️ PLANNING GLOBAL

### Phase 1 : Infrastructure (Jours 1-2)
- [ ] Créer les nouvelles tables dans Supabase
- [ ] Mettre en place les policies RLS
- [ ] Créer les fonctions SQL nécessaires
- [ ] Adapter la structure existante

### Phase 2 : MVP Salons (Jours 3-5)
- [ ] Page création de salon
- [ ] Génération de codes uniques
- [ ] Système pour rejoindre via code
- [ ] Adapter le chat pour multi-salons

### Phase 3 : Viralité (Jours 6-7)
- [ ] Landing pages publiques par salon
- [ ] Tracking des invitations
- [ ] Templates de partage Facebook
- [ ] Analytics basiques

### Phase 4 : Monétisation (Jours 8-9)
- [ ] Gate premium pour création
- [ ] Intégration Stripe 9,90€
- [ ] Dashboard créateur
- [ ] Badges fondateurs

### Phase 5 : Polish (Jour 10)
- [ ] Tests complets
- [ ] Optimisations
- [ ] Documentation
- [ ] Préparation lancement

---

## 🗄️ MODIFICATIONS BASE DE DONNÉES

### 1. NOUVELLES TABLES À CRÉER

#### Table `salons`
```sql
-- Table principale des salons
CREATE TABLE salons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informations de base
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('local', 'business', 'wellness', 'hobby', 'dating', 'other')),
  
  -- Localisation (pour matching local Facebook)
  city TEXT,
  department TEXT,
  region TEXT,
  country TEXT DEFAULT 'France',
  
  -- Propriétaire
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Visuels
  avatar_url TEXT,
  banner_url TEXT,
  color_theme TEXT DEFAULT '#8B5CF6',
  
  -- Configuration
  type TEXT DEFAULT 'public' CHECK (type IN ('public', 'private', 'premium')),
  max_members INTEGER DEFAULT 100,
  requires_approval BOOLEAN DEFAULT false,
  
  -- Code unique pour partage viral
  share_code TEXT UNIQUE NOT NULL,
  share_url TEXT GENERATED ALWAYS AS ('https://aurora50.fr/s/' || share_code) STORED,
  
  -- Statistiques
  member_count INTEGER DEFAULT 1,
  message_count INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  
  -- Métadonnées
  settings JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_salons_category ON salons(category);
CREATE INDEX idx_salons_city ON salons(city);
CREATE INDEX idx_salons_share_code ON salons(share_code);
CREATE INDEX idx_salons_owner ON salons(owner_id);
```

#### Table `salon_members`
```sql
CREATE TABLE salon_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Rôles
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
  
  -- Tracking viral
  invited_by UUID REFERENCES auth.users(id),
  invitation_code TEXT,
  joined_via TEXT CHECK (joined_via IN ('direct', 'facebook', 'whatsapp', 'email', 'other')),
  
  -- Engagement
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  messages_sent INTEGER DEFAULT 0,
  
  -- Notifications
  notifications_enabled BOOLEAN DEFAULT true,
  notification_frequency TEXT DEFAULT 'instant',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_muted BOOLEAN DEFAULT false,
  
  UNIQUE(salon_id, user_id)
);

CREATE INDEX idx_salon_members_user ON salon_members(user_id);
CREATE INDEX idx_salon_members_salon ON salon_members(salon_id);
```

#### Table `salon_invitations`
```sql
CREATE TABLE salon_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  
  -- Code unique
  code TEXT UNIQUE NOT NULL,
  short_url TEXT GENERATED ALWAYS AS ('aurora50.fr/i/' || code) STORED,
  
  -- Créateur
  created_by UUID REFERENCES auth.users(id),
  
  -- Tracking
  platform TEXT,
  clicks INTEGER DEFAULT 0,
  signups INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) GENERATED ALWAYS AS 
    (CASE WHEN clicks > 0 THEN (signups::DECIMAL / clicks * 100) ELSE 0 END) STORED,
  
  -- Limites
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  
  -- Meta
  custom_message TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX idx_invitations_code ON salon_invitations(code);
CREATE INDEX idx_invitations_salon ON salon_invitations(salon_id);
```

#### Table `viral_tracking`
```sql
CREATE TABLE viral_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Qui invite qui
  referrer_id UUID REFERENCES auth.users(id),
  referred_id UUID REFERENCES auth.users(id),
  
  -- Source
  salon_id UUID REFERENCES salons(id),
  invitation_code TEXT,
  source_platform TEXT,
  source_url TEXT,
  
  -- Conversion
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  signed_up_at TIMESTAMPTZ,
  converted_to_premium_at TIMESTAMPTZ,
  
  -- Device/Location
  user_agent TEXT,
  ip_country TEXT,
  ip_city TEXT,
  
  UNIQUE(referrer_id, referred_id, salon_id)
);
```

#### Table `facebook_templates`
```sql
CREATE TABLE facebook_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Avec placeholders {{salon_name}}, {{member_count}}
  
  category TEXT,
  use_case TEXT,
  
  -- Performance
  estimated_ctr DECIMAL(5,2),
  times_used INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_signups INTEGER DEFAULT 0,
  
  suggested_images TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer templates de base
INSERT INTO facebook_templates (title, content, category, use_case) VALUES
('Lancement Local', '🌿 J''ai créé un salon privé Aurora50 pour les femmes de {{city}} ! On est déjà {{member_count}} ! Qui nous rejoint ? 💕', 'local', 'launch'),
('Business Network', '💼 Entrepreneuses 50+ ! J''anime un salon privé sur Aurora50. {{member_count}} membres actives. MP pour le lien !', 'business', 'growth'),
('Bien-être', '🧘‍♀️ Salon Yoga & Bien-être 50+ sur Aurora50. Espace bienveillant, {{member_count}} yoginis. Commentez OM pour nous rejoindre !', 'wellness', 'launch');
```

### 2. MODIFICATIONS DES TABLES EXISTANTES

#### Modifier `chat_messages`
```sql
ALTER TABLE chat_messages 
  ADD COLUMN salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  ADD COLUMN is_pinned BOOLEAN DEFAULT false,
  ADD COLUMN pinned_by UUID REFERENCES auth.users(id),
  ADD COLUMN pinned_at TIMESTAMPTZ;

CREATE INDEX idx_messages_salon_created ON chat_messages(salon_id, created_at DESC);
```

#### Modifier `profiles`
```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS current_salon_id UUID REFERENCES salons(id),
  ADD COLUMN IF NOT EXISTS salons_created INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS salons_joined INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_invites_sent INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS interests TEXT[],
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS founder_number INTEGER; -- Position dans les 100 premières
```

#### Modifier `user_activities`
```sql
ALTER TABLE user_activities
  ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);

-- Mettre à jour les types d'activités autorisés
ALTER TABLE user_activities DROP CONSTRAINT IF EXISTS user_activities_type_check;
ALTER TABLE user_activities
  ADD CONSTRAINT user_activities_type_check 
  CHECK (type IN (
    'salon_created', 'salon_joined', 'member_invited',
    'message_sent', 'salon_shared', 'became_premium',
    'module_completed', 'badge_unlocked', 'community_participation',
    'course_started', 'lesson_completed'
  ));
```

### 3. FONCTIONS SQL NÉCESSAIRES

```sql
-- Fonction pour créer un salon avec code unique
CREATE OR REPLACE FUNCTION create_salon_with_code(
  p_name TEXT,
  p_description TEXT,
  p_category TEXT,
  p_city TEXT
) RETURNS salons AS $$
DECLARE
  v_salon salons;
  v_code TEXT;
  v_slug TEXT;
BEGIN
  -- Générer slug et code unique
  v_slug := LOWER(REGEXP_REPLACE(p_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_code := v_slug || '-' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 4);
  
  -- Créer le salon
  INSERT INTO salons (name, slug, description, category, city, owner_id, share_code)
  VALUES (p_name, v_slug, p_description, p_category, p_city, auth.uid(), v_code)
  RETURNING * INTO v_salon;
  
  -- Ajouter le créateur comme owner
  INSERT INTO salon_members (salon_id, user_id, role)
  VALUES (v_salon.id, auth.uid(), 'owner');
  
  -- Incrémenter le compteur dans profiles
  UPDATE profiles 
  SET salons_created = COALESCE(salons_created, 0) + 1
  WHERE id = auth.uid();
  
  -- Logger l'activité
  INSERT INTO user_activities (user_id, type, title, description, metadata)
  VALUES (
    auth.uid(), 
    'salon_created', 
    'Salon créé', 
    'A créé le salon ' || p_name,
    jsonb_build_object('salon_id', v_salon.id, 'salon_name', p_name)
  );
  
  RETURN v_salon;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour rejoindre un salon via code
CREATE OR REPLACE FUNCTION join_salon_via_code(
  p_code TEXT,
  p_invitation_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_salon_id UUID;
  v_salon_name TEXT;
  v_member_count INTEGER;
  v_result JSONB;
BEGIN
  -- Trouver le salon
  SELECT id, name, member_count 
  INTO v_salon_id, v_salon_name, v_member_count 
  FROM salons 
  WHERE share_code = p_code AND is_active = true;
  
  IF v_salon_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Salon introuvable ou inactif');
  END IF;
  
  -- Vérifier si déjà membre
  IF EXISTS (SELECT 1 FROM salon_members WHERE salon_id = v_salon_id AND user_id = auth.uid()) THEN
    RETURN jsonb_build_object('success', true, 'salon_id', v_salon_id, 'already_member', true);
  END IF;
  
  -- Vérifier limite membres (100 pour freemium)
  IF v_member_count >= 100 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Salon complet (limite 100 membres)');
  END IF;
  
  -- Ajouter le membre
  INSERT INTO salon_members (salon_id, user_id, invitation_code)
  VALUES (v_salon_id, auth.uid(), p_code);
  
  -- Mettre à jour les stats
  UPDATE salons 
  SET member_count = member_count + 1,
      last_activity = NOW()
  WHERE id = v_salon_id;
  
  UPDATE profiles 
  SET salons_joined = COALESCE(salons_joined, 0) + 1
  WHERE id = auth.uid();
  
  -- Tracker l'invitation si fournie
  IF p_invitation_id IS NOT NULL THEN
    UPDATE salon_invitations 
    SET uses_count = uses_count + 1,
        signups = signups + 1,
        last_used_at = NOW()
    WHERE id = p_invitation_id;
  END IF;
  
  -- Logger l'activité
  INSERT INTO user_activities (user_id, type, title, description, metadata, salon_id)
  VALUES (
    auth.uid(), 
    'salon_joined', 
    'Salon rejoint', 
    'A rejoint le salon ' || v_salon_name,
    jsonb_build_object('salon_id', v_salon_id, 'via_code', p_code),
    v_salon_id
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'salon_id', v_salon_id,
    'salon_name', v_salon_name,
    'member_count', v_member_count + 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour générer une invitation
CREATE OR REPLACE FUNCTION create_salon_invitation(
  p_salon_id UUID,
  p_platform TEXT DEFAULT 'direct',
  p_custom_message TEXT DEFAULT NULL
) RETURNS salon_invitations AS $$
DECLARE
  v_invitation salon_invitations;
  v_code TEXT;
BEGIN
  -- Vérifier que l'utilisateur est membre/owner du salon
  IF NOT EXISTS (
    SELECT 1 FROM salon_members 
    WHERE salon_id = p_salon_id 
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Non autorisé à créer une invitation pour ce salon';
  END IF;
  
  -- Générer code unique
  v_code := 'INV-' || SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT), 1, 8);
  
  -- Créer l'invitation
  INSERT INTO salon_invitations (
    salon_id, 
    code, 
    created_by, 
    platform, 
    custom_message
  )
  VALUES (
    p_salon_id, 
    v_code, 
    auth.uid(), 
    p_platform, 
    p_custom_message
  )
  RETURNING * INTO v_invitation;
  
  -- Incrémenter compteur invites
  UPDATE profiles 
  SET total_invites_sent = COALESCE(total_invites_sent, 0) + 1
  WHERE id = auth.uid();
  
  RETURN v_invitation;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4. POLICIES RLS

```sql
-- SALONS
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salons publics visibles par tous" ON salons
  FOR SELECT USING (
    type = 'public' 
    OR owner_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM salon_members 
      WHERE salon_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Premium peut créer des salons" ON salons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND subscription_type IN ('premium', 'trial', 'founder')
    )
  );

CREATE POLICY "Owner peut modifier son salon" ON salons
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owner peut supprimer son salon" ON salons
  FOR DELETE USING (owner_id = auth.uid());

-- SALON_MEMBERS
ALTER TABLE salon_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Membres visibles dans le salon" ON salon_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM salon_members sm 
      WHERE sm.salon_id = salon_members.salon_id 
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Peut rejoindre un salon public" ON salon_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM salons 
      WHERE id = salon_id AND type = 'public'
    )
    OR EXISTS (
      SELECT 1 FROM salon_invitations 
      WHERE salon_id = salon_members.salon_id 
      AND (max_uses IS NULL OR uses_count < max_uses)
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- MESSAGES (mise à jour)
CREATE POLICY "Messages visibles aux membres du salon" ON chat_messages
  FOR SELECT USING (
    salon_id IS NULL -- Messages globaux
    OR EXISTS (
      SELECT 1 FROM salon_members 
      WHERE salon_id = chat_messages.salon_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Membres peuvent envoyer des messages" ON chat_messages
  FOR INSERT WITH CHECK (
    salon_id IS NULL -- Chat global
    OR EXISTS (
      SELECT 1 FROM salon_members 
      WHERE salon_id = chat_messages.salon_id 
      AND user_id = auth.uid()
    )
  );
```

### 5. VUES POUR ANALYTICS

```sql
-- Vue pour le dashboard créateur
CREATE OR REPLACE VIEW salon_creator_dashboard AS
SELECT 
  s.id,
  s.name,
  s.share_code,
  s.member_count,
  s.message_count,
  COUNT(DISTINCT m.id) FILTER (WHERE m.created_at > NOW() - INTERVAL '24 hours') as messages_today,
  COUNT(DISTINCT sm.user_id) FILTER (WHERE sm.last_seen_at > NOW() - INTERVAL '24 hours') as active_today,
  COUNT(DISTINCT sm.user_id) FILTER (WHERE sm.last_seen_at > NOW() - INTERVAL '7 days') as active_week,
  COUNT(DISTINCT si.id) as total_invitations,
  SUM(si.clicks) as total_clicks,
  SUM(si.signups) as total_signups_via_invites,
  AVG(si.conversion_rate)::DECIMAL(5,2) as avg_conversion_rate
FROM salons s
LEFT JOIN chat_messages m ON s.id = m.salon_id
LEFT JOIN salon_members sm ON s.id = sm.salon_id
LEFT JOIN salon_invitations si ON s.id = si.salon_id
WHERE s.owner_id = auth.uid()
GROUP BY s.id, s.name, s.share_code, s.member_count, s.message_count;

-- Vue pour les salons populaires
CREATE OR REPLACE VIEW popular_salons AS
SELECT 
  s.*,
  COUNT(DISTINCT sm.user_id) FILTER (WHERE sm.last_seen_at > NOW() - INTERVAL '7 days') as active_members_7d,
  COUNT(DISTINCT m.id) FILTER (WHERE m.created_at > NOW() - INTERVAL '7 days') as messages_7d,
  p.full_name as owner_name,
  p.avatar_url as owner_avatar
FROM salons s
LEFT JOIN salon_members sm ON s.id = sm.salon_id
LEFT JOIN chat_messages m ON s.id = m.salon_id
LEFT JOIN profiles p ON s.owner_id = p.id
WHERE s.is_active = true AND s.type = 'public'
GROUP BY s.id, p.full_name, p.avatar_url
ORDER BY active_members_7d DESC, messages_7d DESC;
```

---

## 💻 IMPLÉMENTATION FRONTEND

### 1. STRUCTURE DES PAGES

#### Pages à créer
- `/salons` - Liste des salons publics (explorer)
- `/salons/nouveau` - Créer un salon (premium only)
- `/salons/[slug]` - Page d'un salon (membres only)
- `/s/[code]` - Landing publique via code de partage
- `/mes-salons` - Gérer ses salons créés
- `/upgrade` - Page de paiement premium

#### Pages à modifier
- `/dashboard` - Orienter vers salons au lieu des cours
- `/chat` - Remplacer par sélecteur de salons
- Navigation - Masquer "Mon Parcours", ajouter "Mes Salons"

### 2. COMPOSANTS CLÉS À CRÉER

```typescript
// components/salons/CreateSalonForm.tsx
interface CreateSalonFormData {
  name: string;
  description: string;
  category: 'local' | 'business' | 'wellness' | 'hobby' | 'dating' | 'other';
  city?: string;
  type: 'public' | 'private';
}

// components/salons/SalonCard.tsx
interface SalonCardProps {
  salon: {
    id: string;
    name: string;
    description: string;
    member_count: number;
    category: string;
    city?: string;
    owner: {
      name: string;
      avatar_url: string;
    };
  };
  onJoin?: () => void;
}

// components/salons/SalonChat.tsx
interface SalonChatProps {
  salonId: string;
  currentUserId: string;
}

// components/salons/InvitationModal.tsx
interface InvitationModalProps {
  salon: Salon;
  onClose: () => void;
}

// components/salons/ShareTemplates.tsx
interface ShareTemplatesProps {
  salon: Salon;
  templates: FacebookTemplate[];
}
```

### 3. HOOKS CUSTOM

```typescript
// hooks/useSalons.ts
export function useSalons() {
  // Liste des salons publics
  // Mes salons
  // Créer un salon
  // Rejoindre un salon
}

// hooks/useSalonMessages.ts
export function useSalonMessages(salonId: string) {
  // Messages temps réel
  // Envoyer message
  // Réactions
}

// hooks/useSalonInvitations.ts
export function useSalonInvitations(salonId: string) {
  // Créer invitation
  // Tracker clicks
  // Analytics
}
```

### 4. FEATURE FLAGS

```typescript
// .env.local
NEXT_PUBLIC_FEATURE_SALONS=true
NEXT_PUBLIC_FEATURE_COURSES=false // Masquer temporairement
NEXT_PUBLIC_FEATURE_VIRAL_TRACKING=true
NEXT_PUBLIC_SALON_MAX_MEMBERS_FREE=100
NEXT_PUBLIC_SALON_MAX_CREATE_FREE=0
NEXT_PUBLIC_SALON_MAX_CREATE_PREMIUM=unlimited
```

---

## 💰 IMPLÉMENTATION MONÉTISATION

### 1. Plans tarifaires

```javascript
const PRICING_PLANS = {
  founder: {
    name: "Fondatrice",
    price: 9.90,
    stripe_price_id: "price_founder_990",
    features: [
      "Créer des salons illimités",
      "200 membres par salon",
      "Analytics avancés",
      "Templates Facebook premium",
      "Badge Fondatrice à vie",
      "Support prioritaire"
    ],
    limit: 100, // Seulement 100 places
    lifetime: true
  },
  premium: {
    name: "Premium",
    price: 29.90,
    stripe_price_id: "price_premium_2990",
    features: [
      "Créer jusqu'à 5 salons",
      "100 membres par salon",
      "Analytics de base",
      "Templates Facebook",
      "Badge Premium"
    ]
  },
  free: {
    name: "Gratuit",
    price: 0,
    features: [
      "Rejoindre 3 salons maximum",
      "10 messages par jour",
      "Profil basique"
    ],
    limitations: [
      "Pas de création de salon",
      "Pas d'analytics",
      "Pas de templates"
    ]
  }
};
```

### 2. Gate Premium

```typescript
// components/PremiumGate.tsx
export function PremiumGate({ children, feature = 'create_salon' }) {
  const { user, subscription } = useAuth();
  
  if (subscription?.type === 'free') {
    return (
      <div className="premium-gate">
        <h2>🌿 Fonctionnalité Premium</h2>
        <p>Créez vos propres salons et animez votre communauté !</p>
        
        <div className="pricing-card">
          <h3>Offre Fondatrice</h3>
          <p className="price">9,90€/mois à vie</p>
          <p className="urgency">⚡ {87}/100 places prises</p>
          
          <StripeCheckoutButton 
            priceId="price_founder_990"
            successUrl="/salons/nouveau"
          />
        </div>
      </div>
    );
  }
  
  return children;
}
```

---

## 📊 TRACKING & ANALYTICS

### 1. Métriques à implémenter

```sql
-- Table pour dashboard metrics
CREATE TABLE salon_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES salons(id),
  date DATE NOT NULL,
  
  -- Métriques quotidiennes
  new_members INTEGER DEFAULT 0,
  active_members INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  invitations_created INTEGER DEFAULT 0,
  invitation_clicks INTEGER DEFAULT 0,
  invitation_signups INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(salon_id, date)
);

-- Fonction pour calculer les métriques
CREATE OR REPLACE FUNCTION calculate_daily_salon_metrics()
RETURNS void AS $$
BEGIN
  INSERT INTO salon_metrics (
    salon_id, 
    date,
    new_members,
    active_members,
    messages_sent,
    invitations_created,
    invitation_clicks,
    invitation_signups
  )
  SELECT 
    s.id,
    CURRENT_DATE,
    COUNT(DISTINCT sm.user_id) FILTER (WHERE sm.joined_at::date = CURRENT_DATE),
    COUNT(DISTINCT sm.user_id) FILTER (WHERE sm.last_seen_at::date = CURRENT_DATE),
    COUNT(DISTINCT m.id) FILTER (WHERE m.created_at::date = CURRENT_DATE),
    COUNT(DISTINCT i.id) FILTER (WHERE i.created_at::date = CURRENT_DATE),
    SUM(i.clicks) FILTER (WHERE i.last_used_at::date = CURRENT_DATE),
    SUM(i.signups) FILTER (WHERE i.last_used_at::date = CURRENT_DATE)
  FROM salons s
  LEFT JOIN salon_members sm ON s.id = sm.salon_id
  LEFT JOIN chat_messages m ON s.id = m.salon_id
  LEFT JOIN salon_invitations i ON s.id = i.salon_id
  GROUP BY s.id
  ON CONFLICT (salon_id, date) 
  DO UPDATE SET
    new_members = EXCLUDED.new_members,
    active_members = EXCLUDED.active_members,
    messages_sent = EXCLUDED.messages_sent,
    invitations_created = EXCLUDED.invitations_created,
    invitation_clicks = EXCLUDED.invitation_clicks,
    invitation_signups = EXCLUDED.invitation_signups;
END;
$$ LANGUAGE plpgsql;
```

### 2. Dashboard Analytics Component

```typescript
// components/analytics/SalonAnalytics.tsx
export function SalonAnalytics({ salonId }: { salonId: string }) {
  const { data: metrics } = useSalonMetrics(salonId);
  
  return (
    <div className="analytics-dashboard">
      <div className="metrics-grid">
        <MetricCard
          title="Membres actifs aujourd'hui"
          value={metrics?.activeToday || 0}
          trend={metrics?.activeTrend}
        />
        <MetricCard
          title="Messages cette semaine"
          value={metrics?.messagesWeek || 0}
          trend={metrics?.messagesTrend}
        />
        <MetricCard
          title="Taux de conversion"
          value={`${metrics?.conversionRate || 0}%`}
          subtitle="Clics → Inscriptions"
        />
        <MetricCard
          title="Viralité (K-Factor)"
          value={metrics?.kFactor || 0}
          subtitle="Chaque membre en amène"
        />
      </div>
      
      <ViralityChart data={metrics?.viralityHistory} />
      <MemberGrowthChart data={metrics?.growthHistory} />
    </div>
  );
}
```

---

## 🚀 ORDRE D'IMPLÉMENTATION DÉTAILLÉ

### Jour 1-2 : Infrastructure Base de Données
1. [ ] Créer toutes les nouvelles tables dans Supabase
2. [ ] Ajouter les colonnes manquantes aux tables existantes
3. [ ] Créer les fonctions SQL (create_salon, join_salon, etc.)
4. [ ] Mettre en place les policies RLS
5. [ ] Créer les vues pour analytics
6. [ ] Tester les fonctions avec des données de test

### Jour 3-4 : Backend & API
1. [ ] Créer les types TypeScript depuis la DB
2. [ ] Implémenter les hooks Supabase pour salons
3. [ ] Adapter le système de messages pour multi-salons
4. [ ] Créer l'API de génération de codes uniques
5. [ ] Implémenter le tracking des invitations

### Jour 5-6 : Frontend MVP
1. [ ] Page création de salon (`/salons/nouveau`)
2. [ ] Page liste des salons (`/salons`)
3. [ ] Page salon individuel (`/salons/[slug]`)
4. [ ] Adapter le chat pour afficher par salon
5. [ ] Navigation entre salons

### Jour 7-8 : Viralité
1. [ ] Landing page publique (`/s/[code]`)
2. [ ] Système d'invitations avec liens uniques
3. [ ] Templates Facebook avec placeholders
4. [ ] Modal de partage avec copy buttons
5. [ ] Tracking des conversions

### Jour 9 : Monétisation
1. [ ] Gate premium sur création de salon
2. [ ] Page upgrade avec pricing
3. [ ] Intégration Stripe checkout
4. [ ] Badges et avantages fondateurs
5. [ ] Limites freemium (3 salons max, etc.)

### Jour 10 : Polish & Tests
1. [ ] Tests end-to-end du flow complet
2. [ ] Optimisation des requêtes
3. [ ] Amélioration UX/UI
4. [ ] Documentation utilisateur
5. [ ] Préparation lancement

---

## 📝 TESTS À EFFECTUER

### Tests Fonctionnels
- [ ] Créer un salon en tant que premium
- [ ] Bloquer création si compte gratuit
- [ ] Générer un lien de partage unique
- [ ] Rejoindre via lien sans compte
- [ ] Inscription et join automatique
- [ ] Limite 100 membres respectée
- [ ] Messages visibles uniquement aux membres
- [ ] Analytics se mettent à jour

### Tests de Performance
- [ ] Chargement des messages < 200ms
- [ ] Switch entre salons < 100ms
- [ ] Realtime sans lag jusqu'à 50 users
- [ ] Dashboard analytics < 500ms

### Tests de Sécurité
- [ ] RLS empêche accès non autorisé
- [ ] Injection SQL impossible
- [ ] Rate limiting sur création
- [ ] Validation des inputs

---

## 🎯 MÉTRIQUES DE SUCCÈS

### Semaine 1
- [ ] 100 salons créés
- [ ] 500 utilisateurs inscrits
- [ ] 50 conversions premium (495€)
- [ ] K-Factor > 1.5

### Mois 1
- [ ] 500 salons actifs
- [ ] 5000 utilisateurs
- [ ] 500 premium (4950€ MRR)
- [ ] 50% des salons ont 10+ membres

### Indicateurs Clés
- Taux de conversion visiteur → inscription : > 30%
- Taux de conversion gratuit → premium : > 10%
- Rétention J7 : > 60%
- Temps moyen par session : > 10 min
- Messages par user actif : > 5/jour

---

## 🐛 TROUBLESHOOTING ANTICIPÉ

### Problèmes Potentiels

1. **"Salon introuvable"**
   - Vérifier que share_code existe
   - Vérifier is_active = true
   - Check RLS policies

2. **Messages n'apparaissent pas**
   - Vérifier salon_id dans requête
   - Check subscription realtime
   - Vérifier RLS sur chat_messages

3. **Limite membres dépassée**
   - Implémenter check côté DB
   - Afficher message clair
   - Proposer upgrade premium

4. **Analytics incorrects**
   - Vérifier cron job métriques
   - Check timezone issues
   - Recompiler vues si nécessaire

---

## 📚 RESSOURCES & DOCUMENTATION

### Pour Cline
- Utiliser Supabase JS Client v2
- Réutiliser les hooks existants quand possible
- Garder la structure de fichiers actuelle
- Commenter le code pour maintenance

### Templates de Code

```typescript
// Template pour créer un salon
const createSalon = async (data: CreateSalonFormData) => {
  const { data: salon, error } = await supabase
    .rpc('create_salon_with_code', {
      p_name: data.name,
      p_description: data.description,
      p_category: data.category,
      p_city: data.city
    });
    
  if (error) throw error;
  return salon;
};

// Template pour rejoindre via code
const joinSalonViaCode = async (code: string) => {
  const { data, error } = await supabase
    .rpc('join_salon_via_code', {
      p_code: code
    });
    
  if (error) throw error;
  if (!data.success) throw new Error(data.error);
  
  return data;
};
```

---

## 🤖 INSTRUCTIONS SPÉCIFIQUES POUR CLINE

### PRINCIPE FONDAMENTAL
**NE PAS RECRÉER LE CHAT - RÉUTILISER L'EXISTANT À 95%**

Le système de chat sur `/chat` est COMPLET avec :
- ✅ Réactions emoji (double-tap pour ❤️)
- ✅ Réponses aux messages avec preview
- ✅ Suppression soft-delete
- ✅ Présence et statuts (online/busy/away)
- ✅ Mentions @ depuis la sidebar
- ✅ Realtime fonctionnel

### CODE À MODIFIER (exemples concrets)

#### 1. useRealtimeChat.ts - AJOUT MINIMAL
```typescript
// AVANT (actuel)
export function useRealtimeChat() {
  const { data: messages } = await supabase
    .from('chat_messages_with_profiles')
    .select('*')
    .order('created_at');
}

// APRÈS (avec salons)
export function useRealtimeChat(salonId?: string) {
  const { data: messages } = await supabase
    .from('chat_messages_with_profiles')
    .select('*')
    .eq(salonId ? 'salon_id' : 'salon_id', salonId || null) // NULL = chat général
    .order('created_at');
    
  // Channel différent par salon
  const channel = salonId ? `salon:${salonId}` : 'chat-room';
}
```

#### 2. ChatRoom.tsx - GARDER 95% DU CODE
```typescript
// AJOUT en haut du fichier
interface ChatRoomProps {
  salonId?: string;
}

// MODIFIER la fonction
export function ChatRoom({ salonId }: ChatRoomProps) {
  // Passer salonId au hook
  const { messages, sendMessage } = useRealtimeChat(salonId);
  
  // NOUVEAU : Info salon si fourni
  const { salon } = useSalon(salonId);
  
  // AJOUTER header salon SI salonId
  {salon && (
    <div className="border-b p-4 bg-gradient-to-r from-emerald-400/10 to-purple-500/10">
      <h2 className="text-xl font-bold">{salon.name}</h2>
      <p className="text-sm opacity-70">{salon.member_count} membres • {salon.city}</p>
    </div>
  )}
  
  // TOUT LE RESTE DU COMPOSANT RESTE IDENTIQUE
  // Ne pas toucher aux réactions, réponses, etc.
}
```

#### 3. Page Salon - WRAPPER SIMPLE
```typescript
// app/(lms)/salons/[salonId]/page.tsx
import { ChatRoom } from '@/components/chat/ChatRoom';
import { MembersSidebar } from '@/components/chat/MembersSidebar';

export default function SalonChatPage({ params }) {
  const { salonId } = params;
  
  // RÉUTILISATION DIRECTE DES COMPOSANTS EXISTANTS
  return (
    <div className="flex h-full">
      <ChatRoom salonId={salonId} />
      <MembersSidebar salonId={salonId} />
    </div>
  );
}
```

### SQL À EXÉCUTER EN PREMIER

```sql
-- 1. Table salons (SIMPLIFIÉE pour MVP)
CREATE TABLE public.salons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  city TEXT,
  owner_id UUID REFERENCES auth.users(id),
  share_code TEXT UNIQUE NOT NULL,
  member_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Membres des salons
CREATE TABLE public.salon_members (
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (salon_id, user_id)
);

-- 3. IMPORTANT : Ajouter salon_id à chat_messages
ALTER TABLE public.chat_messages 
ADD COLUMN salon_id UUID REFERENCES salons(id);

-- 4. Créer un salon "Général" par défaut
INSERT INTO salons (id, name, description, share_code)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Chat Général',
  'Discussion ouverte à tous',
  'general'
);
```

### ORDRE DE DÉVELOPPEMENT RECOMMANDÉ

```bash
# Jour 1 : Base
1. Exécuter le SQL ci-dessus
2. Modifier useRealtimeChat (ajouter param salonId)
3. Tester que /chat fonctionne toujours

# Jour 2 : Salons basiques
4. Créer page /salons (liste)
5. Créer page /salons/nouveau (form simple)
6. Créer page /salons/[salonId] (wrapper ChatRoom)

# Jour 3 : Viral
7. Fonction create_salon_with_code
8. Page /s/[code] (landing publique)
9. Modal partage avec lien

# Jour 4 : Premium
10. Gate création si gratuit
11. Page /upgrade
12. Badge fondateur
```

### PIÈGES À ÉVITER

❌ **NE PAS** :
- Recréer un nouveau système de chat
- Modifier la logique des réactions/réponses
- Changer les styles du ChatRoom
- Toucher au système de présence
- Refactorer le code existant

✅ **FAIRE** :
- Ajouter salonId comme paramètre optionnel
- Créer des wrappers autour de l'existant
- Garder la compatibilité avec /chat (chat général)
- Tester après chaque modification
- Commiter fréquemment

### VALIDATION À CHAQUE ÉTAPE

Après chaque modification, vérifier :
1. `/chat` fonctionne toujours ? ✓
2. Réactions fonctionnent ? ✓
3. Réponses fonctionnent ? ✓
4. Realtime fonctionne ? ✓
5. Présence visible ? ✓

Si quelque chose casse → Rollback immédiat

### EXEMPLE COMPLET : Créer un Salon

```typescript
// lib/actions/salon-actions.ts
export async function createSalon(data: {
  name: string;
  description: string;
  category: string;
  city: string;
}) {
  // Générer code unique
  const code = data.name.toLowerCase().replace(/\s+/g, '-') + 
               '-' + Math.random().toString(36).substr(2, 4);
  
  // Créer le salon
  const { data: salon, error } = await supabase
    .from('salons')
    .insert({
      ...data,
      owner_id: user.id,
      share_code: code
    })
    .select()
    .single();
    
  if (error) throw error;
  
  // Ajouter le créateur comme membre
  await supabase
    .from('salon_members')
    .insert({
      salon_id: salon.id,
      user_id: user.id,
      role: 'owner'
    });
    
  return salon;
}
```

### RÉSULTAT ATTENDU

Après implémentation :
1. Chat général sur `/chat` (actuel, inchangé)
2. Nouveaux salons sur `/salons/[salonId]` (même interface)
3. Création salon sur `/salons/nouveau` (premium)
4. Partage via `aurora50.fr/s/[code]`
5. Tout utilise les MÊMES composants ChatRoom et MembersSidebar