'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  User,
  Building2,
  Clock,
  Bell,
  Camera,
  Save,
  Mail,
  Phone,
  MapPin,
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

const days = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar',
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [workingHours, setWorkingHours] = useState(
    days.map((day) => ({
      day,
      open: '09:00',
      close: '22:00',
      isOpen: true,
    }))
  );
  const [notifications, setNotifications] = useState({
    orders: true,
    reviews: true,
    analytics: false,
    marketing: true,
  });

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
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

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Profil bilgileri güncellendi');
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const onRestaurantSubmit = async (values: z.infer<typeof restaurantSchema>) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Restoran bilgileri güncellendi');
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkingHoursSave = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Çalışma saatleri güncellendi');
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationsSave = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Bildirim tercihleri güncellendi');
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

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

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="restaurant" className="gap-2">
            <Building2 className="h-4 w-4" />
            Restoran
          </TabsTrigger>
          <TabsTrigger value="hours" className="gap-2">
            <Clock className="h-4 w-4" />
            Çalışma Saatleri
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Bildirimler
          </TabsTrigger>
        </TabsList>

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
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user?.image || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-2xl">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Fotoğraf Değiştir
                    </Button>
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
                            {...field}
                          />
                        </FormControl>
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

                  <Button type="submit" disabled={loading} className="gap-2">
                    <Save className="h-4 w-4" />
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
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
                          <Input placeholder="lezzet-duragi" {...field} />
                        </FormControl>
                        <FormDescription>
                          menucraft.ai/menu/lezzet-duragi
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

                  <div className="grid gap-6 md:grid-cols-2">
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

                  <Button type="submit" disabled={loading} className="gap-2">
                    <Save className="h-4 w-4" />
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </form>
              </Form>
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
              {workingHours.map((schedule, index) => (
                <div
                  key={schedule.day}
                  className="flex items-center gap-4 pb-4 border-b last:border-0"
                >
                  <div className="w-32">
                    <span className="font-medium">{schedule.day}</span>
                  </div>
                  <Switch
                    checked={schedule.isOpen}
                    onCheckedChange={(checked) => {
                      const updated = [...workingHours];
                      updated[index].isOpen = checked;
                      setWorkingHours(updated);
                    }}
                  />
                  {schedule.isOpen ? (
                    <>
                      <Input
                        type="time"
                        value={schedule.open}
                        onChange={(e) => {
                          const updated = [...workingHours];
                          updated[index].open = e.target.value;
                          setWorkingHours(updated);
                        }}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        type="time"
                        value={schedule.close}
                        onChange={(e) => {
                          const updated = [...workingHours];
                          updated[index].close = e.target.value;
                          setWorkingHours(updated);
                        }}
                        className="w-32"
                      />
                    </>
                  ) : (
                    <span className="text-muted-foreground">Kapalı</span>
                  )}
                </div>
              ))}

              <Button
                onClick={handleWorkingHoursSave}
                disabled={loading}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
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
                disabled={loading}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
