/**
 * AI-Powered Recommendation Service
 * Combines safety data, price tracking, and user preferences for personalized guidance
 */

import { recallService, RecallAlert } from './recallService';
import { priceTrackerService, ProductPrice, BudgetRecommendation } from './priceTrackerService';

export interface BabyProfile {
  id: string;
  name: string;
  birthDate: string;
  ageInMonths: number;
  weight?: number; // lbs
  height?: number; // inches
  feedingType: 'breastfeeding' | 'formula' | 'combination';
  allergies: string[];
  specialNeeds: string[];
  parentPreferences: {
    budget: 'tight' | 'moderate' | 'flexible';
    organic: boolean;
    sustainable: boolean;
    brand_conscious: boolean;
  };
  ownedProducts: {
    brand: string;
    model: string;
    category: string;
    purchaseDate: string;
  }[];
}

export interface SmartRecommendation {
  id: string;
  type: 'safety_alert' | 'product_recommendation' | 'price_alert' | 'milestone_guidance' | 'budget_tip';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionable: boolean;
  actionText?: string;
  actionUrl?: string;
  reasoning: string;
  sources: string[];
  estimatedSavings?: number;
  safetyImpact?: 'high' | 'medium' | 'low';
  relevanceScore: number; // 0-100
  dismissible: boolean;
  expiresAt?: string;
  data?: any; // Additional context data
}

export interface DailyInsights {
  date: string;
  babyAge: number;
  recommendations: SmartRecommendation[];
  safetyScore: number; // 0-100
  budgetHealth: 'excellent' | 'good' | 'needs_attention' | 'critical';
  nextMilestones: string[];
  todaysTip: string;
  urgentActions: SmartRecommendation[];
}

class RecommendationService {
  private static instance: RecommendationService;

  static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  /**
   * Generate comprehensive daily insights for a parent
   */
  async generateDailyInsights(babyProfile: BabyProfile): Promise<DailyInsights> {
    const [safetyRecommendations, budgetRecommendations, milestoneGuidance] = await Promise.all([
      this.generateSafetyRecommendations(babyProfile),
      this.generateBudgetRecommendations(babyProfile),
      this.generateMilestoneGuidance(babyProfile)
    ]);

    const allRecommendations = [
      ...safetyRecommendations,
      ...budgetRecommendations,
      ...milestoneGuidance
    ].sort((a, b) => b.relevanceScore - a.relevanceScore);

    const urgentActions = allRecommendations.filter(
      r => r.priority === 'critical' || r.priority === 'high'
    );

    return {
      date: new Date().toISOString().split('T')[0],
      babyAge: babyProfile.ageInMonths,
      recommendations: allRecommendations.slice(0, 10), // Top 10 recommendations
      safetyScore: this.calculateSafetyScore(babyProfile, safetyRecommendations),
      budgetHealth: this.assessBudgetHealth(budgetRecommendations),
      nextMilestones: this.getUpcomingMilestones(babyProfile.ageInMonths),
      todaysTip: this.generateDailyTip(babyProfile),
      urgentActions
    };
  }

  /**
   * Generate safety-focused recommendations
   */
  private async generateSafetyRecommendations(babyProfile: BabyProfile): Promise<SmartRecommendation[]> {
    const recommendations: SmartRecommendation[] = [];

    // Check for product recalls
    const personalizedRecalls = recallService.getPersonalizedRecalls(
      babyProfile.ageInMonths,
      babyProfile.ownedProducts.map(p => `${p.brand} ${p.model}`)
    );

    for (const recall of personalizedRecalls) {
      recommendations.push({
        id: `safety-recall-${recall.id}`,
        type: 'safety_alert',
        priority: recall.severity === 'critical' ? 'critical' : 'high',
        title: `SAFETY ALERT: ${recall.title}`,
        description: recall.description,
        actionable: true,
        actionText: this.getRecallActionText(recall.actionRequired),
        actionUrl: recall.sourceUrl,
        reasoning: `This recall affects products for babies aged ${recall.ageRange.min}-${recall.ageRange.max} months. Your baby is ${babyProfile.ageInMonths} months old.`,
        sources: [recall.source],
        safetyImpact: recall.riskLevel >= 4 ? 'high' : 'medium',
        relevanceScore: this.calculateRelevanceScore(recall, babyProfile),
        dismissible: false,
        data: recall
      });
    }

    // Age-appropriate safety recommendations
    const ageSafetyRecs = this.getAgeSafetyRecommendations(babyProfile.ageInMonths);
    recommendations.push(...ageSafetyRecs);

    return recommendations;
  }

