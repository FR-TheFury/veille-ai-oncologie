
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
            Back to RSS Feeds
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Our Technological Watch
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Artificial Intelligence in Oncology: A systematic approach to tracking revolutionary innovations for MSPR 4
            </p>
          </div>
        </div>

        {/* Project Context */}
        <Card className="mb-8 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Target className="w-6 h-6 mr-3 text-blue-600" />
              MSPR 4 Project Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed mb-4">
              This technological watch is conducted as part of our MSPR 4 (Professional Situation Methodology and Practice) 
              project. We are 4 developers tasked with monitoring and analyzing the latest advances in AI applications for oncology.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Early Detection</h4>
                <p className="text-sm text-blue-700">AI for automated cancer cell detection</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Personalized Treatment</h4>
                <p className="text-sm text-green-700">Precision medicine based on data analysis</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Accelerated Research</h4>
                <p className="text-sm text-purple-700">AI-driven drug discovery</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Development Team */}
        <Card className="mb-8 border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Users className="w-6 h-6 mr-3 text-green-600" />
              Our Development Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">
              A multidisciplinary team of 4 developers covering technical, medical, and ethical aspects:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Badge className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800">AI Technical Expertise</Badge>
                <Badge className="bg-gradient-to-r from-green-100 to-green-200 text-green-800">Medical Knowledge</Badge>
              </div>
              <div className="space-y-3">
                <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800">Regulatory Analysis</Badge>
                <Badge className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800">Competitive Intelligence</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Watch Methodology */}
        <Card className="mb-8 border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <TrendingUp className="w-6 h-6 mr-3 text-purple-600" />
              Our Methodology
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-600" />
                  Diverse Sources
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>17 RSS feeds</strong> covering 6 categories</li>
                  <li>• <strong>Scientific journals</strong>: Nature, Cell, Science</li>
                  <li>• <strong>Preprints</strong>: arXiv, bioRxiv, medRxiv</li>
                  <li>• <strong>Conferences</strong>: MICCAI, ASCO</li>
                  <li>• <strong>Institutes</strong>: NIH, INSERM</li>
                  <li>• <strong>Tech News</strong>: MIT Tech Review</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                  Systematic Analysis
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• Daily monitoring of <strong>250+ articles/month</strong></li>
                  <li>• Filtering by specialized keywords</li>
                  <li>• Classification by potential impact</li>
                  <li>• Weekly team synthesis meetings</li>
                  <li>• Breakthrough technology alerts</li>
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
              Key Challenges Identified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center text-red-700">
                    <Shield className="w-5 h-5 mr-2" />
                    Ethical Issues
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-sm space-y-1 text-red-600">
                    <li>• Algorithmic bias</li>
                    <li>• Decision transparency</li>
                    <li>• Informed consent</li>
                    <li>• Data protection</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center text-blue-700">
                    <Zap className="w-5 h-5 mr-2" />
                    Technical Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-sm space-y-1 text-blue-600">
                    <li>• Data quality</li>
                    <li>• Interoperability</li>
                    <li>• Clinical validation</li>
                    <li>• Model robustness</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center text-green-700">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-sm space-y-1 text-green-600">
                    <li>• Ultra-early diagnosis</li>
                    <li>• Personalized medicine</li>
                    <li>• Cost reduction</li>
                    <li>• Global accessibility</li>
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
              Emerging Trends 2024
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-2">Multimodal AI</h4>
                  <p className="text-sm text-muted-foreground">
                    Integration of medical imaging, genomic data, and patient histories for holistic diagnosis
                  </p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-2">Foundation Models</h4>
                  <p className="text-sm text-muted-foreground">
                    Pre-trained models adaptable to different cancer types and imaging modalities
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-2">Explainable AI</h4>
                  <p className="text-sm text-muted-foreground">
                    Development of transparent systems for clinician and patient trust
                  </p>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-2">Edge Computing</h4>
                  <p className="text-sm text-muted-foreground">
                    Deployment of embedded AI for real-time analysis during surgical procedures
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-indigo-800">
              Our Watch in Numbers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-indigo-600">17</div>
                <div className="text-sm text-indigo-500">RSS Sources</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">250+</div>
                <div className="text-sm text-purple-500">Articles/month</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">6</div>
                <div className="text-sm text-blue-500">Categories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">4</div>
                <div className="text-sm text-green-500">Developers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MSPR 4 Objectives */}
        <Card className="mb-8 border-l-4 border-l-cyan-500">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Target className="w-6 h-6 mr-3 text-cyan-600" />
              MSPR 4 Learning Objectives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-lg mb-3">Technical Skills</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Information gathering and analysis</li>
                  <li>• Technology trend identification</li>
                  <li>• Critical evaluation of sources</li>
                  <li>• Synthesis and reporting</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-3">Professional Skills</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Team collaboration</li>
                  <li>• Project management</li>
                  <li>• Presentation skills</li>
                  <li>• Strategic thinking</li>
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
            Explore our RSS Feeds
            <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutVeille;
