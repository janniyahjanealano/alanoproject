
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Send, Briefcase, Loader2 } from "lucide-react";
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function DeanCheckIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [purpose, setPurpose] = useState('');
  
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/dean/check-in');
    } else if (user) {
      getDoc(doc(firestore, 'users', user.uid)).then(snap => {
        if (snap.exists()) setProfile(snap.data());
      });
    }
  }, [user, isUserLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose || !user || !profile) return;

    setIsLoading(true);
    try {
      await addDoc(collection(firestore, 'dean_logs'), {
        userId: user.uid,
        visitorName: profile.name,
        studentId: profile.studentId,
        purpose: purpose,
        status: 'Waiting',
        timestamp: serverTimestamp()
      });
      router.push('/success?module=Dean\'s Office');
    } catch (error: any) {
      toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
      setIsLoading(false);
    }
  };

  if (isUserLoading || !profile) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <Button variant="ghost" onClick={() => router.push('/')} className="text-muted-foreground">
          <ChevronLeft className="mr-2 h-4 w-4" /> Cancel
        </Button>

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <div className="bg-primary p-8 text-white flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <Briefcase size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-headline">Dean's Office</h1>
              <p className="text-primary-foreground/70 text-sm">Visitor Queue Registration</p>
            </div>
          </div>
          <CardContent className="p-8 pt-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Visitor Name</Label>
                <div className="p-3 bg-muted/30 rounded-lg text-primary">{profile.name}</div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Student ID</Label>
                <div className="p-3 bg-muted/30 rounded-lg font-mono text-primary">{profile.studentId}</div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-primary">Purpose of Visit</Label>
                <Select onValueChange={setPurpose} value={purpose} required>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Why are you visiting?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Signature">Signature</SelectItem>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Document Submission">Document Submission</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <p className="text-emerald-700 text-xs font-medium text-center">
                  Your current status will be set to <strong>Waiting</strong> upon submission.
                </p>
              </div>

              <Button type="submit" className="w-full h-14 text-lg font-bold shadow-lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <><Send className="mr-2 h-5 w-5" /> Join Queue</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
