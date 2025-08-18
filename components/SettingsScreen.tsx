import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Moon, 
  Globe, 
  Shield, 
  HelpCircle, 
  ChevronRight, 
  Mail,
  Phone,
  Edit3,
  Camera
} from 'lucide-react';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function SettingsScreen() {
  const [notifications, setNotifications] = useState({
    feedingReminders: true,
    sleepTracking: true,
    milestones: true,
    safetyAlerts: true,
    dailyTips: false,
    weeklyReports: true
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    units: 'imperial', // or 'metric'
    language: 'English'
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const settingSections = [
    {
      title: 'Account',
      items: [
        { label: 'Profile Information', icon: User, hasChevron: true },
        { label: 'Baby Profiles', icon: User, hasChevron: true, badge: '1' },
        { label: 'Subscription', icon: Shield, hasChevron: true, badge: 'Premium' },
      ]
    },
    {
      title: 'Support',
      items: [
        { label: 'Help Center', icon: HelpCircle, hasChevron: true },
        { label: 'Contact Support', icon: Mail, hasChevron: true },
        { label: 'Feedback', icon: Phone, hasChevron: true },
      ]
    },
    {
      title: 'Legal',
      items: [
        { label: 'Privacy Policy', icon: Shield, hasChevron: true },
        { label: 'Terms of Service', icon: Globe, hasChevron: true },
        { label: 'Data Export', icon: Settings, hasChevron: true },
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-600" />
          <h2 className="text-2xl">Settings</h2>
        </div>
        <p className="text-muted-foreground">Customize your Be-Saavy experience</p>
      </div>

      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face"
                alt="Sarah's profile"
                className="w-full h-full object-cover"
              />
            </div>
            <Button size="sm" className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full p-0 bg-primary">
              <Camera className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg">Sarah Johnson</h3>
              <Button variant="ghost" size="sm" className="p-1">
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">sarah.johnson@email.com</p>
            <Badge variant="secondary" className="mt-2 bg-purple-100 text-purple-700">
              Premium Member
            </Badge>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <div className="space-y-4">
        <h3 className="text-lg">Notifications</h3>
        
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Feeding Reminders</p>
              <p className="text-xs text-muted-foreground">Get notified about feeding times</p>
            </div>
            <Switch
              checked={notifications.feedingReminders}
              onCheckedChange={() => toggleNotification('feedingReminders')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Sleep Tracking</p>
              <p className="text-xs text-muted-foreground">Monitor sleep patterns and schedules</p>
            </div>
            <Switch
              checked={notifications.sleepTracking}
              onCheckedChange={() => toggleNotification('sleepTracking')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Milestone Alerts</p>
              <p className="text-xs text-muted-foreground">Celebrate development achievements</p>
            </div>
            <Switch
              checked={notifications.milestones}
              onCheckedChange={() => toggleNotification('milestones')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Safety Alerts</p>
              <p className="text-xs text-muted-foreground">Important safety notifications</p>
            </div>
            <Switch
              checked={notifications.safetyAlerts}
              onCheckedChange={() => toggleNotification('safetyAlerts')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Daily Tips</p>
              <p className="text-xs text-muted-foreground">Helpful parenting advice</p>
            </div>
            <Switch
              checked={notifications.dailyTips}
              onCheckedChange={() => toggleNotification('dailyTips')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Weekly Reports</p>
              <p className="text-xs text-muted-foreground">Summary of baby's progress</p>
            </div>
            <Switch
              checked={notifications.weeklyReports}
              onCheckedChange={() => toggleNotification('weeklyReports')}
            />
          </div>
        </Card>
      </div>

      {/* Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg">Preferences</h3>
        
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Switch to dark theme</p>
              </div>
            </div>
            <Switch
              checked={preferences.darkMode}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, darkMode: checked }))}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm">Units</p>
                <p className="text-xs text-muted-foreground">Imperial (lbs, inches)</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm">Language</p>
                <p className="text-xs text-muted-foreground">English (US)</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Setting Sections */}
      {settingSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-4">
          <h3 className="text-lg">{section.title}</h3>
          
          <Card className="p-0 overflow-hidden">
            {section.items.map((item, itemIndex) => {
              const Icon = item.icon;
              return (
                <div key={itemIndex}>
                  <button className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <span className="flex-1 text-left text-sm">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {item.hasChevron && (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  {itemIndex < section.items.length - 1 && (
                    <Separator className="mx-4" />
                  )}
                </div>
              );
            })}
          </Card>
        </div>
      ))}

      {/* App Version */}
      <Card className="p-6 text-center">
        <p className="text-sm text-muted-foreground">Be-Saavy v2.1.0</p>
        <p className="text-xs text-muted-foreground mt-1">
          Made with ❤️ for parents everywhere
        </p>
      </Card>
    </div>
  );
}