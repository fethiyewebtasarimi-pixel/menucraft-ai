'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFeatureGate } from '@/hooks/useSubscription';

export function TrialBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { isTrialing, trialEndsAt, isLoading } = useFeatureGate();

  if (isLoading || !isTrialing || !trialEndsAt || dismissed) return null;

  const end = new Date(trialEndsAt);
  const now = new Date();
  const daysRemaining = Math.max(
    0,
    Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  const isUrgent = daysRemaining <= 1;

  return (
    <div
      className={`relative flex items-center justify-between gap-3 px-4 py-2.5 text-sm ${
        isUrgent
          ? 'bg-red-500/10 border-b border-red-500/20 text-red-700 dark:text-red-400'
          : 'bg-violet-500/10 border-b border-violet-500/20 text-violet-700 dark:text-violet-400'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">
          <strong>Professional</strong> planı deniyorsunuz!
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 text-xs opacity-80">
          <Clock className="h-3 w-3" />
          {daysRemaining === 0
            ? 'Bugün sona eriyor'
            : `${daysRemaining} gün kaldı`}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          asChild
          size="sm"
          className={`h-7 text-xs ${
            isUrgent
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-violet-600 hover:bg-violet-700 text-white'
          }`}
        >
          <Link href="/dashboard/subscription">Planı Yükselt</Link>
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
