'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Home, ArrowRight, Sparkles } from "lucide-react";
import { Button } from '@/components/ui/button';
// Build Trigger: Testing Loader2 import
import { Loader2 } from "lucide-react";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleName = searchParams.get('module') || 'Library';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center overflow-hidden font-body">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />

      <Card className="max-w-lg w-full border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] rounded-[4rem] overflow-hidden bg-white/90 backdrop-blur-xl relative z-10 animate-in zoom-in-95 fade-in duration-700">
        <CardContent className="p-16 space-y-12">
          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25" />
            <div className="relative bg-emerald-100 text-emerald-600 rounded-full w-full h-full flex items-center justify-center shadow-xl shadow-emerald-200">
              <CheckCircle2 size={72} strokeWidth={2.5} className="animate-in zoom-in-50 duration-700 delay-300" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-primary font-headline tracking-tighter">Success!</h1>
            <p className="text-muted-foreground text-xl font-medium">
              Your visit to <span className="text-accent font-bold">{moduleName}</span> has been confirmed.
            </p>
          </div>

          <div className="bg-slate-50/80 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 relative group">
            <Sparkles className="absolute top-4 right-4 h-5 w-5 text-accent animate-bounce" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black mb-3">Session Status</p>
            <p className="text-primary font-black text-2xl tracking-tight">Active & Verified</p>
          </div>

          <div className="pt-4 space-y-4">
            <Button 
              className="w-full h-16 rounded-[1.5rem] text-xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-95" 
              onClick={() => router.push('/')}
            >
              <div className="relative z-10 flex items-center justify-center">
                <Home className="mr-3 h-6 w-6" /> Return to Gateway
              </div>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </Button>
            <div className="pt-6">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em] font-black">
                NEU Unified Campus Portal
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}