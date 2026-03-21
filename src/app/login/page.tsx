'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
        <p className="text-muted-foreground font-medium">Redirecting to login portal...</p>
      </div>
    </div>
  );
}
