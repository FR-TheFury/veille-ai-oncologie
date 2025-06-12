
import { TrendingUp, FileText, Calendar, Users, Activity, Brain, Stethoscope, Microscope } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const stats = [
    {
      title: "Articles cette semaine",
      value: "127",
      change: "+12%",
      trend: "up",
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Nouvelles études cliniques",
      value: "18",
      change: "+5%",
      trend: "up",
      icon: Stethoscope,
      color: "text-green-600"
    },
    {
      title: "Brevets déposés",
      value: "34",
      change: "+23%",
      trend: "up",
      icon: Brain,
      color: "text-purple-600"
    },
    {
      title: "Chercheurs actifs",
      value: "2,847",
      change: "+8%",
      trend: "up",
      icon: Users,
      color: "text-teal-600"
    }
  ];

  const recentBreakthroughs = [
    {
      title: "IA pour le diagnostic précoce du cancer du pancréas",
      date: "2024-06-10",
      source: "Nature Medicine",
      category: "Diagnostic",
      impact: "Élevé"
    },
    {
      title: "Algorithme d'apprentissage profond pour la radiothérapie personnalisée",
      date: "2024-06-09",
      source: "The Lancet Oncology",
      category: "Traitement",
      impact: "Élevé"
    },
    {
      title: "Analyse prédictive des réponses aux immunothérapies",
      date: "2024-06-08",
      source: "Science Translational Medicine",
      category: "Recherche",
      impact: "Modéré"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.color}`}>
                  <stat.icon className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphique de tendances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>Tendances de publications - 30 derniers jours</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end space-x-2">
            {Array.from({ length: 30 }, (_, i) => (
              <div
                key={i}
                className="bg-gradient-to-t from-blue-600 to-teal-500 rounded-t flex-1"
                style={{ height: `${Math.random() * 200 + 50}px` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dernières découvertes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Microscope className="w-5 h-5 text-purple-600" />
            <span>Dernières découvertes majeures</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBreakthroughs.map((breakthrough, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{breakthrough.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {breakthrough.date}
                      </span>
                      <span>{breakthrough.source}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {breakthrough.category}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    breakthrough.impact === 'Élevé' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {breakthrough.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
