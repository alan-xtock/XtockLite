import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, DollarSign, TrendingDown, Zap, Upload, Brain, MessageCircle, Check, X } from 'lucide-react';

interface TryNowDemoProps {
  onStartDemo: () => void;
  isDemoActive?: boolean;
  currentDemoStep?: number;
  onExitDemo?: () => void;
}

export default function TryNowDemo({ onStartDemo, isDemoActive = false, currentDemoStep = 1, onExitDemo }: TryNowDemoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showStepsOverlay, setShowStepsOverlay] = useState(false);

  const explanationSteps = [
    {
      title: "What XtockLite Does",
      icon: <DollarSign className="w-8 h-8 text-primary" />,
      content: "XtockLite is your AI-powered assistant that helps you save 10% on your daily produce costs. It's like having a smart purchasing expert that never sleeps, analyzing your sales patterns and making sure you buy exactly what you need, when you need it."
    },
    {
      title: "How It Works",
      icon: <Brain className="w-8 h-8 text-accent" />,
      content: "It's simple: Upload your sales history → Our AI studies your patterns → Get smart recommendations → Send orders to suppliers via WhatsApp. The AI learns from your data to predict exactly how much of each item you'll need, preventing both stockouts and waste."
    },
    {
      title: "Value You Get",
      icon: <TrendingDown className="w-8 h-8 text-green-600" />,
      content: "Save money through smarter ordering, reduce food waste by 15-20%, automate your purchasing process, and get WhatsApp-delivered orders that suppliers love. Most customers see results within the first week."
    }
  ];

  const demoSteps = [
    {
      step: 1,
      title: "Upload Your Sales Data",
      description: "Click the upload area and select a CSV file with your recent sales history (last 30 days works best)",
      icon: <Upload className="w-5 h-5" />
    },
    {
      step: 2,
      title: "Let AI Analyze",
      description: "Watch as our AI studies your sales patterns, identifies trends, and calculates optimal order quantities",
      icon: <Brain className="w-5 h-5" />
    },
    {
      step: 3,
      title: "Review Forecasts",
      description: "See predicted demand for each item with confidence scores and potential savings",
      icon: <TrendingDown className="w-5 h-5" />
    },
    {
      step: 4,
      title: "Generate Orders",
      description: "Create purchase orders based on AI recommendations and send them directly to suppliers via WhatsApp",
      icon: <MessageCircle className="w-5 h-5" />
    }
  ];

  const handleNext = () => {
    if (currentStep < explanationSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleReady = () => {
    setIsOpen(false);
    setCurrentStep(0);
    setShowStepsOverlay(true);
    setTimeout(() => {
      setShowStepsOverlay(false);
      onStartDemo();
    }, 5000); // Show steps for 5 seconds then start demo
  };

  const handleExitDemo = () => {
    if (onExitDemo) {
      onExitDemo();
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        size="lg"
        variant="default"
        className="font-semibold shadow-lg"
        data-testid="button-try-now"
      >
        <Zap className="w-5 h-5 mr-2" />
        Try Now - See How It Works
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Welcome to XtockLite
            </DialogTitle>
          </DialogHeader>

          {currentStep < explanationSteps.length ? (
            <div className="space-y-6">
              <Card className="border-2 border-primary/20">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {explanationSteps[currentStep].icon}
                  </div>
                  <CardTitle className="text-xl">
                    {explanationSteps[currentStep].title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    {explanationSteps[currentStep].content}
                  </p>
                </CardContent>
              </Card>

              <div className="flex justify-center space-x-2">
                {explanationSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              <div className="flex justify-center">
                {currentStep < explanationSteps.length - 1 ? (
                  <Button onClick={handleNext} size="lg" data-testid="button-next-explanation">
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-lg font-semibold">Ready to try XtockLite?</p>
                    <Button onClick={handleReady} size="lg" className="bg-accent hover:bg-accent/90" data-testid="button-ready">
                      Yes, I'm Ready!
                      <Check className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Demo Steps Overlay - shown after user clicks Ready */}
      <Dialog open={showStepsOverlay} onOpenChange={setShowStepsOverlay}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Follow These Steps</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {demoSteps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                <div className="flex-shrink-0 text-muted-foreground">
                  {step.icon}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">Starting in a moment...</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Demo Step Indicator - shown during active demo */}
      {isDemoActive && (
        <div className="fixed top-20 right-4 z-50 bg-primary text-primary-foreground rounded-lg shadow-lg p-3 max-w-xs" data-testid="demo-step-indicator">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">
              Step {currentDemoStep}: {demoSteps[currentDemoStep - 1]?.title}
            </h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={handleExitDemo}
              data-testid="button-exit-demo"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs opacity-90">
            {demoSteps[currentDemoStep - 1]?.description}
          </p>
        </div>
      )}
    </>
  );
}