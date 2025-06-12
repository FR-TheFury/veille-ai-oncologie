
import React from 'react';
import { ArrowLeft, Target, Users, TrendingUp, Lightbulb, Shield, Zap, BarChart3, Globe, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const AboutVeille = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4 hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux flux RSS
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Notre Veille Technologique
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Intelligence Artificielle appliquée à l'Oncologie : Une approche systématique pour suivre les innovations révolutionnaires
            </p>
          </div>
        </div>

        {/* Présentation générale */}
        <Card className="mb-8 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Target className="w-6 h-6 mr-3 text-blue-600" />
              Objectif de notre veille
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed mb-4">
              Notre veille technologique se concentre sur l'intersection entre l'Intelligence Artificielle et l'Oncologie, 
              deux domaines en pleine révolution qui transforment radicalement la prise en charge du cancer.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Diagnostic précoce</h4>
                <p className="text-sm text-blue-700">IA pour la détection automatisée de cellules cancéreuses</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Traitement personnalisé</h4>
                <p className="text-sm text-green-700">Médecine de précision basée sur l'analyse de données</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Recherche accélérée</h4>
                <p className="text-sm text-purple-700">Découverte de nouvelles molécules par IA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Équipe */}
        <Card className="mb-8 border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Users className="w-6 h-6 mr-3 text-green-600" />
              Notre équipe de veille
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">
              Une équipe pluridisciplinaire de 4 personnes couvrant les aspects techniques, médicaux et éthiques :
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Badge className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800">Expertise technique IA</Badge>
                <Badge className="bg-gradient-to-r from-green-100 to-green-200 text-green-800">Connaissances médicales</Badge>
              </div>
              <div className="space-y-3">
                <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800">Analyse réglementaire</Badge>
                <Badge className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800">Veille concurrentielle</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Méthode de veille */}
        <Card className="mb-8 border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <TrendingUp className="w-6 h-6 mr-3 text-purple-600" />
              Notre méthodologie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-600" />
                  Sources diversifiées
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>17 flux RSS</strong> couvrant 6 catégories</li>
                  <li>• <strong>Revues scientifiques</strong> : Nature, Cell, Science</li>
                  <li>• <strong>Prépublications</strong> : arXiv, bioRxiv, medRxiv</li>
                  <li>• <strong>Conférences</strong> : MICCAI, ASCO</li>
                  <li>• <strong>Instituts</strong> : NIH, INSERM</li>
                  <li>• <strong>Actualités</strong> : MIT Tech Review</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                  Analyse systématique
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• Suivi quotidien de <strong>250+ articles/mois</strong></li>
                  <li>• Filtrage par mots-clés spécialisés</li>
                  <li>• Classification par impact potentiel</li>
                  <li>• Synthèses hebdomadaires d'équipe</li>
                  <li>• Alertes sur les breakthrough</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enjeux identifiés */}
        <Card className="mb-8 border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Lightbulb className="w-6 h-6 mr-3 text-orange-600" />
              Enjeux majeurs identifiés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center text-red-700">
                    <Shield className="w-5 h-5 mr-2" />
                    Enjeux éthiques
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-sm space-y-1 text-red-600">
                    <li>• Biais algorithmiques</li>
                    <li>• Transparence des décisions</li>
                    <li>• Consentement éclairé</li>
                    <li>• Protection des données</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center text-blue-700">
                    <Zap className="w-5 h-5 mr-2" />
                    Défis techniques
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-sm space-y-1 text-blue-600">
                    <li>• Qualité des données</li>
                    <li>• Interopérabilité</li>
                    <li>• Validation clinique</li>
                    <li>• Robustesse des modèles</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center text-green-700">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Opportunités
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-sm space-y-1 text-green-600">
                    <li>• Diagnostic ultra-précoce</li>
                    <li>• Médecine personnalisée</li>
                    <li>• Réduction des coûts</li>
                    <li>• Accessibilité globale</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Tendances actuelles */}
        <Card className="mb-8 border-l-4 border-l-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <TrendingUp className="w-6 h-6 mr-3 text-indigo-600" />
              Tendances émergentes 2024
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-2">IA multimodale</h4>
                  <p className="text-sm text-muted-foreground">
                    Intégration d'images médicales, données génomiques et historiques patients pour un diagnostic holistique
                  </p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-2">Foundation Models</h4>
                  <p className="text-sm text-muted-foreground">
                    Modèles pré-entraînés adaptables à différents types de cancers et modalités d'imagerie
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-2">IA explicable</h4>
                  <p className="text-sm text-muted-foreground">
                    Développement de systèmes transparents pour la confiance des cliniciens et patients
                  </p>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-2">Edge Computing</h4>
                  <p className="text-sm text-muted-foreground">
                    Déploiement d'IA embarquée pour l'analyse temps réel lors d'interventions chirurgicales
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <Card className="mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-indigo-800">
              Notre veille en chiffres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-indigo-600">17</div>
                <div className="text-sm text-indigo-500">Sources RSS</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">250+</div>
                <div className="text-sm text-purple-500">Articles/mois</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">6</div>
                <div className="text-sm text-blue-500">Catégories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">24/7</div>
                <div className="text-sm text-green-500">Surveillance</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to action */}
        <div className="text-center">
          <Button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3"
          >
            Découvrir nos flux RSS
            <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutVeille;
