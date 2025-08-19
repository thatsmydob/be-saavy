import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Shield, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Heart,
  Sparkles,
  ArrowRight,
  Star,
  Calendar,
  Award
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  recommendationService, 
  DailyInsights as DailyInsightsType,
  SmartRecommendation,
  BabyProfile 
} from './services/recommendationService';
import { recallService } from './services/recallService';
import { cn } from './ui/utils';

interface DailyInsightsProps {
  babyProfile: BabyProfile;
  onRecommendationClick: (recommendation: SmartRecommendation) => void;
}

export function DailyInsights({ babyProfile, onRecommendationClick }: DailyInsightsProps) {
  const [insights, setInsights] = useState<DailyInsightsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRec, setExpandedRec] = useState<string | null>(null);

  useEffect(() => {
    loadDailyInsights();
  }, [babyProfile]);

  const loadDailyInsights = async () => {
    try {
      setIsLoading(true);
      
      // Initialize services with sample data
      await recallService.fetchLatestRecalls();
      
      // Generate personalized insights
      const dailyInsights = await recommendationService.generateDailyInsights(babyProfile);
      setInsights(dailyInsights);
      
    } catch (error) {
      console.error('Failed to load daily insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'safety_alert': return <Shield className="w-5 h-5" />;
      case 'product_recommendation': return <Star className="w-5 h-5" />;
      case 'price_alert': return <DollarSign className="w-5 h-5" />;
      case 'milestone_guidance': return <TrendingUp className="w-5 h-5" />;
      case 'budget_tip': return <Target className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getBudgetHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'needs_attention': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your personalized insights...</p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <Alert>
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          Unable to load daily insights. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date and Baby Age */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Daily Insights</h1>
              <p className="text-gray-600">{formatDate(insights.date)}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">
                {insights.babyAge}
              </div>
              <p className="text-sm text-gray-500">months old</p>
            </div>
          </div>

          {/* Daily Tip */}
          <div className="mt-6 p-4 bg-white/50 rounded-lg">
            <div className="flex items-start">
              <Sparkles className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Today's Parenting Tip</h3>
                <p className="text-gray-700">{insights.todaysTip}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Scores Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-700">Safety Score</h3>
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold text-gray-900">{insights.safetyScore}/100</div>
              <Progress value={insights.safetyScore} className="h-2 mt-1" />
            </div>
            <p className="text-xs text-gray-600">
              {insights.safetyScore >= 90 ? 'Excellent safety practices!' :
               insights.safetyScore >= 70 ? 'Good, with room for improvement' :
               'Needs attention - check recommendations'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-700">Budget Health</h3>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="mb-2">
              <div className={cn('text-lg font-bold capitalize', getBudgetHealthColor(insights.budgetHealth))}>
                {insights.budgetHealth.replace('_', ' ')}
              </div>
            </div>
            <p className="text-xs text-gray-600">
              Smart spending recommendations available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-700">Active Recommendations</h3>
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold text-gray-900">{insights.recommendations.length}</div>
            </div>
            <p className="text-xs text-gray-600">
              {insights.urgentActions.length} urgent actions needed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Actions */}
      {insights.urgentActions.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="font-semibold text-red-900">Urgent Actions Required</h3>
            </div>
            
            <div className="space-y-3">
              {insights.urgentActions.map((action) => (
                <div key={action.id} className="flex items-start justify-between bg-white/50 p-3 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900 mb-1">{action.title}</h4>
                    <p className="text-sm text-red-800">{action.description}</p>
                  </div>
                  {action.actionable && (
                    <Button 
                      size="sm" 
                      className="ml-3"
                      onClick={() => onRecommendationClick(action)}
                    >
                      {action.actionText}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Milestones */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <Award className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Upcoming Milestones</h3>
          </div>
          
          <div className="space-y-2">
            {insights.nextMilestones.map((milestone, index) => (
              <div key={index} className="flex items-center">
                <div className="w-2 h-2 bg-purple-300 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">{milestone}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Smart Recommendations */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Personalized Recommendations</h3>
            <Badge variant="secondary">{insights.recommendations.length} items</Badge>
          </div>

          <div className="space-y-3">
            {insights.recommendations.slice(0, 5).map((rec) => (
              <div 
                key={rec.id} 
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <div className={cn('p-2 rounded-lg mr-3', getPriorityColor(rec.priority))}>
                      {getRecommendationIcon(rec.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{rec.title}</h4>
                        <Badge 
                          className={cn('text-xs', getPriorityColor(rec.priority))}
                          variant="secondary"
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                      
                      {rec.estimatedSavings && (
                        <div className="flex items-center text-xs text-green-600">
                          <DollarSign className="w-3 h-3 mr-1" />
                          Save ${rec.estimatedSavings}
                        </div>
                      )}

                      {expandedRec === rec.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-700 mb-2">
                            <strong>Why this matters:</strong> {rec.reasoning}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>Sources: {rec.sources.join(', ')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {rec.actionable && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRecommendationClick(rec);
                      }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <Target className="w-3 h-3 mr-1" />
                    Relevance: {rec.relevanceScore}/100
                  </div>
                  
                  {rec.expiresAt && (
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Expires: {new Date(rec.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {insights.recommendations.length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                View All {insights.recommendations.length} Recommendations
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}