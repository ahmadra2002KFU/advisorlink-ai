import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { GraduationCap, MessageSquare, Shield, Users } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-glow to-secondary py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center text-white space-y-6">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                <GraduationCap className="h-16 w-16" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Welcome to MentorLink
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              Connecting students with academic advisors for personalized guidance and support
            </p>
            <div className="flex gap-4 justify-center pt-6">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/auth')}
                className="text-lg px-8"
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/auth')}
                className="text-lg px-8 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Powerful Features for Better Communication
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center space-y-4 p-6 rounded-xl bg-card shadow-soft hover:shadow-elevated transition-shadow">
              <div className="flex justify-center">
                <div className="p-3 bg-primary/10 rounded-full">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground">Real-time Chat</h3>
              <p className="text-muted-foreground">
                Connect with your advisor instantly through our secure messaging system
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-xl bg-card shadow-soft hover:shadow-elevated transition-shadow">
              <div className="flex justify-center">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground">Personalized Support</h3>
              <p className="text-muted-foreground">
                Get guidance tailored to your academic level and personal needs
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-xl bg-card shadow-soft hover:shadow-elevated transition-shadow">
              <div className="flex justify-center">
                <div className="p-3 bg-accent/10 rounded-full">
                  <Shield className="h-8 w-8 text-accent" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground">AI Assistant</h3>
              <p className="text-muted-foreground">
                Get instant answers to common questions with our intelligent AI helper
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Ready to Connect?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join MentorLink today and start your journey to academic success
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="text-lg px-12"
          >
            Create Your Account
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
