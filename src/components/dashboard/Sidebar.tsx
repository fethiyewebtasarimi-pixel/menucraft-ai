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
  ShieldCheck,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUIStore } from '@/stores/uiStore';
import { useRestaurants } from '@/hooks/useRestaurant';
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
];

const toolNavItems: NavItem[] = [
  { label: 'Marka & Tasarım', href: '/dashboard/branding', icon: Palette },
  { label: 'Alerjen Uyumluluk', href: '/dashboard/compliance', icon: ShieldCheck },
  { label: 'PDF Menü', href: '/dashboard/menu/print', icon: FileDown },
];

const bottomNavItems: NavItem[] = [
  { label: 'Ayarlar', href: '/dashboard/settings', icon: Settings },
  { label: 'Abonelik', href: '/dashboard/subscription', icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { data: restaurants } = useRestaurants();
  const restaurant = restaurants?.[0];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(href);
  };

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    const Icon = item.icon;

    const content = (
      <Link href={item.href}>
        <div
          className={cn(
            'group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 relative',
            active
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          )}
        >
          {active && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full"
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}
          <Icon className={cn('h-[18px] w-[18px] flex-shrink-0', active && 'text-primary')} />
          {sidebarOpen && (
            <span className="text-sm truncate">{item.label}</span>
          )}
        </div>
      </Link>
    );

    if (!sidebarOpen) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <TooltipProvider>
      <motion.aside
        className="fixed left-0 top-0 z-40 h-screen border-r bg-card flex flex-col"
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        {/* Logo & Restaurant */}
        <div className="flex items-center gap-3 h-16 px-3 border-b flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center rounded-lg bg-primary p-2 flex-shrink-0">
              {restaurant?.logo ? (
                <img src={restaurant.logo} alt="" className="h-5 w-5 rounded" />
              ) : (
                <Store className="h-5 w-5 text-primary-foreground" />
              )}
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">
                  {restaurant?.name || 'MenuCraft AI'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  Restoran Paneli
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
          {/* Main */}
          <div className="space-y-0.5">
            {sidebarOpen && (
              <p className="px-3 mb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Genel
              </p>
            )}
            {mainNavItems.map((item) => (
              <NavItemComponent key={item.href} item={item} />
            ))}
          </div>

          {/* Tools */}
          <div className="space-y-0.5">
            {sidebarOpen && (
              <p className="px-3 mb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Araçlar
              </p>
            )}
            {toolNavItems.map((item) => (
              <NavItemComponent key={item.href} item={item} />
            ))}
          </div>

          {/* Bottom */}
          <div className="space-y-0.5">
            {sidebarOpen && (
              <p className="px-3 mb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Hesap
              </p>
            )}
            {bottomNavItems.map((item) => (
              <NavItemComponent key={item.href} item={item} />
            ))}
          </div>
        </nav>

        {/* Toggle */}
        <div className="border-t p-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="w-full justify-center h-8 text-muted-foreground hover:text-foreground"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
