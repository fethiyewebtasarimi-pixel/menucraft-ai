'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Building2,
  Clock,
  Bell,
  Camera,
  Save,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import {
  useRestaurants,
  useRestaurant,
  useUpdateRestaurant,
} from '@/hooks/useRestaurant';

// --- Schemas ---

const profileSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir email adresi girin'),
  phone: z.string().optional(),
});

const restaurantSchema = z.object({
  name: z.string().min(2, 'Restoran adı en az 2 karakter olmalı'),
  slug: z.string().min(3, 'Slug en az 3 karakter olmalı'),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
});

// --- Constants ---

// dayOfWeek mapping: 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi (matches DB)
const daysConfig = [
  { label: 'Pazartesi', dayOfWeek: 1 },
  { label: 'Salı', dayOfWeek: 2 },
  { label: 'Çarşamba', dayOfWeek: 3 },
  { label: 'Perşembe', dayOfWeek: 4 },
  { label: 'Cuma', dayOfWeek: 5 },
  { label: 'Cumartesi', dayOfWeek: 6 },
  { label: 'Pazar', dayOfWeek: 0 },
];

const NOTIFICATIONS_KEY = 'menucraft_notification_prefs';

// --- Types ---

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: string;
  createdAt: string;
  subscription: any;
  restaurants: Array<{
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    isActive: boolean;
  }>;
}

interface WorkingHourData {
  day: string;
  dayOfWeek: number;
  open: string;
  close: string;
  isOpen: boolean;
}

// --- API helpers ---

async function fetchUserProfile(): Promise<UserProfile> {
  const res = await fetch('/api/user/profile');
  if (!res.ok) throw new Error('Profil yüklenemedi');
  return res.json();
}

async function patchUserProfile(data: { name: string; phone?: string }) {
  const res = await fetch('/api/user/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Profil güncellenemedi');
  }
  return res.json();
}

async function putWorkingHours(data: {
  restaurantId: string;
  workingHours: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
}) {
  const res = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Çalışma saatleri güncellenemedi');
  }
  return res.json();
}

async function uploadFile(file: File, folder: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Dosya yüklenemedi');
  }
  const result = await res.json();
  return result.url;
}

// --- Page component ---

