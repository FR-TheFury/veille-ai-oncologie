
import { Home, FileText, TrendingUp, Calendar, Settings, Bookmark, Users, Brain, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'articles', label: 'Articles', icon: FileText },
    { id: 'trends', label: 'Tendances', icon: TrendingUp },
    { id: 'calendar', label: 'Événements', icon: Calendar },
    { id: 'bookmarks', label: 'Favoris', icon: Bookmark },
    { id: 'researchers', label: 'Chercheurs', icon: Users },
    { id: 'datasets', label: 'Datasets', icon: Database },
  ];

  const categories = [
    { name: 'Diagnostic IA', count: 234, color: 'bg-blue-500' },
    { name: 'Traitement personnalisé', count: 189, color: 'bg-green-500' },
    { name: 'Imagerie médicale', count: 156, color: 'bg-purple-500' },
    { name: 'Génomique', count: 143, color: 'bg-teal-500' },
    { name: 'Radiothérapie', count: 98, color: 'bg-orange-500' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Navigation principale */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === item.id 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "hover:bg-gray-100"
              }`}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Catégories */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              Catégories
            </h3>
            <div className="space-y-3">
              {categories.map((category, index) => (
                <div key={index} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Cette semaine</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nouveaux articles</span>
                <span className="font-medium">127</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Articles lus</span>
                <span className="font-medium">34</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Favoris ajoutés</span>
                <span className="font-medium">8</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paramètres */}
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="w-4 h-4 mr-3" />
          Paramètres
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
