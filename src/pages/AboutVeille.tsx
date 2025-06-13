
import React from 'react';
import { ArrowLeft, Target, Users, TrendingUp, Lightbulb, Shield, Zap, BarChart3, Globe, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DynamicStats from '@/components/DynamicStats';

const AboutVeille = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
            {t('about.backToFeeds')}
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {t('about.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('about.subtitle')}
            </p>
          </div>
        </div>

        {/* Project Context */}
        <Card className="mb-8 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Target className="w-6 h-6 mr-3 text-blue-600" />
              {t('about.projectContext.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed mb-4">
              {t('about.projectContext.description')}
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">{t('about.projectContext.areas.earlyDetection.title')}</h4>
                <p className="text-sm text-blue-700">{t('about.projectContext.areas.earlyDetection.description')}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">{t('about.projectContext.areas.personalizedTreatment.title')}</h4>
                <p className="text-sm text-green-700">{t('about.projectContext.areas.personalizedTreatment.description')}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">{t('about.projectContext.areas.acceleratedResearch.title')}</h4>
                <p className="text-sm text-purple-700">{t('about.projectContext.areas.acceleratedResearch.description')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Development Team */}
        <Card className="mb-8 border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Users className="w-6 h-6 mr-3 text-green-600" />
              {t('about.team.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">
              {t('about.team.description')}
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Badge className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800">{t('about.team.expertise.technical')}</Badge>
                <Badge className="bg-gradient-to-r from-green-100 to-green-200 text-green-800">{t('about.team.expertise.medical')}</Badge>
              </div>
              <div className="space-y-3">
                <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800">{t('about.team.expertise.regulatory')}</Badge>
                <Badge className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800">{t('about.team.expertise.competitive')}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Watch Methodology */}
        <Card className="mb-8 border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <TrendingUp className="w-6 h-6 mr-3 text-purple-600" />
              {t('about.methodology.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-600" />
                  {t('about.methodology.sources.title')}
                </h4>
                <ul className="space-y-2 text-sm">
                  {t('about.methodology.sources.items', { returnObjects: true }).map((item: string, index: number) => (
                    <li key={index}>• <strong>{item.split(':')[0]}:</strong> {item.split(':')[1]}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                  {t('about.methodology.analysis.title')}
                </h4>
                <ul className="space-y-2 text-sm">
                  {t('about.methodology.analysis.items', { returnObjects: true }).map((item: string, index: number) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Challenges Identified */}
        <Card className="mb-8 border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Lightbulb className="w-6 h-6 mr-3 text-orange-600" />
              {t('about.challenges.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center text-red-700">
                    <Shield className="w-5 h-5 mr-2" />
                    {t('about.challenges.ethical.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-sm space-y-1 text-red-600">
                    {t('about.challenges.ethical.items', { returnObjects: true }).map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center text-blue-700">
                    <Zap className="w-5 h-5 mr-2" />
                    {t('about.challenges.technical.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-sm space-y-1 text-blue-600">
                    {t('about.challenges.technical.items', { returnObjects: true }).map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center text-green-700">
                    <BookOpen className="w-5 h-5 mr-2" />
                    {t('about.challenges.opportunities.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-sm space-y-1 text-green-600">
                    {t('about.challenges.opportunities.items', { returnObjects: true }).map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Emerging Trends */}
        <Card className="mb-8 border-l-4 border-l-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <TrendingUp className="w-6 h-6 mr-3 text-indigo-600" />
              {t('about.trends.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-2">{t('about.trends.multimodal.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('about.trends.multimodal.description')}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-2">{t('about.trends.foundation.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('about.trends.foundation.description')}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-2">{t('about.trends.explainable.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('about.trends.explainable.description')}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-2">{t('about.trends.edge.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('about.trends.edge.description')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics - Dynamic */}
        <Card className="mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-indigo-800">
              {t('about.stats.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DynamicStats />
          </CardContent>
        </Card>

        {/* MSPR 4 Objectives */}
        <Card className="mb-8 border-l-4 border-l-cyan-500">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Target className="w-6 h-6 mr-3 text-cyan-600" />
              {t('about.objectives.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-lg mb-3">{t('about.objectives.technical.title')}</h4>
                <ul className="space-y-2 text-sm">
                  {t('about.objectives.technical.items', { returnObjects: true }).map((item: string, index: number) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-3">{t('about.objectives.professional.title')}</h4>
                <ul className="space-y-2 text-sm">
                  {t('about.objectives.professional.items', { returnObjects: true }).map((item: string, index: number) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
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
            {t('about.cta')}
            <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutVeille;
