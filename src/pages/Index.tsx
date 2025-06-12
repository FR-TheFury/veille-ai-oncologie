
import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import ArticleList from '@/components/ArticleList';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'articles':
        return <ArticleList />;
      case 'trends':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analyse des tendances</h2>
            <p className="text-gray-600">Section en développement - Graphiques et analyses des tendances IA en oncologie</p>
          </div>
        );
      case 'calendar':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Événements et conférences</h2>
            <p className="text-gray-600">Section en développement - Calendrier des événements scientifiques</p>
          </div>
        );
      case 'bookmarks':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Articles favoris</h2>
            <p className="text-gray-600">Section en développement - Vos articles sauvegardés</p>
          </div>
        );
      case 'researchers':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Chercheurs influents</h2>
            <p className="text-gray-600">Section en développement - Profils des chercheurs leaders</p>
          </div>
        );
      case 'datasets':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Datasets publics</h2>
            <p className="text-gray-600">Section en développement - Bases de données ouvertes</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
