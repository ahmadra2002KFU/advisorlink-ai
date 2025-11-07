import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Moon, Sun, Languages, Shield } from 'lucide-react';
import { translations, Language } from '@/lib/i18n';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import FAQManager from '@/components/admin/FAQManager';
import ConversationViewer from '@/components/admin/ConversationViewer';
import UserTable from '@/components/admin/UserTable';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  const t = translations[language];

  useEffect(() => {
    // Check authentication and redirect if not admin
    if (!loading && (!user || user.userType !== 'admin')) {
      navigate('/dashboard');
      return;
    }

    const savedTheme = localStorage.getItem('theme');
    const savedLang = localStorage.getItem('language') as Language;
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
    if (savedLang) setLanguage(savedLang);
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
  }, [loading, user, navigate]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || user.userType !== 'admin') {
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
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">
              {language === 'en' ? 'Dashboard' : 'لوحة التحكم'}
            </TabsTrigger>
            <TabsTrigger value="faqs">
              {language === 'en' ? 'FAQs' : 'الأسئلة الشائعة'}
            </TabsTrigger>
            <TabsTrigger value="conversations">
              {language === 'en' ? 'Conversations' : 'المحادثات'}
            </TabsTrigger>
            <TabsTrigger value="users">
              {language === 'en' ? 'Users' : 'المستخدمون'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboard user={user} language={language} />
          </TabsContent>

          <TabsContent value="faqs">
            <FAQManager />
          </TabsContent>

          <TabsContent value="conversations">
            <ConversationViewer />
          </TabsContent>

          <TabsContent value="users">
            <UserTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
