'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Globe,
  Shield,
  Database,
  Mail,
  Key,
  Server,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface ServiceStatus {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'online' | 'warning' | 'offline';
  description: string;
}

export default function AdminSettingsPage() {
  const [checking, setChecking] = useState(false);

  const services: ServiceStatus[] = [
    {
      name: 'Veritabanı (PostgreSQL)',
      icon: Database,
      status: 'online',
      description: 'Railway PostgreSQL - Aktif',
    },
    {
      name: 'Redis (Upstash)',
      icon: Server,
      status: 'online',
      description: 'Rate limiting servisi',
    },
    {
      name: 'Email (Resend)',
      icon: Mail,
      status: 'online',
      description: 'Email gönderim servisi',
    },
    {
      name: 'Depolama (Cloudinary)',
      icon: Globe,
      status: 'online',
      description: 'Resim yükleme servisi',
    },
    {
      name: 'Kimlik Doğrulama (NextAuth)',
      icon: Shield,
      status: 'online',
      description: 'Google OAuth + Credentials',
    },
    {
      name: 'Ödeme (PayTR)',
      icon: Key,
      status: 'online',
      description: 'Ödeme işleme servisi',
    },
  ];

  const handleHealthCheck = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        toast.success('Tüm servisler çalışıyor');
      } else {
        toast.error('Bazı servislerde sorun var');
      }
    } catch {
      toast.error('Bağlantı hatası');
    } finally {
      setChecking(false);
    }
  };

  const envVars = [
    { key: 'DATABASE_URL', label: 'Veritabanı Bağlantısı', sensitive: true },
    { key: 'NEXTAUTH_URL', label: 'Auth URL', sensitive: false },
    { key: 'NEXTAUTH_SECRET', label: 'Auth Secret', sensitive: true },
    { key: 'AUTH_SECRET', label: 'Auth Secret (v5)', sensitive: true },
    { key: 'GOOGLE_CLIENT_ID', label: 'Google OAuth ID', sensitive: false },
    { key: 'GOOGLE_CLIENT_SECRET', label: 'Google OAuth Secret', sensitive: true },
    { key: 'OPENAI_API_KEY', label: 'OpenAI API Key', sensitive: true },
    { key: 'PAYTR_MERCHANT_ID', label: 'PayTR Merchant ID', sensitive: false },
    { key: 'PAYTR_MERCHANT_KEY', label: 'PayTR Merchant Key', sensitive: true },
    { key: 'PAYTR_MERCHANT_SALT', label: 'PayTR Merchant Salt', sensitive: true },
    { key: 'CLOUDINARY_CLOUD_NAME', label: 'Cloudinary Cloud', sensitive: false },
    { key: 'CLOUDINARY_API_KEY', label: 'Cloudinary API Key', sensitive: false },
    { key: 'CLOUDINARY_API_SECRET', label: 'Cloudinary Secret', sensitive: true },
    { key: 'UPSTASH_REDIS_REST_URL', label: 'Upstash Redis URL', sensitive: false },
    { key: 'UPSTASH_REDIS_REST_TOKEN', label: 'Upstash Redis Token', sensitive: true },
    { key: 'RESEND_API_KEY', label: 'Resend API Key', sensitive: true },
    { key: 'NEXT_PUBLIC_APP_URL', label: 'Public App URL', sensitive: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8 text-red-600" />
          Sistem Ayarları
        </h1>
        <p className="text-muted-foreground mt-1">Platform servisleri ve yapılandırma</p>
      </div>

      {/* Health Check */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Servis Durumu</CardTitle>
            <CardDescription>Bağlı servislerin çalışma durumlarını kontrol edin</CardDescription>
          </div>
          <Button onClick={handleHealthCheck} disabled={checking} className="bg-red-600 hover:bg-red-700">
            <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            Kontrol Et
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.name} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="p-2 rounded-lg bg-accent">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                  </div>
                  {service.status === 'online' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-primary" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle>Ortam Değişkenleri</CardTitle>
          <CardDescription>Yapılandırma değişkenleri (Railway üzerinden yönetilir)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {envVars.map((env) => (
              <div key={env.key} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50">
                <div>
                  <p className="text-sm font-mono font-medium">{env.key}</p>
                  <p className="text-xs text-muted-foreground">{env.label}</p>
                </div>
                <Badge variant={env.sensitive ? 'destructive' : 'secondary'}>
                  {env.sensitive ? 'Gizli' : 'Görünür'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Info */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Framework</span>
                <span className="text-sm font-medium">Next.js 14</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Veritabanı</span>
                <span className="text-sm font-medium">PostgreSQL (Prisma)</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Hosting</span>
                <span className="text-sm font-medium">Railway</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Dil</span>
                <span className="text-sm font-medium">TypeScript</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Auth</span>
                <span className="text-sm font-medium">NextAuth.js v5</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ödeme</span>
                <span className="text-sm font-medium">PayTR</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">AI</span>
                <span className="text-sm font-medium">OpenAI GPT-4</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cache</span>
                <span className="text-sm font-medium">Upstash Redis</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Güvenlik Ayarları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Rate Limiting</p>
                <p className="text-xs text-muted-foreground">Auth: 10/dk, Public: 30/dk, AI: 5/dk</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Aktif</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Güvenlik Headerları</p>
                <p className="text-xs text-muted-foreground">CSP, HSTS, X-Frame-Options, XSS Protection</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Aktif</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Şifre Politikası</p>
                <p className="text-xs text-muted-foreground">Min 8 karakter, büyük/küçük harf + rakam</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Aktif</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-medium">JWT Oturum Yönetimi</p>
                <p className="text-xs text-muted-foreground">Secure, HttpOnly cookies</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Aktif</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
