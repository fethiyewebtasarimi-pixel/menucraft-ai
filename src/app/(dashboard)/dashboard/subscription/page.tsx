'use client';

import { motion } from 'framer-motion';
import {
  Check,
  X,
  CreditCard,
  Sparkles,
  Zap,
  Crown,
  ChevronRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/hooks/useSubscription';
import { PLANS } from '@/constants';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const planIcons: Record<string, typeof Sparkles> = {
  FREE: Sparkles,
  STARTER: Sparkles,
  PROFESSIONAL: Zap,
  ENTERPRISE: Crown,
};

const planColors: Record<string, string> = {
  FREE: 'from-gray-500 to-gray-600',
  STARTER: 'from-blue-500 to-blue-600',
  PROFESSIONAL: 'from-amber-500 to-orange-600',
  ENTERPRISE: 'from-purple-500 to-indigo-600',
};

export default function SubscriptionPage() {
  const { data: profile, isLoading } = useUserProfile();

  const subscription = profile?.subscription;
  const currentPlan = subscription?.plan || 'FREE';
  const aiCreditsUsed = subscription?.aiCreditsUsed || 0;
  const aiCreditsTotal = subscription?.aiCredits || 25;
  const creditsPercentage = aiCreditsTotal > 0 ? (aiCreditsUsed / aiCreditsTotal) * 100 : 0;

  const statusLabels: Record<string, string> = {
    ACTIVE: 'Aktif',
    PAST_DUE: 'Gecikmiş',
    CANCELLED: 'İptal Edildi',
    TRIALING: 'Deneme',
  };

  const currentPlanData = PLANS.find((p) => p.slug === currentPlan);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold tracking-tight">Abonelik</h1>
        <p className="text-muted-foreground">
          Planınızı yönetin ve fatura geçmişinizi görüntüleyin
        </p>
      </motion.div>

      {/* Current Plan */}
      <motion.div variants={item}>
        <Card className="border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const Icon = planIcons[currentPlan] || Sparkles;
                    return <Icon className="h-5 w-5 text-amber-600" />;
                  })()}
                  Mevcut Planınız: {currentPlanData?.name || currentPlan}
                </CardTitle>
                <CardDescription>
                  {subscription?.currentPeriodEnd
                    ? `Sonraki ödeme: ${new Date(subscription.currentPeriodEnd).toLocaleDateString('tr-TR')}`
                    : 'Ücretsiz plan'}
                </CardDescription>
              </div>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-600">
                {statusLabels[subscription?.status || 'ACTIVE']}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Aylık Ücret</p>
                <p className="text-2xl font-bold">
                  {currentPlanData?.price === 0
                    ? 'Ücretsiz'
                    : currentPlanData?.price === -1
                    ? 'Özel'
                    : `${currentPlanData?.price} TL`}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Plan Başlangıç</p>
                <p className="text-2xl font-bold">
                  {subscription?.createdAt
                    ? new Date(subscription.createdAt).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'long',
                      })
                    : '-'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Durum</p>
                <p className="text-2xl font-bold text-green-600">
                  {statusLabels[subscription?.status || 'ACTIVE']}
                </p>
              </div>
            </div>

            {/* AI Credits Usage */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span className="font-medium">AI Kredi Kullanımı</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {aiCreditsUsed} / {aiCreditsTotal} kredi
                </span>
              </div>
              <Progress value={creditsPercentage} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Her ay başında kredi limitiniz yenilenir. Kalan: {aiCreditsTotal - aiCreditsUsed} kredi
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plans */}
      <motion.div variants={item}>
        <h2 className="text-2xl font-bold mb-6">Planlar</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.filter((p) => p.slug !== 'ENTERPRISE').map((plan) => {
            const Icon = planIcons[plan.slug] || Sparkles;
            const isCurrent = plan.slug === currentPlan;
            const isPopular = plan.popular;

            return (
              <motion.div
                key={plan.slug}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={cn(
                    'relative h-full',
                    isPopular && 'border-2 border-amber-500 shadow-lg',
                    isCurrent && 'ring-2 ring-amber-500'
                  )}
                >
                  {isPopular && !isCurrent && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 px-4">
                        En Popüler
                      </Badge>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge variant="outline" className="bg-background px-4">
                        Mevcut Plan
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div
                      className={cn(
                        'w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center mb-4',
                        planColors[plan.slug] || 'from-gray-500 to-gray-600'
                      )}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="pt-4">
                      {plan.price === 0 ? (
                        <span className="text-4xl font-bold">Ücretsiz</span>
                      ) : (
                        <>
                          <span className="text-4xl font-bold">{plan.price} TL</span>
                          <span className="text-muted-foreground">/ay</span>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                      {plan.limitations?.map((limitation, index) => (
                        <div key={`lim-${index}`} className="flex items-start gap-2">
                          <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {isCurrent ? (
                      <Button variant="outline" className="w-full" disabled>
                        Mevcut Plan
                      </Button>
                    ) : (
                      <Button
                        className={cn(
                          'w-full gap-2',
                          isPopular && 'bg-gradient-to-r from-amber-500 to-orange-600'
                        )}
                        variant={isPopular ? 'default' : 'outline'}
                      >
                        {PLANS.indexOf(plan) < PLANS.findIndex((p) => p.slug === currentPlan) ? 'Düşür' : 'Yükselt'}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Payment Method */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-600" />
              Ödeme Yöntemi
            </CardTitle>
            <CardDescription>
              Kayıtlı ödeme bilgilerinizi yönetin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentPlan === 'FREE' ? (
              <p className="text-sm text-muted-foreground">
                Ücretsiz planda ödeme yöntemi gerekmez. Yükseltme yaptığınızda ödeme bilgilerinizi ekleyebilirsiniz.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                      KART
                    </div>
                    <div>
                      <p className="font-medium">Kayıtlı kart</p>
                      <p className="text-sm text-muted-foreground">PayTR ile ödeme</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Güncelle
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      {currentPlan !== 'FREE' && (
        <motion.div variants={item}>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Aboneliği İptal Et</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>
                Aboneliğinizi iptal etmek istiyorsanız, tüm verileriniz korunacak ancak premium özelliklere erişiniz sonlanacaktır.
              </span>
              <Button variant="destructive" size="sm">
                İptal Et
              </Button>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </motion.div>
  );
}
