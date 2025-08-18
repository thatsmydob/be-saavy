// Mock AI Service for Be-Saavy
// Simulates intelligent features with predefined logic and responses

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'feeding' | 'safety' | 'toys' | 'clothing' | 'care' | 'sleep';
  ageRange: {
    min: number; // in months
    max: number;
  };
  barcode?: string;
  image?: string;
  description: string;
  safetyRating: 1 | 2 | 3 | 4 | 5; // 1 = high risk, 5 = very safe
  price?: number;
}

export interface SafetyAssessment {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  risks: SafetyRisk[];
  recommendations: string[];
}

export interface SafetyRisk {
  type: 'choking' | 'chemical' | 'age-inappropriate' | 'recall' | 'physical';
  severity: 'low' | 'medium' | 'high';
  description: string;
  mitigation?: string;
}

export interface ProductRecall {
  id: string;
  recallNumber: string;
  product: {
    name: string;
    brand: string;
    model?: string;
    category: 'feeding' | 'safety' | 'toys' | 'clothing' | 'care' | 'sleep' | 'furniture';
    image?: string;
  };
  recallDate: Date;
  severity: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  hazard: string;
  actionRequired: string;
  affectedUnits: number;
  ageRange?: {
    min: number;
    max: number;
  };
  isRelevant: boolean; // AI-determined relevance to user's baby
  aiRelevanceReason?: string;
  remedy: {
    type: 'return' | 'repair' | 'replace' | 'discontinue' | 'contact';
    instructions: string;
    contactInfo?: string;
  };
  cpscUrl?: string;
  manufacturerResponse?: string;
}

export interface BabyProfile {
  name: string;
  birthDate: Date;
  ageInMonths: number;
  developmentalStage: string;
  preferences: string[];
  allergies: string[];
  milestones: string[];
}

export interface SmartInsight {
  id: string;
  type: 'developmental' | 'safety' | 'feeding' | 'sleep' | 'wellness';
  priority: 'low' | 'medium' | 'high';
  title: string;
  content: string;
  actionable: boolean;
  action?: string;
  validUntil: Date;
}

// Mock product database
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Organic Baby Food - Sweet Potato',
    brand: 'Earth\'s Best',
    category: 'feeding',
    ageRange: { min: 6, max: 24 },
    barcode: '023923330284',
    description: 'Organic sweet potato puree, perfect for first foods',
    safetyRating: 5,
    price: 1.49
  },
  {
    id: 'p2',
    name: 'Soft Stacking Rings',
    brand: 'Fisher-Price',
    category: 'toys',
    ageRange: { min: 6, max: 18 },
    barcode: '746775036621',
    description: 'Soft, colorful rings for developing motor skills',
    safetyRating: 4,
    price: 12.99
  },
  {
    id: 'p3',
    name: 'Baby Bottle - 8oz',
    brand: 'Dr. Brown\'s',
    category: 'feeding',
    ageRange: { min: 0, max: 24 },
    barcode: '072239311127',
    description: 'Anti-colic baby bottle with natural flow',
    safetyRating: 5,
    price: 8.99
  },
  {
    id: 'p4',
    name: 'Teething Ring',
    brand: 'Nuby',
    category: 'care',
    ageRange: { min: 3, max: 12 },
    barcode: '048526055555',
    description: 'Silicone teething ring for sore gums',
    safetyRating: 4,
    price: 4.99
  },
  {
    id: 'p5',
    name: 'Small Building Blocks',
    brand: 'Mega Bloks',
    category: 'toys',
    ageRange: { min: 12, max: 36 },
    barcode: '065541009899',
    description: 'Large building blocks for toddlers',
    safetyRating: 2, // Too advanced for 8-month-old
    price: 19.99
  }
];

