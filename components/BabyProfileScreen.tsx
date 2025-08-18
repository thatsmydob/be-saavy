import React from 'react';
import { Baby, Calendar, Ruler, Weight, Star, TrendingUp, Camera, Edit3 } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function BabyProfileScreen() {
  const milestones = [
    { id: '1', title: 'Sits without support', achieved: true, ageRange: '6-8 months', achievedAt: '7 months, 2 weeks' },
    { id: '2', title: 'Crawling', achieved: true, ageRange: '6-10 months', achievedAt: '8 months' },
    { id: '3', title: 'Says first words', achieved: false, ageRange: '8-12 months', progress: 75 },
    { id: '4', title: 'Pulls to standing', achieved: false, ageRange: '8-12 months', progress: 30 },
    { id: '5', title: 'Pincer grasp', achieved: true, ageRange: '8-10 months', achievedAt: '8 months, 1 week' },
  ];

  const growthData = [
    { metric: 'Weight', current: '18.5 lbs', percentile: 65, trend: 'up' },
    { metric: 'Height', current: '28 inches', percentile: 70, trend: 'up' },
    { metric: 'Head Circumference', current: '17.2 inches', percentile: 60, trend: 'stable' },
  ];

  const recentPhotos = [
    'https://images.unsplash.com/photo-1544441892-794166f1e3be?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1522444195799-478538b28823?w=150&h=150&fit=crop&crop=face',
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Profile Header */}
      <Card className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 border-pink-100">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-muted">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1544441892-794166f1e3be?w=150&h=150&fit=crop&crop=face"
                alt="Emma's photo"
                className="w-full h-full object-cover"
              />
            </div>
            <Button size="sm" className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full p-0 bg-primary">
              <Camera className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl">Emma Rose</h2>
              <Button variant="ghost" size="sm" className="p-1">
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Born: March 15, 2024</p>
              <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                8 months, 2 weeks old
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        {growthData.map((stat) => (
          <Card key={stat.metric} className="p-4 text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                {stat.metric === 'Weight' && <Weight className="w-5 h-5 text-blue-600" />}
                {stat.metric === 'Height' && <Ruler className="w-5 h-5 text-blue-600" />}
                {stat.metric === 'Head Circumference' && <TrendingUp className="w-5 h-5 text-blue-600" />}
              </div>
              <div>
                <p className="text-lg">{stat.current}</p>
                <p className="text-xs text-muted-foreground">{stat.metric}</p>
                <p className="text-xs text-green-600">{stat.percentile}th percentile</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Milestones */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg">Development Milestones</h3>
          <Badge variant="outline">
            {milestones.filter(m => m.achieved).length}/{milestones.length} achieved
          </Badge>
        </div>
        
        <div className="space-y-3">
          {milestones.map((milestone) => (
            <Card key={milestone.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  milestone.achieved ? 'bg-green-100' : 'bg-muted'
                }`}>
                  {milestone.achieved ? (
                    <Star className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                  )}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm">{milestone.title}</h4>
                    <span className="text-xs text-muted-foreground">{milestone.ageRange}</span>
                  </div>
                  
                  {milestone.achieved ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                      Achieved at {milestone.achievedAt}
                    </Badge>
                  ) : (
                    <div className="space-y-1">
                      <Progress value={milestone.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">{milestone.progress}% progress</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Photos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg">Recent Photos</h3>
          <Button variant="outline" size="sm">
            <Camera className="w-4 h-4 mr-2" />
            Add Photo
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {recentPhotos.map((photo, index) => (
            <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
              <ImageWithFallback
                src={photo}
                alt={`Emma photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Next Appointment */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg">Next Checkup</h3>
            <p className="text-sm text-muted-foreground">
              9-month wellness visit scheduled for December 20, 2024 at 2:00 PM
            </p>
            <p className="text-xs text-blue-600">Dr. Sarah Johnson • Pediatric Associates</p>
          </div>
        </div>
      </Card>
    </div>
  );
}