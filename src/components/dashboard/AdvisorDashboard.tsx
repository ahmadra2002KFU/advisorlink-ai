import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { translations, Language } from '@/lib/i18n';

interface AdvisorDashboardProps {
  user: User;
  language: Language;
}

const AdvisorDashboard = ({ user, language }: AdvisorDashboardProps) => {
  const navigate = useNavigate();
  const t = translations[language];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">{t.advisorDashboard}</h2>
        <p className="text-muted-foreground">Manage your students and conversations</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-elevated transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>{t.activeChats}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">0</div>
            <p className="text-sm text-muted-foreground mt-1">ongoing conversations</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-elevated transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Users className="h-5 w-5 text-secondary" />
              </div>
              <CardTitle>{t.myStudents}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">0</div>
            <p className="text-sm text-muted-foreground mt-1">assigned students</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-elevated transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
              <CardTitle>Availability</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Set Schedule</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
          <CardDescription>Your latest student interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="default" 
            className="w-full mb-4"
            onClick={() => navigate('/advisor-chat')}
          >
            {language === 'en' ? 'View All Conversations' : 'عرض جميع المحادثات'}
          </Button>
          <div className="text-center py-8 text-muted-foreground">
            No recent conversations
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvisorDashboard;