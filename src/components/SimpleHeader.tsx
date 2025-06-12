
import { Rss } from 'lucide-react';

const SimpleHeader = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Rss className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Veille IA Oncologie</h1>
            <p className="text-sm text-gray-600">Suivi des flux RSS spécialisés</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;