export default function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Data fetching ---

  const {
    data: profile,
    isLoading: profileLoading,
  } = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
  });

  const { data: restaurants, isLoading: restaurantsLoading } = useRestaurants();
  const restaurantId = restaurants?.[0]?.id ?? null;

  const { data: restaurantDetail, isLoading: restaurantDetailLoading } =
    useRestaurant(restaurantId);

  // --- Mutations ---

  const profileMutation = useMutation({
    mutationFn: patchUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profil bilgileri güncellendi');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Bir hata oluştu');
    },
  });

  const updateRestaurant = useUpdateRestaurant();

  const workingHoursMutation = useMutation({
    mutationFn: putWorkingHours,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants', restaurantId] });
      toast.success('Çalışma saatleri güncellendi');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Bir hata oluştu');
    },
  });

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const url = await uploadFile(file, 'avatars');
      // Update user avatar via a direct PATCH (avatar field isn't in the profile schema,
      // so we do a custom call)
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile?.name || user?.name || '',
          phone: profile?.phone || '',
          avatar: url,
        }),
      });
      if (!res.ok) throw new Error('Avatar güncellenemedi');
      return url;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profil fotoğrafı güncellendi');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Fotoğraf yüklenirken hata oluştu');
    },
  });

  // --- Working hours state ---

  const [workingHours, setWorkingHours] = useState<WorkingHourData[]>(
    daysConfig.map((d) => ({
      day: d.label,
      dayOfWeek: d.dayOfWeek,
      open: '09:00',
      close: '22:00',
      isOpen: true,
    }))
  );

  // --- Notification preferences (localStorage) ---

  const [notifications, setNotifications] = useState({
    orders: true,
    reviews: true,
    analytics: false,
    marketing: true,
  });

  // Load notification prefs from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_KEY);
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // --- Forms ---

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  const restaurantForm = useForm<z.infer<typeof restaurantSchema>>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      address: '',
      city: '',
      phone: '',
    },
  });

  // --- Pre-fill forms when data loads ---

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (restaurantDetail) {
      restaurantForm.reset({
        name: restaurantDetail.name || '',
        slug: (restaurantDetail as any).slug || '',
        description: (restaurantDetail as any).description || '',
        address: (restaurantDetail as any).address || '',
        city: (restaurantDetail as any).city || '',
        phone: (restaurantDetail as any).phone || '',
      });
    }
  }, [restaurantDetail]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-fill working hours from restaurant detail
  useEffect(() => {
    if (restaurantDetail && (restaurantDetail as any).workingHours?.length > 0) {
      const serverHours = (restaurantDetail as any).workingHours as Array<{
        dayOfWeek: number;
        openTime: string;
        closeTime: string;
        isClosed: boolean;
      }>;

      const mapped = daysConfig.map((d) => {
        const existing = serverHours.find((h) => h.dayOfWeek === d.dayOfWeek);
        return {
          day: d.label,
          dayOfWeek: d.dayOfWeek,
          open: existing?.openTime || '09:00',
          close: existing?.closeTime || '22:00',
          isOpen: existing ? !existing.isClosed : true,
        };
      });
      setWorkingHours(mapped);
    }
  }, [restaurantDetail]);

  // --- Handlers ---

  const onProfileSubmit = useCallback(
    (values: z.infer<typeof profileSchema>) => {
      profileMutation.mutate({
        name: values.name,
        phone: values.phone || undefined,
      });
    },
    [profileMutation]
  );

  const onRestaurantSubmit = useCallback(
    (values: z.infer<typeof restaurantSchema>) => {
      if (!restaurantId) {
        toast.error('Restoran bulunamadı');
        return;
      }
      updateRestaurant.mutate(
        {
          id: restaurantId,
          name: values.name,
          description: values.description || undefined,
          address: values.address || undefined,
          phone: values.phone || undefined,
          // slug is NOT sent -- not editable after creation
          // city is sent via the catch-all partial schema on the server
          ...(values.city ? { city: values.city } : {}),
        } as any,
        {
          onSuccess: () => {
            toast.success('Restoran bilgileri güncellendi');
          },
          onError: (err: Error) => {
            toast.error(err.message || 'Bir hata oluştu');
          },
        }
      );
    },
    [restaurantId, updateRestaurant]
  );

  const handleWorkingHoursSave = useCallback(() => {
    if (!restaurantId) {
      toast.error('Restoran bulunamadı');
      return;
    }

    workingHoursMutation.mutate({
      restaurantId,
      workingHours: workingHours.map((wh) => ({
        dayOfWeek: wh.dayOfWeek,
        openTime: wh.open,
        closeTime: wh.close,
        isClosed: !wh.isOpen,
      })),
    });
  }, [restaurantId, workingHours, workingHoursMutation]);

  const handleNotificationsSave = useCallback(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
      toast.success('Bildirim tercihleri kaydedildi');
    } catch {
      toast.error('Bir hata oluştu');
    }
  }, [notifications]);

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Sadece JPEG, PNG veya WebP dosyaları yükleyebilirsiniz');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Dosya boyutu en fazla 5MB olabilir');
        return;
      }

      avatarMutation.mutate(file);
    },
    [avatarMutation]
  );

  // --- Derived loading state ---

  const isDataLoading = profileLoading || restaurantsLoading;
  const profileSaving = profileMutation.isPending;
  const restaurantSaving = updateRestaurant.isPending;
  const hoursSaving = workingHoursMutation.isPending;
  const avatarUploading = avatarMutation.isPending;

  // Resolved avatar URL: prefer profile.avatar, fallback to user.image
  const avatarUrl = profile?.avatar || user?.image || undefined;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>
        <p className="text-muted-foreground">
          Hesap ve restoran ayarlarınızı yönetin
        </p>
      </div>

      {isDataLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="profile" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-auto min-w-full sm:min-w-0">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profil</span>
                <span className="sm:hidden">Profil</span>
              </TabsTrigger>
              <TabsTrigger value="restaurant" className="gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Restoran</span>
                <span className="sm:hidden">Restoran</span>
              </TabsTrigger>
              <TabsTrigger value="hours" className="gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Çalışma Saatleri</span>
                <span className="sm:hidden">Saatler</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Bildirimler</span>
                <span className="sm:hidden">Bildirim</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profil Bilgileri</CardTitle>
                <CardDescription>
                  Kişisel bilgilerinizi güncelleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                    className="space-y-6"
                  >
                    {/* Avatar */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-2xl">
                          {profile?.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-center sm:items-start gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={handleAvatarClick}
                          disabled={avatarUploading}
                        >
                          {avatarUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Camera className="h-4 w-4" />
                          )}
                          {avatarUploading ? 'Yükleniyor...' : 'Fotoğraf Değiştir'}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          JPEG, PNG veya WebP. Maks 5MB.
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad Soyad</FormLabel>
                          <FormControl>
                            <Input placeholder="Adınız Soyadınız" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="email@example.com"
                              disabled
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Email adresi değiştirilemez
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon</FormLabel>
                          <FormControl>
                            <Input placeholder="+90 555 123 45 67" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={profileSaving} className="gap-2">
                      {profileSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {profileSaving ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Restaurant Tab */}
          <TabsContent value="restaurant" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Restoran Bilgileri</CardTitle>
                <CardDescription>
                  Restoranınızın temel bilgilerini düzenleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!restaurantId ? (
                  <p className="text-muted-foreground py-4">
                    Henüz bir restoranınız bulunmuyor.
                  </p>
                ) : restaurantDetailLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Form {...restaurantForm}>
                    <form
                      onSubmit={restaurantForm.handleSubmit(onRestaurantSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={restaurantForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Restoran Adı</FormLabel>
                            <FormControl>
                              <Input placeholder="Lezzet Durağı" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={restaurantForm.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL Slug</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="lezzet-duragi"
                                disabled
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              menucraft.ai/menu/{field.value || 'slug'} &mdash; Oluşturulduktan sonra değiştirilemez
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={restaurantForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Açıklama</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Restoranınız hakkında kısa bir açıklama..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={restaurantForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adres</FormLabel>
                            <FormControl>
                              <Input placeholder="Sokak, No, Mahalle" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                        <FormField
                          control={restaurantForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Şehir</FormLabel>
                              <FormControl>
                                <Input placeholder="İstanbul" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={restaurantForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefon</FormLabel>
                              <FormControl>
                                <Input placeholder="+90 555 123 45 67" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={restaurantSaving}
                        className="gap-2"
                      >
                        {restaurantSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {restaurantSaving ? 'Kaydediliyor...' : 'Kaydet'}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Working Hours Tab */}
          <TabsContent value="hours" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Çalışma Saatleri</CardTitle>
                <CardDescription>
                  Restoranınızın açık olduğu saatleri belirleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!restaurantId ? (
                  <p className="text-muted-foreground py-4">
                    Çalışma saatlerini düzenlemek için önce bir restoran oluşturun.
                  </p>
                ) : (
                  <>
                    {workingHours.map((schedule, index) => (
                      <div
                        key={schedule.day}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pb-4 border-b last:border-0"
                      >
                        <div className="w-full sm:w-32 flex items-center justify-between sm:block">
                          <span className="font-medium">{schedule.day}</span>
                          <div className="sm:hidden">
                            <Switch
                              checked={schedule.isOpen}
                              onCheckedChange={(checked) => {
                                const updated = [...workingHours];
                                updated[index].isOpen = checked;
                                setWorkingHours(updated);
                              }}
                            />
                          </div>
                        </div>
                        <div className="hidden sm:block">
                          <Switch
                            checked={schedule.isOpen}
                            onCheckedChange={(checked) => {
                              const updated = [...workingHours];
                              updated[index].isOpen = checked;
                              setWorkingHours(updated);
                            }}
                          />
                        </div>
                        {schedule.isOpen ? (
                          <div className="flex items-center gap-2 sm:gap-4">
                            <Input
                              type="time"
                              value={schedule.open}
                              onChange={(e) => {
                                const updated = [...workingHours];
                                updated[index].open = e.target.value;
                                setWorkingHours(updated);
                              }}
                              className="w-full sm:w-32"
                            />
                            <span className="text-muted-foreground shrink-0">-</span>
                            <Input
                              type="time"
                              value={schedule.close}
                              onChange={(e) => {
                                const updated = [...workingHours];
                                updated[index].close = e.target.value;
                                setWorkingHours(updated);
                              }}
                              className="w-full sm:w-32"
                            />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Kapalı</span>
                        )}
                      </div>
                    ))}

                    <Button
                      onClick={handleWorkingHoursSave}
                      disabled={hoursSaving}
                      className="gap-2"
                    >
                      {hoursSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {hoursSaving ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bildirim Tercihleri</CardTitle>
                <CardDescription>
                  Hangi bildirimleri almak istediğinizi seçin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <Label htmlFor="orders" className="font-medium">
                        Sipariş Bildirimleri
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Yeni siparişler için bildirim alın
                      </p>
                    </div>
                    <Switch
                      id="orders"
                      checked={notifications.orders}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, orders: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <Label htmlFor="reviews" className="font-medium">
                        Yorum Bildirimleri
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Yeni yorumlar için bildirim alın
                      </p>
                    </div>
                    <Switch
                      id="reviews"
                      checked={notifications.reviews}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, reviews: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <Label htmlFor="analytics" className="font-medium">
                        Analitik Raporları
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Haftalık analitik özeti alın
                      </p>
                    </div>
                    <Switch
                      id="analytics"
                      checked={notifications.analytics}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, analytics: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing" className="font-medium">
                        Pazarlama E-postaları
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Özellikler ve güncellemeler hakkında bilgi alın
                      </p>
                    </div>
                    <Switch
                      id="marketing"
                      checked={notifications.marketing}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, marketing: checked })
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={handleNotificationsSave}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Kaydet
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
}
