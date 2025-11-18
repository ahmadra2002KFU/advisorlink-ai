import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import AdvisorDashboard from '@/components/dashboard/AdvisorDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import NotificationBell from '@/components/NotificationBell';
import { Loader2, Moon, Sun, Languages } from 'lucide-react';
import { translations, Language } from '@/lib/i18n';
import { chatApi, UnreadMessage } from '@/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

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

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
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

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  // Fetch unread messages
  const { data: unreadMessages = [] } = useQuery<UnreadMessage[]>({
    queryKey: ['unreadMessages'],
    queryFn: chatApi.getUnreadMessages,
    enabled: !!user && (user.userType === 'student' || user.userType === 'advisor'),
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const handleNotificationClick = (conversationId: number) => {
    if (user.userType === 'student') {
      navigate('/student-chat');
    } else if (user.userType === 'advisor') {
      navigate(`/advisor-chat?conversation=${conversationId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">MentorLink</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleLanguage}>
              <Languages className="h-5 w-5" />
            </Button>
            {(user.userType === 'student' || user.userType === 'advisor') && (
              <NotificationBell
                unreadMessages={unreadMessages}
                onNotificationClick={handleNotificationClick}
                language={language}
                noNotificationsText={t.noNewNotifications}
                viewAllText={t.viewAllMessages}
              />
            )}
            <Button variant="outline" onClick={handleLogout}>
              {t.logout}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {user.userType === 'admin' && <AdminDashboard user={user} language={language} />}
        {user.userType === 'advisor' && <AdvisorDashboard language={language} />}
        {user.userType === 'student' && <StudentDashboard user={user} language={language} />}
      </main>
    </div>
  );
};

export default Dashboard;