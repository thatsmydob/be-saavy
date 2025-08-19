// NotificationService.ts - Enhanced notification system for recalls
import { SmartNotificationTiming, OptimalTimingResult } from './SmartNotificationTiming';

export interface NotificationPreferences {
  critical: {
    enabled: boolean;
    disabled: boolean; // Always true - critical cannot be disabled
  };
  high: {
    enabled: boolean;
    schedule: 'immediate' | 'next_optimal' | 'evening_digest';
    quietHours: {
      enabled: boolean;
      start: string; // HH:mm format
      end: string;   // HH:mm format
    };
  };
  medium: {
    enabled: boolean;
    frequency: 'immediate' | 'daily_digest' | 'weekly' | 'disabled';
    batchWith: 'development_tips' | 'weekly_summary' | 'standalone';
  };
  general: {
    sound: boolean;
    vibration: boolean;
    showOnLockscreen: boolean;
    groupSimilar: boolean;
  };
}

export interface ScheduledNotification {
  id: string;
  recallId: string;
  type: 'critical' | 'high' | 'medium';
  title: string;
  body: string;
  scheduledFor: Date;
  personalizedMessage?: string;
  actionUrl?: string;
  priority: number; // 1-10, 10 being highest
  timingReasoning?: string; // Why this time was chosen
  confidence?: number; // 0-1, confidence in timing choice
}

export interface NotificationContext {
  babyName: string;
  babyAge: number;
  userTimezone: string;
  lastAppUsage: Date;
  sleepSchedule?: {
    bedtime: string;
    wakeup: string;
    napTimes: string[];
  };
  responsiveHours: string[]; // Hours when user typically responds to notifications
}

export class NotificationService {
  private static instance: NotificationService;
  private preferences: NotificationPreferences;
  private context: NotificationContext;
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private smartTiming: SmartNotificationTiming;


  private constructor() {
    // Default notification preferences
    this.smartTiming = new SmartNotificationTiming();

    this.preferences = {
      critical: {
        enabled: true,
        disabled: true // Cannot disable critical notifications
      },
      high: {
        enabled: true,
        schedule: 'immediate',
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '07:00'
        }
      },
      medium: {
        enabled: true,
        frequency: 'daily_digest',
        batchWith: 'development_tips'
      },
      general: {
        sound: true,
        vibration: true,
        showOnLockscreen: true,
        groupSimilar: true
      }
    };

    // Default context - should be loaded from user profile
    this.context = {
      babyName: 'Emma',
      babyAge: 8.5,
      userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      lastAppUsage: new Date(),
      responsiveHours: ['08', '12', '15', '19'] // Default responsive times
    };

    this.initializeNotificationPermissions();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initializeNotificationPermissions(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return Notification.permission === 'granted';
  }

  public updatePreferences(newPreferences: Partial<NotificationPreferences>): void {
    this.preferences = {
      ...this.preferences,
      ...newPreferences
    };
    
    // Save to localStorage for persistence
    localStorage.setItem('be-saavy-notification-preferences', JSON.stringify(this.preferences));
    
    // Sync with smart timing
    if (newPreferences.high?.quietHours) {
      this.smartTiming.updateUserBehavior({
        quietPeriods: [{
          start: this.preferences.high.quietHours.start,
          end: this.preferences.high.quietHours.end
        }]
      });
    }
  }

  public updateContext(newContext: Partial<NotificationContext>): void {
    this.context = {
      ...this.context,
      ...newContext
    };
  }

