'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function MainPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to My Day as the default view
    router.replace('/my-day');
  }, [router]);

  return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );
}
