// SmartNotificationTiming.ts - AI-powered notification timing system

export interface UserBehaviorPattern {
  appUsageHours: number[]; // Hours when user typically opens the app
  responseRates: { [hour: string]: number }; // Response rate by hour (0-1)
  averageResponseTime: { [hour: string]: number }; // Average response time in minutes
  quietPeriods: Array<{ start: string; end: string }>; // User-defined quiet periods
  lastActiveTime: Date;
  weeklyPattern: { [day: string]: number[] }; // Daily usage patterns by day of week
}

export interface BabyScheduleData {
  napTimes: Array<{ start: string; end: string; reliability: number }>; // 0-1 reliability score
  bedtime: { time: string; consistency: number };
  wakeupTime: { time: string; consistency: number };
  feedingTimes: number[]; // Hours when feeding typically occurs
  fussyPeriods: Array<{ start: string; end: string; intensity: number }>; // High-stress times
}

export interface ContextualFactors {
  dayOfWeek: number; // 0-6, Sunday = 0
  isHoliday: boolean;
  weatherImpact?: 'indoor' | 'outdoor' | 'neutral';
  parentStressLevel?: 'low' | 'medium' | 'high';
  partnerAvailable?: boolean; // Whether partner is available to help
}

export interface OptimalTimingResult {
  recommendedTime: Date;
  confidence: number; // 0-1, how confident we are in this timing
  reasoning: string;
  alternativeTimes: Date[];
  shouldDelayReason?: string;
}

export class SmartNotificationTiming {
  private userBehavior: UserBehaviorPattern;
  private babySchedule: BabyScheduleData;
  private contextualFactors: ContextualFactors;

  constructor() {
    // Initialize with default patterns - these should be learned over time
    this.userBehavior = {
      appUsageHours: [7, 8, 12, 15, 19, 21], // Default active hours
      responseRates: {
        '7': 0.85, '8': 0.90, '12': 0.75, '15': 0.80, '19': 0.85, '21': 0.70
      },
      averageResponseTime: {
        '7': 5, '8': 3, '12': 15, '15': 8, '19': 5, '21': 20
      },
      quietPeriods: [
        { start: '22:00', end: '07:00' }, // Default night quiet hours
        { start: '13:00', end: '15:00' }  // Default nap time
      ],
      lastActiveTime: new Date(),
      weeklyPattern: {
        'monday': [8, 12, 19],
        'tuesday': [7, 12, 15, 19],
        'wednesday': [8, 12, 19, 21],
        'thursday': [7, 12, 15, 19],
        'friday': [8, 12, 19, 21],
        'saturday': [9, 14, 20],
        'sunday': [10, 15, 19]
      }
    };

    this.babySchedule = {
      napTimes: [
        { start: '09:30', end: '11:00', reliability: 0.8 },
        { start: '13:00', end: '15:00', reliability: 0.9 },
        { start: '17:30', end: '18:00', reliability: 0.6 }
      ],
      bedtime: { time: '19:30', consistency: 0.85 },
      wakeupTime: { time: '07:00', consistency: 0.75 },
      feedingTimes: [7, 10, 13, 16, 19, 22],
      fussyPeriods: [
        { start: '17:00', end: '19:00', intensity: 0.8 }, // Evening fussy period
        { start: '05:00', end: '06:00', intensity: 0.6 }  // Early morning
      ]
    };

    this.contextualFactors = {
      dayOfWeek: new Date().getDay(),
      isHoliday: false,
      weatherImpact: 'neutral',
      parentStressLevel: 'medium',
      partnerAvailable: true
    };

    this.loadUserData();
  }

  private loadUserData(): void {
    // Load saved user behavior patterns from localStorage
    try {
      const savedBehavior = localStorage.getItem('be-saavy-user-behavior');
      if (savedBehavior) {
        this.userBehavior = { ...this.userBehavior, ...JSON.parse(savedBehavior) };
      }

      const savedSchedule = localStorage.getItem('be-saavy-baby-schedule');
      if (savedSchedule) {
        this.babySchedule = { ...this.babySchedule, ...JSON.parse(savedSchedule) };
      }
    } catch (error) {
      console.error('Failed to load user behavior data:', error);
    }
  }

