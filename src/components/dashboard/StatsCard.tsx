'use client';

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  trend?: 'up' | 'down';
  description?: string;
}

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  trend = 'up',
  description,
}: StatsCardProps) {
  const isPositive = trend === 'up';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <h3 className="mt-2 text-3xl font-bold tracking-tight">
                {value}
              </h3>
              {description && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {description}
                </p>
              )}
              {change !== undefined && (
                <div className="mt-2 flex items-center gap-1">
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isPositive ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {isPositive && '+'}
                    {change}%
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    son 30 gün
                  </span>
                </div>
              )}
            </div>
            <motion.div
              className={cn(
                'rounded-lg p-3',
                'bg-gradient-to-br from-amber-500/10 to-orange-500/10',
                'ring-1 ring-amber-500/20'
              )}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <Icon className="h-6 w-6 text-amber-600" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
