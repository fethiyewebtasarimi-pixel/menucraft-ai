'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  CreditCard,
  BarChart3,
  Settings,
  MessageSquare,
  Shield,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { label: 'Genel Bakis', href: '/admin', icon: LayoutDashboard },
  { label: 'Kullanicilar', href: '/admin/users', icon: Users },
  { label: 'Restoranlar', href: '/admin/restaurants', icon: Store },
  { label: 'Siparisler', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Abonelikler', href: '/admin/subscriptions', icon: CreditCard },
  { label: 'Yorumlar', href: '/admin/reviews', icon: MessageSquare },
  { label: 'Analitik', href: '/admin/analytics', icon: BarChart3 },
];

const bottomNavItems: NavItem[] = [
  { label: 'Sistem Ayarlari', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    const Icon = item.icon;

    const content = (
      <Link href={item.href}>
        <motion.div
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer',
            'hover:bg-accent/50',
            active && 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700',
            !active && 'text-muted-foreground hover:text-foreground'
          )}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Icon className={cn('h-5 w-5 flex-shrink-0', active && 'text-white')} />
          {sidebarOpen && (
            <span className="font-medium text-sm truncate">{item.label}</span>
          )}
          {sidebarOpen && item.badge && (
            <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </motion.div>
      </Link>
    );

    if (!sidebarOpen) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <TooltipProvider>
      <motion.aside
        className="fixed left-0 top-0 z-40 h-screen border-r bg-background"
        initial={false}
        animate={{
          width: sidebarOpen ? 256 : 64,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b px-3">
            <Link href="/admin" className="flex items-center gap-2">
              <motion.div
                className="flex items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-rose-600 p-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Shield className="h-6 w-6 text-white" />
              </motion.div>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="text-lg font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                    Admin Panel
                  </span>
                </motion.div>
              )}
            </Link>
          </div>

          {/* Back to Dashboard */}
          <div className="px-3 pt-3">
            <Link href="/dashboard">
              <motion.div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                whileHover={{ x: 2 }}
              >
                <ArrowLeft className="h-4 w-4" />
                {sidebarOpen && <span>Dashboard&apos;a Don</span>}
              </motion.div>
            </Link>
          </div>

          <Separator className="my-2 mx-3" />

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
            {mainNavItems.map((item) => (
              <NavItemComponent key={item.href} item={item} />
            ))}

            <Separator className="my-4" />

            {bottomNavItems.map((item) => (
              <NavItemComponent key={item.href} item={item} />
            ))}
          </nav>

          {/* Toggle Button */}
          <div className="border-t p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full justify-center"
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
