import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  MessageCircle, 
  Bot, 
  User, 
  Clock, 
  AlertTriangle, 
  Heart,
  Baby,
  Moon,
  Thermometer,
  Shield,
  Brain,
  Milk,
  Activity,
  HelpCircle,
  ExternalLink,
  Copy,
  CheckCircle,
  RotateCcw,
  Sparkles,
  Stethoscope
} from 'lucide-react';
import { toast } from "sonner";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Alert, AlertDescription } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { cn } from './ui/utils';

// Message types
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: SourceCitation[];
  isTyping?: boolean;
  disclaimer?: boolean;
  urgent?: boolean;
}

interface SourceCitation {
  organization: 'AAP' | 'CDC' | 'WHO' | 'NIH' | 'Mayo Clinic';
  title: string;
  url?: string;
  excerpt?: string;
}

interface SuggestedTopic {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'feeding' | 'sleep' | 'development' | 'health' | 'safety' | 'general';
  gradient: string;
  question: string;
}

// Haptic feedback hook
const useHapticFeedback = () => {
  const triggerHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20, 10, 20],
        heavy: [30, 15, 30, 15, 30]
      };
      navigator.vibrate(patterns[intensity]);
    }
  }, []);

  return { triggerHaptic };
};

// Mock AI service - in real app, this would call your AI API
const mockAIResponse = async (question: string): Promise<{ content: string; sources: SourceCitation[]; urgent?: boolean }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

  // Detect urgent keywords
  const urgentKeywords = ['emergency', 'urgent', 'blood', 'fever', 'breathing', 'choking', 'unconscious', 'severe', 'hospital'];
  const isUrgent = urgentKeywords.some(keyword => question.toLowerCase().includes(keyword));

  if (isUrgent) {
    return {
      content: "🚨 This sounds like it could be a medical emergency. Please contact your pediatrician immediately or call emergency services (911) if this is urgent. I'm here to support you with general parenting questions, but medical emergencies require immediate professional attention.",
      sources: [
        {
          organization: 'AAP',
          title: 'When to Call the Pediatrician',
          url: 'https://healthychildren.org/English/tips-tools/ask-the-pediatrician/Pages/When-to-Call-the-Pediatrician.aspx',
          excerpt: 'Trust your instincts - if you think your child needs immediate medical attention, seek help right away.'
        }
      ],
      urgent: true
    };
  }

  // Different response patterns based on question content
  if (question.toLowerCase().includes('feeding') || question.toLowerCase().includes('breastfeed') || question.toLowerCase().includes('bottle')) {
    return {
      content: "Feeding can feel overwhelming at first, but you're doing amazing! 💙 For newborns, feeding every 2-3 hours is typical. Watch for hunger cues like rooting, lip-smacking, or bringing hands to mouth.\n\nBreastfeeding: Let baby feed on demand, usually 8-12 times per day initially. Each session typically lasts 20-45 minutes.\n\nBottle feeding: Start with 2-3 ounces every 3-4 hours for newborns, gradually increasing as baby grows.\n\nRemember: Every baby is different, and you'll learn their unique patterns together. Trust your instincts - you know your baby best!",
      sources: [
        {
          organization: 'AAP',
          title: 'Breastfeeding and Bottle Feeding Guidelines',
          url: 'https://healthychildren.org/English/ages-stages/baby/feeding-nutrition/Pages/default.aspx',
          excerpt: 'The AAP recommends exclusive breastfeeding for about 6 months, with continued breastfeeding along with appropriate complementary foods for 1 year or longer.'
        },
        {
          organization: 'CDC',
          title: 'Infant Feeding Practices',
          url: 'https://www.cdc.gov/breastfeeding/recommendations/index.htm',
          excerpt: 'Breastfeeding provides optimal nutrition and supports healthy growth and development.'
        }
      ]
    };
  }

  if (question.toLowerCase().includes('sleep') || question.toLowerCase().includes('nap')) {
    return {
      content: "Sleep challenges are so common - you're not alone in this! 🌙 Newborns typically sleep 14-17 hours per day, but in short 2-4 hour stretches.\n\n**Safe Sleep Guidelines:**\n• Always place baby on their back to sleep\n• Use a firm mattress with a fitted sheet\n• Keep the crib bare - no blankets, bumpers, or toys\n• Room-share without bed-sharing for at least the first 6 months\n\n**Gentle Sleep Tips:**\n• Establish a calm bedtime routine\n• Watch for sleepy cues (yawning, rubbing eyes, fussiness)\n• Swaddling can help newborns feel secure\n• Consider white noise for consistent sound\n\nRemember: Sleep patterns develop gradually. Be patient with yourself and Emma as you both learn together.",
      sources: [
        {
          organization: 'AAP',
          title: 'Safe Sleep Guidelines',
          url: 'https://healthychildren.org/English/ages-stages/baby/sleep/Pages/A-Parents-Guide-to-Safe-Sleep.aspx',
          excerpt: 'Following safe sleep recommendations can reduce the risk of SIDS by up to 70%.'
        },
        {
          organization: 'CDC',
          title: 'Sudden Infant Death Syndrome (SIDS) Prevention',
          url: 'https://www.cdc.gov/sids/parents-caregivers/index.html',
          excerpt: 'Safe sleep practices are crucial for reducing SIDS risk.'
        }
      ]
    };
  }

  if (question.toLowerCase().includes('development') || question.toLowerCase().includes('milestone')) {
    return {
      content: "Every baby develops at their own beautiful pace! 🌟 It's wonderful that you're thinking about Emma's development.\n\n**Typical Early Milestones:**\n• 0-2 months: Follows objects with eyes, lifts head briefly, makes cooing sounds\n• 2-4 months: Holds head steady, pushes up during tummy time, smiles socially\n• 4-6 months: Rolls over, sits with support, reaches for objects\n\n**Supporting Development:**\n• Tummy time is crucial for strengthening neck and shoulder muscles\n• Talk and read to Emma - your voice is her favorite sound\n• Provide safe objects to explore with hands and mouth\n• Respond to her cues and give plenty of loving interaction\n\n**When to Check In:**\nIf you notice Emma isn't meeting milestones within the typical ranges, mention it at your next pediatric visit. Early intervention, when needed, can be incredibly helpful.\n\nYou're giving Emma exactly what she needs - love, attention, and care! 💙",
      sources: [
        {
          organization: 'CDC',
          title: 'Developmental Milestones',
          url: 'https://www.cdc.gov/ncbddd/actearly/milestones/index.html',
          excerpt: 'Learn the Signs. Act Early. program provides milestone checklists and guidance for supporting child development.'
        },
        {
          organization: 'AAP',
          title: 'Early Child Development',
          url: 'https://healthychildren.org/English/ages-stages/Pages/default.aspx',
          excerpt: 'Understanding typical development helps parents support their child\'s growth and recognize when to seek guidance.'
        }
      ]
    };
  }

  // Default supportive response
  return {
    content: "Thank you for reaching out! 💙 I'm here to support you on this beautiful parenting journey. While I can share evidence-based information from trusted sources like the AAP, CDC, and WHO, I always recommend discussing specific concerns with Emma's pediatrician.\n\nEvery baby is unique, and what works for one family might be different for another. Trust your instincts - you know Emma better than anyone!\n\nWhat specific aspect of parenting would you like to explore together? I'm here to help with feeding, sleep, development, safety, or any other questions you might have. Remember: you're doing an amazing job, even when it doesn't feel like it! ✨",
    sources: [
      {
        organization: 'AAP',
        title: 'Parenting Support Resources',
        url: 'https://healthychildren.org/English/family-life/Pages/default.aspx',
        excerpt: 'The AAP provides evidence-based guidance to support parents in raising healthy, happy children.'
      }
    ]
  };
};

const AIAssistantScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { triggerHaptic } = useHapticFeedback();

  // Suggested topics for quick questions
  const suggestedTopics: SuggestedTopic[] = [
    {
      id: 'feeding',
      title: 'Feeding Help',
      subtitle: 'Breastfeeding, bottles, schedules',
      icon: Milk,
      category: 'feeding',
      gradient: 'from-blue-100 to-blue-50',
      question: "I need help with feeding Emma. Can you guide me through breastfeeding and bottle feeding basics?"
    },
    {
      id: 'sleep',
      title: 'Sleep Support',
      subtitle: 'Safe sleep, routines, schedules',
      icon: Moon,
      category: 'sleep',
      gradient: 'from-purple-100 to-purple-50',
      question: "I'm struggling with Emma's sleep. Can you help me understand safe sleep practices and establish better routines?"
    },
    {
      id: 'development',
      title: 'Development',
      subtitle: 'Milestones, activities, growth',
      icon: Brain,
      category: 'development',
      gradient: 'from-green-100 to-green-50',
      question: "I want to make sure Emma is developing well. What milestones should I look for and how can I support her development?"
    },
    {
      id: 'health',
      title: 'Health & Wellness',
      subtitle: 'Common concerns, when to call doctor',
      icon: Stethoscope,
      category: 'health',
      gradient: 'from-red-100 to-red-50',
      question: "I have some questions about Emma's health and wellness. What are normal baby symptoms vs. when should I be concerned?"
    },
    {
      id: 'safety',
      title: 'Safety First',
      subtitle: 'Babyproofing, car seats, recalls',
      icon: Shield,
      category: 'safety',
      gradient: 'from-orange-100 to-orange-50',
      question: "I want to keep Emma safe. Can you help me understand baby safety essentials and childproofing tips?"
    },
    {
      id: 'general',
      title: 'General Support',
      subtitle: 'Parenting tips, self-care, confidence',
      icon: Heart,
      category: 'general',
      gradient: 'from-pink-100 to-pink-50',
      question: "I'm feeling overwhelmed as a new parent. Can you offer some general parenting support and encouragement?"
    }
  ];

  // Welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'assistant',
      content: "Hi there! 💙 I'm your AI parenting assistant, here to support you on this incredible journey with Emma.\n\nI can help with feeding, sleep, development, safety, and general parenting questions using evidence-based guidance from trusted sources like the American Academy of Pediatrics (AAP), CDC, and WHO.\n\n**Important:** I'm here for support and information, but for medical concerns or emergencies, always consult Emma's pediatrician or call 911 if urgent.\n\nHow can I support you today? You can ask me anything or try one of the suggested topics below! ✨",
      timestamp: new Date(),
      sources: [
        {
          organization: 'AAP',
          title: 'Trusted Parenting Resources',
          url: 'https://healthychildren.org/',
          excerpt: 'Evidence-based parenting guidance from pediatric experts.'
        }
      ]
    };

    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    triggerHaptic('light');
    setInputMessage('');

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Get AI response
      const response = await mockAIResponse(content);

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        sources: response.sources,
        urgent: response.urgent,
        disclaimer: true
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Show appropriate toast
      if (response.urgent) {
        toast.error("This may need immediate attention", {
          description: "Please consult your pediatrician or emergency services",
          duration: 6000,
        });
      } else {
        toast.success("Here to help! 💙", {
          description: "Remember, I'm here for support - not medical advice",
          duration: 3000,
        });
      }
    } catch (error) {
      toast.error("I'm having trouble right now", {
        description: "Please try again in a moment. For urgent matters, contact your pediatrician",
        duration: 4000,
      });
    } finally {
      setIsTyping(false);
    }
  }, [triggerHaptic]);

  // Handle suggested topic click
  const handleTopicClick = useCallback((topic: SuggestedTopic) => {
    triggerHaptic('medium');
    handleSendMessage(topic.question);
  }, [handleSendMessage, triggerHaptic]);

  // Copy message to clipboard
  const handleCopyMessage = useCallback(async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      triggerHaptic('light');
      toast.success("Copied to clipboard", {
        description: "Message copied successfully",
        duration: 2000,
      });
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      toast.error("Couldn't copy message", {
        description: "Please try again",
        duration: 2000,
      });
    }
  }, [triggerHaptic]);

  // Clear chat
  const handleClearChat = useCallback(() => {
    triggerHaptic('medium');
    const welcomeMessage = messages.find(m => m.id === 'welcome');
    if (welcomeMessage) {
      setMessages([welcomeMessage]);
    }
    toast.success("Chat cleared", {
      description: "Starting fresh - I'm still here to help! 💙",
      duration: 2000,
    });
  }, [messages, triggerHaptic]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-secondary-lightest/20">
      
      {/* Header */}
      <motion.div 
        className="flex-shrink-0 px-6 py-4 bg-white/90 backdrop-blur-xl border-b border-border/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-premium"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Bot className="w-5 h-5 text-white drop-shadow-sm" />
            </motion.div>
            
            <div>
              <h1 className="text-lg font-semibold text-foreground">Ask AI</h1>
              <p className="text-xs text-muted-foreground">Evidence-based parenting support</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  className="p-2 hover:bg-secondary/10 rounded-xl"
                >
                  <RotateCcw className="w-4 h-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear chat history</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Important Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-3"
        >
          <Alert className="border-orange-200 bg-orange-50/50">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <AlertDescription className="text-xs text-orange-800">
              For medical emergencies or serious concerns, always consult Emma's pediatrician or call 911. I provide supportive information, not medical advice.
            </AlertDescription>
          </Alert>
        </motion.div>
      </motion.div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-6 space-y-6">
            
            {/* Messages */}
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={cn(
                    "flex gap-3",
                    message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  {/* Avatar */}
                  <div className={cn(
                    "w-8 h-8 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0",
                    message.type === 'user' 
                      ? 'bg-gradient-to-br from-primary to-secondary' 
                      : message.urgent
                      ? 'bg-gradient-to-br from-red-500 to-orange-500'
                      : 'bg-gradient-to-br from-secondary to-primary'
                  )}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={cn(
                    "flex-1 max-w-[85%]",
                    message.type === 'user' ? 'items-end' : 'items-start'
                  )}>
                    <div className={cn(
                      "p-4 rounded-2xl shadow-sm border backdrop-blur-sm",
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground border-primary/20 ml-8'
                        : message.urgent
                        ? 'bg-red-50 text-red-900 border-red-200 mr-8'
                        : 'bg-white text-foreground border-border/20 mr-8'
                    )}>
                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                      </div>

                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-current/10">
                          <p className="text-xs font-medium mb-2 opacity-70">Sources:</p>
                          <div className="space-y-2">
                            {message.sources.map((source, idx) => (
                              <motion.div
                                key={idx}
                                className="flex items-start gap-2 p-2 rounded-lg bg-current/5"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Badge 
                                  variant="outline" 
                                  className="text-xs font-medium bg-current/10 border-current/20"
                                >
                                  {source.organization}
                                </Badge>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    {source.title}
                                  </p>
                                  {source.excerpt && (
                                    <p className="text-xs opacity-70 mt-1 line-clamp-2">
                                      {source.excerpt}
                                    </p>
                                  )}
                                  {source.url && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-auto p-0 text-xs mt-1 opacity-70 hover:opacity-100"
                                      onClick={() => window.open(source.url, '_blank')}
                                    >
                                      Learn more <ExternalLink className="w-3 h-3 ml-1" />
                                    </Button>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Message Actions */}
                      {message.type === 'assistant' && (
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-current/10">
                          <div className="flex items-center gap-1 text-xs opacity-60">
                            <Clock className="w-3 h-3" />
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyMessage(message.id, message.content)}
                            className="h-auto p-1 opacity-60 hover:opacity-100"
                          >
                            {copiedMessageId === message.id ? (
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Disclaimer for assistant messages */}
                    {message.type === 'assistant' && message.disclaimer && !message.urgent && (
                      <motion.p 
                        className="text-xs text-muted-foreground mt-2 px-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        💙 This is supportive information, not medical advice. For health concerns, consult Emma's pediatrician.
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 mr-8">
                    <div className="p-4 rounded-2xl bg-white border border-border/20 shadow-sm backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <motion.div
                            className="w-2 h-2 bg-muted-foreground/40 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-muted-foreground/40 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-muted-foreground/40 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">Thinking with care...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Suggested Topics (shown when chat is short) */}
            <AnimatePresence>
              {messages.length <= 2 && !isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <h3 className="font-medium text-foreground mb-2">Quick Help Topics</h3>
                    <p className="text-sm text-muted-foreground">Tap any topic to get started, or ask me anything!</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {suggestedTopics.map((topic, index) => {
                      const IconComponent = topic.icon;
                      return (
                        <motion.div
                          key={topic.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                        >
                          <Card 
                            className={cn(
                              "cursor-pointer transition-all duration-300 hover:shadow-premium group border-border/20 backdrop-blur-sm",
                              "active:scale-95 touch-target"
                            )}
                            onClick={() => handleTopicClick(topic)}
                          >
                            <CardContent className="p-4">
                              <div className={cn(
                                "w-10 h-10 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300",
                                topic.gradient
                              )}>
                                <IconComponent className="w-5 h-5 text-current opacity-80" />
                              </div>
                              <h4 className="font-medium text-foreground text-sm mb-1">
                                {topic.title}
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {topic.subtitle}
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <motion.div 
        className="flex-shrink-0 p-6 bg-white/90 backdrop-blur-xl border-t border-border/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputMessage);
                }
              }}
              placeholder="Ask me anything about parenting Emma... 💙"
              className="pr-12 py-3 rounded-2xl border-border/20 bg-muted/30 backdrop-blur-sm focus:bg-white transition-all duration-300"
              disabled={isTyping}
            />
            
            {/* Help indicator */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <HelpCircle className="w-4 h-4 text-muted-foreground/60" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-64">
                  <p className="text-xs">Ask about feeding, sleep, development, safety, or any parenting concern. I'll provide evidence-based guidance with source citations.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <Button
            onClick={() => handleSendMessage(inputMessage)}
            disabled={!inputMessage.trim() || isTyping}
            size="lg"
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-secondary to-primary hover:shadow-premium transition-all duration-300 group"
          >
            {isTyping ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Bot className="w-5 h-5 text-white" />
              </motion.div>
            ) : (
              <Send className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform duration-200" />
            )}
          </Button>
        </div>
        
        <motion.p 
          className="text-xs text-muted-foreground mt-3 text-center px-4 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Sparkles className="w-3 h-3 inline mr-1" />
          I'm here to support you with evidence-based parenting guidance. For medical emergencies, always contact your pediatrician or emergency services.
        </motion.p>
      </motion.div>
    </div>
  );
};

export { AIAssistantScreen };