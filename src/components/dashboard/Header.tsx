'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Menu,
  Search,
  Bell,
  BellRing,
  ChevronRight,
  ShoppingBag,
  MessageSquare,
  Info,
  CreditCard,
  CheckCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUIStore } from '@/stores/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const NOTIFICATION_ICONS: Record<string, typeof ShoppingBag> = {
  NEW_ORDER: ShoppingBag,
  ORDER_STATUS: ShoppingBag,
  NEW_REVIEW: MessageSquare,
  SUBSCRIPTION: CreditCard,
  SYSTEM: Info,
  WAITER_CALL: BellRing,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Az önce';
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

export function Header() {
  const pathname = usePathname();
  const { toggleSidebar } = useUIStore();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  // Fetch notifications with polling every 30 seconds
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications?limit=10');
      if (!res.ok) return { notifications: [], unreadCount: 0 };
      return res.json();
    },
    refetchInterval: 10000,
    staleTime: 5000,
  });

  const notifications: Notification[] = notifData?.notifications || [];
  const notificationCount: number = notifData?.unreadCount || 0;
  const prevUnreadRef = useRef(notificationCount);

  // Play sound when new WAITER_CALL notification arrives
  useEffect(() => {
    if (notificationCount > prevUnreadRef.current) {
      const hasNewWaiterCall = notifications.some(
        (n) => n.type === 'WAITER_CALL' && !n.isRead
      );
      if (hasNewWaiterCall) {
        const audio = new Audio('/sounds/waiter-call.mp3');
        audio.play().catch(() => {});
      }
    }
    prevUnreadRef.current = notificationCount;
  }, [notificationCount, notifications]);

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleMarkAllRead = useCallback(() => {
    markAllReadMutation.mutate();
  }, [markAllReadMutation]);

  const getBreadcrumbs = () => {
    const segments = pathname?.split('/').filter(Boolean) || [];
    const breadcrumbs = [{ label: 'Ana Sayfa', href: '/dashboard' }];

    const pathMap: Record<string, string> = {
      dashboard: 'Genel Bakış',
      menu: 'Menüler',
      menus: 'Menüler',
      'qr-codes': 'QR Kodlar',
      orders: 'Siparişler',
      tables: 'Masalar',
      reviews: 'Yorumlar',
      analytics: 'Analitik',
      branding: 'Marka & Tasarım',
      settings: 'Ayarlar',
      subscription: 'Abonelik',
    };

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      if (index > 0) {
        breadcrumbs.push({
          label: pathMap[segment] || segment,
          href: currentPath,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center gap-4 px-4 md:px-6">
        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumbs */}
        <nav className="hidden md:flex items-center text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
              <Link
                href={crumb.href}
                className={cn(
                  'hover:text-foreground transition-colors',
                  index === breadcrumbs.length - 1 && 'text-foreground font-medium'
                )}
              >
                {crumb.label}
              </Link>
            </div>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search Bar */}
        <div className="relative hidden lg:block w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Ara..."
            className="pl-9 pr-16 bg-accent/50"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>

        {/* Search Icon (Mobile) */}
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-96">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-semibold text-sm">Bildirimler</span>
              {notificationCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={handleMarkAllRead}
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Tümünü okundu işaretle
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-sm text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  Bildirim yok
                </div>
              ) : (
                notifications.map((notif) => {
                  const Icon = NOTIFICATION_ICONS[notif.type] || Info;
                  return (
                    <div
                      key={notif.id}
                      className={cn(
                        'flex gap-3 px-4 py-3 hover:bg-accent/50 transition-colors border-b last:border-0',
                        !notif.isRead && 'bg-primary/5'
                      )}
                    >
                      <div className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                        notif.type === 'NEW_ORDER' && 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
                        notif.type === 'NEW_REVIEW' && 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
                        notif.type === 'SYSTEM' && 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                        notif.type === 'SUBSCRIPTION' && 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
                        notif.type === 'WAITER_CALL' && 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse',
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{notif.title}</p>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                        <p className="text-[11px] text-muted-foreground/70 mt-0.5">{timeAgo(notif.createdAt)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image || undefined} alt={user?.name || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || 'Kullanıcı'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'email@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Profilim</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Restoran Ayarları</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between px-2 py-1.5">
              <Label htmlFor="theme-toggle" className="text-sm cursor-pointer">
                Karanlık Mod
              </Label>
              <Switch
                id="theme-toggle"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-destructive focus:text-destructive"
            >
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
