import React, { useState, useEffect } from 'react';
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
  Camera,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Volume2,
  VolumeX,
  Smartphone,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { NotificationService, NotificationPreferences } from './services/NotificationService';
import { cn } from './ui/utils';

export function SettingsScreen() {
  const [notificationService] = useState(() => NotificationService.getInstance());
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(
    notificationService.getPreferences()
  );
  
  // Legacy notification settings (keeping for compatibility)
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

  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default'>('default');

  useEffect(() => {
    // Check notification permission status
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }

    // Load saved preferences from localStorage
    const saved = localStorage.getItem('be-saavy-notification-preferences');
    if (saved) {
      try {
        const savedPrefs = JSON.parse(saved);
        setNotificationPrefs(savedPrefs);
        notificationService.updatePreferences(savedPrefs);
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
      }
    }
  }, [notificationService]);

  const updateNotificationPreference = (section: keyof NotificationPreferences, updates: any) => {
    const newPrefs = {
      ...notificationPrefs,
      [section]: {
        ...notificationPrefs[section],
        ...updates
      }
    };
    setNotificationPrefs(newPrefs);
    notificationService.updatePreferences({ [section]: newPrefs[section] });
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
    }
  };

  const testNotification = async () => {
    try {
      await notificationService.sendCriticalRecallAlert(
        'test-001',
        'Sample Baby Product',
        'This is a test notification to verify your settings are working correctly.'
      );
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
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

      {/* Notification Permission Alert */}
      {permissionStatus !== 'granted' && (
        <Alert className="border-orange-200 bg-orange-50">
          <Bell className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-orange-800">
                  Enable notifications for safety alerts
                </span>
                <br />
                <span className="text-orange-700 text-sm">
                  Get critical product recall alerts even when the app is closed
                </span>
              </div>
              <Button 
                onClick={requestNotificationPermission}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white ml-4"
              >
                Enable
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Safety Notifications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg">Safety Notifications</h3>
          <Button 
            onClick={testNotification}
            variant="outline" 
            size="sm"
            className="text-xs"
          >
            Test Notification
          </Button>
        </div>
        
        <Card className="p-6 space-y-6">
          {/* Critical Recalls - Cannot be disabled */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">Critical Safety Alerts</h4>
                  <Badge variant="destructive" className="text-xs">Always On</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Immediate alerts for urgent product recalls affecting Emma's safety
                </p>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-xs font-medium">Protected</span>
              </div>
            </div>
            
            <Alert className="bg-red-50 border-red-200">
              <Info className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 text-xs">
                Critical safety alerts cannot be disabled to ensure Emma's protection. These bypass all other settings.
              </AlertDescription>
            </Alert>
          </div>

          <Separator />

          {/* High Priority Recalls */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium">High Priority Recalls</h4>
                <p className="text-xs text-muted-foreground">
                  Important safety updates that need attention within 24 hours
                </p>
              </div>
              <Switch
                checked={notificationPrefs.high.enabled}
                onCheckedChange={(enabled) => updateNotificationPreference('high', { enabled })}
              />
            </div>

            {notificationPrefs.high.enabled && (
              <div className="ml-11 space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Delivery Timing</Label>
                  <Select
                    value={notificationPrefs.high.schedule}
                    onValueChange={(schedule) => updateNotificationPreference('high', { schedule })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate (respects quiet hours)</SelectItem>
                      <SelectItem value="next_optimal">Next optimal time</SelectItem>
                      <SelectItem value="evening_digest">Evening digest (7 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Quiet Hours</Label>
                    <Switch
                      checked={notificationPrefs.high.quietHours.enabled}
                      onCheckedChange={(enabled) => 
                        updateNotificationPreference('high', { 
                          quietHours: { ...notificationPrefs.high.quietHours, enabled }
                        })
                      }
                    />
                  </div>
                  
                  {notificationPrefs.high.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">From</Label>
                        <Input
                          type="time"
                          value={notificationPrefs.high.quietHours.start}
                          onChange={(e) => 
                            updateNotificationPreference('high', {
                              quietHours: { ...notificationPrefs.high.quietHours, start: e.target.value }
                            })
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">To</Label>
                        <Input
                          type="time"
                          value={notificationPrefs.high.quietHours.end}
                          onChange={(e) => 
                            updateNotificationPreference('high', {
                              quietHours: { ...notificationPrefs.high.quietHours, end: e.target.value }
                            })
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Medium Priority Recalls */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium">Medium Priority Updates</h4>
                <p className="text-xs text-muted-foreground">
                  General safety notices and non-urgent recalls
                </p>
              </div>
              <Switch
                checked={notificationPrefs.medium.enabled}
                onCheckedChange={(enabled) => updateNotificationPreference('medium', { enabled })}
              />
            </div>

            {notificationPrefs.medium.enabled && (
              <div className="ml-11 space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Delivery Frequency</Label>
                  <Select
                    value={notificationPrefs.medium.frequency}
                    onValueChange={(frequency) => updateNotificationPreference('medium', { frequency })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="daily_digest">Daily digest (8 PM)</SelectItem>
                      <SelectItem value="weekly">Weekly summary (Sunday)</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Batch With</Label>
                  <Select
                    value={notificationPrefs.medium.batchWith}
                    onValueChange={(batchWith) => updateNotificationPreference('medium', { batchWith })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development_tips">Development tips</SelectItem>
                      <SelectItem value="weekly_summary">Weekly summary</SelectItem>
                      <SelectItem value="standalone">Send separately</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* General Notification Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">General Settings</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm">Sound</p>
                    <p className="text-xs text-muted-foreground">Play notification sound</p>
                  </div>
                </div>
                <Switch
                  checked={notificationPrefs.general.sound}
                  onCheckedChange={(sound) => updateNotificationPreference('general', { sound })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm">Vibration</p>
                    <p className="text-xs text-muted-foreground">Vibrate on notifications</p>
                  </div>
                </div>
                <Switch
                  checked={notificationPrefs.general.vibration}
                  onCheckedChange={(vibration) => updateNotificationPreference('general', { vibration })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm">Lock Screen</p>
                    <p className="text-xs text-muted-foreground">Show on lock screen</p>
                  </div>
                </div>
                <Switch
                  checked={notificationPrefs.general.showOnLockscreen}
                  onCheckedChange={(showOnLockscreen) => updateNotificationPreference('general', { showOnLockscreen })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm">Group Similar</p>
                    <p className="text-xs text-muted-foreground">Group related notifications</p>
                  </div>
                </div>
                <Switch
                  checked={notificationPrefs.general.groupSimilar}
                  onCheckedChange={(groupSimilar) => updateNotificationPreference('general', { groupSimilar })}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Legacy Notifications (keeping for compatibility) */}
      <div className="space-y-4">
        <h3 className="text-lg">App Notifications</h3>
        
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
              <Globe className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm">Language</p>
                <p className="text-xs text-muted-foreground">English (US)</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Settings Sections */}
      {settingSections.map((section, index) => (
        <div key={index} className="space-y-4">
          <h3 className="text-lg">{section.title}</h3>
          
          <Card className="p-6 space-y-4">
            {section.items.map((item, itemIndex) => {
              const Icon = item.icon;
              return (
                <div key={itemIndex}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <p className="text-sm">{item.label}</p>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {item.hasChevron && (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  {itemIndex < section.items.length - 1 && <Separator className="mt-4" />}
                </div>
              );
            })}
          </Card>
        </div>
      ))}
    </div>
  );
}