  /**
   * Generate budget and price-focused recommendations
   */
  private async generateBudgetRecommendations(babyProfile: BabyProfile): Promise<SmartRecommendation[]> {
    const recommendations: SmartRecommendation[] = [];
    
    // Get current deals
    const currentDeals = priceTrackerService.getCurrentDeals();
    
    // Filter deals relevant to baby's age and family preferences
    const relevantDeals = currentDeals.filter(deal => 
      deal.ageRange.min <= babyProfile.ageInMonths && 
      deal.ageRange.max >= babyProfile.ageInMonths &&
      this.matchesPreferences(deal, babyProfile.parentPreferences)
    );

    for (const deal of relevantDeals.slice(0, 5)) { // Top 5 deals
      recommendations.push({
        id: `deal-${deal.id}`,
        type: 'price_alert',
        priority: deal.discountPercent >= 30 ? 'high' : 'medium',
        title: `${deal.discountPercent.toFixed(0)}% off ${deal.name}`,
        description: `${deal.brand} ${deal.name} is currently ${deal.discountPercent.toFixed(0)}% off at ${deal.retailer}`,
        actionable: true,
        actionText: 'View Deal',
        actionUrl: deal.productUrl,
        reasoning: `High-rated product (${deal.rating}/5) with significant savings. Fits your budget preference: ${babyProfile.parentPreferences.budget}`,
        sources: ['Price Tracking'],
        estimatedSavings: deal.originalPrice - deal.currentPrice,
        relevanceScore: this.calculateDealRelevance(deal, babyProfile),
        dismissible: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        data: deal
      });
    }

    // Budget guidance
    if (babyProfile.parentPreferences.budget === 'tight') {
      recommendations.push({
        id: 'budget-guidance',
        type: 'budget_tip',
        priority: 'medium',
        title: 'Smart Shopping Tips for New Parents',
        description: 'Save 20-30% on baby essentials with these evidence-based strategies',
        actionable: true,
        actionText: 'View Budget Guide',
        reasoning: 'Based on your budget preference and baby\'s age, these tips can significantly reduce expenses',
        sources: ['Parenting Economics Research'],
        estimatedSavings: 150, // Monthly savings estimate
        relevanceScore: 85,
        dismissible: true,
        data: {
          tips: [
            'Generic formula is FDA-regulated to be nutritionally identical to name brands',
            'Buy diapers one size up during growth spurts to prevent waste',
            'Seasonal clothing shopping 3-6 months ahead saves 40-60%'
          ]
        }
      });
    }

    return recommendations;
  }

  /**
   * Generate developmental milestone guidance
   */
  private async generateMilestoneGuidance(babyProfile: BabyProfile): Promise<SmartRecommendation[]> {
    const recommendations: SmartRecommendation[] = [];
    const ageInMonths = babyProfile.ageInMonths;

    // Milestone-based product recommendations
    const milestoneProducts = this.getMilestoneProducts(ageInMonths);
    
    for (const product of milestoneProducts) {
      recommendations.push({
        id: `milestone-${product.category}-${ageInMonths}`,
        type: 'milestone_guidance',
        priority: 'medium',
        title: `Time for ${product.title}`,
        description: product.description,
        actionable: true,
        actionText: 'Shop Safely',
        reasoning: `At ${ageInMonths} months, babies typically ${product.developmental_reason}`,
        sources: ['AAP Guidelines', 'CDC Milestones'],
        relevanceScore: 70,
        dismissible: true,
        data: product
      });
    }

    return recommendations;
  }

