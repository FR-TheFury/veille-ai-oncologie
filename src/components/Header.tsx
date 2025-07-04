
import { Search, Bell, User, Menu, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from '@/components/UserMenu';
import LanguageSelector from '@/components/LanguageSelector';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Simuler des notifications (à remplacer par de vraies données)
  const notifications = [
    { id: 1, title: t('header.notifications.newArticles'), time: t('header.notifications.twoHoursAgo') },
    { id: 2, title: t('header.notifications.feedUpdated'), time: t('header.notifications.fiveHoursAgo') },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et titre */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">{t('header.title')}</h1>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder={t('header.searchPlaceholder')}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Bouton About */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/about')}
              className="flex items-center gap-2 hover:bg-blue-50"
            >
              <Info className="w-4 h-4" />
              {t('header.about')}
            </Button>

            {/* Sélecteur de langue */}
            <LanguageSelector />

            {user ? (
              <>
                {/* Bouton notifications */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="w-4 h-4" />
                      {notifications.length > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                          {notifications.length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm">{t('header.notifications.title')}</h3>
                      {notifications.length > 0 ? (
                        <div className="space-y-2">
                          {notifications.map((notification) => (
                            <div key={notification.id} className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                              <p className="text-sm font-medium">{notification.title}</p>
                              <p className="text-xs text-gray-500">{notification.time}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">{t('header.notifications.empty')}</p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Menu utilisateur */}
                <UserMenu />
              </>
            ) : (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                {t('header.signIn')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
