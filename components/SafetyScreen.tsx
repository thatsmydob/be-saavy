import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Eye, 
  Home, 
  Car, 
  Utensils,
  Scan,
  Brain,
  TrendingUp,
  Clock,
  ShieldAlert,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ProductScanner } from './ProductScanner';
import { SimplifiedRecallFlow } from './SimplifiedRecallFlow';
import { AIService, Product, SafetyAssessment } from './services/aiService';
import { cn } from './ui/utils';

export function SafetyScreen() {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [showRecallFlow, setShowRecallFlow] = useState(false);
  const [recentScans, setRecentScans] = useState<Array<{product: Product, assessment: SafetyAssessment}>>([]);
  const [overallSafetyScore, setOverallSafetyScore] = useState(85);
  const [smartAlertsExpanded, setSmartAlertsExpanded] = useState(true);
  const [checklistExpanded, setChecklistExpanded] = useState(true);

  // AI-generated safety alerts based on baby's development
  const [aiSafetyAlerts, setAiSafetyAlerts] = useState<Array<{
    id: string;
    type: 'warning' | 'info' | 'success';
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    aiGenerated: boolean;
    developmentBased: boolean;
  }>>([]);

  useEffect(() => {
    // Generate AI-powered safety insights based on Emma's development
    const profile = AIService.getBabyProfile();
    const insights = AIService.generateSmartInsights(profile);
    
    const safetyInsights = insights
      .filter(insight => insight.type === 'safety')
      .map(insight => ({
        id: insight.id,
        type: insight.priority === 'high' ? 'warning' as const : 'info' as const,
        title: insight.title,
        message: insight.content,
        priority: insight.priority,
        aiGenerated: true,
        developmentBased: true
      }));

    // Add recall-based alerts
    const urgentRecalls = AIService.getUrgentRecalls();
    if (urgentRecalls.length > 0) {
      safetyInsights.unshift({
        id: 'recalls-urgent',
        type: 'warning' as const,
        title: 'Urgent Product Recalls',
        message: `${urgentRecalls.length} urgent recall${urgentRecalls.length === 1 ? '' : 's'} affecting baby products. Review immediately for Emma's safety.`,
        priority: 'high' as const,
        aiGenerated: true,
        developmentBased: true
      });
    }

    // Add some general safety alerts
    const generalAlerts = [
      {
        id: 'general1',
        type: 'info' as const,
        title: 'Weekly Safety Check',
        message: 'Time for your weekly home safety assessment. Check for new hazards as Emma becomes more mobile.',
        priority: 'medium' as const,
        aiGenerated: false,
        developmentBased: false
      }
    ];

    setAiSafetyAlerts([...safetyInsights, ...generalAlerts]);
  }, []);

  const handleCheckItem = (itemId: string) => {
    setCheckedItems(prev => {
      const newChecked = prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      
      // Update overall safety score based on completed items
      const totalItems = homeChecklist.length + carSafetyItems.length + feedingChecklist.length;
      const completedItems = newChecked.length;
      const newScore = Math.min(95, 60 + (completedItems / totalItems) * 35);
      setOverallSafetyScore(Math.round(newScore));
      
      return newChecked;
    });
  };

  const handleProductScanned = (product: Product, assessment: SafetyAssessment) => {
    setRecentScans(prev => [{product, assessment}, ...prev.slice(0, 2)]);
  };

  const handleRecallHandled = (recallId: string) => {
  console.log(`Recall ${recallId} has been handled`);
  // You can add logic here to update UI, send analytics, etc.
};

  // Enhanced checklists with AI-generated priorities
  const homeChecklist = [
    { 
      id: 'outlet-covers', 
      label: 'Electrical outlet covers installed', 
      category: 'electrical',
      aiPriority: 'high',
      reason: 'Emma is crawling and exploring - electrical safety is critical'
    },
    { 
      id: 'cabinet-locks', 
      label: 'Cabinet and drawer locks secured', 
      category: 'storage',
      aiPriority: 'high',
      reason: 'At 8 months, Emma will soon pull herself up and reach new heights'
    },
    { 
      id: 'corner-guards', 
      label: 'Corner guards on sharp furniture', 
      category: 'furniture',
      aiPriority: 'medium',
      reason: 'Important as Emma becomes more mobile and starts cruising'
    },
    { 
      id: 'stair-gates', 
      label: 'Safety gates at stairs', 
      category: 'mobility',
      aiPriority: 'high',
      reason: 'Essential for preventing falls as crawling improves'
    },
    { 
      id: 'window-locks', 
      label: 'Window locks and guards', 
      category: 'windows',
      aiPriority: 'medium',
      reason: 'Prepare for when Emma can pull to standing'
    },
    { 
      id: 'cord-management', 
      label: 'Blind cords secured/cut short', 
      category: 'cords',
      aiPriority: 'high',
      reason: 'Strangulation hazard - critical for mobile babies'
    }
  ];

  const carSafetyItems = [
    { 
      id: 'car-seat', 
      label: 'Car seat properly installed', 
      category: 'seating',
      aiPriority: 'high',
      reason: 'Foundation of car safety - get it checked by a certified technician'
    },
    { 
      id: 'rear-facing', 
      label: 'Rear-facing until 2 years old', 
      category: 'seating',
      aiPriority: 'high',
      reason: 'AAP recommendation - 5x safer than forward-facing for under 2'
    },
    { 
      id: 'harness-tight', 
      label: 'Harness snug (1 finger rule)', 
      category: 'restraints',
      aiPriority: 'high',
      reason: 'Proper harness fit is crucial for crash protection'
    },
    { 
      id: 'chest-clip', 
      label: 'Chest clip at armpit level', 
      category: 'restraints',
      aiPriority: 'medium',
      reason: 'Ensures harness stays in correct position during impact'
    }
  ];

  const feedingChecklist = [
    { 
      id: 'high-chair', 
      label: 'High chair safety straps used', 
      category: 'equipment',
      aiPriority: 'high',
      reason: 'Emma is learning to self-feed - prevent falls'
    },
    { 
      id: 'food-size', 
      label: 'Food cut to appropriate size', 
      category: 'preparation',
      aiPriority: 'high',
      reason: 'Critical for preventing choking at this developmental stage'
    },
    { 
      id: 'temperature', 
      label: 'Food temperature tested', 
      category: 'preparation',
      aiPriority: 'medium',
      reason: 'Babies are sensitive to temperature changes'
    },
    { 
      id: 'choking-hazards', 
      label: 'No choking hazards present', 
      category: 'hazards',
      aiPriority: 'high',
      reason: 'Remove small items that fit through toilet paper tube'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50';
    if (score >= 70) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className="p-6 space-y-6 pb-20">
      {/* Enhanced Header with AI Safety Score */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl">Safety Hub</h2>
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                AI Powered
              </Badge>
            </div>
            <p className="text-muted-foreground">Intelligent safety guidance for Emma</p>
          </div>
        </div>

        {/* Overall Safety Score */}
        <Card className={cn("p-4", getScoreBgColor(overallSafetyScore))}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">Overall Safety Score</h3>
              <p className="text-xs text-muted-foreground">Based on completed safety checks and AI analysis</p>
            </div>
            <div className="text-right space-y-1">
              <div className={cn("text-2xl font-bold", getScoreColor(overallSafetyScore))}>
                {overallSafetyScore}%
              </div>
              <Progress value={overallSafetyScore} className="w-20 h-2" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Access Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Product Scanner */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Scan className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-foreground truncate">Product Scanner</h3>
                <p className="text-xs text-muted-foreground truncate">AI-powered safety assessment</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowScanner(true)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
            >
              Scan
            </Button>
          </div>
        </Card>

        {/* Product Recalls */}
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-5 h-5 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-foreground truncate">Product Recalls</h3>
                <p className="text-xs text-muted-foreground truncate">Stay updated on safety alerts</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowRecallFlow(true)}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white flex-shrink-0"
            >
              View
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Product Scans */}
      {recentScans.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg">Recent Safety Scans</h3>
          {recentScans.map((scan, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{scan.product.name}</h4>
                  <p className="text-xs text-muted-foreground">{scan.product.brand}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    "text-xs",
                    scan.assessment.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                    scan.assessment.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  )}>
                    {scan.assessment.riskLevel} risk
                  </Badge>
                  <span className="text-sm font-semibold">{scan.assessment.overallScore.toFixed(1)}/5</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* AI Safety Alerts - Collapsible */}
      <Collapsible open={smartAlertsExpanded} onOpenChange={setSmartAlertsExpanded}>
        <Card className="border-2 border-primary/20">
          <CollapsibleTrigger asChild>
            <div className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                  <Brain className="w-5 h-5 text-primary flex-shrink-0" />
                  <h3 className="text-lg font-semibold">Smart Safety Alerts</h3>
                  <Badge variant="secondary" className="bg-primary/10 text-primary text-xs flex-shrink-0">
                    AI Powered
                  </Badge>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {aiSafetyAlerts.length} alert{aiSafetyAlerts.length === 1 ? '' : 's'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    {smartAlertsExpanded ? 'Hide' : 'Show'} alerts
                  </span>
                  {smartAlertsExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              {!smartAlertsExpanded && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {aiSafetyAlerts.slice(0, 3).map((alert) => (
                    <Badge 
                      key={alert.id}
                      variant={alert.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs flex-shrink-0 max-w-[calc(50%-0.25rem)]"
                    >
                      <span className="truncate">
                        {alert.priority === 'high' ? '⚠️' : '💡'} {alert.title}
                      </span>
                    </Badge>
                  ))}
                  {aiSafetyAlerts.length > 3 && (
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      +{aiSafetyAlerts.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              {aiSafetyAlerts.map((alert) => (
                <Alert key={alert.id} className={cn(
                  alert.priority === 'high' ? 'border-orange-200 bg-orange-50' : 
                  alert.type === 'success' ? 'border-green-200 bg-green-50' :
                  'border-blue-200 bg-blue-50'
                )}>
                  <div className="flex items-start gap-2">
                    {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />}
                    {alert.type === 'info' && <Info className="h-4 w-4 text-blue-600 mt-0.5" />}
                    {alert.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />}
                    <div className="flex-1">
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">{alert.title}</h4>
                            <div className="flex gap-1">
                              {alert.aiGenerated && (
                                <Badge variant="outline" className="text-xs">AI</Badge>
                              )}
                              {alert.developmentBased && (
                                <Badge variant="outline" className="text-xs">Development</Badge>
                              )}
                              <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                                {alert.priority}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Enhanced Safety Checklists with AI Insights - Collapsible */}
      <Collapsible open={checklistExpanded} onOpenChange={setChecklistExpanded}>
        <Card className="border-2 border-secondary/20">
          <CollapsibleTrigger asChild>
            <div className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                  <h3 className="text-lg font-semibold">Safety Checklists</h3>
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary text-xs flex-shrink-0">
                    AI Guided
                  </Badge>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {checkedItems.length}/{homeChecklist.length + carSafetyItems.length + feedingChecklist.length} complete
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    {checklistExpanded ? 'Hide' : 'Show'} checklists
                  </span>
                  {checklistExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              {!checklistExpanded && (
                <div className="mt-2">
                  <Progress 
                    value={(checkedItems.length / (homeChecklist.length + carSafetyItems.length + feedingChecklist.length)) * 100} 
                    className="w-full h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete your safety checks to improve Emma's protection
                  </p>
                </div>
              )}
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <Tabs defaultValue="home" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="home" className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Home
                  </TabsTrigger>
                  <TabsTrigger value="car" className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Car
                  </TabsTrigger>
                  <TabsTrigger value="feeding" className="flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    Feeding
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="home" className="space-y-4">
                  <Card className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg">Home Safety Checklist</h4>
                        <Badge variant="outline">
                          {checkedItems.filter(id => homeChecklist.some(item => item.id === id)).length}/{homeChecklist.length}
                        </Badge>
                      </div>
                      
                      <div className="space-y-4">
                        {homeChecklist.map((item) => (
                          <div key={item.id} className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={item.id}
                                checked={checkedItems.includes(item.id)}
                                onCheckedChange={() => handleCheckItem(item.id)}
                              />
                              <label 
                                htmlFor={item.id} 
                                className="text-sm flex-1 cursor-pointer"
                              >
                                {item.label}
                              </label>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs",
                                    item.aiPriority === 'high' ? 'border-red-200 text-red-600' :
                                    item.aiPriority === 'medium' ? 'border-yellow-200 text-yellow-600' :
                                    'border-green-200 text-green-600'
                                  )}
                                >
                                  {item.aiPriority}
                                </Badge>
                                {checkedItems.includes(item.id) && (
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground ml-6 italic">
                              💡 AI Insight: {item.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="car" className="space-y-4">
                  <Card className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg">Car Safety Checklist</h4>
                        <Badge variant="outline">
                          {checkedItems.filter(id => carSafetyItems.some(item => item.id === id)).length}/{carSafetyItems.length}
                        </Badge>
                      </div>
                      
                      <div className="space-y-4">
                        {carSafetyItems.map((item) => (
                          <div key={item.id} className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={item.id}
                                checked={checkedItems.includes(item.id)}
                                onCheckedChange={() => handleCheckItem(item.id)}
                              />
                              <label 
                                htmlFor={item.id} 
                                className="text-sm flex-1 cursor-pointer"
                              >
                                {item.label}
                              </label>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs",
                                    item.aiPriority === 'high' ? 'border-red-200 text-red-600' :
                                    'border-yellow-200 text-yellow-600'
                                  )}
                                >
                                  {item.aiPriority}
                                </Badge>
                                {checkedItems.includes(item.id) && (
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground ml-6 italic">
                              💡 AI Insight: {item.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="feeding" className="space-y-4">
                  <Card className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg">Feeding Safety Checklist</h4>
                        <Badge variant="outline">
                          {checkedItems.filter(id => feedingChecklist.some(item => item.id === id)).length}/{feedingChecklist.length}
                        </Badge>
                      </div>
                      
                      <div className="space-y-4">
                        {feedingChecklist.map((item) => (
                          <div key={item.id} className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={item.id}
                                checked={checkedItems.includes(item.id)}
                                onCheckedChange={() => handleCheckItem(item.id)}
                              />
                              <label 
                                htmlFor={item.id} 
                                className="text-sm flex-1 cursor-pointer"
                              >
                                {item.label}
                              </label>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs",
                                    item.aiPriority === 'high' ? 'border-red-200 text-red-600' :
                                    'border-yellow-200 text-yellow-600'
                                  )}
                                >
                                  {item.aiPriority}
                                </Badge>
                                {checkedItems.includes(item.id) && (
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground ml-6 italic">
                              💡 AI Insight: {item.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Emergency Contacts */}
      <Card className="p-6 border-red-100 bg-red-50">
        <div className="space-y-3">
          <h3 className="text-lg text-red-800">Emergency Contacts</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Pediatrician:</span>
              <span className="text-red-700">(555) 123-4567</span>
            </div>
            <div className="flex justify-between">
              <span>Poison Control:</span>
              <span className="text-red-700">1-800-222-1222</span>
            </div>
            <div className="flex justify-between">
              <span>Emergency:</span>
              <span className="text-red-700">911</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Product Scanner Modal */}
      <ProductScanner 
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onProductScanned={handleProductScanned}
      />

      {/* Product Recalls Modal */}
      <SimplifiedRecallFlow
        isOpen={showRecallFlow}
        onClose={() => setShowRecallFlow(false)}
        onRecallHandled={handleRecallHandled}
      />
    </div>
  );
}