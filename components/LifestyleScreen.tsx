import React from 'react';
import { Heart, Moon, Utensils, Activity, Users, Sparkles, Clock, Target } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function LifestyleScreen() {
  const parentWellnessData = {
    sleep: { hours: 6.5, target: 8, percentage: 81 },
    selfCare: { activities: 3, target: 5, percentage: 60 },
    stress: { level: 'Moderate', color: 'yellow' },
    support: { score: 85, status: 'Good' }
  };

  const babyWellnessData = {
    sleep: { hours: 12, target: 14, percentage: 86 },
    nutrition: { meals: 6, target: 6, percentage: 100 },
    activity: { minutes: 45, target: 60, percentage: 75 },
    development: { score: 92, status: 'Excellent' }
  };

  const recommendations = [
    {
      category: 'Sleep',
      icon: Moon,
      title: 'Bedtime routine optimization',
      description: 'Try a calming bath 30 minutes before bedtime to help Emma wind down.',
      priority: 'high',
      timeToImplement: '3 days'
    },
    {
      category: 'Nutrition',
      icon: Utensils,
      title: 'Iron-rich foods',
      description: 'Introduce iron-fortified cereals and pureed meats to support development.',
      priority: 'medium',
      timeToImplement: '1 week'
    },
    {
      category: 'Activity',
      icon: Activity,
      title: 'Tummy time variety',
      description: 'Add textured surfaces and toys during tummy time for sensory development.',
      priority: 'medium',
      timeToImplement: 'Today'
    },
    {
      category: 'Parent Care',
      icon: Heart,
      title: 'Mindfulness practice',
      description: 'Take 10 minutes for guided meditation during Emma\'s nap time.',
      priority: 'high',
      timeToImplement: 'Today'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-pink-500" />
          <h2 className="text-2xl">Wellness Hub</h2>
        </div>
        <p className="text-muted-foreground">Holistic care for Emma and you</p>
      </div>

      {/* Wellness Overview */}
      <Tabs defaultValue="baby" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="baby">Emma's Wellness</TabsTrigger>
          <TabsTrigger value="parent">Your Wellness</TabsTrigger>
        </TabsList>

        <TabsContent value="baby" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-purple-500" />
                  <h4 className="text-sm">Sleep Quality</h4>
                </div>
                <div className="space-y-2">
                  <Progress value={babyWellnessData.sleep.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {babyWellnessData.sleep.hours}h of {babyWellnessData.sleep.target}h target
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-500" />
                  <h4 className="text-sm">Nutrition</h4>
                </div>
                <div className="space-y-2">
                  <Progress value={babyWellnessData.nutrition.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {babyWellnessData.nutrition.meals} feeds today
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <h4 className="text-sm">Activity</h4>
                </div>
                <div className="space-y-2">
                  <Progress value={babyWellnessData.activity.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {babyWellnessData.activity.minutes}min active play
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <h4 className="text-sm">Development</h4>
                </div>
                <div className="space-y-2">
                  <Progress value={babyWellnessData.development.score} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {babyWellnessData.development.status} progress
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="parent" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-purple-500" />
                  <h4 className="text-sm">Sleep Quality</h4>
                </div>
                <div className="space-y-2">
                  <Progress value={parentWellnessData.sleep.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {parentWellnessData.sleep.hours}h of {parentWellnessData.sleep.target}h target
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-500" />
                  <h4 className="text-sm">Self-Care</h4>
                </div>
                <div className="space-y-2">
                  <Progress value={parentWellnessData.selfCare.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {parentWellnessData.selfCare.activities} of {parentWellnessData.selfCare.target} activities
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <h4 className="text-sm">Stress Level</h4>
                </div>
                <div className="space-y-2">
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    {parentWellnessData.stress.level}
                  </Badge>
                  <p className="text-xs text-muted-foreground">Based on recent patterns</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <h4 className="text-sm">Support Network</h4>
                </div>
                <div className="space-y-2">
                  <Progress value={parentWellnessData.support.score} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {parentWellnessData.support.status} connections
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg">Personalized Recommendations</h3>
        
        <div className="space-y-3">
          {recommendations.map((rec, index) => {
            const Icon = rec.icon;
            return (
              <Card key={index} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm">{rec.title}</h4>
                      <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Implement in {rec.timeToImplement}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Daily Affirmation */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg">Today's Affirmation</h3>
          </div>
          <p className="text-sm text-muted-foreground italic">
            "You are doing an amazing job. Every moment of care you provide helps Emma grow 
            into the wonderful person she's meant to be. Trust yourself—you've got this."
          </p>
        </div>
      </Card>
    </div>
  );
}