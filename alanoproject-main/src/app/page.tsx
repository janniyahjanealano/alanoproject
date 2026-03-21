'use client';

import { useState, Suspense } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Mail, Loader2, ArrowRight, Lock, UserPlus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

function VisitorPortal() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration specific states
  const [otpStep, setOtpStep] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const INSTITUTIONAL_DOMAIN = '@neu.edu.ph';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(firestore, 'users', result.user.uid));
      
      if (!userDoc.exists() || !userDoc.data().studentId) {
        router.push('/register');
      } else {
        router.push('/check-in');
      }
      
      toast({ title: "Welcome back", description: "Successfully signed in to NEU CampLib." });
    } catch (error: any) {
      toast({ 
        title: "Login Failed", 
        description: "Invalid credentials or account does not exist.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith(INSTITUTIONAL_DOMAIN)) {
      toast({
        title: "Invalid Email",
        description: `Registration requires a ${INSTITUTIONAL_DOMAIN} account.`,
        variant: "destructive"
      });
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpStep(true);
  };

  const verifyAndProceedToRegister = () => {
    if (userOtp !== generatedOtp) {
      toast({ title: "Incorrect Code", description: "The verification code is invalid.", variant: "destructive" });
      return;
    }
    sessionStorage.setItem('pendingRegistrationEmail', email);
    router.push('/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden font-body">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700 slide-in-from-bottom-8">
        <Card className="shadow-2xl border-none rounded-[3rem] overflow-hidden bg-white/90 backdrop-blur-xl border border-white/20">
          <CardHeader className="text-center space-y-6 pt-12 pb-8">
            <div className="mx-auto w-28 h-28 relative hover:scale-105 transition-transform duration-500 cursor-pointer">
              <Image 
                src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
                alt="NEU Logo" 
                fill 
                className="object-contain drop-shadow-xl"
                priority
              />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-4xl font-headline font-bold text-primary tracking-tighter flex items-center justify-center gap-2">
                NEU <span className="text-accent">CampLib</span>
                <Sparkles className="h-5 w-5 text-accent animate-bounce" />
              </CardTitle>
              <CardDescription className="text-base font-medium text-muted-foreground/80">
                {isRegistering ? 'Start Your Journey' : 'Institutional Library Gateway'}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 px-10 pb-12">
            {!isRegistering ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2 group">
                  <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-1 group-focus-within:text-accent transition-colors">Institutional Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 group-focus-within:text-accent transition-colors" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@neu.edu.ph" 
                      className="pl-12 h-14 rounded-2xl border-2 bg-white/50 focus:bg-white focus:ring-accent transition-all shadow-sm" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-1 group-focus-within:text-accent transition-colors">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 group-focus-within:text-accent transition-colors" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-12 h-14 rounded-2xl border-2 bg-white/50 focus:bg-white focus:ring-accent transition-all shadow-sm" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 font-bold bg-primary hover:bg-primary/95 text-lg shadow-xl rounded-2xl transition-all hover:scale-[1.02] active:scale-95 group overflow-hidden" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : (
                    <div className="flex items-center">
                      Sign In 
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                    </div>
                  )}
                </Button>
                <div className="text-center pt-2">
                  <Button variant="link" onClick={() => setIsRegistering(true)} className="text-accent font-semibold hover:text-accent/80 transition-colors">
                    New student? Create an account
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleStartRegistration} className="space-y-5 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-2 group">
                  <Label htmlFor="reg-email" className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-1">Student Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 transition-colors" />
                    <Input 
                      id="reg-email" 
                      type="email" 
                      placeholder="name@neu.edu.ph" 
                      className="pl-12 h-14 rounded-2xl border-2 bg-white/50 focus:bg-white focus:ring-accent transition-all shadow-sm" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 font-bold bg-accent hover:bg-accent/95 text-lg shadow-xl rounded-2xl transition-all hover:scale-[1.02] active:scale-95 group" 
                  disabled={isLoading}
                >
                  Get Verification Code <ShieldCheck className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                </Button>
                <div className="text-center pt-2">
                  <Button variant="link" onClick={() => setIsRegistering(false)} className="text-muted-foreground hover:text-primary transition-colors">
                    Already have an account? Sign in
                  </Button>
                </div>
              </form>
            )}

            <div className="pt-6 text-center border-t border-slate-100">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/admin/login')} 
                className="text-muted-foreground hover:text-primary rounded-full px-6 transition-colors"
              >
                Institutional Staff Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={otpStep} onOpenChange={setOtpStep}>
        <DialogContent className="sm:max-w-md rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
          <div className="p-8 space-y-8">
            <DialogHeader className="text-center items-center pt-4">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mb-4 animate-in zoom-in-50 duration-500">
                <ShieldCheck size={40} className="animate-pulse" />
              </div>
              <DialogTitle className="text-3xl font-bold text-primary tracking-tight">Email Verification</DialogTitle>
              <DialogDescription className="text-base">
                Confirm your identity for <span className="font-semibold text-primary">{email}</span>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="p-8 bg-slate-50/80 rounded-[2.5rem] border-2 border-dashed border-emerald-500/20 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold mb-3">Your Secure Code</p>
                  <p className="text-5xl font-mono font-bold tracking-[0.4em] text-primary">{generatedOtp}</p>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="otp" className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground text-center block">Enter Code Below</Label>
                <Input 
                  id="otp" 
                  placeholder="000000" 
                  maxLength={6} 
                  className="text-center text-3xl tracking-[0.6em] font-mono h-20 rounded-3xl border-2 focus:ring-accent transition-all" 
                  value={userOtp}
                  onChange={(e) => setUserOtp(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="pb-4">
              <Button 
                className="w-full h-16 text-xl font-bold bg-accent hover:bg-accent/95 rounded-[1.5rem] shadow-xl hover:scale-[1.02] active:scale-95 transition-all" 
                onClick={verifyAndProceedToRegister}
              >
                Verify & Continue
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function GatewayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
      <VisitorPortal />
    </Suspense>
  );
}