  private saveUserData(): void {
    try {
      localStorage.setItem('be-saavy-user-behavior', JSON.stringify(this.userBehavior));
      localStorage.setItem('be-saavy-baby-schedule', JSON.stringify(this.babySchedule));
    } catch (error) {
      console.error('Failed to save user behavior data:', error);
    }
  }

  public updateUserBehavior(behaviorData: Partial<UserBehaviorPattern>): void {
    this.userBehavior = { ...this.userBehavior, ...behaviorData };
    this.saveUserData();
  }

  public updateBabySchedule(scheduleData: Partial<BabyScheduleData>): void {
    this.babySchedule = { ...this.babySchedule, ...scheduleData };
    this.saveUserData();
  }

  public updateContextualFactors(factors: Partial<ContextualFactors>): void {
    this.contextualFactors = { ...this.contextualFactors, ...factors };
  }

  public predictOptimalTime(
    urgencyLevel: 'critical' | 'high' | 'medium',
    contentType: 'recall' | 'development' | 'general' = 'recall'
  ): OptimalTimingResult {
    const now = new Date();
    
    // Critical notifications always go immediately
    if (urgencyLevel === 'critical') {
      return {
        recommendedTime: now,
        confidence: 1.0,
        reasoning: 'Critical safety alerts are delivered immediately regardless of timing',
        alternativeTimes: []
      };
    }

    // Calculate optimal time based on multiple factors
    const optimalHour = this.calculateOptimalHour(urgencyLevel, contentType);
    const optimalTime = this.createOptimalTime(optimalHour);
    
    // Check if we should delay due to current context
    const delayCheck = this.shouldDelayNotification(optimalTime, urgencyLevel);
    
    if (delayCheck.shouldDelay) {
      const delayedTime = this.findNextOptimalTime(optimalTime, urgencyLevel);
      return {
        recommendedTime: delayedTime,
        confidence: delayCheck.confidence,
        reasoning: delayCheck.reason,
        alternativeTimes: this.generateAlternatives(delayedTime),
        shouldDelayReason: delayCheck.reason
      };
    }

    return {
      recommendedTime: optimalTime,
      confidence: this.calculateConfidence(optimalHour, urgencyLevel),
      reasoning: this.generateReasoning(optimalHour, urgencyLevel, contentType),
      alternativeTimes: this.generateAlternatives(optimalTime)
    };
  }

  private calculateOptimalHour(urgencyLevel: 'high' | 'medium', contentType: string): number {
    const now = new Date();
    const currentHour = now.getHours();
    const dayName = this.getDayName(now.getDay());
    
    // Get user's typical active hours for this day of week
    const todayPattern = this.userBehavior.weeklyPattern[dayName] || this.userBehavior.appUsageHours;
    
    // Score each potential hour
    const hourScores: { [hour: number]: number } = {};
    
    for (const hour of todayPattern) {
      let score = 0;
      
      // Base score from response rate
      const responseRate = this.userBehavior.responseRates[hour.toString()] || 0.5;
      score += responseRate * 40;
      
      // Bonus for faster response times
      const avgResponseTime = this.userBehavior.averageResponseTime[hour.toString()] || 15;
      score += Math.max(0, (20 - avgResponseTime)) * 2; // Faster response = higher score
      
      // Penalty for conflicting with baby's schedule
      score -= this.getBabyScheduleConflict(hour) * 20;
      
      // Urgency multiplier
      if (urgencyLevel === 'high') {
        score *= 1.3; // High priority gets 30% boost to overcome scheduling conflicts
      }
      
      // Content type adjustments
      if (contentType === 'development' && (hour < 8 || hour > 20)) {
        score *= 0.7; // Development content better during awake hours
      }
      
      // Weekend/weekday adjustments
      if (this.contextualFactors.dayOfWeek === 0 || this.contextualFactors.dayOfWeek === 6) {
        if (hour < 9) score *= 0.8; // Weekend mornings are more relaxed
      }
      
      hourScores[hour] = score;
    }
    
    // Find the highest scoring hour that's reasonable
    const sortedHours = Object.entries(hourScores)
      .sort(([, a], [, b]) => b - a)
      .map(([hour]) => parseInt(hour));
    
    // If it's urgent and current time is reasonable, prefer sooner
    if (urgencyLevel === 'high' && todayPattern.includes(currentHour)) {
      const nextFewHours = todayPattern.filter(h => h >= currentHour && h <= currentHour + 3);
      if (nextFewHours.length > 0) {
        return nextFewHours[0];
      }
    }
    
    return sortedHours[0] || currentHour;
  }

