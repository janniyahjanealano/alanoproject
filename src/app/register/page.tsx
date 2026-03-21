'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DEPARTMENTS } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader2, ChevronLeft, GraduationCap, Briefcase, Lock } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';

export default function RegisterPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    studentId: '',
    college: '',
    userType: 'student' as 'student' | 'employee',
  });

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem('pendingRegistrationEmail');
    if (!pendingEmail) {
      router.push('/');
    } else {
      setEmail(pendingEmail);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.password || !formData.studentId || !formData.college) {
      toast({
        title: "Missing Information",
        description: "Please complete all fields to secure your account.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({ title: "Weak Password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, formData.password);
      const newUser = userCredential.user;

      await updateProfile(newUser, { displayName: formData.name });

      // Save profile in Firestore
      await setDoc(doc(firestore, 'users', newUser.uid), {
        uid: newUser.uid,
        email: email,
        name: formData.name,
        studentId: formData.studentId,
        college: formData.college,
        userType: formData.userType,
        role: 'student',
        isBlocked: false,
        createdAt: new Date().toISOString(),
      });

      sessionStorage.removeItem('pendingRegistrationEmail');
      toast({
        title: "Account Created",
        description: "Your library profile is now active.",
      });
      router.push('/check-in');
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <div className="absolute top-0 left-0 p-8">
        <Button variant="ghost" onClick={() => router.push('/')} className="text-muted-foreground">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Login
        </Button>
      </div>

      <Card className="w-full max-w-lg shadow-2xl border-none animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="text-center space-y-2 pb-8 border-b">
          <div className="mx-auto w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-2">
            <UserPlus size={24} />
          </div>
          <CardTitle className="text-2xl font-bold text-primary font-headline">Finish Registration</CardTitle>
          <CardDescription>Secure your account for {email}</CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Identify as:</Label>
              <RadioGroup 
                defaultValue="student" 
                onValueChange={(val) => setFormData({...formData, userType: val as 'student' | 'employee'})}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="student" id="student" className="peer sr-only" />
                  <Label
                    htmlFor="student"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <GraduationCap className="mb-3 h-6 w-6" />
                    Student
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="employee" id="employee" className="peer sr-only" />
                  <Label
                    htmlFor="employee"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Briefcase className="mb-3 h-6 w-6" />
                    Employee
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs uppercase tracking-wider font-semibold text-primary">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Juan Dela Cruz" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="h-12 focus:ring-accent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pass" className="text-xs uppercase tracking-wider font-semibold text-primary">Create Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="pass" 
                  type="password"
                  placeholder="Min. 6 characters" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="h-12 pl-10 focus:ring-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="studentId" className="text-xs uppercase tracking-wider font-semibold text-primary">
                  ID Number
                </Label>
                <Input 
                  id="studentId" 
                  placeholder="2024-XXXXX" 
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  className="h-12 focus:ring-accent"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-semibold text-primary">College</Label>
                <Select onValueChange={(val) => setFormData({...formData, college: val})} value={formData.college}>
                  <SelectTrigger className="h-12 focus:ring-accent">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg transition-all" 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Complete Account Setup"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-muted/30 p-4 justify-center rounded-b-lg">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center">
            Institutional verification ensures library resource integrity.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
