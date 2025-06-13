
import { Info, Rss, Globe, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSelector from './LanguageSelector';
import UserMenu from './UserMenu';

const SimpleHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('header.title')}</h1>
              <p className="text-sm text-gray-600">{t('header.subtitle')}</p>
            </div>
          </div>
          
          <nav className="flex items-center space-x-2">
            <Button
              variant={location.pathname === '/' ? 'default' : 'outline'}
              size="sm"
              onClick={() => navigate('/')}
              className={location.pathname === '/' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
            >
              <Rss className="w-4 h-4 mr-2" />
              {t('header.rssFeeds')}
            </Button>
            <Button
              variant={location.pathname === '/about' ? 'default' : 'outline'}
              size="sm"
              onClick={() => navigate('/about')}
              className={location.pathname === '/about' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
            >
              <Info className="w-4 h-4 mr-2" />
              {t('header.about')}
            </Button>
            <LanguageSelector />
            
            {!loading && (
              user ? (
                <UserMenu />
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="hover:bg-blue-50 hover:border-blue-300"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Connexion
                </Button>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;
