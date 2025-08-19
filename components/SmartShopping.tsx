import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingDown, 
  ShoppingCart, 
  AlertTriangle,
  Star,
  ExternalLink,
  Clock,
  Target,
  Zap,
  PiggyBank,
  Shield,
  Heart,
  Filter
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { priceTrackerService, ProductPrice, BudgetRecommendation } from './services/priceTrackerService';
import { recommendationService, SmartRecommendation } from './services/recommendationService';
import { cn } from './ui/utils';

interface SmartShoppingProps {
  babyAge: number; // in months
  monthlyBudget: number;
  preferences: {
    organic: boolean;
    sustainable: boolean;
    budget_conscious: boolean;
  };
}

export function SmartShopping({ babyAge, monthlyBudget, preferences }: SmartShoppingProps) {
  const [activeTab, setActiveTab] = useState('deals');
  const [currentDeals, setCurrentDeals] = useState<ProductPrice[]>([]);
  const [budgetRecommendations, setBudgetRecommendations] = useState<BudgetRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadSmartShoppingData();
  }, [babyAge, monthlyBudget, preferences]);

  const loadSmartShoppingData = async () => {
    try {
      setIsLoading(true);
      
      // Initialize price tracker with sample data
      priceTrackerService.initializeSampleProducts();
      
      // Get current deals
      const deals = priceTrackerService.getCurrentDeals();
      setCurrentDeals(deals);

      // Get budget recommendations
      const recommendations = priceTrackerService.getPersonalizedRecommendations(
        babyAge, 
        monthlyBudget, 
        preferences
      );
      setBudgetRecommendations(recommendations);

    } catch (error) {
      console.error('Failed to load shopping data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBudgetHealthColor = () => {
    const totalSpent = budgetRecommendations.reduce((sum, rec) => sum + rec.monthlyBudget, 0);
    const percentage = (totalSpent / monthlyBudget) * 100;
    
    if (percentage <= 80) return 'text-green-600';
    if (percentage <= 95) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRetailerLogo = (retailer: string) => {
    const logos: Record<string, string> = {
      amazon: '🛒',
      target: '🎯',
      walmart: '💙',
      buybuybaby: '👶',
      costco: '🏬'
    };
    return logos[retailer] || '🏪';
  };

  const getSafetyBadge = (rating?: string) => {
    if (!rating) return null;
    
    const colors: Record<string, string> = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      fair: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={cn('text-xs', colors[rating])}>
        <Shield className="w-3 h-3 mr-1" />
        {rating}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Budget Overview */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Smart Shopping</h2>
              <p className="text-gray-600">AI-powered deals and budget guidance for your {babyAge}-month-old</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(monthlyBudget)}
              </div>
              <p className="text-sm text-gray-500">Monthly Budget</p>
            </div>
          </div>

          {/* Budget Health Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Budget Allocation</span>
              <span className={cn('text-sm font-medium', getBudgetHealthColor())}>
                {budgetRecommendations.reduce((sum, rec) => sum + rec.monthlyBudget, 0).toFixed(0)}/{monthlyBudget} Used
              </span>
            </div>
            <Progress 
              value={(budgetRecommendations.reduce((sum, rec) => sum + rec.monthlyBudget, 0) / monthlyBudget) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Smart Insights Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <Zap className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Smart Savings Opportunity:</strong> Based on your preferences, you could save{' '}
          <span className="font-semibold">
            {formatCurrency(budgetRecommendations.reduce((sum, rec) => sum + rec.totalSavings, 0))}
          </span>{' '}
          this month with our recommended deals.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deals">
            <TrendingDown className="w-4 h-4 mr-2" />
            Current Deals
          </TabsTrigger>
          <TabsTrigger value="budget">
            <PiggyBank className="w-4 h-4 mr-2" />
            Budget Guide
          </TabsTrigger>
          <TabsTrigger value="essentials">
            <Heart className="w-4 h-4 mr-2" />
            Essentials
          </TabsTrigger>
        </TabsList>

        {/* Current Deals Tab */}
        <TabsContent value="deals" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Hot Deals for {babyAge}-Month-Olds</h3>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="grid gap-4">
            {currentDeals.slice(0, 6).map((deal) => (
              <Card key={deal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-red-100 text-red-800 font-semibold">
                          {deal.discountPercent.toFixed(0)}% OFF
                        </Badge>
                        {getSafetyBadge(deal.safetyRating)}
                        {deal.isEssential && (
                          <Badge className="bg-purple-100 text-purple-800">Essential</Badge>
                        )}
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 mb-1">{deal.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{deal.brand}</p>
                      
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center">
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(deal.currentPrice)}
                          </span>
                          <span className="text-sm text-gray-500 line-through ml-2">
                            {formatCurrency(deal.originalPrice)}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          {deal.rating} ({deal.reviewCount})
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-2">{getRetailerLogo(deal.retailer)}</span>
                          {deal.retailer}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'w-2 h-2 rounded-full',
                            deal.availability === 'in_stock' ? 'bg-green-500' :
                            deal.availability === 'low_stock' ? 'bg-yellow-500' : 'bg-red-500'
                          )} />
                          <span className="text-xs text-gray-500 capitalize">
                            {deal.availability.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      className="ml-4"
                      onClick={() => window.open(deal.productUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Deal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Budget Guide Tab */}
        <TabsContent value="budget" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">Smart Budget Allocation</h3>
            <p className="text-gray-600 mb-6">
              Recommended spending by category for a {babyAge}-month-old baby
            </p>
          </div>

          <div className="grid gap-4">
            {budgetRecommendations.map((category, index) => (
              <Card key={category.category}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold capitalize text-gray-900">
                      {category.category.replace('_', ' ')}
                    </h4>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(category.monthlyBudget)}
                      </div>
                      <div className="text-xs text-green-600">
                        Save {formatCurrency(category.totalSavings)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Essential Items</h5>
                      <div className="space-y-1">
                        {category.essentialItems.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{item.name}</span>
                            <span className="font-medium">{formatCurrency(item.currentPrice)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Money-Saving Tips</h5>
                      <div className="space-y-1">
                        {category.recommendations.slice(0, 2).map((tip, tipIndex) => (
                          <p key={tipIndex} className="text-xs text-gray-600 flex items-start">
                            <span className="text-green-600 mr-1">•</span>
                            {tip}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Budget Summary */}
          <Card className="bg-blue-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Budget Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Total Allocated:</span>
                  <span className="font-semibold text-blue-900 ml-2">
                    {formatCurrency(budgetRecommendations.reduce((sum, rec) => sum + rec.monthlyBudget, 0))}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Potential Savings:</span>
                  <span className="font-semibold text-green-600 ml-2">
                    {formatCurrency(budgetRecommendations.reduce((sum, rec) => sum + rec.totalSavings, 0))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Essentials Tab */}
        <TabsContent value="essentials" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Age-Appropriate Essentials</h3>
            <p className="text-gray-600 mb-6">
              Must-have items for your {babyAge}-month-old's safety and development
            </p>
          </div>

          {/* Essential Categories */}
          <div className="grid gap-4">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <h4 className="font-semibold text-red-900">Safety Essentials</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-red-800">• Car seat appropriate for weight/age</p>
                  <p className="text-red-800">• Baby-proofing supplies (if mobile)</p>
                  <p className="text-red-800">• Thermometer and first aid kit</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <Heart className="w-5 h-5 text-yellow-600 mr-2" />
                  <h4 className="font-semibold text-yellow-900">Daily Care</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-yellow-800">• Diapers and wipes (size appropriate)</p>
                  <p className="text-yellow-800">• Gentle baby soap and lotion</p>
                  <p className="text-yellow-800">• Clean bottles and feeding supplies</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <Zap className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-semibold text-green-900">Development</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-green-800">• Age-appropriate toys for motor skills</p>
                  <p className="text-green-800">• Books for language development</p>
                  <p className="text-green-800">• Comfortable clothing for growth</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}