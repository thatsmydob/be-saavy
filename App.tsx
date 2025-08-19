import React, {
  useState,
  useEffect,
  lazy,
  Suspense,
  useRef,
  useCallback,
} from "react";
import {
  motion,
  AnimatePresence,
  useAnimation,
  PanInfo,
} from "framer-motion";
import {
  Home,
  MessageCircle,
  Shield,
  Baby,
  Heart,
  Settings,
  RefreshCw,
  Bell,
  Zap,
  Award,
  Sun,
  Moon,
  Coffee,
  BookOpen,
  Users,
  ShoppingCart,
  Brain,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "./components/ui/utils";
import { HomeScreen } from "./components/HomeScreen";
import { SmartShopping } from "./components/SmartShopping";
import { DailyInsights } from "./components/DailyInsights";
import { Button } from "./components/ui/button";
import { Skeleton } from "./components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./components/ui/sheet";
import { Card, CardContent } from "./components/ui/card";
import { NotificationService } from "./components/services/NotificationService";

// Lazy load screens for performance
const AIAssistantScreen = lazy(() =>
  import("./components/AIAssistantScreen").then((module) => ({
    default: module.AIAssistantScreen,
  })),
);
const SafetyScreen = lazy(() =>
  import("./components/SafetyScreen").then((module) => ({
    default: module.SafetyScreen,
  })),
);
const BabyProfileScreen = lazy(() =>
  import("./components/BabyProfileScreen").then((module) => ({
    default: module.BabyProfileScreen,
  })),
);
const LifestyleScreen = lazy(() =>
  import("./components/LifestyleScreen").then((module) => ({
    default: module.LifestyleScreen,
  })),
);
const SettingsScreen = lazy(() =>
  import("./components/SettingsScreen").then((module) => ({
    default: module.SettingsScreen,
  })),
);

// Enhanced Haptic Feedback Hook
const useHapticFeedback = () => {
  const triggerHaptic = useCallback(
    (
      intensity: "light" | "medium" | "heavy" = "medium",
      element?: HTMLElement,
    ) => {
      // Visual haptic feedback simulation
      if (element) {
        element.classList.add(`haptic-${intensity}`);
        setTimeout(
          () => element.classList.remove(`haptic-${intensity}`),
          intensity === "light"
            ? 100
            : intensity === "medium"
              ? 150
              : 200,
        );
      }

      // Native haptic feedback if available
      if ("vibrate" in navigator) {
        const patterns = {
          light: [10],
          medium: [20, 10, 20],
          heavy: [30, 15, 30, 15, 30],
        };
        navigator.vibrate(patterns[intensity]);
      }

      // Audio feedback for accessibility
      if ("AudioContext" in window) {
        try {
          const audioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.setValueAtTime(
            intensity === "light"
              ? 800
              : intensity === "medium"
                ? 600
                : 400,
            audioContext.currentTime,
          );
          oscillator.type = "sine";
          gainNode.gain.setValueAtTime(
            0.1,
            audioContext.currentTime,
          );
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.1,
          );

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
          // Silent fallback
        }
      }
    },
    [],
  );

  return { triggerHaptic };
};

// Pull to Refresh Hook with enhanced feedback
const usePullToRefresh = (onRefresh: () => Promise<void>) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { triggerHaptic } = useHapticFeedback();

  const handlePanStart = useCallback(() => {
    if (window.scrollY === 0) {
      setIsPulling(true);
    }
  }, []);

  const handlePanMove = useCallback(
    (_: any, info: PanInfo) => {
      if (isPulling && info.delta.y > 0) {
        const distance = Math.min(info.offset.y, 120);
        setPullDistance(distance);

        // Haptic feedback at threshold
        if (distance > 80 && pullDistance <= 80) {
          triggerHaptic("light");
        }
      }
    },
    [isPulling, pullDistance, triggerHaptic],
  );

  const handlePanEnd = useCallback(async () => {
    if (isPulling) {
      setIsPulling(false);

      if (pullDistance > 80) {
        setIsRefreshing(true);
        triggerHaptic("medium");

        try {
          await onRefresh();
          toast.success("Everything's fresh and updated!", {
            description:
              "You're staying on top of Emma's world beautifully ✨",
            duration: 3000,
            action: {
              label: "💙",
              onClick: () => triggerHaptic("light"),
            },
          });
        } catch (error) {
          toast.error("Couldn't refresh right now", {
            description: "No worries, try again in a moment",
            duration: 2500,
          });
        } finally {
          setIsRefreshing(false);
        }
      }

      setPullDistance(0);
    }
  }, [isPulling, pullDistance, onRefresh, triggerHaptic]);

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
  };
};