  private getBabyScheduleConflict(hour: number): number {
    let conflict = 0;
    
    // Check nap times
    for (const nap of this.babySchedule.napTimes) {
      const napStart = this.parseTime(nap.start);
      const napEnd = this.parseTime(nap.end);
      if (this.isHourInRange(hour, napStart, napEnd)) {
        conflict += nap.reliability * 0.8; // Higher conflict for more reliable naps
      }
    }
    
    // Check fussy periods
    for (const fussy of this.babySchedule.fussyPeriods) {
      const fussyStart = this.parseTime(fussy.start);
      const fussyEnd = this.parseTime(fussy.end);
      if (this.isHourInRange(hour, fussyStart, fussyEnd)) {
        conflict += fussy.intensity * 0.6;
      }
    }
    
    // Check feeding times (minor conflict as parents often check phone during feeds)
    if (this.babySchedule.feedingTimes.includes(hour)) {
      conflict += 0.2;
    }
    
    return Math.min(conflict, 1.0); // Cap at 1.0
  }

  private shouldDelayNotification(
    proposedTime: Date, 
    urgencyLevel: 'high' | 'medium'
  ): { shouldDelay: boolean; reason: string; confidence: number } {
    const now = new Date();
    const proposedHour = proposedTime.getHours();
    
    // Don't delay if it's high urgency and within next 4 hours
    if (urgencyLevel === 'high' && proposedTime.getTime() - now.getTime() < 4 * 60 * 60 * 1000) {
      return { shouldDelay: false, reason: '', confidence: 0.8 };
    }
    
    // Check if proposed time conflicts with quiet periods
    for (const quiet of this.userBehavior.quietPeriods) {
      if (this.isTimeInQuietPeriod(proposedTime, quiet)) {
        return {
          shouldDelay: true,
          reason: 'Proposed time conflicts with quiet hours',
          confidence: 0.9
        };
      }
    }
    
    // Check if baby is likely to be sleeping
    const sleepConflict = this.getBabyScheduleConflict(proposedHour);
    if (sleepConflict > 0.7) {
      return {
        shouldDelay: true,
        reason: 'Baby is likely sleeping or in a fussy period',
        confidence: sleepConflict
      };
    }
    
    // Check if user is typically unresponsive at this time
    const responseRate = this.userBehavior.responseRates[proposedHour.toString()] || 0.5;
    if (responseRate < 0.3 && urgencyLevel === 'medium') {
      return {
        shouldDelay: true,
        reason: 'User historically unresponsive at this time',
        confidence: 1 - responseRate
      };
    }
    
    return { shouldDelay: false, reason: '', confidence: 0.8 };
  }