  public getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  private isInQuietHours(): boolean {
    if (!this.preferences.high.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const start = this.parseTime(this.preferences.high.quietHours.start);
    const end = this.parseTime(this.preferences.high.quietHours.end);
    
    // Handle overnight quiet hours (e.g., 22:00 to 07:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    }
    
    return currentTime >= start && currentTime <= end;
  }

  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private generatePersonalizedMessage(recallType: string, productName: string): string {
    const messages = {
      critical: [
        `🚨 URGENT: ${productName} recall affects ${this.context.babyName}'s safety`,
        `⚠️ CRITICAL: Stop using ${productName} immediately for ${this.context.babyName}`,
        `🛡️ SAFETY ALERT: ${productName} recall - ${this.context.babyName} needs immediate attention`
      ],
      high: [
        `⚠️ Important recall: ${productName} may affect ${this.context.babyName}`,
        `🔍 Safety update: Check your ${productName} for ${this.context.babyName}`,
        `📢 Product alert: ${productName} recall relevant to ${this.context.babyName}'s age`
      ],
      medium: [
        `📋 Safety notice: ${productName} recall to be aware of`,
        `ℹ️ Product update: ${productName} recall information`,
        `🔔 Recall notice: ${productName} - stay informed`
      ]
    };

    const typeMessages = messages[recallType as keyof typeof messages] || messages.medium;
    return typeMessages[Math.floor(Math.random() * typeMessages.length)];
  }

  private calculateOptimalDeliveryTime(urgencyLevel: 'critical' | 'high' | 'medium'): { time: Date; reasoning: string; confidence: number } {
    // Critical: always immediate
    if (urgencyLevel === 'critical') {
      return {
        time: new Date(),
        reasoning: 'Critical safety alerts are delivered immediately',
        confidence: 1.0
      };
    }
    
    const optimalResult = this.smartTiming.predictOptimalTime(urgencyLevel);

    // Apply user preference overrides
    if (urgencyLevel === 'high') {
      switch (this.preferences.high.schedule) {
        case 'immediate':
          if (!this.isInQuietHours()) {
            return {
              time: new Date(),
              reasoning: 'User preference: immediate delivery outside quiet hours',
              confidence: 0.8
            };
          }
          break;
        case 'evening_digest':
          const eveningTime = this.getEveningDigestTime();
          return {
            time: eveningTime,
            reasoning: 'User preference: evening digest delivery',
            confidence: 0.9
          };
        case 'next_optimal':
        default:
          // Use AI recommendation
          break;
      }
    }

    return {
      time: optimalResult.recommendedTime,
      reasoning: optimalResult.reasoning,
      confidence: optimalResult.confidence
    };
  }

  private getNextOptimalTime(): Date {
    const now = new Date();
    const responsiveHours = this.context.responsiveHours.map(h => parseInt(h));
    
    // If in quiet hours, wait until quiet hours end
    if (this.isInQuietHours()) {
      const endTime = this.parseTime(this.preferences.high.quietHours.end);
      const endDate = new Date();
      endDate.setHours(Math.floor(endTime / 60), endTime % 60, 0, 0);
      
      // If end time is tomorrow (overnight quiet hours)
      if (endDate <= now) {
        endDate.setDate(endDate.getDate() + 1);
      }
      
      return endDate;
    }

    // Find next responsive hour
    const currentHour = now.getHours();
    const nextResponsiveHour = responsiveHours.find(hour => hour > currentHour);
    
    if (nextResponsiveHour) {
      const nextTime = new Date();
      nextTime.setHours(nextResponsiveHour, 0, 0, 0);
      return nextTime;
    }

    // Use first responsive hour tomorrow
    const tomorrowTime = new Date();
    tomorrowTime.setDate(tomorrowTime.getDate() + 1);
    tomorrowTime.setHours(responsiveHours[0], 0, 0, 0);
    return tomorrowTime;
  }

  private getEveningDigestTime(): Date {
    const digestTime = new Date();
    digestTime.setHours(19, 0, 0, 0); // 7 PM digest
    
    // If it's already past 7 PM, schedule for tomorrow
    if (digestTime <= new Date()) {
      digestTime.setDate(digestTime.getDate() + 1);
    }
    
    return digestTime;
  }

  private getNextBatchTime(): Date {
    const batchTime = new Date();
    
    switch (this.preferences.medium.frequency) {
      case 'immediate':
        return batchTime;
      case 'daily_digest':
        batchTime.setHours(20, 0, 0, 0); // 8 PM daily digest
        if (batchTime <= new Date()) {
          batchTime.setDate(batchTime.getDate() + 1);
        }
        return batchTime;
      case 'weekly':
        // Next Sunday at 6 PM
        const daysUntilSunday = (7 - batchTime.getDay()) % 7;
        batchTime.setDate(batchTime.getDate() + (daysUntilSunday || 7));
        batchTime.setHours(18, 0, 0, 0);
        return batchTime;
      default:
        return new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
    }
  }

  public async scheduleRecallNotification(
    recallId: string,
    urgencyLevel: 'critical' | 'high' | 'medium',
    productName: string,
    hazardDescription: string
  ): Promise<boolean> {
    // Check if this urgency level is enabled
    if (urgencyLevel === 'high' && !this.preferences.high.enabled) return false;
    if (urgencyLevel === 'medium' && !this.preferences.medium.enabled) return false;
    // Critical is always enabled

    const timingResult = this.calculateOptimalDeliveryTime(urgencyLevel);
    const personalizedMessage = this.generatePersonalizedMessage(urgencyLevel, productName);
    
    const notification: ScheduledNotification = {
      id: `recall-${recallId}-${Date.now()}`,
      recallId,
      type: urgencyLevel,
      title: personalizedMessage,
      body: hazardDescription,
      scheduledFor: timingResult.time,
      personalizedMessage,
      actionUrl: `/recalls/${recallId}`,
      priority: urgencyLevel === 'critical' ? 10 : urgencyLevel === 'high' ? 7 : 4,
      timingReasoning: timingResult.reasoning,
      confidence: timingResult.confidence
    };
    
    this.scheduledNotifications.set(notification.id, notification);

    // If immediate delivery, send now
    if (timingResult.time <= new Date()) {
      return this.sendNotification(notification);
    }

    // Schedule for later
    const delay = timingResult.time.getTime() - Date.now();
    setTimeout(() => {
      // Double-check if we should still send (user might have handled it)
      if (this.smartTiming.shouldDeliverNow(timingResult.time, urgencyLevel)) {
        this.sendNotification(notification);
      }
      this.scheduledNotifications.delete(notification.id);
    }, delay);

    return true;
  }

  private async sendNotification(notification: ScheduledNotification): Promise<boolean> {
    if (!await this.initializeNotificationPermissions()) {
      console.warn('Notification permission not granted');
      return false;
    }

    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.body,
        icon: '/favicon.ico',
        badge: '/badge-icon.png',
        tag: `recall-${notification.recallId}`, // Group similar notifications
        requireInteraction: notification.type === 'critical',
        silent: !this.preferences.general.sound,
        data: {
          recallId: notification.recallId,
          actionUrl: notification.actionUrl,
          type: notification.type
        }
      });

