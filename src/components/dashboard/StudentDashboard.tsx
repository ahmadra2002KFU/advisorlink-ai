import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, User as UserIcon, Bot, BookOpen, GraduationCap, TrendingUp, Calendar, Clock, MapPin, Mail, Award } from 'lucide-react';
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
                  <span className="font-medium">{profile?.student_number || profile?.student_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t.fullName}:</span>
                  <span className="font-medium">{profile?.full_name || user.fullName}</span>
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
                    <span className="font-bold text-lg">{profile?.attendance_percentage?.toFixed(1) || 'N/A'}%</span>
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
                  <span className="font-medium">{advisor.advisor_name || advisor.full_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{advisor.advisor_email || advisor.email || 'N/A'}</span>
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
            <div className="space-y-4">
              {courses.map((course: any) => (
                <div
                  key={course.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-all bg-card"
                >
                  {/* Course Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{course.course_name}</h4>
                        <p className="text-sm text-muted-foreground">{course.course_code} • {course.department || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs px-2 py-1 bg-secondary/20 rounded-full font-medium">
                        {course.credit_hours || 3} credits
                      </span>
                      {course.current_grade && course.current_grade !== 'In Progress' && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          course.current_grade.startsWith('A') ? 'bg-green-100 text-green-700' :
                          course.current_grade.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                          course.current_grade.startsWith('C') ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          Grade: {course.current_grade}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Course Description */}
                  {course.course_description && (
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      {course.course_description}
                    </p>
                  )}

                  {/* Course Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {/* Instructor */}
                    {course.instructor_name && (
                      <div className="flex items-start gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">{course.instructor_name}</p>
                          {course.instructor_email && (
                            <a
                              href={`mailto:${course.instructor_email}`}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <Mail className="h-3 w-3" />
                              {course.instructor_email}
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Schedule */}
                    {course.class_time && course.class_days && (
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">{course.class_days}</p>
                          <p className="text-xs text-muted-foreground">{course.class_time}</p>
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    {course.building && course.room_number && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Room {course.room_number}</p>
                          <p className="text-xs text-muted-foreground">{course.building}</p>
                        </div>
                      </div>
                    )}

                    {/* Semester */}
                    {course.semester && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">{course.semester}</p>
                          {course.current_grade === 'In Progress' && (
                            <p className="text-xs text-muted-foreground">Currently enrolled</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Prerequisites */}
                  {course.prerequisites && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground">
                        <Award className="h-3 w-3 inline mr-1" />
                        <span className="font-medium">Prerequisites:</span> {course.prerequisites}
                      </p>
                    </div>
                  )}
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