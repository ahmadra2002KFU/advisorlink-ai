import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, MessageSquare, TrendingUp, Shield, Bot } from 'lucide-react';
import { translations, Language } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  email: string;
  fullName: string;
  userType: string;
}

interface AdminDashboardProps {
  user: User;
  language: Language;
}

const AdminDashboard = ({ user, language }: AdminDashboardProps) => {
  const navigate = useNavigate();
  const t = translations[language];
  const { toast } = useToast();

  // Fetch admin stats
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getStats,
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch admin statistics',
        variant: 'destructive'
      });
    }
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Failed to load admin dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">{t.adminDashboard}</h2>
          <p className="text-muted-foreground">System overview and management</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Students */}
        <Card className="hover:shadow-elevated transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-primary">{stats?.total_students || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">registered students</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Advisors */}
        <Card className="hover:shadow-elevated transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Advisors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-secondary">{stats?.total_advisors || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">active advisors</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Conversations */}
        <Card className="hover:shadow-elevated transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{t.totalChats}</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-accent">{stats?.total_conversations || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.active_conversations || 0} active
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* AI Chat Sessions */}
        <Card className="hover:shadow-elevated transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">AI Chats</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-green-600">{stats?.total_ai_chats || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">AI conversations</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-elevated transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.total_messages || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">messages exchanged</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-elevated transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-primary">{stats?.active_conversations || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">ongoing chats</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-elevated transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Operational</div>
            <p className="text-xs text-muted-foreground mt-1">all systems running</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Management</CardTitle>
          <CardDescription>Access comprehensive admin tools</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="default"
            className="w-full"
            onClick={() => navigate('/admin-panel')}
          >
            {language === 'en' ? 'Open Admin Panel' : 'فتح لوحة الإدارة'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
