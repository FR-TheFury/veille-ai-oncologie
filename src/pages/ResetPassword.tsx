
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Globe, RefreshCw, AlertCircle } from 'lucide-react';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { updatePassword, isLoading } = usePasswordReset();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [hasValidToken, setHasValidToken] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Vérifier les paramètres d'erreur dans l'URL (format #error=...)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorParam = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        
        if (errorParam) {
          if (errorParam === 'access_denied' && errorDescription?.includes('expired')) {
            setTokenError('Le lien de réinitialisation a expiré. Veuillez demander un nouveau lien.');
          } else {
            setTokenError('Le lien de réinitialisation est invalide. Veuillez demander un nouveau lien.');
          }
          setInitializing(false);
          return;
        }

        // Vérifier si on a des tokens dans l'URL
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // Utiliser les tokens pour établir la session
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Error setting session:', error);
            setTokenError('Erreur lors de l\'authentification. Veuillez demander un nouveau lien.');
          } else if (data.session) {
            setHasValidToken(true);
            // Nettoyer l'URL des tokens pour des raisons de sécurité
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            setTokenError('Session invalide. Veuillez demander un nouveau lien.');
          }
        } else {
          setTokenError('Aucun token de réinitialisation trouvé. Veuillez utiliser le lien depuis votre email.');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setTokenError('Erreur lors de l\'initialisation. Veuillez réessayer.');
      } finally {
        setInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!hasValidToken) {
      setError('Token de réinitialisation invalide');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    const { error } = await updatePassword(password);
    if (!error) {
      navigate('/');
    }
  };

  const handleRequestNewLink = () => {
    navigate('/auth');
  };

  // Écran de chargement pendant l'initialisation
  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Vérification du lien...</span>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">OncIA Watch</h1>
              <p className="text-sm text-gray-600">Réinitialisation du mot de passe</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                Lien expiré
              </CardTitle>
              <CardDescription>
                Le lien de réinitialisation n'est plus valide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {tokenError}
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleRequestNewLink}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Demander un nouveau lien
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">OncIA Watch</h1>
            <p className="text-sm text-gray-600">Réinitialisation du mot de passe</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nouveau mot de passe</CardTitle>
            <CardDescription>
              Entrez votre nouveau mot de passe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                disabled={isLoading || !hasValidToken}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  'Mettre à jour le mot de passe'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/auth')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Retour à la connexion
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
