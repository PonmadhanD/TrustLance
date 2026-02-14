'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Send, 
  MessageCircle, 
  HelpCircle, 
  FileText, 
  Scale, 
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

const initialMessages: Message[] = [
  {
    id: '1',
    type: 'ai',
    content: 'Hello! I\'m your AI Dispute Assistant. I can help you understand the dispute process, suggest evidence to collect, and guide you through resolution steps. How can I assist you today?',
    timestamp: '3:39:04 PM',
    suggestions: [
      'How do I raise a dispute?',
      'What evidence should I collect?',
      'Explain the resolution process',
      'Check dispute status'
    ]
  }
];

const quickActions = [
  {
    icon: <Scale className="h-4 w-4" />,
    title: 'Dispute Process',
    description: 'Learn about our fair resolution system'
  },
  {
    icon: <FileText className="h-4 w-4" />,
    title: 'Evidence Guide',
    description: 'What documents to prepare'
  },
  {
    icon: <Clock className="h-4 w-4" />,
    title: 'Timeline',
    description: 'Expected resolution timeframes'
  },
  {
    icon: <HelpCircle className="h-4 w-4" />,
    title: 'FAQ',
    description: 'Common dispute questions'
  }
];

export function DisputeAIAssistant() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
  }, []);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: currentTime || new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(message);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    
    let response = '';
    let suggestions: string[] = [];

    if (lowerMessage.includes('raise') || lowerMessage.includes('create') || lowerMessage.includes('dispute')) {
      response = 'To raise a dispute, follow these steps:\n\n1. Select your role (Freelancer/Client)\n2. Choose the dispute type\n3. Select the project and milestone\n4. Provide detailed explanation with evidence\n5. Submit for AI pre-analysis\n\nThe AI will analyze your case before human experts review it.';
      suggestions = ['What evidence do I need?', 'How long does review take?', 'Can I add more evidence later?'];
    } else if (lowerMessage.includes('evidence')) {
      response = 'Essential evidence includes:\n\n📄 Contract documents\n💬 Chat logs and communications\n📸 Screenshots of work/issues\n💰 Payment receipts\n📅 Timeline documentation\n🔗 Git commits or file versions\n\nThe stronger your evidence, the faster the resolution.';
      suggestions = ['Upload evidence now', 'What if I don\'t have contracts?', 'How to export chat logs?'];
    } else if (lowerMessage.includes('process') || lowerMessage.includes('timeline')) {
      response = 'Dispute Resolution Process:\n\n🤖 AI Pre-Analysis (Immediate)\n👥 Human Expert Panel Review (2-5 days)\n📋 Evidence Collection (if needed)\n⚖️ Final Decision (1-3 days)\n💰 Automatic Execution\n\nTotal timeline: 3-10 business days depending on complexity.';
      suggestions = ['Who are the experts?', 'Can I appeal decisions?', 'What happens after resolution?'];
    } else if (lowerMessage.includes('status')) {
      response = 'You can check your dispute status anytime in the main dashboard. You\'ll receive notifications for:\n\n• Status changes\n• Evidence requests\n• Expert panel decisions\n• Payment releases\n\nWould you like me to check a specific dispute?';
      suggestions = ['Check DSP-001 status', 'View all my disputes', 'Set up notifications'];
    } else {
      response = 'I can help you with:\n\n• Understanding dispute types\n• Preparing evidence\n• Explaining the resolution process\n• Checking dispute status\n• Platform policies\n\nWhat specific aspect would you like to know more about?';
      suggestions = ['Dispute types', 'Evidence requirements', 'Resolution timeline', 'Platform policies'];
    }

    return {
      id: Date.now().toString(),
      type: 'ai',
      content: response,
      timestamp: currentTime || new Date().toLocaleTimeString(),
      suggestions
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          AI Dispute Assistant
          <Badge variant="secondary" className="ml-auto">
            <CheckCircle className="h-3 w-3 mr-1" />
            Online
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Quick Actions */}
        <div className="px-6 pb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Help</h4>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-auto p-3 flex flex-col items-start text-left"
                onClick={() => handleSendMessage(action.title)}
              >
                <div className="flex items-center gap-2 mb-1">
                  {action.icon}
                  <span className="text-xs font-medium">{action.title}</span>
                </div>
                <span className="text-xs text-gray-500">{action.description}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="border-t">
          <ScrollArea className="h-96 px-6 py-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="text-sm whitespace-pre-line">{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp}
                    </div>
                    
                    {message.suggestions && (
                      <div className="mt-3 space-y-1">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 bg-white hover:bg-gray-50"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <Lightbulb className="h-3 w-3 mr-1" />
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about disputes, evidence, or process..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
              className="flex-1"
            />
            <Button 
              size="sm" 
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <AlertCircle className="h-3 w-3" />
            <span>AI provides guidance only. Final decisions made by human experts.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 