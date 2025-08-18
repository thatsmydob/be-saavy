import React, { useState } from 'react';
import { 
  Scan, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Star, 
  X,
  Camera,
  Loader2,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { AIService, Product, SafetyAssessment } from './services/aiService';
import { cn } from './ui/utils';

interface ProductScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onProductScanned?: (product: Product, assessment: SafetyAssessment) => void;
}

export function ProductScanner({ isOpen, onClose, onProductScanned }: ProductScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [safetyAssessment, setSafetyAssessment] = useState<SafetyAssessment | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleStartScan = async () => {
    setIsScanning(true);
    setScanError(null);
    setScannedProduct(null);
    setSafetyAssessment(null);

    try {
      // Simulate barcode scanning
      const barcode = await AIService.simulateBarcodeScanning();
      const product = AIService.recognizeProduct(barcode);
      
      if (product) {
        const babyProfile = AIService.getBabyProfile();
        const assessment = AIService.assessProductSafety(product, babyProfile.ageInMonths);
        
        setScannedProduct(product);
        setSafetyAssessment(assessment);
        
        if (onProductScanned) {
          onProductScanned(product, assessment);
        }
      } else {
        setScanError('Product not found in our database. Please try again or search manually.');
      }
    } catch (error) {
      setScanError('Scanning failed. Please check your camera permissions and try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSafetyIcon = (level: string) => {
    switch (level) {
      case 'low': return <ShieldCheck className="w-5 h-5 text-green-600" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'high': return <ShieldAlert className="w-5 h-5 text-red-600" />;
      default: return <ShieldCheck className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto" aria-describedby="scanner-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-primary" />
            Product Safety Scanner
          </DialogTitle>
          <div id="scanner-description" className="sr-only">
            Scan product barcodes to get AI-powered safety assessments for your baby
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scanner Interface */}
          {!scannedProduct && !scanError && (
            <div className="space-y-4">
              <div className="relative aspect-square bg-muted rounded-xl overflow-hidden flex items-center justify-center">
                {isScanning ? (
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">Scanning product...</p>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <Camera className="w-16 h-16 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">Tap scan to analyze product safety</p>
                  </div>
                )}
                
                {/* Scanning overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-primary/5">
                    <div className="absolute inset-4 border-2 border-primary rounded-lg">
                      <div className="w-full h-0.5 bg-primary animate-pulse absolute top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleStartScan} 
                disabled={isScanning}
                className="w-full bg-primary hover:bg-primary-light text-white py-3 rounded-xl"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4 mr-2" />
                    Scan Product Barcode
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Scan Error */}
          {scanError && (
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {scanError}
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleStartScan} 
                  variant="outline" 
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={() => setScanError(null)} 
                  variant="ghost"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Product Results */}
          {scannedProduct && safetyAssessment && (
            <div className="space-y-4">
              {/* Product Info */}
              <Card className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{scannedProduct.name}</h3>
                      <p className="text-sm text-muted-foreground">{scannedProduct.brand}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {scannedProduct.category}
                      </Badge>
                    </div>
                    {scannedProduct.price && (
                      <span className="text-lg font-semibold text-primary">
                        ${scannedProduct.price}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {scannedProduct.description}
                  </p>
                  
                  <div className="text-xs text-muted-foreground">
                    Age Range: {scannedProduct.ageRange.min}-{scannedProduct.ageRange.max} months
                  </div>
                </div>
              </Card>

              {/* Safety Assessment */}
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Safety Assessment</h3>
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium",
                      getRiskLevelColor(safetyAssessment.riskLevel)
                    )}>
                      {getSafetyIcon(safetyAssessment.riskLevel)}
                      {safetyAssessment.riskLevel.toUpperCase()} RISK
                    </div>
                  </div>

                  {/* Safety Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Safety Score</span>
                      <span className="font-semibold">{safetyAssessment.overallScore.toFixed(1)}/5.0</span>
                    </div>
                    <Progress value={(safetyAssessment.overallScore / 5) * 100} className="h-2" />
                  </div>

                  {/* Risks */}
                  {safetyAssessment.risks.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">Safety Concerns:</h4>
                      {safetyAssessment.risks.map((risk, index) => (
                        <Alert key={index} className={cn(
                          "p-3",
                          risk.severity === 'high' ? 'border-red-200 bg-red-50' :
                          risk.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                          'border-blue-200 bg-blue-50'
                        )}>
                          <AlertTriangle className={cn(
                            "h-4 w-4",
                            risk.severity === 'high' ? 'text-red-600' :
                            risk.severity === 'medium' ? 'text-yellow-600' :
                            'text-blue-600'
                          )} />
                          <AlertDescription className="text-sm">
                            <div className="space-y-1">
                              <p className="font-medium">{risk.description}</p>
                              {risk.mitigation && (
                                <p className="text-xs text-muted-foreground">
                                  💡 {risk.mitigation}
                                </p>
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  {safetyAssessment.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">Recommendations:</h4>
                      <div className="space-y-1">
                        {safetyAssessment.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setScannedProduct(null);
                    setSafetyAssessment(null);
                  }}
                  variant="outline" 
                  className="flex-1"
                >
                  Scan Another
                </Button>
                <Button 
                  onClick={onClose}
                  className="flex-1 bg-primary hover:bg-primary-light text-white"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}