  /**
   * Calculate safety score based on current products and recommendations
   */
  private calculateSafetyScore(babyProfile: BabyProfile, safetyRecs: SmartRecommendation[]): number {
    let score = 100;

    // Deduct points for critical safety issues
    const criticalIssues = safetyRecs.filter(r => r.priority === 'critical');
    score -= criticalIssues.length * 25;

    // Deduct points for high priority issues
    const highPriorityIssues = safetyRecs.filter(r => r.priority === 'high');
    score -= highPriorityIssues.length * 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Assess budget health based on spending patterns and recommendations
   */
  private assessBudgetHealth(budgetRecs: SmartRecommendation[]): 'excellent' | 'good' | 'needs_attention' | 'critical' {
    const totalSavings = budgetRecs.reduce((sum, rec) => sum + (rec.estimatedSavings || 0), 0);
    
    if (totalSavings >= 200) return 'excellent';
    if (totalSavings >= 100) return 'good';
    if (totalSavings >= 50) return 'needs_attention';
    return 'critical';
  }

  /**
   * Get upcoming developmental milestones
   */
  private getUpcomingMilestones(ageInMonths: number): string[] {
    const milestones: Record<number, string[]> = {
      2: ['First social smiles', 'Follows objects with eyes', 'Holds head up briefly'],
      4: ['Laughs out loud', 'Holds head steady', 'Brings hands to mouth'],
      6: ['Sits with support', 'Reaches for objects', 'Responds to name'],
      9: ['Crawls or scoots', 'Pulls to standing', 'Says mama/dada'],
      12: ['First words', 'Walks with assistance', 'Points at objects'],
      18: ['Walks independently', '10-25 word vocabulary', 'Stacks blocks'],
      24: ['Runs steadily', '50+ word vocabulary', 'Plays pretend']
    };

    // Find next milestone age
    const nextMilestoneAge = Object.keys(milestones)
      .map(Number)
      .find(age => age > ageInMonths);

    return nextMilestoneAge ? milestones[nextMilestoneAge] : ['Continuing development'];
  }

  /**
   * Generate personalized daily tip
   */
  private generateDailyTip(babyProfile: BabyProfile): string {
    const tips = [
      'Reading aloud helps brain development - even newborns benefit from hearing your voice',
      'Tummy time prevents flat head syndrome and builds neck/shoulder strength',
      'Babies need 14-17 hours of sleep daily in their first 3 months',
      'Skin-to-skin contact regulates baby\'s temperature and heart rate',
      'High-contrast images help develop vision in the first few months'
    ];

    return tips[Math.floor(Math.random() * tips.length)];
  }

  // Helper methods
  private getRecallActionText(actionRequired: string): string {
    const actions: Record<string, string> = {
      stop_use: 'Stop using immediately',
      return: 'Return for refund',
      inspect: 'Inspect product',
      contact_manufacturer: 'Contact manufacturer',
      update: 'Update/repair product'
    };
    return actions[actionRequired] || 'Take action';
  }

  private calculateRelevanceScore(recall: RecallAlert, babyProfile: BabyProfile): number {
    let score = 50;
    
    // Age relevance
    if (babyProfile.ageInMonths >= recall.ageRange.min && 
        babyProfile.ageInMonths <= recall.ageRange.max) {
      score += 30;
    }

    // Severity
    if (recall.severity === 'critical') score += 20;
    else if (recall.severity === 'high') score += 15;

    return Math.min(100, score);
  }

  private matchesPreferences(product: ProductPrice, preferences: BabyProfile['parentPreferences']): boolean {
    // Budget matching logic
    if (preferences.budget === 'tight' && product.currentPrice > 50) return false;
    if (preferences.budget === 'moderate' && product.currentPrice > 150) return false;
    
    return true;
  }

  private calculateDealRelevance(deal: ProductPrice, babyProfile: BabyProfile): number {
    let score = 50;
    
    // Discount percentage
    score += Math.min(30, deal.discountPercent);
    
    // Rating
    score += (deal.rating / 5) * 20;

    // Essential vs optional
    if (deal.isEssential) score += 10;

    return Math.min(100, score);
  }

  private getAgeSafetyRecommendations(ageInMonths: number): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];

    if (ageInMonths < 6) {
      recommendations.push({
        id: 'safe-sleep-newborn',
        type: 'safety_alert',
        priority: 'high',
        title: 'Safe Sleep Guidelines',
        description: 'Always place baby on back to sleep, use firm mattress, avoid soft bedding',
        actionable: true,
        actionText: 'Learn More',
        actionUrl: 'https://www.nichd.nih.gov/health/topics/sids/conditioninfo/reduce-risk',
        reasoning: 'SIDS risk is highest in first 6 months',
        sources: ['AAP', 'NICHD'],
        safetyImpact: 'high',
        relevanceScore: 95,
        dismissible: false
      });
    }

    if (ageInMonths >= 6) {
      recommendations.push({
        id: 'childproof-crawling',
        type: 'safety_alert',
        priority: 'medium',
        title: 'Childproofing for Mobile Baby',
        description: 'Secure cabinets, cover outlets, install safety gates',
        actionable: true,
        actionText: 'Childproofing Checklist',
        reasoning: 'Babies become mobile around 6-9 months',
        sources: ['CPSC'],
        safetyImpact: 'medium',
        relevanceScore: 80,
        dismissible: true
      });
    }

    return recommendations;
  }

  private getMilestoneProducts(ageInMonths: number): any[] {
    const products: Record<number, any[]> = {
      4: [{
        category: 'toys',
        title: 'High-contrast toys',
        description: 'Support visual development with black and white patterns',
        developmental_reason: 'begin to focus on objects and track movement'
      }],
      6: [{
        category: 'feeding',
        title: 'First foods and baby-led weaning supplies',
        description: 'Start solids with safe, age-appropriate options',
        developmental_reason: 'show readiness for solid foods'
      }],
      9: [{
        category: 'safety',
        title: 'Baby-proofing essentials',
        description: 'Cabinet locks, outlet covers, corner guards',
        developmental_reason: 'become mobile and explore their environment'
      }]
    };

    return products[ageInMonths] || [];
  }
}

export const recommendationService = RecommendationService.getInstance();