// Premium Loading Component with Skeletons
const PremiumLoadingSpinner = ({
  showSkeletons = false,
}: {
  showSkeletons?: boolean;
}) => {
  const [loadingMessage, setLoadingMessage] = useState(
    "Loading with love...",
  );

  useEffect(() => {
    const messages = [
      "Loading with love...",
      "Getting everything ready...",
      "Preparing your updates...",
      "Almost there...",
      "Just a moment...",
    ];
    
    const interval = setInterval(() => {
      setLoadingMessage(
        messages[Math.floor(Math.random() * messages.length)],
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (showSkeletons) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header Skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>

        {/* Content Skeletons */}
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="flex items-center justify-center h-full min-h-[400px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex flex-col items-center gap-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="relative">
          <motion.div
            className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute inset-2 w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full opacity-20"
            animate={{ scale: [0.8, 1.2, 0.8] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center"
        >
          <motion.p
            className="text-lg font-semibold text-foreground mb-2"
            key={loadingMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {loadingMessage}
          </motion.p>
          <p className="text-sm text-muted-foreground">
            You're doing amazing ✨
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

type Screen =
  | "home"
  | "assistant"
  | "safety"
  | "baby"
  | "lifestyle"
  | "shopping"
  | "insights"
  | "settings";

// Enhanced navigation with tooltips and haptic feedback
const navigation = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    color: "text-primary",
    bgColor: "bg-primary/10",
    gradientFrom: "from-primary/20",
    gradientTo: "to-primary/5",
    description: "Your personalized dashboard",
    detailedDescription:
      "Daily insights, milestones, and everything you need at a glance",
    supportiveMessage: "Everything you need is here",
    shortcut: "⌘1",
  },
  {
    id: "assistant",
    label: "Ask AI",
    icon: MessageCircle,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    gradientFrom: "from-secondary/20",
    gradientTo: "to-secondary/5",
    description: "Get instant parenting guidance",
    detailedDescription:
      "24/7 support with evidence-based answers from trusted sources",
    supportiveMessage: "No question is too small",
    shortcut: "⌘2",
  },
  {
    id: "safety",
    label: "Safety",
    icon: Shield,
    color: "text-accent",
    bgColor: "bg-accent/10",
    gradientFrom: "from-accent/20",
    gradientTo: "to-accent/5",
    description: "Keep Emma safe",
    detailedDescription:
      "Product recalls, safety alerts, and childproofing guidance",
    supportiveMessage: "Peace of mind always",
    shortcut: "⌘3",
  },
  {
    id: "baby",
    label: "Emma",
    icon: Baby,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    gradientFrom: "from-purple-100",
    gradientTo: "to-purple-50",
    description: "Track development and growth",
    detailedDescription:
      "Milestones, growth charts, and developmental insights",
    supportiveMessage: "Watching Emma grow",
    shortcut: "⌘4",
  },
  {
    id: "lifestyle",
    label: "Wellness",
    icon: Heart,
    color: "text-pink-500",
    bgColor: "bg-pink-50",
    gradientFrom: "from-pink-100",
    gradientTo: "to-pink-50",
    description: "Care for yourself and baby",
    detailedDescription:
      "Self-care tips, mental health support, and wellness tracking",
    supportiveMessage: "You matter too",
    shortcut: "⌘5",
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: ShoppingCart,
    color: "text-green-500",
    bgColor: "bg-green-50",
    gradientFrom: "from-green-100",
    gradientTo: "to-green-50",
    description: "Smart deals and price tracking",
    detailedDescription:
      "AI-powered shopping recommendations and price alerts for baby essentials",
    supportiveMessage: "Save money, stay safe",
    shortcut: "⌘6",
  },
  {
    id: "insights",
    label: "Insights",
    icon: Brain,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
    gradientFrom: "from-indigo-100",
    gradientTo: "to-indigo-50",
    description: "Personalized daily guidance",
    detailedDescription:
      "AI-generated insights combining safety, budget, and developmental guidance",
    supportiveMessage: "Smart parenting made simple",
    shortcut: "⌘7",
  },
] as const;

export default function App() {
  const [currentScreen, setCurrentScreen] =
    useState<Screen>("home");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hasUnreadNotifications, setHasUnreadNotifications] =
    useState(true);
  const [showEncouragement, setShowEncouragement] =
    useState(false);
  const [parentingStreak, setParentingStreak] = useState(12);
  const [recentMilestone, setRecentMilestone] = useState(
    "Emma rolled over for the first time!",
  );
  const [hasSafetyAlerts, setHasSafetyAlerts] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);
  const [showCommunitySheet, setShowCommunitySheet] =
    useState(false);

  const floatingButtonControls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const { triggerHaptic } = useHapticFeedback();

  // Enhanced Pull to Refresh
  const handleRefresh = useCallback(async () => {
    // Simulate refresh delay with realistic timing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update some data to show refresh worked
    if (Math.random() > 0.5) {
      setParentingStreak((prev) => prev + 1);
    }

    // Randomly show new milestone
    const milestones = [
      "Emma smiled at you today!",
      "Emma held her head up during tummy time!",
      "Emma made eye contact and cooed!",
      "Emma reached for her favorite toy!",
      "Emma slept through the night!",
    ];
    setRecentMilestone(
      milestones[Math.floor(Math.random() * milestones.length)],
    );
  }, []);

  const {
    isPulling,
    pullDistance,
    isRefreshing,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
  } = usePullToRefresh(handleRefresh);

  // Time-based updates
  useEffect(() => {
    const timer = setInterval(
      () => setCurrentTime(new Date()),
      60000,
    );
    return () => clearInterval(timer);
  }, []);

  // Smart encouragement system with enhanced notifications
  useEffect(() => {
    const encouragementTimer = setInterval(() => {
      if (Math.random() > 0.7) {
        const encouragements = [
          {
            title: "You're doing amazing!",
            message: "Every small step matters in parenting 🌟",
            duration: 4000,
            icon: "🌟",
          },
          {
            title: "Take a deep breath",
            message: "Self-care makes you a better parent 💙",
            duration: 4000,
            icon: "💙",
          },
          {
            title: "Emma is lucky to have you",
            message:
              "Your love and care show in everything you do ✨",
            duration: 5000,
            icon: "✨",
          },
          {
            title: "Remember to celebrate small wins",
            message:
              "Every feeding, every diaper change, every smile counts 🎉",
            duration: 4500,
            icon: "🎉",
          },
        ];

        const encouragement =
          encouragements[
            Math.floor(Math.random() * encouragements.length)
          ];

        toast.success(encouragement.title, {
          description: encouragement.message,
          duration: encouragement.duration,
          action: {
            label: encouragement.icon,
            onClick: () => triggerHaptic("light"),
          },
        });

        setShowEncouragement(true);
        setTimeout(() => setShowEncouragement(false), 5000);
      }
    }, 300000); // Every 5 minutes

    return () => clearInterval(encouragementTimer);
  }, [triggerHaptic]);

  // Network monitoring with smart notifications
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success("You're back online!", {
        description: "All features are now available",
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.info("You're offline", {
        description:
          "Basic features still work. Don't worry! ☕",
        duration: 5000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Enhanced floating button animation
  useEffect(() => {
    floatingButtonControls.start({
      scale: [1, 1.05, 1],
      rotate: [0, 5, 0],
      transition: {
        duration: 0.6,
        ease: [0.68, -0.55, 0.265, 1.55],
      },
    });
  }, [currentScreen, floatingButtonControls]);
  
  // In your App.tsx or main component, track app usage:
  useEffect(() => {
    const notificationService = NotificationService.getInstance();
    notificationService.recordUserAppUsage();
}, []);


// When user interacts with notifications:
const handleNotificationClick = (notificationId: string) => {
  const notificationService = NotificationService.getInstance();
  notificationService.recordNotificationInteraction(notificationId, 'acted');
};

  // Enhanced screen transition with haptic feedback
  const handleScreenChange = useCallback(
    async (screen: Screen, element?: HTMLElement) => {
      if (screen !== currentScreen) {
        triggerHaptic("light", element);
        setIsLoading(true);

        // Show skeleton loading for better perceived performance
        await new Promise((resolve) =>
          setTimeout(resolve, 200),
        );
        setCurrentScreen(screen);

        // Simulate realistic loading time
        await new Promise((resolve) =>
          setTimeout(resolve, 100),
        );
        setIsLoading(false);

        // Success notification for screen changes
        if (screen !== "home") {
          const navItem = navigation.find(
            (nav) => nav.id === screen,
          );
          if (navItem) {
            toast.success(`${navItem.label} loaded`, {
              description: navItem.supportiveMessage,
              duration: 2000,
            });
          }
        }
      }
    },
    [currentScreen, triggerHaptic],
  );

  const renderScreen = () => {
    if (isLoading) {
      return <PremiumLoadingSpinner showSkeletons={true} />;
    }

    const screenComponent = (() => {
      switch (currentScreen) {
        case "home":
          return (
            <HomeScreen
              currentTime={currentTime}
              parentingStreak={parentingStreak}
              recentMilestone={recentMilestone}
              onScreenChange={handleScreenChange}
            />
          );
        case "assistant":
          return (
            <Suspense
              fallback={
                <PremiumLoadingSpinner showSkeletons={true} />
              }
            >
              <AIAssistantScreen />
            </Suspense>
          );
        case "safety":
          return (
            <Suspense
              fallback={
                <PremiumLoadingSpinner showSkeletons={true} />
              }
            >
              <SafetyScreen />
            </Suspense>
          );
        case "baby":
          return (
            <Suspense
              fallback={
                <PremiumLoadingSpinner showSkeletons={true} />
              }
            >
              <BabyProfileScreen />
            </Suspense>
          );
        case "lifestyle":
          return (
            <Suspense
              fallback={
                <PremiumLoadingSpinner showSkeletons={true} />
              }
            >
              <LifestyleScreen />
            </Suspense>
          );
        case "shopping":
          return (
            <SmartShopping 
              babyAge={6}
              monthlyBudget={400}
              preferences={{
                organic: false,
                sustainable: false,
                budget_conscious: true
              }}
            />
          );
        case "insights":
          return (
            <DailyInsights 
              babyProfile={{
                id: "demo-profile",
                name: "Emma",
                birthDate: "2024-07-18",
                ageInMonths: 6,
                feedingType: "combination",
                allergies: [],
                specialNeeds: [],
                parentPreferences: {
                  budget: "moderate",
                  organic: false,
                  sustainable: false,
                  brand_conscious: false
                },
                ownedProducts: []
              }}
              onRecommendationClick={(rec) => {
                toast.success("Recommendation clicked", {
                  description: rec.title,
                  duration: 2000
                });
              }}
            />
          );
        case "settings":
          return (
            <Suspense
              fallback={
                <PremiumLoadingSpinner showSkeletons={true} />
              }
            >
              <SettingsScreen />
            </Suspense>
          );
        default:
          return (
            <HomeScreen
              currentTime={currentTime}
              parentingStreak={parentingStreak}
              recentMilestone={recentMilestone}
              onScreenChange={handleScreenChange}
            />
          );
      }
    })();

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{
            duration: 0.3,
            ease: [0.23, 1, 0.32, 1],
          }}
          className="w-full h-full"
        >
          {screenComponent}
        </motion.div>
      </AnimatePresence>
    );
  };

  // Enhanced contextual greeting
  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6)
      return {
        text: "You're amazing for being up",
        subtext: "Night feeds are hard work",
        icon: Moon,
        color: "text-purple-500",
        gradient: "from-purple-100 to-purple-50",
        encouragement:
          "Every night feeding is an act of love ✨",
      };
    if (hour < 12)
      return {
        text: "Good morning, beautiful",
        subtext: "Ready for another wonderful day?",
        icon: Sun,
        color: "text-secondary",
        gradient:
          "from-secondary-lighter to-secondary-lightest",
        encouragement: "You're doing better than you think 🌟",
      };
    if (hour < 17)
      return {
        text: "Hope your day is going well",
        subtext: "Finding moments of joy with Emma?",
        icon: BookOpen,
        color: "text-primary",
        gradient: "from-primary-lighter to-primary-lightest",
        encouragement: "Every small moment matters 💙",
      };
    if (hour < 21)
      return {
        text: "Evening wind-down time",
        subtext: "You've accomplished so much today",
        icon: Coffee,
        color: "text-accent",
        gradient: "from-accent-lighter to-accent-lightest",
        encouragement: "Rest is productive too 🧡",
      };
    return {
      text: "Late night parent mode",
      subtext: "You're not alone in this journey",
      icon: Moon,
      color: "text-purple-500",
      gradient: "from-purple-100 to-purple-50",
      encouragement:
        "Nighttime parenting takes real courage 💜",
    };
  };

  const greeting = getTimeBasedGreeting();
  const GreetingIcon = greeting.icon;
  const currentNav = navigation.find(
    (nav) => nav.id === currentScreen,
  );

  const getNotificationCount = () => {
    let count = 0;
    if (hasUnreadNotifications) count++;
    if (hasSafetyAlerts) count++;
    return count;
  };

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        ref={containerRef}
        className="h-screen bg-gradient-to-br from-background via-background to-primary-lightest/20 flex flex-col max-w-md mx-auto overflow-hidden relative"
        style={{
          fontFamily: "var(--font-family)",
          fontSize: "var(--text-base)",
          lineHeight: "var(--leading-normal)",
          WebkitTapHighlightColor: "transparent",
          touchAction: "manipulation",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        onPanStart={handlePanStart}
        onPan={handlePanMove}
        onPanEnd={handlePanEnd}
      >
        {/* Enhanced Pull to Refresh Indicator */}
        <AnimatePresence>
          {(isPulling || isRefreshing) && (
            <motion.div
              className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-xl border-b border-border/20 shadow-premium"
              initial={{ opacity: 0, y: -60 }}
              animate={{
                opacity: 1,
                y: isPulling
                  ? Math.min(pullDistance - 60, 0)
                  : 0,
                height: isPulling
                  ? Math.min(pullDistance, 80)
                  : 60,
              }}
              exit={{ opacity: 0, y: -60 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="flex items-center gap-4 p-4">
                <motion.div
                  animate={
                    isRefreshing
                      ? { rotate: 360 }
                      : {
                          rotate:
                            pullDistance > 80
                              ? 180
                              : pullDistance * 2,
                        }
                  }
                  transition={
                    isRefreshing
                      ? {
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }
                      : { duration: 0.1 }
                  }
                  className="relative"
                >
                  <RefreshCw
                    className={cn(
                      "w-5 h-5 transition-colors duration-200",
                      pullDistance > 80 || isRefreshing
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  />
                  {isRefreshing && (
                    <motion.div
                      className="absolute inset-0 w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full"
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  )}
                </motion.div>
                <div className="flex flex-col">
                  <motion.p
                    className={cn(
                      "text-sm font-semibold transition-colors duration-200",
                      pullDistance > 80 || isRefreshing
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                    animate={{
                      scale: pullDistance > 80 ? 1.05 : 1,
                    }}
                  >
                    {isRefreshing
                      ? "Refreshing..."
                      : pullDistance > 80
                        ? "Release to refresh"
                        : "Pull to refresh"}
                  </motion.p>
                  {isRefreshing && (
                    <motion.p
                      className="text-xs text-muted-foreground"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      Getting the latest for Emma ✨
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced App Header with Layers */}
        <motion.div
          className="flex-shrink-0 relative overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: 1,
            y: 0,
            marginTop: isPulling
              ? Math.min(pullDistance, 80)
              : 0,
          }}
          transition={{
            duration: 0.5,
            ease: [0.23, 1, 0.32, 1],
          }}
        >
          {/* Header Background Layers */}
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xl" />
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-r transition-all duration-500",
              greeting.gradient,
            )}
            style={{ opacity: 0.3 }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"
            animate={{
              background: [
                "linear-gradient(90deg, rgba(91,155,213,0.05) 0%, transparent 50%, rgba(104,211,145,0.05) 100%)",
                "linear-gradient(90deg, rgba(104,211,145,0.05) 0%, transparent 50%, rgba(91,155,213,0.05) 100%)",
                "linear-gradient(90deg, rgba(91,155,213,0.05) 0%, transparent 50%, rgba(104,211,145,0.05) 100%)",
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="relative px-6 py-4 border-b border-border/20">
            <div className="flex items-center justify-between">
              {/* Enhanced Brand Identity */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <motion.div
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary-light to-secondary flex items-center justify-center shadow-premium relative"
                  animate={{
                    scale: [1, 1.02, 1],
                    rotate: [0, 1, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Baby className="w-6 h-6 text-white drop-shadow-sm" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-secondary to-primary rounded-full border-2 border-white shadow-premium"
                    animate={{
                      scale: [1, 1.3, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <motion.h1
                    className="text-xl font-bold text-foreground truncate"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    Be-Saavy
                  </motion.h1>

                  <motion.div
                    className="flex items-center gap-2 mt-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <GreetingIcon
                        className={cn(
                          "w-3 h-3",
                          greeting.color,
                        )}
                      />
                    </motion.div>
                    <p className="text-xs text-foreground leading-tight truncate font-medium">
                      {greeting.text}
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Enhanced Action Bar */}
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {/* Enhanced Parenting Streak */}
                <AnimatePresence>
                  {parentingStreak > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          className="flex items-center gap-1.5 bg-secondary/10 px-3 py-1.5 rounded-xl border border-secondary/20 cursor-pointer shadow-premium backdrop-blur-sm"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{
                            duration: 0.3,
                            ease: [0.68, -0.55, 0.265, 1.55],
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            triggerHaptic(
                              "medium",
                              e.currentTarget,
                            );
                            toast.success(
                              `${parentingStreak} day streak!`,
                              {
                                description:
                                  "Amazing dedication to Emma's care 🌟",
                                duration: 3000,
                              },
                            );
                          }}
                        >
                          <motion.div
                            animate={{ rotate: [0, 10, 0] }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                            }}
                          >
                            <Award className="w-3 h-3 text-secondary" />
                          </motion.div>
                          <span className="text-sm font-bold text-secondary">
                            {parentingStreak}d
                          </span>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="bg-white/95 backdrop-blur-xl border-0 shadow-premium"
                      >
                        <p className="text-sm font-medium">
                          Parenting streak: {parentingStreak}{" "}
                          days
                        </p>
                        <p className="text-xs text-muted-foreground">
                          You're building amazing habits! 🎉
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </AnimatePresence>

                {/* Enhanced Notification Bell */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative p-2.5 hover:bg-white/50 rounded-xl group shadow-sm backdrop-blur-sm transition-all duration-300"
                      onClick={(e) => {
                        setHasUnreadNotifications(false);
                        setHasSafetyAlerts(false);
                        triggerHaptic("light", e.currentTarget);
                        toast.success("Notifications cleared", {
                          description:
                            "You're all caught up! 🎉",
                          duration: 2000,
                        });
                      }}
                    >
                      <motion.div
                        animate={
                          getNotificationCount() > 0
                            ? { rotate: [0, 15, -15, 0] }
                            : {}
                        }
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Bell className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                      </motion.div>

                      <AnimatePresence>
                        {getNotificationCount() > 0 && (
                          <motion.div
                            className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-premium border border-white"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{
                              duration: 0.3,
                              ease: [0.68, -0.55, 0.265, 1.55],
                            }}
                          >
                            <motion.span
                              className="text-white font-bold text-xs"
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                              }}
                            >
                              {getNotificationCount()}
                            </motion.span>
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full opacity-60"
                              animate={{
                                scale: [1, 1.8, 1],
                                opacity: [0.6, 0, 0.6],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                              }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="bg-white/95 backdrop-blur-xl border-0 shadow-premium"
                  >
                    <p className="text-sm font-medium">
                      View notifications
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Stay updated on Emma's world
                    </p>
                  </TooltipContent>
                </Tooltip>

                {/* Settings Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2.5 hover:bg-white/50 rounded-xl shadow-sm backdrop-blur-sm transition-all duration-300"
                      onClick={(e) => {
                        triggerHaptic("light", e.currentTarget);
                        handleScreenChange(
                          "settings",
                          e.currentTarget,
                        );
                      }}
                    >
                      <motion.div
                        whileHover={{ rotate: 45 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors duration-300" />
                      </motion.div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="bg-white/95 backdrop-blur-xl border-0 shadow-premium"
                  >
                    <p className="text-sm font-medium">
                      App settings
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Customize your Be-Saavy experience
                    </p>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            </div>

            {/* Enhanced Contextual Subtitle */}
            <motion.div
              className="mt-3 flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {greeting.subtext}
              </p>

              {/* Current Screen Indicator */}
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors duration-300 shadow-sm",
                    currentNav?.bgColor || "bg-primary/20",
                  )}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {currentNav?.label}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content Viewport with Enhanced Transitions */}
        <div className="flex-1 overflow-auto relative">
          <div className="transition-all duration-300 ease-in-out h-full">
            {renderScreen()}
          </div>
        </div>

        {/* Enhanced Floating AI Assistant */}
        <AnimatePresence>
          {currentScreen !== "assistant" && (
            <motion.div
              className="absolute bottom-20 right-4 z-40"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                duration: 0.5,
                ease: [0.68, -0.55, 0.265, 1.55],
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    {/* Floating glow effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-primary/30 rounded-2xl blur-xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    <Button
                      onClick={(e) => {
                        triggerHaptic(
                          "medium",
                          e.currentTarget,
                        );
                        handleScreenChange(
                          "assistant",
                          e.currentTarget,
                        );
                      }}
                      size="lg"
                      className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary via-primary to-secondary shadow-premium hover:shadow-2xl transition-all duration-300 group border border-white/20 backdrop-blur-xl"
                    >
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Zap className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
                      </motion.div>

                      {/* Pulse indicator */}
                      <motion.div
                        className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-accent to-accent-light rounded-full shadow-premium border border-white"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [1, 0.5, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="left"
                  className="bg-white/95 backdrop-blur-xl border-0 shadow-premium mr-2"
                >
                  <p className="text-sm font-medium">
                    AI Parenting Assistant
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Get instant help with evidence-based
                    guidance ✨
                  </p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Community Sheet Button */}
        <AnimatePresence>
          {currentScreen === "home" && (
            <motion.div
              className="absolute bottom-20 left-4 z-40"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Sheet
                open={showCommunitySheet}
                onOpenChange={setShowCommunitySheet}
              >
                <SheetTrigger asChild>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-xl shadow-premium hover:shadow-2xl border border-border/20"
                        onClick={() => triggerHaptic("light")}
                      >
                        <Users className="w-6 h-6 text-primary" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="bg-white/95 backdrop-blur-xl border-0 shadow-premium ml-2"
                    >
                      <p className="text-sm font-medium">
                        Community
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Connect with other parents
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </SheetTrigger>

                <SheetContent
                  side="bottom"
                  className="h-[80vh] bg-white/95 backdrop-blur-xl border-t border-border/20"
                >
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Parent Community
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-6 space-y-4 max-h-full overflow-auto">
                    {/* Masonry-like layout for community posts */}
                    <div className="grid grid-cols-1 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Card className="bg-white/50 backdrop-blur-xl border border-border/10 shadow-premium">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-semibold">
                                    {String.fromCharCode(
                                      65 + i,
                                    )}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    Parent {i + 1}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    2 hours ago
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-foreground leading-relaxed mb-2">
                                {i % 3 === 0 &&
                                  "Just wanted to share that Emma slept through the night for the first time! 🎉 Any tips for keeping this going?"}
                                {i % 3 === 1 &&
                                  "Has anyone tried the new baby-wearing techniques? Looking for recommendations for a 3-month-old."}
                                {i % 3 === 2 &&
                                  "Feeling overwhelmed today but reading everyone's posts reminds me I'm not alone. Thank you all! 💙"}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                  <Heart className="w-3 h-3" />
                                  {Math.floor(
                                    Math.random() * 50,
                                  ) + 5}
                                </button>
                                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                  <MessageCircle className="w-3 h-3" />
                                  {Math.floor(
                                    Math.random() * 20,
                                  ) + 2}
                                </button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Bottom Navigation Hub */}
        <motion.div
          className="flex-shrink-0 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.3,
            ease: [0.23, 1, 0.32, 1],
          }}
        >
          {/* Navigation Background Layers */}
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xl" />
          <motion.div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 via-secondary/40 to-transparent"
            animate={{
              background: [
                "linear-gradient(90deg, transparent 0%, rgba(91,155,213,0.4) 25%, rgba(104,211,145,0.4) 75%, transparent 100%)",
                "linear-gradient(90deg, transparent 0%, rgba(104,211,145,0.4) 25%, rgba(91,155,213,0.4) 75%, transparent 100%)",
                "linear-gradient(90deg, transparent 0%, rgba(91,155,213,0.4) 25%, rgba(104,211,145,0.4) 75%, transparent 100%)",
              ],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <nav
            className="flex items-center justify-around px-2 py-3 relative"
            role="navigation"
          >
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={(e) =>
                        handleScreenChange(
                          item.id as Screen,
                          e.currentTarget,
                        )
                      }
                      className={cn(
                        "flex flex-col items-center gap-1.5 px-3 py-3 rounded-2xl transition-all duration-300 touch-target relative overflow-hidden group transform-gpu",
                        "hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        isActive
                          ? `bg-gradient-to-br ${item.gradientFrom} ${item.gradientTo} ${item.color} shadow-premium border border-white/30 backdrop-blur-xl`
                          : "text-muted-foreground hover:text-foreground hover:bg-white/30",
                      )}
                      aria-label={`Navigate to ${item.label}: ${item.description}`}
                      role="tab"
                      aria-selected={isActive}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.1 * index,
                        duration: 0.4,
                        ease: [0.23, 1, 0.32, 1],
                      }}
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                    >
                      {/* Active State Background Glow */}
                      <AnimatePresence>
                        {isActive && (
                          <>
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-t from-white/30 via-white/10 to-transparent rounded-2xl"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            />
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-br from-current/5 to-transparent rounded-2xl"
                              initial={{
                                scale: 0.8,
                                opacity: 0,
                              }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              transition={{
                                duration: 0.4,
                                ease: [
                                  0.68, -0.55, 0.265, 1.55,
                                ],
                              }}
                            />
                          </>
                        )}
                      </AnimatePresence>

                      {/* Enhanced Icon with Micro-Interactions */}
                      <motion.div
                        animate={
                          isActive
                            ? {
                                y: [0, -2, 0],
                                scale: [1, 1.1, 1],
                              }
                            : {}
                        }
                        transition={{
                          duration: 2,
                          repeat: isActive ? Infinity : 0,
                          ease: "easeInOut",
                        }}
                        className="relative"
                      >
                        <Icon
                          className={cn(
                            "w-5 h-5 transition-all duration-300 transform-gpu relative z-10",
                            isActive && "drop-shadow-sm",
                          )}
                        />

                        {/* Active glow */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-current opacity-20 rounded-full blur-sm"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.2, 0.4, 0.2],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                          />
                        )}
                      </motion.div>

                      {/* Enhanced Feature Label */}
                      <span
                        className={cn(
                          "text-xs leading-tight transition-all duration-300 text-center font-medium relative z-10",
                          isActive && "drop-shadow-sm",
                        )}
                      >
                        {item.label}
                      </span>

                      {/* Keyboard Shortcut Hint */}
                      {isActive && (
                        <motion.span
                          className="absolute -top-1 -right-1 text-[8px] font-mono text-current/60 bg-current/10 px-1 rounded-sm"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            delay: 0.2,
                            duration: 0.3,
                          }}
                        >
                          {item.shortcut}
                        </motion.span>
                      )}

                      {/* Active Feature Indicator Dot */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            className="absolute -bottom-1 w-6 h-1 bg-current rounded-full shadow-premium opacity-60"
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{
                              scaleX: 1,
                              opacity: [0.6, 1, 0.6],
                            }}
                            exit={{ scaleX: 0, opacity: 0 }}
                            transition={{
                              scaleX: { duration: 0.3 },
                              opacity: {
                                duration: 2,
                                repeat: Infinity,
                              },
                            }}
                          />
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="bg-white/95 backdrop-blur-xl border-0 shadow-premium mb-2"
                  >
                    <p className="text-sm font-medium">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground max-w-48">
                      {item.detailedDescription}
                    </p>
                    {item.shortcut && (
                      <p className="text-xs font-mono text-muted-foreground mt-1">
                        {item.shortcut}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          {/* iPhone Safe Area Spacer */}
          <div className="h-safe-area-inset-bottom bg-white/95" />
        </motion.div>

        {/* Offline Indicator */}
        <AnimatePresence>
          {isOffline && (
            <motion.div
              className="absolute top-4 left-4 right-4 z-50 bg-orange-100 text-orange-800 px-4 py-2 rounded-xl border border-orange-200 shadow-premium backdrop-blur-xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <p className="text-sm font-medium text-center">
                You're offline • Basic features available
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  );
}