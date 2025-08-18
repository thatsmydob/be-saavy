import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  ExternalLink, 
  Filter, 
  Search, 
  ShieldAlert, 
  ShieldCheck,
  Calendar,
  Package,
  Phone,
  Eye,
  X,
  ChevronDown,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AIService, ProductRecall } from './services/aiService';
import { cn } from './ui/utils';

interface ProductRecallsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProductRecalls({ isOpen, onClose }: ProductRecallsProps) {
  const [selectedRecall, setSelectedRecall] = useState<ProductRecall | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('relevant');

  const allRecalls = AIService.getProductRecalls();
  const relevantRecalls = AIService.getProductRecalls(true);
  const urgentRecalls = AIService.getUrgentRecalls();
  const recentRecalls = AIService.getRecentRecalls(30);
  const summary = AIService.getRecallSummary();

  const getFilteredRecalls = (recallList: ProductRecall[]) => {
    let filtered = recallList;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = AIService.searchRecalls(searchQuery);
    }

    // Apply severity filter
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(recall => recall.severity === filterSeverity);
    }

    return filtered;
  };

  const getCurrentRecalls = () => {
    switch (activeTab) {
      case 'urgent':
        return getFilteredRecalls(urgentRecalls);
      case 'recent':
        return getFilteredRecalls(recentRecalls);
      case 'all':
        return getFilteredRecalls(allRecalls);
      default:
        return getFilteredRecalls(relevantRecalls);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'urgent': return 'text-red-700 bg-red-50 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'urgent': return <ShieldAlert className="w-4 h-4 text-red-600" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'medium': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'low': return <ShieldCheck className="w-4 h-4 text-green-600" />;
      default: return <ShieldCheck className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const currentRecalls = getCurrentRecalls();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl mx-auto max-h-[90vh] overflow-hidden" aria-describedby="recalls-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-orange-600" />
            Product Recalls
          </DialogTitle>
          <div id="recalls-description" className="sr-only">
            View and manage product recalls affecting baby products
          </div>
        </DialogHeader>

        <div className="space-y-6 overflow-hidden">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3">
              <div className="text-center space-y-1">
                <div className="text-2xl font-semibold text-primary">{summary.relevant}</div>
                <div className="text-xs text-muted-foreground">Relevant</div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-center space-y-1">
                <div className="text-2xl font-semibold text-red-600">{summary.urgent}</div>
                <div className="text-xs text-muted-foreground">Urgent</div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-center space-y-1">
                <div className="text-2xl font-semibold text-orange-600">{summary.recent}</div>
                <div className="text-xs text-muted-foreground">This Week</div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-center space-y-1">
                <div className="text-2xl font-semibold text-muted-foreground">{summary.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search recalls by product name, brand, or hazard..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button variant="outline" size="sm" className="px-3">
                <Search className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'urgent', 'high', 'medium', 'low'].map(severity => (
                <Button
                  key={severity}
                  variant={filterSeverity === severity ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterSeverity(severity)}
                  className="whitespace-nowrap text-xs"
                >
                  {severity === 'all' ? 'All Severities' : severity.charAt(0).toUpperCase() + severity.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="relevant" className="text-xs">
                Relevant ({summary.relevant})
              </TabsTrigger>
              <TabsTrigger value="urgent" className="text-xs">
                Urgent ({summary.urgent})
              </TabsTrigger>
              <TabsTrigger value="recent" className="text-xs">
                Recent ({summary.recent})
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs">
                All ({summary.total})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 max-h-96 overflow-y-auto">
              {currentRecalls.length === 0 ? (
                <Card className="p-6">
                  <div className="text-center space-y-2">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                    <h3 className="text-lg font-medium text-foreground">
                      {searchQuery || filterSeverity !== 'all' 
                        ? 'No matching recalls found' 
                        : 'No recalls in this category'
                      }
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery || filterSeverity !== 'all'
                        ? 'Try adjusting your search or filter criteria'
                        : 'Great news! There are no recalls affecting this category.'
                      }
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {currentRecalls.map((recall) => (
                    <Card key={recall.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">
                                {recall.product.name}
                              </h3>
                              <Badge className={cn(
                                "text-xs font-medium",
                                getSeverityColor(recall.severity)
                              )}>
                                {getSeverityIcon(recall.severity)}
                                {recall.severity.toUpperCase()}
                              </Badge>
                              {recall.isRelevant && (
                                <Badge variant="secondary" className="text-xs">
                                  Relevant
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {recall.product.brand} • {recall.product.model}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRecall(recall)}
                            className="text-primary hover:text-primary-light"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </div>

                        {/* Recall Info */}
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground">
                                {recall.reason}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {recall.hazard}
                              </p>
                            </div>
                          </div>
                          
                          {recall.isRelevant && recall.aiRelevanceReason && (
                            <Alert className="bg-blue-50 border-blue-200">
                              <AlertCircle className="h-4 w-4 text-blue-600" />
                              <AlertDescription className="text-sm text-blue-700">
                                💡 AI Insight: {recall.aiRelevanceReason}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(recall.recallDate)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {recall.affectedUnits.toLocaleString()} units
                            </div>
                          </div>
                          <div className="text-xs font-medium">
                            #{recall.recallNumber}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Recall Details Modal */}
        {selectedRecall && (
          <Dialog open={!!selectedRecall} onOpenChange={() => setSelectedRecall(null)}>
            <DialogContent className="max-w-2xl mx-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getSeverityIcon(selectedRecall.severity)}
                  {selectedRecall.product.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Product Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedRecall.product.brand}</h3>
                      <p className="text-sm text-muted-foreground">{selectedRecall.product.model}</p>
                    </div>
                    <Badge className={cn(
                      "text-sm font-medium",
                      getSeverityColor(selectedRecall.severity)
                    )}>
                      {getSeverityIcon(selectedRecall.severity)}
                      {selectedRecall.severity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Recall Date:</span>
                      <br />
                      {formatDate(selectedRecall.recallDate)}
                    </div>
                    <div>
                      <span className="font-medium">Affected Units:</span>
                      <br />
                      {selectedRecall.affectedUnits.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Hazard Information */}
                <Card className="p-4 border-orange-200 bg-orange-50">
                  <div className="space-y-3">
                    <h4 className="font-medium text-orange-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Safety Hazard
                    </h4>
                    <p className="text-sm text-orange-700">{selectedRecall.hazard}</p>
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <p className="text-sm font-medium text-orange-800">Action Required:</p>
                      <p className="text-sm text-orange-700">{selectedRecall.actionRequired}</p>
                    </div>
                  </div>
                </Card>

                {/* Remedy Information */}
                <Card className="p-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">What You Should Do</h4>
                    <p className="text-sm text-muted-foreground">{selectedRecall.remedy.instructions}</p>
                    
                    {selectedRecall.remedy.contactInfo && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-primary" />
                        <span className="text-primary font-medium">{selectedRecall.remedy.contactInfo}</span>
                      </div>
                    )}
                    
                    {selectedRecall.manufacturerResponse && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Manufacturer Response:</p>
                        <p className="text-sm text-foreground">{selectedRecall.manufacturerResponse}</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* AI Relevance */}
                {selectedRecall.isRelevant && selectedRecall.aiRelevanceReason && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-700">
                      <span className="font-medium">Why this is relevant for Emma:</span><br />
                      {selectedRecall.aiRelevanceReason}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {selectedRecall.cpscUrl && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(selectedRecall.cpscUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      CPSC Details
                    </Button>
                  )}
                  <Button 
                    onClick={() => setSelectedRecall(null)}
                    className="flex-1 bg-primary hover:bg-primary-light text-white"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}