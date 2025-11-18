import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import NotificationBell from '@/components/NotificationBell';
import { ArrowLeft, Send, Loader2, Moon, Sun, Languages } from 'lucide-react';
import { translations, Language } from '@/lib/i18n';
import { chatApi, UnreadMessage } from '@/api';
import { useAuth } from '@/context/AuthContext';

interface Conversation {
  id: number;
  student_id: string;
  student_name: string;
  advisor_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: number;
  message_text: string;
  sender_id: number;
  conversation_id: number;
  created_at: string;
  is_read: number;
  sender_name: string;
}

const AdvisorChat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Handle URL parameter for conversation selection
  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    if (conversationParam) {
      const conversationId = parseInt(conversationParam, 10);
      if (!isNaN(conversationId)) {
        setSelectedConversation(conversationId);
      }
    }
  }, [searchParams]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
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
    enabled: !!user,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const handleNotificationClick = (conversationId: number) => {
    setSelectedConversation(conversationId);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.getConversations,
    enabled: !!user
  });

  // Fetch messages with polling
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedConversation],
    queryFn: () => chatApi.getMessages(selectedConversation!),
    enabled: !!selectedConversation,
    refetchInterval: 3000, // Poll every 3 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => chatApi.sendMessage(selectedConversation!, message),
    onSuccess: () => {
      setInput('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
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
    if (selectedConversation && messages.length > 0) {
      const unreadMessages = messages.filter((msg: Message) => !msg.is_read && msg.sender_id !== user?.id);
      unreadMessages.forEach((msg: Message) => {
        chatApi.markAsRead(msg.id).catch(console.error);
      });
    }
  }, [messages, selectedConversation, user]);

  const sendMessage = () => {
    if (!input.trim() || !selectedConversation) return;
    sendMessageMutation.mutate(input);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-primary">
              {language === 'en' ? 'Student Conversations' : 'محادثات الطلاب'}
            </h1>
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

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-150px)]">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>{t.myStudents}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 overflow-y-auto max-h-[calc(100vh-250px)]">
              {conversationsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : conversations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {language === 'en' ? 'No conversations yet' : 'لا توجد محادثات بعد'}
                </p>
              ) : (
                conversations.map((conv: Conversation) => (
                  <Button
                    key={conv.id}
                    variant={selectedConversation === conv.id ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setSelectedConversation(conv.id)}
                  >
                    <div className="text-start">
                      <p className="font-semibold">{conv.student_name}</p>
                      <p className="text-xs opacity-70">{conv.student_id}</p>
                    </div>
                  </Button>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message: Message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender_id === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                          <p className="whitespace-pre-wrap">{message.message_text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.created_at.replace(' ', 'T')).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
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
                      placeholder={language === 'en' ? 'Type your message...' : 'اكتب رسالتك...'}
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
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {language === 'en' ? 'Select a conversation to start' : 'اختر محادثة للبدء'}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdvisorChat;
