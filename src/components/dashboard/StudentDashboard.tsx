import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, User as UserIcon, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudentDashboardProps {
  user: User;
}

const StudentDashboard = ({ user }: StudentDashboardProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back, Student!</h2>
        <p className="text-muted-foreground">Access your advisor and get personalized guidance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-elevated transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>My Conversations</CardTitle>
            </div>
            <CardDescription>View your chat history</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">View Chats</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-elevated transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <UserIcon className="h-5 w-5 text-secondary" />
              </div>
              <CardTitle>My Advisor</CardTitle>
            </div>
            <CardDescription>Connect with your advisor</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full">Contact Advisor</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-elevated transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Bot className="h-5 w-5 text-accent" />
              </div>
              <CardTitle>AI Assistant</CardTitle>
            </div>
            <CardDescription>Get instant help</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Ask AI</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>Your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Student ID:</span>
              <span className="font-medium">{user.user_metadata?.student_id || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Full Name:</span>
              <span className="font-medium">{user.user_metadata?.full_name || 'Not set'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;