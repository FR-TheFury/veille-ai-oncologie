
import { Info, Rss } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

const SimpleHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Rss className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Cancer AI Beacon</h1>
              <p className="text-sm text-gray-600">Veille IA & Oncologie</p>
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
              Flux RSS
            </Button>
            <Button
              variant={location.pathname === '/about' ? 'default' : 'outline'}
              size="sm"
              onClick={() => navigate('/about')}
              className={location.pathname === '/about' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
            >
              <Info className="w-4 h-4 mr-2" />
              À propos
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;
