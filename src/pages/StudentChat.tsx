import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import NotificationBell from '@/components/NotificationBell';
import { ArrowLeft, Send, Loader2, Moon, Sun, Languages, MessageCircle, AlertCircle } from 'lucide-react';
import { translations, Language } from '@/lib/i18n';
import { chatApi, UnreadMessage } from '@/api';
import { useAuth } from '@/context/AuthContext';

interface Message {
  id: number;
  message_text: string;
  sender_id: number;
  conversation_id: number;
  created_at: string;
  is_read: boolean;
  sender_name: string;
}

interface Conversation {
  id: number;
  student_id: number;
  advisor_id: number;
  advisor_name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const StudentChat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);

  const t = translations[language];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedLang = localStorage.getItem('language') as Language;
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
    if (savedLang) setLanguage(savedLang);
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
  }, []);

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (user.userType !== 'student') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    const newLang: Language = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  // Fetch unread messages
  const { data: unreadMessages = [] } = useQuery<UnreadMessage[]>({
    queryKey: ['unreadMessages'],
    queryFn: chatApi.getUnreadMessages,
    enabled: !!user && user.userType === 'student',
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const handleNotificationClick = (conversationId: number) => {
    // Students only have one conversation, so we just ensure we're showing it
    setConversationId(conversationId);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch or create conversation
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['studentConversations'],
    queryFn: chatApi.getConversations,
    enabled: !!user && user.userType === 'student'
  });

  // Set conversation ID when conversations are loaded
  useEffect(() => {
    if (conversations.length > 0 && !conversationId) {
      setConversationId(conversations[0].id);
    }
  }, [conversations, conversationId]);

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: () => chatApi.createConversation(),
    onSuccess: (data) => {
      setConversationId(data.id);
      queryClient.invalidateQueries({ queryKey: ['studentConversations'] });
      toast({
        title: language === 'en' ? 'Success' : 'نجح',
        description: language === 'en' ? 'Conversation created with your advisor' : 'تم إنشاء المحادثة مع مستشارك',
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: error.response?.data?.error || (language === 'en' ? 'Failed to create conversation' : 'فشل إنشاء المحادثة'),
        variant: 'destructive',
      });
    }
  });

  // Fetch messages with polling
  const { data: messages = [] } = useQuery({
    queryKey: ['studentMessages', conversationId],
    queryFn: () => chatApi.getMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 3000, // Poll every 3 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => chatApi.sendMessage(conversationId!, message),
    onSuccess: () => {
      setInput('');
      queryClient.invalidateQueries({ queryKey: ['studentMessages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['studentConversations'] });
    },
    onError: () => {
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: language === 'en' ? 'Failed to send message' : 'فشل إرسال الرسالة',
        variant: 'destructive',
      });
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      const unreadMessages = messages.filter(
        (msg: Message) => !msg.is_read && msg.sender_id !== user?.id
      );
      unreadMessages.forEach((msg: Message) => {
        chatApi.markAsRead(msg.id).catch(console.error);
      });
    }
  }, [messages, conversationId, user]);

  const sendMessage = () => {
    if (!input.trim() || !conversationId) return;
    sendMessageMutation.mutate(input);
  };

  const handleStartConversation = () => {
    createConversationMutation.mutate();
  };

  const currentConversation = conversations.find((c: Conversation) => c.id === conversationId);

  if (!user || user.userType !== 'student') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">
                  {language === 'en' ? 'Chat with Advisor' : 'محادثة مع المستشار'}
                </h1>
                {currentConversation && (
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Advisor: ' : 'المستشار: '}
                    {currentConversation.advisor_name}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleLanguage}>
              <Languages className="h-5 w-5" />
            </Button>
            <NotificationBell
              unreadMessages={unreadMessages}
              onNotificationClick={handleNotificationClick}
              language={language}
              noNotificationsText={t.noNewNotifications}
              viewAllText={t.viewAllMessages}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {conversationsLoading ? (
          <Card className="h-[calc(100vh-200px)] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </Card>
        ) : !conversationId ? (
          <Card className="h-[calc(100vh-200px)]">
            <CardContent className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="p-4 bg-muted rounded-full">
                <MessageCircle className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">
                  {language === 'en' ? 'No Conversation Yet' : 'لا توجد محادثة بعد'}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'en'
                    ? 'Start a conversation with your academic advisor'
                    : 'ابدأ محادثة مع مستشارك الأكاديمي'}
                </p>
              </div>
              <Button onClick={handleStartConversation} disabled={createConversationMutation.isPending}>
                {createConversationMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {language === 'en' ? 'Creating...' : 'جارٍ الإنشاء...'}
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Start Conversation' : 'بدء المحادثة'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-[calc(100vh-200px)] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {language === 'en' ? 'Conversation with Advisor' : 'المحادثة مع المستشار'}
              </CardTitle>
            </CardHeader>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mb-3 opacity-50" />
                  <p>{language === 'en' ? 'No messages yet. Start the conversation!' : 'لا توجد رسائل بعد. ابدأ المحادثة!'}</p>
                </div>
              ) : (
                messages.map((message: Message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {message.sender_id !== user?.id && (
                        <p className="text-xs font-semibold mb-1 opacity-70">
                          {message.sender_name}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap">{message.message_text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at.replace(' ', 'T')).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? 'Type your message to your advisor...'
                      : 'اكتب رسالتك إلى مستشارك...'
                  }
                  disabled={sendMessageMutation.isPending}
                  className="flex-1"
                />
                <Button type="submit" disabled={sendMessageMutation.isPending || !input.trim()}>
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default StudentChat;