// Mock product recalls database
const MOCK_RECALLS: ProductRecall[] = [
  {
    id: 'r1',
    recallNumber: 'CPSC-2024-001',
    product: {
      name: 'Infant Sleep Positioner',
      brand: 'DreamTime Baby',
      model: 'Model DT-100, DT-200',
      category: 'sleep',
    },
    recallDate: new Date('2024-01-15'),
    severity: 'urgent',
    reason: 'Suffocation hazard',
    hazard: 'Infants can suffocate if they roll over or their face becomes pressed against the positioner',
    actionRequired: 'Stop using immediately and contact manufacturer',
    affectedUnits: 175000,
    ageRange: { min: 0, max: 6 },
    isRelevant: true,
    aiRelevanceReason: 'High priority for Emma\'s age group - sleep safety is critical',
    remedy: {
      type: 'return',
      instructions: 'Stop use immediately. Return to place of purchase for full refund or contact manufacturer.',
      contactInfo: '1-800-DREAM-01 or recalls@dreamtimebaby.com'
    },
    cpscUrl: 'https://cpsc.gov/recalls/2024/dreamtime-baby-recalls-infant-sleep-positioners',
    manufacturerResponse: 'Working with CPSC to ensure customer safety. Full refunds available.'
  },
  {
    id: 'r2',
    recallNumber: 'CPSC-2024-002',
    product: {
      name: 'High Chair Safety Straps',
      brand: 'SafeEat',
      model: 'SE-HC-2023',
      category: 'feeding',
    },
    recallDate: new Date('2024-02-03'),
    severity: 'high',
    reason: 'Fall hazard due to strap failure',
    hazard: 'Safety straps can break, causing infants to fall from high chair',
    actionRequired: 'Inspect straps and request replacement parts',
    affectedUnits: 85000,
    ageRange: { min: 6, max: 36 },
    isRelevant: true,
    aiRelevanceReason: 'Emma is starting to use high chairs - feeding safety is important',
    remedy: {
      type: 'replace',
      instructions: 'Inspect safety straps for wear. Contact manufacturer for free replacement straps.',
      contactInfo: '1-855-SAFE-EAT or safety@safeeat.com'
    },
    cpscUrl: 'https://cpsc.gov/recalls/2024/safeeat-recalls-high-chair-safety-straps',
    manufacturerResponse: 'Improved strap design implemented. Free replacement program available.'
  },
  {
    id: 'r3',
    recallNumber: 'CPSC-2024-003',
    product: {
      name: 'Plush Musical Toy',
      brand: 'TinyTunes',
      model: 'TT-Bear-01',
      category: 'toys',
    },
    recallDate: new Date('2024-02-20'),
    severity: 'medium',
    reason: 'Small parts detachment',
    hazard: 'Small button eyes can detach and pose choking hazard',
    actionRequired: 'Inspect toy and remove if damage found',
    affectedUnits: 45000,
    ageRange: { min: 3, max: 24 },
    isRelevant: true,
    aiRelevanceReason: 'Emma is at the age where she explores toys with her mouth',
    remedy: {
      type: 'repair',
      instructions: 'Check for loose button eyes. If found, stop use and contact manufacturer for repair kit.',
      contactInfo: '1-800-TINY-TOY or recall@tinytunes.com'
    },
    cpscUrl: 'https://cpsc.gov/recalls/2024/tinytunes-recalls-plush-musical-toys',
    manufacturerResponse: 'Improved attachment method for future products. Repair kits available.'
  },
  {
    id: 'r4',
    recallNumber: 'CPSC-2024-004',
    product: {
      name: 'Baby Bath Support Ring',
      brand: 'SplashTime',
      model: 'ST-Ring-2023',
      category: 'care',
    },
    recallDate: new Date('2024-03-10'),
    severity: 'urgent',
    reason: 'Drowning hazard',
    hazard: 'Support ring can flip over, trapping baby underwater',
    actionRequired: 'Stop using immediately',
    affectedUnits: 120000,
    ageRange: { min: 6, max: 18 },
    isRelevant: true,
    aiRelevanceReason: 'Critical water safety concern for Emma\'s developmental stage',
    remedy: {
      type: 'discontinue',
      instructions: 'Stop use immediately. No safe way to continue using this product. Full refund available.',
      contactInfo: '1-888-SPLASH-1 or urgent@splashtime.com'
    },
    cpscUrl: 'https://cpsc.gov/recalls/2024/splashtime-recalls-baby-bath-support-rings',
    manufacturerResponse: 'Product discontinued. Immediate refund program in effect.'
  },
  {
    id: 'r5',
    recallNumber: 'CPSC-2023-050',
    product: {
      name: 'Convertible Crib',
      brand: 'DreamNest',
      model: 'DN-Convert-Pro',
      category: 'furniture',
    },
    recallDate: new Date('2023-11-22'),
    severity: 'medium',
    reason: 'Entrapment hazard',
    hazard: 'Gap between mattress and crib rail can trap infants',
    actionRequired: 'Adjust mattress height or request modification kit',
    affectedUnits: 35000,
    ageRange: { min: 0, max: 24 },
    isRelevant: false,
    aiRelevanceReason: 'Lower priority - older recall and specific to convertible cribs',
    remedy: {
      type: 'repair',
      instructions: 'Lower mattress to lowest setting or contact manufacturer for modification kit.',
      contactInfo: '1-800-DREAM-NEST or safety@dreamnest.com'
    },
    cpscUrl: 'https://cpsc.gov/recalls/2023/dreamnest-recalls-convertible-cribs',
    manufacturerResponse: 'Free modification kits available to address gap concern.'
  },
  {
    id: 'r6',
    recallNumber: 'CPSC-2024-005',
    product: {
      name: 'Organic Baby Formula',
      brand: 'PureStart',
      model: 'Stage 1 Formula',
      category: 'feeding',
    },
    recallDate: new Date('2024-01-28'),
    severity: 'high',
    reason: 'Contamination risk',
    hazard: 'Potential bacterial contamination in specific lots',
    actionRequired: 'Check lot numbers and discard if affected',
    affectedUnits: 200000,
    ageRange: { min: 0, max: 12 },
    isRelevant: true,
    aiRelevanceReason: 'Formula safety is critical for babies Emma\'s age',
    remedy: {
      type: 'return',
      instructions: 'Check lot numbers on packaging. If affected, stop use and return for full refund.',
      contactInfo: '1-800-PURE-START or recall@purestart.com'
    },
    cpscUrl: 'https://cpsc.gov/recalls/2024/purestart-recalls-organic-baby-formula',
    manufacturerResponse: 'Enhanced quality control measures implemented. Full refund for affected lots.'
  }
];

