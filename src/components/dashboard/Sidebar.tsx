'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  UtensilsCrossed,
  QrCode,
  ShoppingBag,
  Grid3X3,
  MessageSquare,
  BarChart3,
  Palette,
  Settings,
  CreditCard,
  ChefHat,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Menüler', href: '/dashboard/menu', icon: UtensilsCrossed },
  { label: 'QR Kodlar', href: '/dashboard/qr-codes', icon: QrCode },
  { label: 'Siparişler', href: '/dashboard/orders', icon: ShoppingBag },
  { label: 'Masalar', href: '/dashboard/tables', icon: Grid3X3 },
  { label: 'Yorumlar', href: '/dashboard/reviews', icon: MessageSquare },
  { label: 'Analitik', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Marka & Tasarım', href: '/dashboard/branding', icon: Palette },
];

const bottomNavItems: NavItem[] = [
  { label: 'Ayarlar', href: '/dashboard/settings', icon: Settings },
  { label: 'Abonelik', href: '/dashboard/subscription', icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
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
            active && 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600',
            !active && 'text-muted-foreground hover:text-foreground'
          )}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Icon className={cn('h-5 w-5 flex-shrink-0', active && 'text-white')} />
          {sidebarOpen && (
            <span className="font-medium text-sm truncate">{item.label}</span>
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
            <Link href="/dashboard" className="flex items-center gap-2">
              <motion.div
                className="flex items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 p-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChefHat className="h-6 w-6 text-white" />
              </motion.div>
              {sidebarOpen && (
                <motion.span
                  className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  MenuCraft AI
                </motion.span>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
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
              onClick={toggleSidebar}
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