      // Handle notification click
      browserNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          // Navigate to recall details
          window.location.hash = notification.actionUrl;
        }
        browserNotification.close();
      };

      // Trigger vibration if enabled
      if (this.preferences.general.vibration && navigator.vibrate) {
        const pattern = notification.type === 'critical' ? [200, 100, 200, 100, 200] : [100, 50, 100];
        navigator.vibrate(pattern);
      }

      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  public async sendCriticalRecallAlert(
    recallId: string,
    productName: string,
    hazardDescription: string
  ): Promise<boolean> {
    // Critical alerts bypass all settings and send immediately
    const notification: ScheduledNotification = {
      id: `critical-${recallId}-${Date.now()}`,
      recallId,
      type: 'critical',
      title: `🚨 URGENT: ${productName} Safety Alert`,
      body: `Stop using immediately. ${hazardDescription}`,
      scheduledFor: new Date(),
      personalizedMessage: this.generatePersonalizedMessage('critical', productName),
      actionUrl: `/recalls/${recallId}`,
      priority: 10
    };

    return this.sendNotification(notification);
  }

  public getScheduledNotifications(): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values())
      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
  }

  public cancelNotification(notificationId: string): boolean {
    return this.scheduledNotifications.delete(notificationId);
  }

  public recordUserAppUsage(): void {
  const now = new Date();
  this.context.lastAppUsage = now;
  this.smartTiming.recordAppUsage(now);
}

public recordNotificationInteraction(
  notificationId: string,
  action: 'opened' | 'dismissed' | 'acted'
): void {
  const notification = this.scheduledNotifications.get(notificationId);
  if (notification) {
    this.smartTiming.recordNotificationResponse(
      notificationId,
      notification.scheduledFor,
      new Date(),
      action
    );
  }
}

public updateBabySchedule(schedule: {
  bedtime?: string;
  wakeup?: string;
  napTimes?: string[];
}): void {
  if (schedule.bedtime || schedule.wakeup || schedule.napTimes) {
    this.smartTiming.updateBabySchedule({
      bedtime: schedule.bedtime ? { time: schedule.bedtime, consistency: 0.8 } : undefined,
      wakeupTime: schedule.wakeup ? { time: schedule.wakeup, consistency: 0.8 } : undefined,
      napTimes: schedule.napTimes?.map(time => ({
        start: time,
        end: time, // Would need duration in real implementation
        reliability: 0.7
      }))
    });
  }
}

public getSmartTimingInsights(): {
  nextOptimalTime: Date;
  confidence: number;
  reasoning: string;
} {
  const result = this.smartTiming.predictOptimalTime('medium');
  return {
    nextOptimalTime: result.recommendedTime,
    confidence: result.confidence,
    reasoning: result.reasoning
  };
}

  public batchMediumPriorityNotifications(): Promise<boolean[]> {
    const mediumNotifications = Array.from(this.scheduledNotifications.values())
      .filter(n => n.type === 'medium');

    if (mediumNotifications.length === 0) return Promise.resolve([]);

    // Group similar notifications
    const groupedTitle = `${mediumNotifications.length} Product Safety Updates`;
    const groupedBody = `${mediumNotifications.length} recalls to review for ${this.context.babyName}'s safety`;

    const batchedNotification: ScheduledNotification = {
      id: `batch-${Date.now()}`,
      recallId: 'batch',
      type: 'medium',
      title: groupedTitle,
      body: groupedBody,
      scheduledFor: new Date(),
      actionUrl: '/recalls/batch',
      priority: 4
    };

    // Clear individual notifications
    mediumNotifications.forEach(n => this.scheduledNotifications.delete(n.id));

    return Promise.resolve([this.sendNotification(batchedNotification)]);
  }
}