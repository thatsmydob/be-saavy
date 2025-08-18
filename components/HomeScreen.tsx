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
  AlertCircle
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ProductScanner } from './ProductScanner';
import { AIService, SmartInsight } from './services/aiService';
import { cn } from './ui/utils';

export function HomeScreen() {
  const [showAllInsights, setShowAllInsights] = useState(false);
  const [showAllActions, setShowAllActions] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [smartInsights, setSmartInsights] = useState<SmartInsight[]>([]);
  const [dailyTip, setDailyTip] = useState('');
  const [recallSummary, setRecallSummary] = useState({ urgent: 0, recent: 0 });
  
  const currentTime = new Date().getHours();
  const isNight = currentTime >= 18 || currentTime <= 6;
  const timeOfDay = isNight ? 'evening' : currentTime < 12 ? 'morning' : 'afternoon';
  
  // Load AI insights on component mount
  useEffect(() => {
    const profile = AIService.getBabyProfile();
    const insights = AIService.generateSmartInsights(profile);
    const tip = AIService.getDailyTip(profile);
    const summary = AIService.getRecallSummary();
    
    setSmartInsights(insights);
    setDailyTip(tip);
    setRecallSummary({ urgent: summary.urgent, recent: summary.recent });
  }, []);
  
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
      {/* Warm Welcome Section */}
      <div className="space-y-3">
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

      {/* AI-Powered Smart Insights */}
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
          {displayedInsights.map((insight) => (
            <Card key={insight.id} className={cn(
              "p-5 bg-gradient-to-r border-0 shadow-sm hover:shadow-md transition-all duration-300",
              getInsightColor(insight.priority)
            )}>
              <div className="flex items-start gap-4">
                <div className="text-2xl flex-shrink-0 animate-gentle-bounce">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">{insight.title}</h4>
                    {insight.priority === 'high' && (
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
                      className="text-primary hover:text-primary-light p-0 h-auto text-sm"
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

      {/* Safety Alert Summary */}
      {(recallSummary.urgent > 0 || recallSummary.recent > 0) && (
        <Card className="p-4 bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 border-orange-200">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-orange-800">Safety Alerts</h3>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                Product Recalls
              </Badge>
            </div>
            
            <div className="space-y-2">
              {recallSummary.urgent > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      {recallSummary.urgent} urgent recall{recallSummary.urgent === 1 ? '' : 's'}
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-red-600 hover:bg-red-700 text-white text-xs"
                  >
                    Review Now
                  </Button>
                </div>
              )}
              
              {recallSummary.recent > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      {recallSummary.recent} new recall{recallSummary.recent === 1 ? '' : 's'} this week
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-100 text-xs"
                  >
                    View Details
                  </Button>
                </div>
              )}
            </div>
            
            <p className="text-xs text-orange-700 italic">
              💡 Stay informed about product safety to keep Emma protected
            </p>
          </div>
        </Card>
      )}

      {/* Quick Actions - Enhanced with AI Features */}
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
              {showAllActions ? 'Show less' : 'More'}
              <Plus className={cn(
                "w-4 h-4 ml-1 transition-transform duration-300",
                showAllActions && "rotate-45"
              )} />
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {displayedActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card 
                key={index}
                className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group touch-target border-0 bg-white/80 backdrop-blur-sm hover:scale-105 active:scale-95"
                onClick={action.action}
              >
                <div className="space-y-3">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300",
                    action.bgColor,
                    "group-hover:scale-110"
                  )}>
                    <Icon className={cn("w-5 h-5", action.color)} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">{action.title}</h4>
                    <p className="text-xs text-muted-foreground leading-tight">{action.subtitle}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* AI-Generated Daily Tip */}
      <Card className="p-6 bg-gradient-to-br from-warm-coral via-peach-cream to-gentle-green border-0 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">AI Daily Tip</h3>
              <p className="text-xs text-muted-foreground">Personalized for Emma's development</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {dailyTip}
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-orange-700 hover:text-orange-600 p-0 h-auto text-sm font-medium"
          >
            Learn more about this stage <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </Card>

      {/* Encouraging Message */}
      <div className="text-center py-4 space-y-2">
        <p className="text-sm text-muted-foreground italic">
          "You're doing an amazing job, Sarah. Every day with Emma is a gift." 💙
        </p>
      </div>

      {/* Product Scanner Modal */}
      <ProductScanner 
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onProductScanned={(product, assessment) => {
          console.log('Product scanned:', product, assessment);
          // Could trigger notifications or add to inventory
        }}
      />
    </div>
  );
}