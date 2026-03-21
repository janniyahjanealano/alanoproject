'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, ChevronLeft, UserPlus, Mail, Lock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const router = useRouter();
  const { toast } = useToast();
  
  const auth = useAuth();
  const firestore = useFirestore();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (!email.endsWith('@neu.edu.ph')) {
      toast({ 
        title: "Domain Restricted", 
        description: "Staff access is limited to @neu.edu.ph institutional accounts.", 
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        toast({ title: "Access Granted", description: "Welcome to the NEU CampLib Dashboard." });
        router.push('/admin/dashboard');
      } else {
        toast({
          title: "Unauthorized Access",
          description: "This account lacks administrative credentials. Entry denied.",
          variant: "destructive",
        });
        await signOut(auth);
      }
    } catch (error: any) {
      toast({ 
        title: "Login Failure", 
        description: "Incorrect credentials or account restricted.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white animate-in fade-in zoom-in-95 duration-700">
        <CardHeader className="text-center space-y-6 pt-12">
          <div className="mx-auto w-24 h-24 relative hover:scale-110 transition-transform duration-500 cursor-pointer">
            <Image 
              src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
              alt="NEU Logo" 
              fill 
              className="object-contain"
            />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold text-primary font-headline tracking-tight">Staff Portal</CardTitle>
            <CardDescription className="text-base">Administrative Gateway for CampLib</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-10 pb-8">
          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div className="space-y-2 group">
              <Label htmlFor="admin-email" className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">Staff Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  id="admin-email" 
                  type="email" 
                  placeholder="staff@neu.edu.ph" 
                  className="pl-12 h-14 rounded-2xl border-2 transition-all focus:ring-primary/20" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2 group">
              <Label htmlFor="admin-password" className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  id="admin-password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-12 h-14 rounded-2xl border-2 transition-all focus:ring-primary/20" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <Button 
              type="submit"
              className="w-full h-14 bg-primary hover:bg-primary/90 transition-all font-bold text-lg shadow-xl rounded-2xl mt-4 active:scale-95" 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : (
                <>
                  <LogIn className="mr-2 h-5 w-5" /> Staff Sign In
                </>
              )}
            </Button>
          </form>

          <div className="flex items-center gap-4 py-8">
            <div className="h-px flex-1 bg-border"></div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Management</span>
            <div className="h-px flex-1 bg-border"></div>
          </div>

          <Link href="/admin/register" className="block">
            <Button variant="outline" className="w-full h-14 border-dashed border-primary/30 hover:bg-primary/5 rounded-2xl text-primary font-semibold hover:border-primary transition-all">
              <UserPlus className="mr-2 h-5 w-5" /> Create Admin Account
            </Button>
          </Link>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t pt-6 pb-10 bg-slate-50/50">
          <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="text-muted-foreground hover:text-primary rounded-full px-6">
            <ChevronLeft className="mr-1 h-4 w-4" /> Return to Gateway
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}