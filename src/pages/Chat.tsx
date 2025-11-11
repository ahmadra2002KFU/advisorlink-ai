import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Loader2, Moon, Sun, Languages, Users, MessageSquare, User, Sparkles } from 'lucide-react';
import { translations, Language } from '@/lib/i18n';
import { aiApi, advisorApi, type ChatMessage } from '@/api';
import { useAuth } from '@/context/AuthContext';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // User type detection
  const { user } = useAuth();
  const isAdvisor = user?.userType === 'advisor';
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Fetch advisor data conditionally
  const { data: advisorStats, isLoading: statsLoading } = useQuery({
    queryKey: ['advisorStats'],
    queryFn: advisorApi.getStats,
    enabled: isAdvisor
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['assignedStudents'],
    queryFn: advisorApi.getAssignedStudents,
    enabled: isAdvisor
  });

  const t = translations[language];

  // Detect text direction based on content
  const detectTextDirection = (text: string): 'rtl' | 'ltr' => {
    // Arabic Unicode range: \u0600-\u06FF
    const arabicChars = text.match(/[\u0600-\u06FF]/g);
    const totalChars = text.replace(/\s/g, '').length;

    if (arabicChars && arabicChars.length > totalChars * 0.3) {
      return 'rtl';
    }
    return 'ltr';
  };

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Convert messages to ChatMessage format for API
      const chatHistory: ChatMessage[] = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      // Call AI API (pass selectedStudentId if advisor has selected a student)
      const response = await aiApi.chat(
        userMessage.content,
        chatHistory,
        selectedStudentId || undefined
      );

      // Add AI response to messages
      const aiMessage: Message = {
        role: 'model',
        content: response.response
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: language === 'en' ? 'Failed to get response from AI' : 'فشل في الحصول على رد من الذكاء الاصطناعي',
        variant: 'destructive',
      });
      // Remove the user message if there was an error
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  // Render advisor sidebar
  const renderAdvisorSidebar = () => {
    if (!isAdvisor) return null;

    return (
      <Card className="h-[calc(100vh-200px)] flex flex-col overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {language === 'en' ? 'Advisor Panel' : 'لوحة المستشار'}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Stats */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {language === 'en' ? 'Quick Stats' : 'إحصائيات سريعة'}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary">
                  {statsLoading ? '-' : advisorStats?.assignedStudents || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  {language === 'en' ? 'Students' : 'طلاب'}
                </div>
              </div>
              <div className="bg-secondary/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-secondary">
                  {statsLoading ? '-' : advisorStats?.activeConversations || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  {language === 'en' ? 'Active' : 'نشط'}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Student Selector */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {language === 'en' ? 'Select Student' : 'اختر الطالب'}
            </h4>
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={language === 'en' ? 'Choose a student...' : 'اختر طالبًا...'} />
              </SelectTrigger>
              <SelectContent>
                {studentsLoading ? (
                  <div className="p-2 text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {language === 'en' ? 'Loading...' : 'جاري التحميل...'}
                  </div>
                ) : students.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    {language === 'en' ? 'No students assigned' : 'لا يوجد طلاب مسندون'}
                  </div>
                ) : (
                  students.map((student: any) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {student.studentId} • GPA: {student.gpa}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Actions */}
          {selectedStudentId && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                {language === 'en' ? 'Quick Actions' : 'إجراءات سريعة'}
              </h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    const student = students.find((s: any) => s.id.toString() === selectedStudentId);
                    if (student) {
                      toast({
                        title: language === 'en' ? 'Student Profile' : 'ملف الطالب',
                        description: `${student.name} - ${student.level} - GPA: ${student.gpa}`,
                      });
                    }
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'View Profile' : 'عرض الملف'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/advisor-chat')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'Human Chat' : 'محادثة بشرية'}
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* AI Capabilities Badge */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {language === 'en' ? 'AI Capabilities' : 'قدرات الذكاء الاصطناعي'}
            </h4>
            <div className="space-y-1">
              <Badge variant="secondary" className="w-full justify-center">
                {language === 'en' ? '10 Functions Available' : '10 وظائف متاحة'}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {language === 'en'
                  ? 'Access to all student and advisor functions'
                  : 'الوصول إلى جميع وظائف الطالب والمستشار'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
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
              {language === 'en' ? 'AI Assistant' : 'المساعد الذكي'}
            </h1>
            {isAdvisor && (
              <Badge variant="outline" className="ml-2">
                <Sparkles className="h-3 w-3 mr-1" />
                {language === 'en' ? 'Advisor Mode' : 'وضع المستشار'}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleLanguage}>
              <Languages className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className={`container mx-auto px-4 py-6 ${isAdvisor ? 'max-w-7xl' : 'max-w-4xl'}`}>
        <div className={isAdvisor ? 'grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6' : ''}>
          {/* Main Chat Area */}
          <Card className="h-[calc(100vh-200px)] flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  {isAdvisor ? (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="p-4 bg-primary/10 rounded-full">
                          <Sparkles className="h-12 w-12 text-primary" />
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-semibold mb-2">
                          {language === 'en'
                            ? 'Welcome to AI-Powered Advising'
                            : 'مرحبًا بك في الاستشارة المدعومة بالذكاء الاصطناعي'}
                        </p>
                        <p className="text-sm">
                          {language === 'en'
                            ? 'Ask questions about your students, get insights, or request reports'
                            : 'اسأل أسئلة حول طلابك، أو احصل على رؤى، أو اطلب تقارير'}
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 mt-4">
                        <Badge variant="outline" className="text-xs">
                          {language === 'en' ? 'Student Performance' : 'أداء الطالب'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {language === 'en' ? 'GPA Analysis' : 'تحليل المعدل'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {language === 'en' ? 'Contact History' : 'سجل الاتصال'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {language === 'en' ? 'Honor Students' : 'الطلاب المتميزين'}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-lg">
                      {language === 'en'
                        ? 'Welcome! Ask me anything about your academic journey.'
                        : 'مرحباً! اسألني أي شيء عن رحلتك الأكاديمية.'}
                    </p>
                  )}
                </div>
              )}
            {messages.map((message, index) => {
              const messageDir = detectTextDirection(message.content);
              return (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    dir={messageDir}
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                    style={{
                      textAlign: messageDir === 'rtl' ? 'right' : 'left',
                      unicodeBidi: 'plaintext',
                    }}
                  >
                    <p
                      className="whitespace-pre-wrap leading-relaxed"
                      style={{
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {message.content}
                    </p>
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary text-secondary-foreground rounded-lg p-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
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
                placeholder={language === 'en' ? 'Type your message...' : 'اكتب رسالتك...'}
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Advisor Sidebar */}
        {isAdvisor && renderAdvisorSidebar()}
      </div>
      </main>
    </div>
  );
};

export default Chat;