  private findNextOptimalTime(originalTime: Date, urgencyLevel: 'high' | 'medium'): Date {
    const maxDelay = urgencyLevel === 'high' ? 6 : 24; // Max hours to delay
    const now = new Date();
    
    for (let i = 1; i <= maxDelay; i++) {
      const candidate = new Date(originalTime.getTime() + i * 60 * 60 * 1000);
      const candidateHour = candidate.getHours();
      
      // Skip if in quiet period
      const inQuietPeriod = this.userBehavior.quietPeriods.some(quiet => 
        this.isTimeInQuietPeriod(candidate, quiet)
      );
      if (inQuietPeriod) continue;
      
      // Check if this hour has reasonable response rate
      const responseRate = this.userBehavior.responseRates[candidateHour.toString()] || 0.5;
      if (responseRate > 0.5) {
        return candidate;
      }
    }
    
    // Fallback: use next active hour from user pattern
    const dayName = this.getDayName(originalTime.getDay());
    const todayPattern = this.userBehavior.weeklyPattern[dayName] || this.userBehavior.appUsageHours;
    const nextActiveHour = todayPattern.find(hour => hour > originalTime.getHours()) || todayPattern[0];
    
    const fallbackTime = new Date(originalTime);
    fallbackTime.setHours(nextActiveHour, 0, 0, 0);
    
    // If the fallback is earlier than now + 1 hour, move to tomorrow
    if (fallbackTime.getTime() < now.getTime() + 60 * 60 * 1000) {
      fallbackTime.setDate(fallbackTime.getDate() + 1);
    }
    
    return fallbackTime;
  }

  private calculateConfidence(hour: number, urgencyLevel: 'high' | 'medium'): number {
    let confidence = 0.7; // Base confidence
    
    // Higher confidence for user's active hours
    if (this.userBehavior.appUsageHours.includes(hour)) {
      confidence += 0.2;
    }
    
    // Higher confidence for good response rates
    const responseRate = this.userBehavior.responseRates[hour.toString()] || 0.5;
    confidence += responseRate * 0.3;
    
    // Higher confidence for low baby schedule conflicts
    const babyConflict = this.getBabyScheduleConflict(hour);
    confidence += (1 - babyConflict) * 0.2;
    
    // Urgency adjustments
    if (urgencyLevel === 'high') {
      confidence += 0.1; // Slightly more confident in high priority timing
    }
    
    return Math.min(confidence, 1.0);
  }

  private generateReasoning(hour: number, urgencyLevel: string, contentType: string): string {
    const reasons: string[] = [];
    
    if (this.userBehavior.appUsageHours.includes(hour)) {
      reasons.push('user typically active at this time');
    }
    
    const responseRate = this.userBehavior.responseRates[hour.toString()] || 0.5;
    if (responseRate > 0.7) {
      reasons.push('high historical response rate');
    }
    
    const babyConflict = this.getBabyScheduleConflict(hour);
    if (babyConflict < 0.3) {
      reasons.push('low conflict with baby\'s schedule');
    }
    
    const avgResponseTime = this.userBehavior.averageResponseTime[hour.toString()] || 15;
    if (avgResponseTime < 10) {
      reasons.push('user typically responds quickly');
    }
    
    if (urgencyLevel === 'high') {
      reasons.push('prioritized for safety importance');
    }
    
    return `Optimal timing based on: ${reasons.join(', ')}`;
  }

  private generateAlternatives(primaryTime: Date): Date[] {
    const alternatives: Date[] = [];
    const baseTime = new Date(primaryTime);
    
    // Generate 2-3 alternative times within reasonable range
    const offsets = [-2, -1, 1, 2]; // Hours before/after primary time
    
    for (const offset of offsets) {
      const altTime = new Date(baseTime.getTime() + offset * 60 * 60 * 1000);
      const altHour = altTime.getHours();
      
      // Only include if it's a reasonable time
      if (this.userBehavior.appUsageHours.includes(altHour)) {
        const responseRate = this.userBehavior.responseRates[altHour.toString()] || 0.5;
        if (responseRate > 0.4) {
          alternatives.push(altTime);
        }
      }
      
      if (alternatives.length >= 3) break;
    }
    
    return alternatives;
  }

  public shouldDeliverNow(
    scheduledTime: Date,
    urgencyLevel: 'critical' | 'high' | 'medium'
  ): boolean {
    // Critical always delivers immediately
    if (urgencyLevel === 'critical') return true;
    
    const now = new Date();
    const timeDiff = scheduledTime.getTime() - now.getTime();
    
    // If scheduled time has passed, deliver now
    if (timeDiff <= 0) return true;
    
    // If within 5 minutes of scheduled time, deliver now
    if (timeDiff <= 5 * 60 * 1000) return true;
    
    // For high priority, check if current time is actually better than scheduled
    if (urgencyLevel === 'high') {
      const currentOptimal = this.predictOptimalTime('high');
      const currentScore = this.calculateConfidence(now.getHours(), 'high');
      const scheduledScore = this.calculateConfidence(scheduledTime.getHours(), 'high');
      
      // If current time is significantly better, deliver now
      if (currentScore > scheduledScore + 0.2) return true;
    }
    
    return false;
  }

