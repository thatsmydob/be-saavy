import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ExternalLink,
  ChevronRight,
  Clock,
  Info,
  ShieldAlert,
  Search
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { recallService } from './services/recallService';
import { cn } from './ui/utils';

interface SimplifiedRecallFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onRecallHandled: (recallId: string) => void;
}

export function SimplifiedRecallFlow({ isOpen, onClose, onRecallHandled }: SimplifiedRecallFlowProps) {
  const [recalls, setRecalls] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      loadRecalls();
    }
  }, [isOpen]);

  const loadRecalls = async () => {
    try {
      setIsLoading(true);
      await recallService.fetchLatestRecalls();
      
      // Get personalized recalls (you can adjust these parameters based on your baby's profile)
      const personalizedRecalls = recallService.getPersonalizedRecalls(8, [
        'Fisher-Price Rock n Play',
        'Chicco Bravo Stroller',
        'Baby Trend Car Seat'
      ]);
      
      setRecalls(personalizedRecalls);
    } catch (error) {
      console.error('Failed to load recalls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecalls = recalls.filter(recall => 
    recall.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recall.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRecallIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high': return <ShieldAlert className="w-5 h-5 text-orange-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getRecallColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'high': return 'border-orange-200 bg-orange-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const handleRecallAction = (recall: any) => {
    // Handle the recall action (e.g., mark as handled, open external link)
    if (recall.sourceUrl) {
      window.open(recall.sourceUrl, '_blank');
    }
    onRecallHandled(recall.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Product Recall Alerts</h2>
              <p className="text-sm text-muted-foreground">Stay informed about product safety</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search recalls by product or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[50vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading recall information...</p>
              </div>
            </div>
          ) : filteredRecalls.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Great news!</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'No recalls found matching your search.' : 'No active recalls found for your baby products.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {filteredRecalls.map((recall) => (
                <Card key={recall.id} className={cn('p-4', getRecallColor(recall.severity))}>
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-0.5">
                          {getRecallIcon(recall.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm line-clamp-1">{recall.title}</h3>
                            <Badge className={cn('text-xs flex-shrink-0', getBadgeColor(recall.severity))}>
                              {recall.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {recall.brand} • {recall.category}
                          </p>
                          <p className="text-sm text-foreground line-clamp-2">
                            {recall.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Reported: {new Date(recall.dateIssued).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Risk Level: {recall.riskLevel}/5
                        </span>
                      </div>
                    </div>

                    {/* Age Range Alert */}
                    {recall.ageRange && (
                      <Alert className="py-2">
                        <Info className="w-4 h-4" />
                        <AlertDescription className="text-xs">
                          Affects babies aged {recall.ageRange.min}-{recall.ageRange.max} months
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Action Required */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-xs">
                        <span className="font-medium text-foreground">Action required: </span>
                        <span className="text-muted-foreground">{recall.actionRequired}</span>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleRecallAction(recall)}
                        className="text-xs"
                      >
                        View Details
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <p>Data from CPSC, FDA, and manufacturer reports</p>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}