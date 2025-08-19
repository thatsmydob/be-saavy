import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Droplets, 
  Clock, 
  TrendingUp, 
  Star, 
  ChevronRight, 
  Activity,
  Coffee,
  Smile,
  ChevronDown,
  Plus,
  Scan,
  Sparkles,
  Brain,
  AlertCircle,
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { ProductScanner } from './ProductScanner';
import { SimplifiedRecallFlow } from './SimplifiedRecallFlow';
import { Shield, AlertTriangle, ShieldAlert } from 'lucide-react';

import { AIService, SmartInsight } from './services/aiService';
import { cn } from './ui/utils';

interface HomeScreenProps {
  currentTime?: Date;
  parentingStreak?: number;
  recentMilestone?: string;
  onScreenChange?: (screen: string) => void;
}

export function HomeScreen({ 
  currentTime, 
  parentingStreak, 
  recentMilestone, 
  onScreenChange 
}: HomeScreenProps) {
  const [showAllInsights, setShowAllInsights] = useState(false);
  const [showAllActions, setShowAllActions] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showRecallFlow, setShowRecallFlow] = useState(false);
  const [smartInsights, setSmartInsights] = useState<SmartInsight[]>([]);
  const [dailyTip, setDailyTip] = useState('');
  const [recallSummary, setRecallSummary] = useState({ urgent: 0, recent: 0 });
  
  const currentHour = currentTime?.getHours() || new Date().getHours();
  const isNight = currentHour >= 18 || currentHour <= 6;
  const timeOfDay = isNight ? 'evening' : currentHour < 12 ? 'morning' : 'afternoon';
  
  // Load AI insights and recall data on component mount
  useEffect(() => {
    const profile = AIService.getBabyProfile();
    const insights = AIService.generateSmartInsights(profile);
    const tip = AIService.getDailyTip(profile);
    const summary = AIService.getRecallSummary();
    
    setSmartInsights(insights);
    setDailyTip(tip);
    setRecallSummary({ urgent: summary.urgent, recent: summary.recent });
  }, []);

  // Get urgent recalls for home screen integration
  const urgentRecalls = AIService.getUrgentRecalls();
  const hasUrgentRecalls = urgentRecalls.length > 0;
  
  const handleRecallHandled = (recallId: string) => {
    console.log(`Recall ${recallId} handled from HomeScreen`);
    // Update recall summary after handling
    const updatedSummary = AIService.getRecallSummary();
    setRecallSummary({ urgent: updatedSummary.urgent, recent: updatedSummary.recent });
  };

  const todaysStats = [
    { 
      icon: Droplets, 
      value: '6', 
      label: 'Feedings', 
      sublabel: 'Last: 2h ago',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: 'stable'
    },
    { 
      icon: Clock, 
      value: '11h', 
      label: 'Sleep', 
      sublabel: 'Quality: Good',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: 'up'
    },
    { 
      icon: Activity, 
      value: '4', 
      label: 'Activities', 
      sublabel: 'Tummy time',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: 'up'
    },
  ];

  const quickActions = [
    {
      icon: Droplets,
      title: 'Log Feeding',
      subtitle: 'Bottle or breast',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      priority: 'high'
    },
    {
      icon: Moon,
      title: 'Sleep Timer',
      subtitle: 'Start nap/bedtime',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      priority: 'high'
    },
    {
      icon: Scan,
      title: 'Scan Product',
      subtitle: 'Check safety',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      priority: 'high',
      action: () => setShowScanner(true)
    },
    {
      icon: TrendingUp,
      title: 'Milestone',
      subtitle: 'Track development',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      priority: 'medium'
    },
    {
      icon: Star,
      title: 'Ask AI',
      subtitle: 'Get instant help',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      priority: 'medium'
    },
    {
      icon: Coffee,
      title: 'Self-Care',
      subtitle: 'Take a moment',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      priority: 'low'
    }
  ];

  const displayedActions = showAllActions ? quickActions : quickActions.slice(0, 4);
  const displayedInsights = showAllInsights ? smartInsights : smartInsights.slice(0, 2);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'developmental': return '🧠';
      case 'safety': return '🛡️';
      case 'feeding': return '🍎';
      case 'sleep': return '😴';
      case 'wellness': return '💚';
      default: return '💡';
    }
  };

  const getInsightColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-orange-50 via-red-50 to-pink-50';
      case 'medium': return 'from-blue-50 via-indigo-50 to-purple-50';
      case 'low': return 'from-green-50 via-emerald-50 to-teal-50';
      default: return 'from-gray-50 to-slate-50';
    }
  };

  return (
    <div className="p-6 space-y-6 pb-20">
      {/* URGENT RECALL BANNER - Critical Safety Issues */}
      {hasUrgentRecalls && (
        <Alert className="border-red-500 bg-red-50 shadow-lg animate-pulse">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold">URGENT: Product Safety Alert</span>
                <br />
                {urgentRecalls.length} critical recall{urgentRecalls.length === 1 ? '' : 's'} affecting Emma's safety
              </div>
              <Button 
                onClick={() => setShowRecallFlow(true)}
                className="bg-red-600 hover:bg-red-700 text-white ml-4"
                size="sm"
              >
                Handle Now
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* HEADER WITH RECALL NOTIFICATION BADGE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isNight ? (
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Moon className="w-4 h-4 text-purple-600" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Sun className="w-4 h-4 text-yellow-600" />
              </div>
            )}
            <p className="text-muted-foreground">
              Good {timeOfDay}, Sarah
            </p>
          </div>
          
          {/* RECALL NOTIFICATION BADGE */}
          {recallSummary.urgent > 0 && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRecallFlow(true)}
                className="p-2"
              >
                <Shield className="w-6 h-6 text-red-600" />
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {recallSummary.urgent}
                </div>
              </Button>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">
            How's little Emma today?
          </h2>
          <p className="text-muted-foreground text-sm">
            She's 8 months, 2 weeks old and growing beautifully 💕
          </p>
        </div>
      </div>

      {/* Today's Summary - Enhanced Visual Design */}
      <Card className="p-6 bg-gradient-to-br from-calm-blue via-white to-gentle-green border-primary/20 shadow-sm">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Today's Summary</h3>
            <Badge variant="secondary" className="bg-primary-lighter text-primary font-medium px-3 py-1">
              Day {Math.floor((Date.now() - new Date('2024-03-15').getTime()) / (1000 * 60 * 60 * 24))}
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {todaysStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center space-y-3 group cursor-pointer">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-105",
                    stat.bgColor
                  )}>
                    <Icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                    <p className="text-xs font-medium text-foreground">{stat.label}</p>
                    <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* URGENT RECALL INSIGHTS - Integrated into Smart Insights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Smart Insights</h3>
            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
              AI Powered
            </Badge>
          </div>
          {smartInsights.length > 2 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAllInsights(!showAllInsights)}
              className="text-primary hover:text-primary-light"
            >
              {showAllInsights ? 'Show less' : `${smartInsights.length - 2} more`}
              <ChevronDown className={cn(
                "w-4 h-4 ml-1 transition-transform duration-300",
                showAllInsights && "rotate-180"
              )} />
            </Button>
          )}
        </div>
        
        <div className="space-y-3">
          {/* PRIORITY: Show urgent recall insights first */}
          {displayedInsights
            .sort((a, b) => {
              // Safety insights with high priority first
              if (a.type === 'safety' && a.priority === 'high') return -1;
              if (b.type === 'safety' && b.priority === 'high') return 1;
              return 0;
            })
            .map((insight) => (
            <Card key={insight.id} className={cn(
              "p-5 bg-gradient-to-r border-0 shadow-sm hover:shadow-md transition-all duration-300",
              insight.type === 'safety' && insight.priority === 'high' 
                ? 'from-red-50 via-orange-50 to-pink-50 border-red-200' 
                : getInsightColor(insight.priority)
            )}>
              <div className="flex items-start gap-4">
                <div className="text-2xl flex-shrink-0 animate-gentle-bounce">
                  {insight.type === 'safety' && insight.priority === 'high' ? (
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                    </div>
                  ) : (
                    getInsightIcon(insight.type)
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">{insight.title}</h4>
                    {insight.priority === 'high' && insight.type === 'safety' && (
                      <Badge variant="destructive" className="text-xs">
                        Critical
                      </Badge>
                    )}
                    {insight.priority === 'high' && insight.type !== 'safety' && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                        Important
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.content}
                  </p>
                  {insight.actionable && insight.action && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "p-0 h-auto text-sm",
                        insight.type === 'safety' && insight.priority === 'high'
                          ? "text-red-600 hover:text-red-700 font-medium"
                          : "text-primary hover:text-primary-light"
                      )}
                      onClick={() => {
                        if (insight.type === 'safety') {
                          setShowRecallFlow(true);
                        }
                      }}
                    >
                      {insight.action} <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
          {quickActions.length > 4 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAllActions(!showAllActions)}
              className="text-primary hover:text-primary-light"
            >
              {showAllActions ? 'Show less' : `${quickActions.length - 4} more`}
              <ChevronDown className={cn(
                "w-4 h-4 ml-1 transition-transform duration-300",
                showAllActions && "rotate-180"
              )} />
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {displayedActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card 
                key={index} 
                className="p-4 hover:shadow-md transition-all duration-300 cursor-pointer group"
                onClick={action.action}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                    action.bgColor
                  )}>
                    <Icon className={cn("w-5 h-5", action.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate">{action.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{action.subtitle}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Daily Tip */}
      {dailyTip && (
        <Card className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <div className="flex items-start gap-3">
            <div className="text-lg">💡</div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">Today's Tip</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{dailyTip}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Product Scanner Modal */}
      <ProductScanner 
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
      />

      {/* Simplified Recall Flow Modal */}
      <SimplifiedRecallFlow
        isOpen={showRecallFlow}
        onClose={() => setShowRecallFlow(false)}
        onRecallHandled={handleRecallHandled}
      />
    </div>
  );
}