  public batchNonUrgentNotifications(notifications: Array<{ id: string; content: string }>): Date {
    // Find the next optimal time for a batch delivery
    const optimalResult = this.predictOptimalTime('medium', 'general');
    
    // Ensure minimum time between notifications to avoid spam
    const lastNotification = this.userBehavior.lastActiveTime;
    const minInterval = 2 * 60 * 60 * 1000; // 2 hours minimum
    
    if (optimalResult.recommendedTime.getTime() - lastNotification.getTime() < minInterval) {
      // Push to next optimal window
      const adjustedTime = new Date(lastNotification.getTime() + minInterval);
      return this.findNextOptimalTime(adjustedTime, 'medium');
    }
    
    return optimalResult.recommendedTime;
  }

  // Utility methods
  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
  }

  private isHourInRange(hour: number, start: number, end: number): boolean {
    if (start <= end) {
      return hour >= start && hour <= end;
    } else {
      // Overnight range
      return hour >= start || hour <= end;
    }
  }

  private isTimeInQuietPeriod(time: Date, quietPeriod: { start: string; end: string }): boolean {
    const timeHour = time.getHours() + time.getMinutes() / 60;
    const start = this.parseTime(quietPeriod.start);
    const end = this.parseTime(quietPeriod.end);
    return this.isHourInRange(timeHour, start, end);
  }

  private createOptimalTime(hour: number): Date {
    const time = new Date();
    time.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
    
    // If the time has already passed today, schedule for tomorrow
    if (time <= new Date()) {
      time.setDate(time.getDate() + 1);
    }
    
    return time;
  }

  private getDayName(dayIndex: number): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayIndex];
  }

  // Learning methods - these would be called when user interacts with notifications
  public recordNotificationResponse(
    notificationId: string,
    deliveredAt: Date,
    respondedAt: Date,
    actionTaken: 'opened' | 'dismissed' | 'acted'
  ): void {
    const hour = deliveredAt.getHours();
    const responseTime = (respondedAt.getTime() - deliveredAt.getTime()) / (1000 * 60); // minutes
    
    // Update response rate for this hour
    const currentRate = this.userBehavior.responseRates[hour.toString()] || 0.5;
    const responseValue = actionTaken === 'acted' ? 1 : actionTaken === 'opened' ? 0.7 : 0.2;
    
    // Weighted average with more weight on recent data
    this.userBehavior.responseRates[hour.toString()] = currentRate * 0.8 + responseValue * 0.2;
    
    // Update average response time
    const currentAvgTime = this.userBehavior.averageResponseTime[hour.toString()] || 15;
    this.userBehavior.averageResponseTime[hour.toString()] = currentAvgTime * 0.8 + responseTime * 0.2;
    
    this.saveUserData();
  }

  public recordAppUsage(timestamp: Date): void {
    const hour = timestamp.getHours();
    
    // Add to active hours if not already present
    if (!this.userBehavior.appUsageHours.includes(hour)) {
      this.userBehavior.appUsageHours.push(hour);
      this.userBehavior.appUsageHours.sort();
    }
    
    // Update weekly pattern
    const dayName = this.getDayName(timestamp.getDay());
    if (!this.userBehavior.weeklyPattern[dayName]) {
      this.userBehavior.weeklyPattern[dayName] = [];
    }
    
    if (!this.userBehavior.weeklyPattern[dayName].includes(hour)) {
      this.userBehavior.weeklyPattern[dayName].push(hour);
      this.userBehavior.weeklyPattern[dayName].sort();
    }
    
    this.userBehavior.lastActiveTime = timestamp;
    this.saveUserData();
  }
}