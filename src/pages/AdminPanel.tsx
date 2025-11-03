import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, MessageSquare, Moon, Sun, Languages, Shield } from 'lucide-react';
import { translations, Language } from '@/lib/i18n';

interface ConversationWithDetails {
  id: string;
  created_at: string;
  status: string;
  student_profile: {
    full_name: string;
    student_id: string;
  };
  advisor_profile: {
    full_name: string;
  };
  message_count: number;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalConversations: 0,
    activeAdvisors: 0,
  });

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

    checkAuth();
    loadStats();
    loadConversations();
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

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (roleData?.role !== 'admin') {
      navigate('/dashboard');
    }
  };

  const loadStats = async () => {
    const [usersResult, conversationsResult, advisorsResult] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('conversations').select('id', { count: 'exact', head: true }),
      supabase.from('advisors').select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      totalUsers: usersResult.count || 0,
      totalConversations: conversationsResult.count || 0,
      activeAdvisors: advisorsResult.count || 0,
    });
  };

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, created_at, status, student_id, advisor_id')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading conversations:', error);
      return;
    }

    if (!data) {
      setConversations([]);
      return;
    }

    const conversationsWithDetails = await Promise.all(
      data.map(async (conv) => {
        const [studentResult, advisorResult, messageCount] = await Promise.all([
          supabase.from('profiles').select('full_name, student_id').eq('id', conv.student_id).single(),
          supabase.from('profiles').select('full_name').eq('id', conv.advisor_id).single(),
          supabase.from('messages').select('id', { count: 'exact', head: true }).eq('conversation_id', conv.id),
        ]);

        return {
          id: conv.id,
          created_at: conv.created_at,
          status: conv.status,
          student_profile: studentResult.data || { full_name: 'Unknown', student_id: 'N/A' },
          advisor_profile: advisorResult.data || { full_name: 'Unknown' },
          message_count: messageCount.count || 0,
        };
      })
    );

    setConversations(conversationsWithDetails);
  };

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
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-primary">
                {language === 'en' ? 'Admin Panel' : 'لوحة الإدارة'}
              </h1>
            </div>
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

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card className="hover:shadow-elevated transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>{t.totalUsers}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elevated transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-secondary" />
                <CardTitle>{t.totalChats}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats.totalConversations}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elevated transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                <CardTitle>{language === 'en' ? 'Active Advisors' : 'المستشارون النشطون'}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.activeAdvisors}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="conversations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="conversations">
              {language === 'en' ? 'All Conversations' : 'جميع المحادثات'}
            </TabsTrigger>
            <TabsTrigger value="users">
              {language === 'en' ? 'Users' : 'المستخدمون'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversations">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'en' ? 'Recent Conversations' : 'المحادثات الأخيرة'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      {language === 'en' ? 'No conversations yet' : 'لا توجد محادثات بعد'}
                    </p>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className="border rounded-lg p-4 hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">
                              {language === 'en' ? 'Student: ' : 'الطالب: '}
                              {conv.student_profile.full_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {language === 'en' ? 'ID: ' : 'الرقم الجامعي: '}
                              {conv.student_profile.student_id}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {language === 'en' ? 'Advisor: ' : 'المستشار: '}
                              {conv.advisor_profile.full_name}
                            </p>
                          </div>
                          <div className="text-end">
                            <p className="text-sm text-muted-foreground">
                              {new Date(conv.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm font-semibold">
                              {conv.message_count} {language === 'en' ? 'messages' : 'رسالة'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'en' ? 'User Management' : 'إدارة المستخدمين'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  {language === 'en' ? 'User management features coming soon' : 'ميزات إدارة المستخدمين قريباً'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