// Mock baby profile
const EMMA_PROFILE: BabyProfile = {
  name: 'Emma',
  birthDate: new Date('2024-03-15'),
  ageInMonths: 8.5,
  developmentalStage: 'Mobile Explorer',
  preferences: ['sweet foods', 'soft textures', 'bright colors', 'music'],
  allergies: [],
  milestones: ['sitting independently', 'crawling', 'pincer grasp', 'babbling']
};

export class AIService {
  // Product Recognition System
  static recognizeProduct(barcode: string): Product | null {
    return MOCK_PRODUCTS.find(p => p.barcode === barcode) || null;
  }

  static searchProducts(query: string): Product[] {
    const searchTerm = query.toLowerCase();
    return MOCK_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      p.brand.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm)
    );
  }

  // Safety Risk Assessment
  static assessProductSafety(product: Product, babyAge: number): SafetyAssessment {
    const risks: SafetyRisk[] = [];
    let overallScore = product.safetyRating;

    // Check for active recalls
    const recalls = this.getProductRecalls().filter(recall => 
      recall.product.name.toLowerCase().includes(product.name.toLowerCase()) ||
      recall.product.brand.toLowerCase().includes(product.brand.toLowerCase())
    );

    if (recalls.length > 0) {
      const urgentRecalls = recalls.filter(r => r.severity === 'urgent');
      if (urgentRecalls.length > 0) {
        risks.push({
          type: 'recall',
          severity: 'high',
          description: `This product has an urgent recall: ${urgentRecalls[0].reason}`,
          mitigation: urgentRecalls[0].actionRequired
        });
        overallScore -= 3;
      } else {
        risks.push({
          type: 'recall',
          severity: 'medium',
          description: `This product has an active recall: ${recalls[0].reason}`,
          mitigation: recalls[0].actionRequired
        });
        overallScore -= 1.5;
      }
    }

    // Age appropriateness check
    if (babyAge < product.ageRange.min) {
      risks.push({
        type: 'age-inappropriate',
        severity: 'high',
        description: `This product is designed for babies ${product.ageRange.min}+ months old`,
        mitigation: `Wait until Emma is ${product.ageRange.min} months old`
      });
      overallScore -= 2;
    } else if (babyAge > product.ageRange.max) {
      risks.push({
        type: 'age-inappropriate',
        severity: 'low',
        description: 'This product may be too simple for current developmental stage',
        mitigation: 'Consider more age-appropriate alternatives'
      });
      overallScore -= 0.5;
    }

    // Category-specific risk assessment
    switch (product.category) {
      case 'toys':
        if (babyAge < 12 && product.name.toLowerCase().includes('small')) {
          risks.push({
            type: 'choking',
            severity: 'high',
            description: 'Small parts may pose choking hazard',
            mitigation: 'Always supervise play and check for loose parts'
          });
          overallScore -= 1.5;
        }
        break;
      
      case 'feeding':
        if (product.name.toLowerCase().includes('honey') && babyAge < 12) {
          risks.push({
            type: 'chemical',
            severity: 'high',
            description: 'Honey products not recommended under 12 months',
            mitigation: 'Avoid honey products until after first birthday'
          });
          overallScore -= 3;
        }
        break;
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (overallScore >= 4) {
      recommendations.push('This product appears safe for Emma\'s current age');
    }
    if (risks.length > 0) {
      recommendations.push('Please review the safety concerns before use');
      recommendations.push('Always supervise Emma when using this product');
    }
    if (product.category === 'toys') {
      recommendations.push('Regularly inspect for wear and damage');
    }

    const finalScore = Math.max(1, Math.min(5, overallScore));
    const riskLevel: 'low' | 'medium' | 'high' = 
      finalScore >= 4 ? 'low' : finalScore >= 2.5 ? 'medium' : 'high';

    return {
      overallScore: finalScore,
      riskLevel,
      risks,
      recommendations
    };
  }

  // Product Recalls System
  static getProductRecalls(relevantOnly: boolean = false): ProductRecall[] {
    if (relevantOnly) {
      return MOCK_RECALLS.filter(recall => recall.isRelevant);
    }
    return MOCK_RECALLS;
  }

  static getRecallsByCategory(category: string): ProductRecall[] {
    return MOCK_RECALLS.filter(recall => 
      recall.product.category === category && recall.isRelevant
    );
  }

  static getUrgentRecalls(): ProductRecall[] {
    return MOCK_RECALLS.filter(recall => 
      recall.severity === 'urgent' && recall.isRelevant
    );
  }

  static getRecentRecalls(days: number = 30): ProductRecall[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return MOCK_RECALLS.filter(recall => 
      recall.recallDate >= cutoffDate && recall.isRelevant
    );
  }

  static searchRecalls(query: string): ProductRecall[] {
    const searchTerm = query.toLowerCase();
    return MOCK_RECALLS.filter(recall => 
      recall.product.name.toLowerCase().includes(searchTerm) ||
      recall.product.brand.toLowerCase().includes(searchTerm) ||
      recall.reason.toLowerCase().includes(searchTerm) ||
      recall.hazard.toLowerCase().includes(searchTerm)
    );
  }

  static getRecallSummary(): {
    total: number;
    urgent: number;
    recent: number;
    relevant: number;
  } {
    const total = MOCK_RECALLS.length;
    const urgent = this.getUrgentRecalls().length;
    const recent = this.getRecentRecalls(7).length;
    const relevant = this.getProductRecalls(true).length;

    return { total, urgent, recent, relevant };
  }

  // Personalized Recommendations Engine
  static generatePersonalizedRecommendations(profile: BabyProfile): Product[] {
    const ageAppropriate = MOCK_PRODUCTS.filter(p => 
      profile.ageInMonths >= p.ageRange.min && 
      profile.ageInMonths <= p.ageRange.max
    );

    // Score products based on preferences and developmental needs
    const scored = ageAppropriate.map(product => {
      let score = product.safetyRating;
      
      // Developmental stage matching
      if (profile.developmentalStage === 'Mobile Explorer') {
        if (product.category === 'toys' && product.name.toLowerCase().includes('stacking')) {
          score += 2; // Great for motor skills
        }
        if (product.category === 'feeding' && product.name.toLowerCase().includes('finger')) {
          score += 1.5; // Supports self-feeding
        }
      }

      // Preference matching
      if (profile.preferences.includes('soft textures') && 
          product.description.toLowerCase().includes('soft')) {
        score += 1;
      }

      return { ...product, recommendationScore: score };
    });

    return scored
      .sort((a, b) => (b as any).recommendationScore - (a as any).recommendationScore)
      .slice(0, 3);
  }

  // Smart Insights Generator
  static generateSmartInsights(profile: BabyProfile): SmartInsight[] {
    const insights: SmartInsight[] = [];
    const today = new Date();
    const validUntil = new Date();
    validUntil.setDate(today.getDate() + 7);

    // Add recall-based insights
    const urgentRecalls = this.getUrgentRecalls();
    if (urgentRecalls.length > 0) {
      insights.push({
        id: 'recall-urgent',
        type: 'safety',
        priority: 'high',
        title: 'Urgent Product Recall Alert',
        content: `There ${urgentRecalls.length === 1 ? 'is' : 'are'} ${urgentRecalls.length} urgent recall${urgentRecalls.length === 1 ? '' : 's'} affecting products for Emma's age group. Please review immediately.`,
        actionable: true,
        action: 'View recalls',
        validUntil
      });
    }

    const recentRecalls = this.getRecentRecalls(7);
    if (recentRecalls.length > 0 && urgentRecalls.length === 0) {
      insights.push({
        id: 'recall-recent',
        type: 'safety',
        priority: 'medium',
        title: 'New Product Recalls',
        content: `${recentRecalls.length} new recall${recentRecalls.length === 1 ? '' : 's'} this week for baby products. Stay informed about product safety.`,
        actionable: true,
        action: 'Review recalls',
        validUntil
      });
    }

    // Developmental insights
    if (profile.ageInMonths >= 8 && profile.ageInMonths < 10) {
      insights.push({
        id: 'dev1',
        type: 'developmental',
        priority: 'high',
        title: 'Pincer Grasp Development',
        content: 'Emma is at the perfect age to develop her pincer grasp! Offer small, soft foods like peas or small pieces of banana to encourage this important milestone.',
        actionable: true,
        action: 'View finger food ideas',
        validUntil
      });

      insights.push({
        id: 'dev2',
        type: 'developmental',
        priority: 'medium',
        title: 'Language Development Boost',
        content: 'At 8 months, Emma\'s babbling is becoming more complex. Narrate your daily activities and respond to her sounds to encourage language development.',
        actionable: true,
        action: 'Language activities',
        validUntil
      });
    }

    // Safety insights based on age
    if (profile.ageInMonths >= 8) {
      insights.push({
        id: 'safety1',
        type: 'safety',
        priority: 'high',
        title: 'Mobility Safety Check',
        content: 'Emma is becoming more mobile! Time to baby-proof lower cabinets and secure any furniture that could tip over.',
        actionable: true,
        action: 'Safety checklist',
        validUntil
      });
    }

    // Feeding insights
    insights.push({
      id: 'feeding1',
      type: 'feeding',
      priority: 'medium',
      title: 'Iron-Rich Foods',
      content: 'Emma\'s iron stores from birth are depleting. Introduce iron-rich foods like iron-fortified cereals, pureed meats, or well-cooked lentils.',
      actionable: true,
      action: 'Meal planning',
      validUntil
    });

    // Sleep insights
    const sleepValidUntil = new Date();
    sleepValidUntil.setDate(today.getDate() + 3);
    
    insights.push({
      id: 'sleep1',
      type: 'sleep',
      priority: 'low',
      title: 'Sleep Schedule Optimization',
      content: 'Emma\'s sleep patterns are maturing. Consider adjusting to a 2-nap schedule if she\'s fighting her third nap.',
      actionable: true,
      action: 'Sleep guidance',
      validUntil: sleepValidUntil
    });

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Mock barcode scanning simulation
  static simulateBarcodeScanning(): Promise<string> {
    return new Promise((resolve) => {
      // Simulate scanning delay
      setTimeout(() => {
        // Return a random barcode from our mock products
        const randomProduct = MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)];
        resolve(randomProduct.barcode || '000000000000');
      }, 2000);
    });
  }

  // Daily tips based on developmental stage
  static getDailyTip(profile: BabyProfile): string {
    const tips = [
      `At ${Math.floor(profile.ageInMonths)} months, Emma loves exploring textures! Try offering different safe materials for her to touch and explore.`,
      'Reading to Emma every day helps with language development. Even if she seems more interested in the book itself, keep reading!',
      'Emma is learning cause and effect. Simple toys that make sounds when shaken are perfect for this stage.',
      'Peek-a-boo games help Emma understand object permanence - that things exist even when she can\'t see them.',
      'Let Emma practice self-feeding, even if it\'s messy! This builds independence and fine motor skills.',
    ];

    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return tips[dayOfYear % tips.length];
  }

  // Get current baby profile
  static getBabyProfile(): BabyProfile {
    return EMMA_PROFILE;
  }

  // Activity recommendations based on time of day and weather
  static getActivityRecommendations(timeOfDay: 'morning' | 'afternoon' | 'evening'): string[] {
    const activities = {
      morning: [
        'Gentle stretching and tummy time',
        'Reading colorful board books',
        'Sensory play with different textures',
        'Music and movement time'
      ],
      afternoon: [
        'Outdoor stroller walk (weather permitting)',
        'Water play during bath time',
        'Peek-a-boo and simple games',
        'Finger food exploration'
      ],
      evening: [
        'Calm sensory bottles or quiet toys',
        'Gentle massage before bedtime',
        'Soft lullabies and cuddle time',
        'Looking at family photos together'
      ]
    };

    return activities[timeOfDay];
  }
}