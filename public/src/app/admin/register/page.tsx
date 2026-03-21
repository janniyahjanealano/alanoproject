'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, ChevronLeft, Loader2, Mail, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function AdminRegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const router = useRouter();
  const { toast } = useToast();
  
  const auth = useAuth();
  const firestore = useFirestore();

  const handleAdminRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast({ title: "Incomplete Form", description: "All fields are required.", variant: "destructive" });
      return;
    }

    if (!email.endsWith('@neu.edu.ph')) {
      toast({ 
        title: "Invalid Domain", 
        description: "Registration is restricted to @neu.edu.ph accounts.", 
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(firestore, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: name,
        role: 'admin',
        isBlocked: false,
        createdAt: new Date().toISOString()
      });

      toast({ title: "Account Created", description: "Admin access granted successfully." });
      router.push('/admin/dashboard');
    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-lg shadow-2xl border-none rounded-3xl overflow-hidden">
        <CardHeader className="text-center space-y-6 pt-12">
          <div className="mx-auto w-24 h-24 relative">
            <Image 
              src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
              alt="NEU Logo" 
              fill 
              className="object-contain"
            />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold text-primary font-headline">Staff Registration</CardTitle>
            <CardDescription>Create a new administrative CampLib account</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-10">
          <form onSubmit={handleAdminRegistration} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="admin-name" 
                  placeholder="Dr. Juan Dela Cruz" 
                  className="pl-10 h-12"
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-email">Institutional Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="admin-email" 
                  type="email" 
                  placeholder="staff@neu.edu.ph" 
                  className="pl-10 h-12"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Secure Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="admin-password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-12"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-lg mt-4" 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Complete Registration"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t py-8 bg-slate-100/30">
          <Button variant="link" onClick={() => router.push('/admin/login')} className="text-muted-foreground">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Staff Sign In
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
