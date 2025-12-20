// app/not-found.tsx
'use client';

import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Wifi,
  RefreshCw,
  Info,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const suggestionItems = [
  {
    text: 'Check your internet connection',
    icon: Wifi,
  },
  {
    text: 'Refresh the page or the app',
    icon: RefreshCw,
  },
  {
    text: 'If the issue persists, contact support',
    icon: Info,
  },
];

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 font-display">
      <div className="grow flex flex-col items-center justify-center text-center">
        <div className="mb-6">
          <AlertTriangle className="h-24 w-24 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="mb-2 text-3xl font-bold">
          Oops! Page Not Found.
        </h1>
        <p className="mb-8 max-w-sm text-base text-muted-foreground">
          Looks like this vial is empty. We couldn’t draw up the page you requested.
        </p>

        <div className="w-full max-w-sm space-y-4 text-left">
            {suggestionItems.map((item, index) => (
                 <Card key={index} className="bg-muted/50">
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="shrink-0 text-primary">
                            <item.icon className="h-6 w-6" />
                        </div>
                        <p className="text-foreground">{item.text}</p>
                    </CardContent>
                 </Card>
            ))}
        </div>
      </div>
      <div className="w-full max-w-sm">
        <Button
          size="lg"
          className="w-full"
          onClick={() => router.push('/dashboard')}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}