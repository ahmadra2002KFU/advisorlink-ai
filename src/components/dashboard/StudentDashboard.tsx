import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, User as UserIcon, Bot, BookOpen, GraduationCap, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { translations, Language } from '@/lib/i18n';
import { studentApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  email: string;
  fullName: string;
  userType: string;
}

interface StudentDashboardProps {
  user: User;
  language: Language;
}

const StudentDashboard = ({ user, language }: StudentDashboardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const t = translations[language];

  // Fetch student profile
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: studentApi.getProfile,
    retry: 1,
  });

  // Fetch enrolled courses
  const { data: courses, isLoading: coursesLoading, error: coursesError } = useQuery({
    queryKey: ['studentCourses'],
    queryFn: studentApi.getCourses,
    retry: 1,
  });

  // Fetch advisor info
  const { data: advisor, isLoading: advisorLoading, error: advisorError } = useQuery({
    queryKey: ['studentAdvisor'],
    queryFn: studentApi.getAdvisor,
    retry: 1,
  });

  // Handle errors
  if (profileError || coursesError || advisorError) {
    const error = profileError || coursesError || advisorError;
    toast({
      title: language === 'en' ? 'Error' : 'خطأ',
      description: language === 'en' ? 'Failed to load dashboard data' : 'فشل تحميل بيانات لوحة التحكم',
      variant: 'destructive',
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {t.welcomeBack}, {profile?.fullName || user.fullName}!
        </h2>
        <p className="text-muted-foreground">Access your advisor and get personalized guidance</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-elevated transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>{t.aiAssistant}</CardTitle>
            </div>
            <CardDescription>Get instant AI-powered help</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate('/chat')}>{t.askAI}</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-elevated transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <UserIcon className="h-5 w-5 text-secondary" />
              </div>
              <CardTitle>{t.myAdvisor}</CardTitle>
            </div>
            <CardDescription>Connect with your advisor</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/advisor-chat')}
            >
              {t.contactAdvisor}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-elevated transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-accent" />
              </div>
              <CardTitle>{t.myConversations}</CardTitle>
            </div>
            <CardDescription>View your chat history</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => navigate('/chat')}>{t.viewChats}</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Student Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t.studentInfo}</CardTitle>
            <CardDescription>Your personal and academic details</CardDescription>
          </CardHeader>
          <CardContent>
            {profileLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t.studentId}:</span>
                  <span className="font-medium">{profile?.studentId || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t.fullName}:</span>
                  <span className="font-medium">{profile?.fullName || user.fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t.email}:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Level:</span>
                  <span className="font-medium">{profile?.level || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Section:</span>
                  <span className="font-medium">{profile?.section || 'N/A'}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">GPA:</span>
                    </div>
                    <span className="font-bold text-lg">{profile?.gpa?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-secondary" />
                      <span className="text-muted-foreground">Attendance:</span>
                    </div>
                    <span className="font-bold text-lg">{profile?.attendancePercentage || 'N/A'}%</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Advisor Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t.myAdvisor}</CardTitle>
            <CardDescription>Your assigned academic advisor</CardDescription>
          </CardHeader>
          <CardContent>
            {advisorLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : advisor ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{advisor.fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{advisor.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Specialization:</span>
                  <span className="font-medium">{advisor.specialization || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Availability:</span>
                  <span className="font-medium">{advisor.availability || 'N/A'}</span>
                </div>
                <div className="mt-4">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate('/advisor-chat')}
                  >
                    {t.contactAdvisor}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No advisor assigned yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Courses */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Enrolled Courses</CardTitle>
          </div>
          <CardDescription>Your current semester courses</CardDescription>
        </CardHeader>
        <CardContent>
          {coursesLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : courses && courses.length > 0 ? (
            <div className="space-y-3">
              {courses.map((course: any) => (
                <div
                  key={course.id}
                  className="p-3 border rounded-lg hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <GraduationCap className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{course.courseName}</p>
                        <p className="text-sm text-muted-foreground">Code: {course.courseCode}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-secondary/20 rounded-full">
                      {course.credits} credits
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No courses enrolled yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;