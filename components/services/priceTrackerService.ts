/**
 * Price Tracker Service - Monitors prices across retailers for baby essentials
 * Helps parents save money on quality baby products
 */

export interface PriceAlert {
  id: string;
  productId: string;
  userId: string;
  targetPrice: number;
  currentPrice: number;
  priceDropPercent: number;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

export interface ProductPrice {
  id: string;
  name: string;
  brand: string;
  category: 'feeding' | 'diapers' | 'formula' | 'care' | 'clothing' | 'toys' | 'gear' | 'safety';
  description: string;
  image: string;
  currentPrice: number;
  originalPrice: number;
  discountPercent: number;
  retailer: 'amazon' | 'target' | 'walmart' | 'buybuybaby' | 'costco' | 'local';
  retailerLogo: string;
  productUrl: string;
  availability: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder';
  priceHistory: PricePoint[];
  rating: number;
  reviewCount: number;
  isEssential: boolean; // Core necessity vs nice-to-have
  ageRange: {
    min: number; // months
    max: number; // months
  };
  safetyRating?: 'excellent' | 'good' | 'fair' | 'poor';
  certifications?: string[]; // 'FDA', 'CPSC', 'Greenguard', etc.
  lastUpdated: string;
}

export interface PricePoint {
  price: number;
  date: string;
  retailer: string;
}

export interface BudgetRecommendation {
  category: string;
  monthlyBudget: number;
  essentialItems: ProductPrice[];
  optionalItems: ProductPrice[];
  totalSavings: number;
  recommendations: string[];
}

class PriceTrackerService {
  private static instance: PriceTrackerService;
  private products: Map<string, ProductPrice> = new Map();
  private priceAlerts: Map<string, PriceAlert[]> = new Map();

  static getInstance(): PriceTrackerService {
    if (!PriceTrackerService.instance) {
      PriceTrackerService.instance = new PriceTrackerService();
    }
    return PriceTrackerService.instance;
  }

  /**
   * Get personalized product recommendations based on baby's age and budget
   */
  getPersonalizedRecommendations(
    babyAge: number, 
    monthlyBudget: number,
    preferences: {
      organic: boolean;
      sustainable: boolean;
      budget_conscious: boolean;
    }
  ): BudgetRecommendation[] {
    const relevantProducts = this.getAgeAppropriateProducts(babyAge);
    const categories = this.groupProductsByCategory(relevantProducts);

    return Object.entries(categories).map(([category, products]) => {
      const budgetAllocation = this.calculateCategoryBudget(category, monthlyBudget);
      const essentialItems = products.filter(p => p.isEssential);
      const optionalItems = products.filter(p => !p.isEssential);

      // Sort by value (quality/price ratio)
      const sortedEssentials = this.sortByValue(essentialItems, preferences);
      const sortedOptional = this.sortByValue(optionalItems, preferences);

      return {
        category,
        monthlyBudget: budgetAllocation,
        essentialItems: sortedEssentials.slice(0, 5), // Top 5 essentials
        optionalItems: sortedOptional.slice(0, 3), // Top 3 optional
        totalSavings: this.calculatePotentialSavings(sortedEssentials.concat(sortedOptional)),
        recommendations: this.generateCategoryRecommendations(category, babyAge, preferences)
      };
    });
  }

  /**
   * Track price for a specific product
   */
  async trackProduct(productId: string, targetPrice: number, userId: string): Promise<PriceAlert> {
    const product = this.products.get(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const alert: PriceAlert = {
      id: `alert-${Date.now()}`,
      productId,
      userId,
      targetPrice,
      currentPrice: product.currentPrice,
      priceDropPercent: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    if (!this.priceAlerts.has(userId)) {
      this.priceAlerts.set(userId, []);
    }
    this.priceAlerts.get(userId)!.push(alert);

    return alert;
  }

  /**
   * Get current deals and discounts
   */
  getCurrentDeals(category?: string): ProductPrice[] {
    let products = Array.from(this.products.values());

    if (category) {
      products = products.filter(p => p.category === category);
    }

    // Filter for good deals (>20% off or high-value items)
    return products
      .filter(p => p.discountPercent >= 20 || p.rating >= 4.5)
      .sort((a, b) => b.discountPercent - a.discountPercent)
      .slice(0, 20);
  }

  /**
   * Get price history for a product
   */
  getPriceHistory(productId: string, days: number = 30): PricePoint[] {
    const product = this.products.get(productId);
    if (!product) return [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return product.priceHistory
      .filter(point => new Date(point.date) >= cutoffDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Get budget breakdown for new parents
   */
  getNewParentBudgetGuide(): {
    firstMonth: BudgetRecommendation[];
    firstYear: BudgetRecommendation[];
    totalEstimate: number;
    savingsTips: string[];
  } {
    const firstMonthRecommendations = this.getPersonalizedRecommendations(0, 500, {
      organic: false,
      sustainable: false,
      budget_conscious: true
    });

    const firstYearRecommendations = this.getPersonalizedRecommendations(6, 300, {
      organic: false,
      sustainable: false,
      budget_conscious: true
    });

    return {
      firstMonth: firstMonthRecommendations,
      firstYear: firstYearRecommendations,
      totalEstimate: this.calculateYearlyTotal(firstYearRecommendations),
      savingsTips: [
        'Buy diapers in bulk during sales - can save 20-30%',
        'Generic formula is FDA-regulated to be nutritionally identical',
        'Buy seasonally appropriate clothing 1-2 sizes ahead during off-season sales',
        'Consider subscription services for regular items like diapers and wipes',
        'Check recall status before buying second-hand items',
        'Compare unit prices, not just total prices for bulk items'
      ]
    };
  }

  /**
   * Initialize with sample products for development
   */
  initializeSampleProducts(): void {
    const sampleProducts: ProductPrice[] = [
      {
        id: 'prod-001',
        name: 'Enfamil NeuroPro Infant Formula',
        brand: 'Enfamil',
        category: 'formula',
        description: 'Brain-building nutrition inspired by breast milk',
        image: '/images/enfamil-neuropro.jpg',
        currentPrice: 34.99,
        originalPrice: 39.99,
        discountPercent: 12.5,
        retailer: 'amazon',
        retailerLogo: '/images/amazon-logo.png',
        productUrl: 'https://amazon.com/enfamil-neuropro',
        availability: 'in_stock',
        priceHistory: [
          { price: 39.99, date: '2024-01-01', retailer: 'amazon' },
          { price: 37.99, date: '2024-01-08', retailer: 'amazon' },
          { price: 34.99, date: '2024-01-15', retailer: 'amazon' }
        ],
        rating: 4.6,
        reviewCount: 12847,
        isEssential: true,
        ageRange: { min: 0, max: 12 },
        safetyRating: 'excellent',
        certifications: ['FDA'],
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'prod-002',
        name: 'Pampers Baby Dry Night',
        brand: 'Pampers',
        category: 'diapers',
        description: '12-hour protection for peaceful nights',
        image: '/images/pampers-baby-dry.jpg',
        currentPrice: 47.99,
        originalPrice: 54.99,
        discountPercent: 12.7,
        retailer: 'target',
        retailerLogo: '/images/target-logo.png',
        productUrl: 'https://target.com/pampers-baby-dry',
        availability: 'in_stock',
        priceHistory: [
          { price: 54.99, date: '2024-01-01', retailer: 'target' },
          { price: 47.99, date: '2024-01-10', retailer: 'target' }
        ],
        rating: 4.4,
        reviewCount: 8921,
        isEssential: true,
        ageRange: { min: 0, max: 36 },
        safetyRating: 'excellent',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'prod-003',
        name: 'Fisher-Price Rock \'n Play Sleeper',
        brand: 'Fisher-Price',
        category: 'gear',
        description: 'Portable bassinet with gentle rocking motion',
        image: '/images/fisher-price-sleeper.jpg',
        currentPrice: 0, // RECALLED PRODUCT
        originalPrice: 89.99,
        discountPercent: 0,
        retailer: 'walmart',
        retailerLogo: '/images/walmart-logo.png',
        productUrl: '',
        availability: 'out_of_stock',
        priceHistory: [],
        rating: 0,
        reviewCount: 0,
        isEssential: false,
        ageRange: { min: 0, max: 6 },
        safetyRating: 'poor', // RECALLED
        lastUpdated: new Date().toISOString()
      }
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  private getAgeAppropriateProducts(babyAge: number): ProductPrice[] {
    return Array.from(this.products.values())
      .filter(product => 
        babyAge >= product.ageRange.min && babyAge <= product.ageRange.max
      );
  }

  private groupProductsByCategory(products: ProductPrice[]): Record<string, ProductPrice[]> {
    return products.reduce((groups, product) => {
      if (!groups[product.category]) {
        groups[product.category] = [];
      }
      groups[product.category].push(product);
      return groups;
    }, {} as Record<string, ProductPrice[]>);
  }

  private calculateCategoryBudget(category: string, totalBudget: number): number {
    // Budget allocation percentages for different categories
    const allocations: Record<string, number> = {
      formula: 0.25,    // 25% for formula/feeding
      diapers: 0.30,    // 30% for diapers
      care: 0.15,       // 15% for care items
      clothing: 0.15,   // 15% for clothing
      gear: 0.10,       // 10% for gear
      toys: 0.05        // 5% for toys
    };

    return totalBudget * (allocations[category] || 0.1);
  }

  private sortByValue(products: ProductPrice[], preferences: any): ProductPrice[] {
    return products.sort((a, b) => {
      // Value score: (rating * discount * safety) / price
      const valueA = (a.rating * (1 + a.discountPercent/100) * (a.safetyRating === 'excellent' ? 1.2 : 1)) / a.currentPrice;
      const valueB = (b.rating * (1 + b.discountPercent/100) * (b.safetyRating === 'excellent' ? 1.2 : 1)) / b.currentPrice;
      return valueB - valueA;
    });
  }

  private calculatePotentialSavings(products: ProductPrice[]): number {
    return products.reduce((total, product) => {
      return total + (product.originalPrice - product.currentPrice);
    }, 0);
  }

  private generateCategoryRecommendations(category: string, babyAge: number, preferences: any): string[] {
    const recommendations: Record<string, string[]> = {
      formula: [
        'Generic store brands are FDA-required to match name brands nutritionally',
        'Buy in bulk during sales, but check expiration dates',
        'Consider subscription services for 5-15% additional savings'
      ],
      diapers: [
        'Size up during growth spurts to prevent blowouts',
        'Overnight diapers prevent night changes and sheet washing',
        'Track diaper changes to optimize purchase timing'
      ],
      care: [
        'Multi-purpose products reduce costs and simplify routine',
        'Buy travel sizes for diaper bag, full sizes for home',
        'Check ingredient safety ratings before purchase'
      ]
    };

    return recommendations[category] || ['Compare prices across retailers', 'Check safety ratings first'];
  }

  private calculateYearlyTotal(recommendations: BudgetRecommendation[]): number {
    return recommendations.reduce((total, rec) => total + (rec.monthlyBudget * 12), 0);
  }
}

export const priceTrackerService = PriceTrackerService.getInstance();