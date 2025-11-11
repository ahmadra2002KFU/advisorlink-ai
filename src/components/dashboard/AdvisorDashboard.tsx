import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, Calendar, Loader2, Bot, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { translations, Language } from '@/lib/i18n';
import { advisorApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

interface AdvisorDashboardProps {
  language: Language;
}

const AdvisorDashboard = ({ language }: AdvisorDashboardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const t = translations[language];

  // Fetch advisor profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['advisorProfile'],
    queryFn: advisorApi.getProfile
  });

  // Fetch assigned students
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['assignedStudents'],
    queryFn: advisorApi.getAssignedStudents
  });

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['advisorStats'],
    queryFn: advisorApi.getStats
  });

  // Update availability mutation
  const availabilityMutation = useMutation({
    mutationFn: (isAvailable: boolean) => advisorApi.updateAvailability(isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advisorProfile'] });
      toast({
        title: language === 'en' ? 'Success' : 'نجح',
        description: language === 'en' ? 'Availability updated' : 'تم تحديث التوفر'
      });
    },
    onError: () => {
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: language === 'en' ? 'Failed to update availability' : 'فشل تحديث التوفر',
        variant: 'destructive'
      });
    }
  });

  const isLoading = profileLoading || studentsLoading || statsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">{t.advisorDashboard}</h2>
        <p className="text-muted-foreground">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {language === 'en' ? 'Loading...' : 'جاري التحميل...'}
            </span>
          ) : (
            <>
              {profile?.name} - {profile?.level} - {profile?.specialization}
            </>
          )}
        </p>
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
            {statsLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <>
                <div className="text-3xl font-bold text-primary">{stats?.activeConversations || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'en' ? 'ongoing conversations' : 'محادثات جارية'}
                </p>
              </>
            )}
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
            {statsLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            ) : (
              <>
                <div className="text-3xl font-bold text-secondary">{stats?.assignedStudents || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'en' ? 'assigned students' : 'طلاب مسندون'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-elevated transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
              <CardTitle>{language === 'en' ? 'Availability' : 'التوفر'}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {profileLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            ) : (
              <div className="flex items-center space-x-2">
                <Switch
                  id="availability"
                  checked={profile?.isAvailable || false}
                  onCheckedChange={(checked) => availabilityMutation.mutate(checked)}
                  disabled={availabilityMutation.isPending}
                />
                <Label htmlFor="availability">
                  {profile?.isAvailable
                    ? (language === 'en' ? 'Available' : 'متاح')
                    : (language === 'en' ? 'Unavailable' : 'غير متاح')
                  }
                </Label>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* AI Assistant Card */}
        <Card className="hover:shadow-elevated transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>
                {language === 'en' ? 'AI Assistant' : 'المساعد الذكي'}
              </CardTitle>
            </div>
            <CardDescription>
              {language === 'en'
                ? 'Get AI-powered assistance with your students'
                : 'احصل على مساعدة مدعومة بالذكاء الاصطناعي لطلابك'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => navigate('/chat')}
            >
              <Bot className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Open AI Assistant' : 'فتح المساعد الذكي'}
            </Button>
          </CardContent>
        </Card>

        {/* Batch Actions Card */}
        <Card className="hover:shadow-elevated transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <FileText className="h-5 w-5 text-secondary" />
              </div>
              <CardTitle>
                {language === 'en' ? 'Reports & Actions' : 'التقارير والإجراءات'}
              </CardTitle>
            </div>
            <CardDescription>
              {language === 'en'
                ? 'Generate reports and perform batch actions'
                : 'إنشاء التقارير وتنفيذ الإجراءات الجماعية'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/advisor-chat')}
            >
              <FileText className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Manage Students' : 'إدارة الطلاب'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.myStudents}</CardTitle>
          <CardDescription>{language === 'en' ? 'Your assigned students' : 'الطلاب المسندون إليك'}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="default"
            className="w-full mb-4"
            onClick={() => navigate('/advisor-chat')}
          >
            {language === 'en' ? 'View All Conversations' : 'عرض جميع المحادثات'}
          </Button>
          {studentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {language === 'en' ? 'No assigned students yet' : 'لا يوجد طلاب مسندون بعد'}
            </div>
          ) : (
            <div className="space-y-2">
              {students.map((student: any) => (
                <Card key={student.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.studentId}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {student.department}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvisorDashboard;