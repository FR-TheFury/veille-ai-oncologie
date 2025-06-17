
# Documentation Technique - OncIA Watch

## Architecture générale

### Stack technologique

**Frontend**
- **React 18** avec TypeScript
- **Vite** pour le build et le développement
- **Tailwind CSS** pour le styling
- **shadcn/ui** pour les composants UI
- **TanStack Query** pour la gestion d'état et cache
- **React Router** pour la navigation

**Backend**
- **Supabase** (PostgreSQL + Auth + Edge Functions)
- **Row Level Security (RLS)** pour la sécurité
- **PostgreSQL** avec extensions UUID

**Déploiement**
- **GitHub Pages** pour l'hébergement statique
- **GitHub Actions** pour le CI/CD

### Structure du projet

```
src/
├── components/          # Composants React réutilisables
│   ├── ui/             # Composants UI de base (shadcn)
│   ├── Dashboard.tsx   # Tableau de bord principal
│   ├── ArticleList.tsx # Liste des articles
│   └── ...
├── pages/              # Pages de l'application
│   ├── Index.tsx       # Page d'accueil
│   ├── Auth.tsx        # Authentification
│   ├── ResetPassword.tsx # Réinitialisation MDP
│   └── ...
├── hooks/              # Hooks personnalisés
│   ├── useRSSFeeds.ts  # Gestion des flux RSS
│   ├── usePasswordReset.ts # Reset de mot de passe
│   ├── use2FA.ts       # Authentification 2FA
│   └── ...
├── contexts/           # Contextes React
│   └── AuthContext.tsx # Contexte d'authentification
├── integrations/       # Intégrations externes
│   └── supabase/       # Configuration Supabase
└── lib/                # Utilitaires et configurations
```

## Base de données

### Schéma principal

```sql
-- Profils utilisateur
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  totp_enabled BOOLEAN DEFAULT FALSE,
  totp_secret TEXT,
  backup_codes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)

-- Rôles utilisateur
user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  role app_role NOT NULL DEFAULT 'lecteur',
  created_at TIMESTAMP WITH TIME ZONE
)

-- Catégories d'articles
categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)

-- Flux RSS
rss_feeds (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  last_fetched_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  error_message TEXT,
  article_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)

-- Articles
articles (
  id UUID PRIMARY KEY,
  feed_id UUID REFERENCES rss_feeds(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  url TEXT NOT NULL,
  author TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  relevance_score FLOAT DEFAULT 0,
  keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)

-- Logs d'administration
admin_logs (
  id UUID PRIMARY KEY,
  admin_user_id UUID REFERENCES auth.users,
  target_user_id UUID REFERENCES auth.users,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE
)
```

### Sécurité (RLS)

**Politiques par rôle :**
- **Lecteur** : lecture seule sur articles, catégories, flux RSS
- **Admin** : toutes permissions + gestion utilisateurs + logs

**Fonctions de sécurité :**
```sql
-- Vérification des rôles
has_role(_user_id UUID, _role app_role) RETURNS BOOLEAN

-- Création automatique de profil
handle_new_user() RETURNS TRIGGER
```

## Authentification

### Système d'auth Supabase

**Fonctionnalités implémentées :**
- Inscription/connexion par email
- Réinitialisation de mot de passe
- Gestion des sessions
- Profils utilisateur automatiques

**Contexte d'authentification :**
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
}
```

### 2FA (en développement)

**Technologies :**
- `otplib` pour la génération TOTP
- `qrcode` pour les QR codes
- Codes de sauvegarde stockés en base

## Edge Functions

### add-rss-feed

**Endpoint :** `/functions/v1/add-rss-feed`

**Fonctionnalité :**
- Validation de l'URL RSS
- Parsing du flux XML
- Extraction des métadonnées
- Insertion en base avec catégorisation

### fetch-articles

**Endpoint :** `/functions/v1/fetch-articles`

**Fonctionnalité :**
- Récupération des articles d'un flux
- Parsing du contenu XML/RSS
- Calcul du score de pertinence
- Déduplication et insertion

## Hooks personnalisés

### useRSSFeeds

```typescript
// Gestion complète des flux RSS
const {
  // Queries
  data: feeds,
  isLoading,
  error
} = useRSSFeeds();

// Mutations
const addFeed = useAddRSSFeed();
const deleteFeed = useDeleteRSSFeed();
const fetchArticles = useFetchArticles();
```

### usePasswordReset

```typescript
// Gestion reset mot de passe
const {
  requestPasswordReset,
  updatePassword,
  isLoading
} = usePasswordReset();
```

### useUserManagement

```typescript
// Gestion utilisateurs (admin)
const {
  getAllUsers,
  updateUserRole,
  updateUserProfile,
  getAdminLogs,
  isLoading
} = useUserManagement();
```

## Configuration

### Variables d'environnement

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optionnel pour dev local
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Routing

```typescript
// Configuration GitHub Pages
const basename = isGitHubPages ? "/veille-ai-oncologie" : "";

// Routes protégées
<ProtectedRoute>
  <UserManagement />
</ProtectedRoute>
```

## Déploiement

### GitHub Actions

**Workflow automatique :**
1. Build de l'application React
2. Configuration pour GitHub Pages
3. Déploiement sur `gh-pages` branch

### Configuration Supabase

**URLs de redirection :**
- Production : `https://fr-thefury.github.io/veille-ai-oncologie/`
- Reset password : `https://fr-thefury.github.io/veille-ai-oncologie/reset-password`

## Monitoring et logs

### Logs côté client

- Console logs pour le debug
- Toast notifications pour les erreurs utilisateur
- Gestion d'erreur avec TanStack Query

### Logs administrateur

- Table `admin_logs` pour tracer les actions admin
- Détails JSON des modifications
- Horodatage automatique

## Performance

### Optimisations

- **TanStack Query** : cache intelligent des données
- **Lazy loading** : chargement à la demande
- **Memoization** : React.memo pour les composants
- **Index DB** : optimisation des requêtes PostgreSQL

### Métriques clés

- Temps de chargement initial < 3s
- Cache hit ratio > 80%
- Bundle size optimisé avec tree-shaking

## Sécurité

### Mesures implémentées

- **RLS Supabase** : sécurité au niveau base
- **JWT tokens** : authentification sécurisée
- **HTTPS** : chiffrement en transit
- **Validation côté serveur** : Edge Functions
- **Nettoyage URL** : suppression des tokens sensibles

### Bonnes pratiques

- Secrets en variables d'environnement
- Validation des entrées utilisateur
- Gestion des erreurs sans fuite d'information
- Mise à jour régulière des dépendances

## Maintenance

### Mises à jour recommandées

- **Mensuel** : dépendances mineures
- **Trimestriel** : dépendances majeures
- **Selon besoin** : correctifs de sécurité

### Surveillance

- Logs Supabase pour les erreurs backend
- Console navigateur pour les erreurs frontend
- Monitoring des Edge Functions

## API Reference

### Types principaux

```typescript
interface Feed {
  id: string;
  title: string;
  url: string;
  description: string;
  category_id: string;
  status: 'active' | 'inactive' | 'error';
  article_count: number;
}

interface Article {
  id: string;
  feed_id: string;
  title: string;
  summary: string;
  url: string;
  author: string;
  published_at: string;
  relevance_score: number;
  keywords: string[];
}

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: 'admin' | 'manager' | 'lecteur';
}
```
