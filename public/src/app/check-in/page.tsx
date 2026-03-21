"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEPARTMENTS, VISIT_REASONS } from "@/lib/mock-data";
import { CheckCircle2, ChevronLeft, Send, User as UserIcon, Sparkles, Loader2, BookOpen, Clock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, doc, deleteDoc, getDoc } from 'firebase/firestore';

export default function CheckInPage() {
  const [mounted, setMounted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [department, setDepartment] = useState('');
  const [reason, setReason] = useState('');
  const [userDetails, setUserDetails] = useState<any>(null);
  
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    setMounted(true);
    if (!isUserLoading) {
      if (!user) {
        router.push('/');
      } else {
        fetchUserProfile(user.uid);
      }
    }
  }, [user, isUserLoading, router]);

  const fetchUserProfile = async (uid: string) => {
    const snap = await getDoc(doc(firestore, 'users', uid));
    if (snap.exists()) {
      setUserDetails(snap.data());
      if (snap.data().college) {
        setDepartment(snap.data().college);
      }
    }
  };

  if (!mounted || isUserLoading) return null;

  const handleSignOut = async () => {
    if (user) {
      await deleteDoc(doc(firestore, 'user_sessions', user.uid));
    }
    await signOut(auth);
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!department || !reason || !user || !userDetails) {
      toast({ title: "Incomplete Form", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    try {
      await addDoc(collection(firestore, 'visits'), {
        userId: user.uid,
        userName: userDetails.name || 'Visitor',
        userEmail: user.email,
        userType: userDetails.userType || 'student',
        college: department,
        purpose: reason,
        timestamp: serverTimestamp(),
        academicYear: '2024-2025'
      });

      setIsSubmitted(true);
      toast({
        title: "Success!",
        description: "You have been checked in successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Check-in Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
        <div className="absolute inset-0 bg-accent/5 animate-pulse" />
        <Card className="w-full max-w-lg text-center shadow-2xl animate-in zoom-in-95 duration-700 rounded-[3.5rem] bg-white/90 backdrop-blur-md relative z-10 border-none">
          <CardContent className="pt-20 pb-20 space-y-10 px-12">
            <div className="mx-auto w-32 h-32 bg-accent/20 text-accent rounded-full flex items-center justify-center animate-bounce shadow-inner">
              <CheckCircle2 size={72} strokeWidth={2.5} />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-primary font-headline tracking-tight">See You Inside!</h2>
              <p className="text-muted-foreground text-xl">Your visit to NEU Library has been recorded.</p>
            </div>
            <div className="p-6 bg-slate-50/80 rounded-3xl italic text-primary/70 border border-slate-100 shadow-sm">
              "Reading is a basic tool in the living of a good life."
            </div>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="mt-6 border-primary text-primary hover:bg-primary/5 rounded-2xl px-12 h-14 font-bold text-lg transition-all hover:scale-105"
            >
              Log Out & Finish
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 font-body">
      <div className="max-w-4xl mx-auto space-y-10 pt-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleSignOut} className="text-muted-foreground hover:bg-white/50 rounded-full px-6 transition-colors">
            <ChevronLeft className="mr-2 h-4 w-4" /> Exit Portal
          </Button>
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-md border border-white/50">
            <div className="w-6 h-6 relative group cursor-pointer">
              <Image 
                src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
                alt="NEU Logo" 
                fill 
                className="object-contain transition-transform group-hover:scale-110"
              />
            </div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">{user?.email}</span>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-accent to-primary rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
          <Card className="bg-primary text-primary-foreground border-none shadow-2xl rounded-[3rem] overflow-hidden relative">
            <CardContent className="p-12 flex flex-col md:flex-row items-center gap-10 relative z-10">
              <div className="w-24 h-24 bg-white/15 rounded-[2rem] flex items-center justify-center border border-white/20 shadow-2xl animate-pulse">
                <Sparkles className="h-12 w-12 text-accent" />
              </div>
              <div className="text-center md:text-left space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter">Welcome to NEU Library!</h1>
                <p className="text-primary-foreground/80 text-xl font-medium">Hello, {userDetails?.name?.split(' ')[0] || 'Scholar'}. Ready for a productive session?</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-10 pt-4">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold font-headline text-primary tracking-tight">Institutional Check-in</h2>
              <p className="text-muted-foreground leading-relaxed text-xl">
                Please confirm your details to help us manage library capacity and resources effectively.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border rounded-[2.5rem] p-10 space-y-8 shadow-xl border-white/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <h3 className="font-bold text-primary flex items-center gap-3 uppercase tracking-[0.2em] text-[10px]">
                <span className="w-3 h-3 bg-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(46,184,209,0.5)]" /> Profile Verification
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 group/item">
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-5 w-5 text-accent" />
                    <span className="text-sm text-muted-foreground font-medium">Visitor Type</span>
                  </div>
                  <span className="text-sm font-bold capitalize text-primary bg-slate-50 px-3 py-1 rounded-lg">{userDetails?.userType || '...'}</span>
                </div>
                <div className="flex justify-between items-center group/item">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-accent" />
                    <span className="text-sm text-muted-foreground font-medium">Identification</span>
                  </div>
                  <span className="text-sm font-bold text-primary bg-slate-50 px-3 py-1 rounded-lg">{userDetails?.studentId || '...'}</span>
                </div>
              </div>
            </div>
          </div>

          <Card className="shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border-none rounded-[3.5rem] bg-white/90 backdrop-blur-md">
            <CardHeader className="pt-12 px-10">
              <CardTitle className="text-3xl font-bold tracking-tight text-primary">Session Info</CardTitle>
              <CardDescription className="text-lg">Select your primary department and visit reason.</CardDescription>
            </CardHeader>
            <CardContent className="px-10 pb-12">
              {!userDetails ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                  <Loader2 className="animate-spin text-primary h-12 w-12" />
                  <p className="font-medium animate-pulse">Loading identity...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-1">College Department</Label>
                    <Select onValueChange={setDepartment} value={department}>
                      <SelectTrigger className="h-16 focus:ring-accent rounded-2xl border-2 bg-slate-50/50 hover:bg-white transition-all text-base">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-accent" />
                          <SelectValue placeholder="Select your college" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-2 shadow-2xl">
                        {DEPARTMENTS.map(dept => (
                          <SelectItem key={dept} value={dept} className="h-12 focus:bg-accent/10">{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-1">Reason for Visit</Label>
                    <Select onValueChange={setReason} value={reason}>
                      <SelectTrigger className="h-16 focus:ring-accent rounded-2xl border-2 bg-slate-50/50 hover:bg-white transition-all text-base">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-accent" />
                          <SelectValue placeholder="What brings you here?" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-2 shadow-2xl">
                        {VISIT_REASONS.map(reason => (
                          <SelectItem key={reason} value={reason} className="h-12 focus:bg-accent/10">{reason}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-16 bg-accent hover:bg-accent/95 text-white font-bold text-xl transition-all shadow-xl hover:shadow-accent/20 rounded-2xl group relative overflow-hidden active:scale-[0.98]"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      Confirm Check-in 
                      <Send className="ml-3 h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
