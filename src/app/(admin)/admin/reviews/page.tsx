'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminReviews } from '@/hooks/useAdmin';

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('');

  const params: Record<string, string> = { page: String(page), limit: '20' };
  if (ratingFilter) params.rating = ratingFilter;
  if (publishedFilter) params.published = publishedFilter;

  const { data, isLoading } = useAdminReviews(params);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-primary text-primary' : 'text-muted-foreground/70'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-red-600" />
          Yorum Yonetimi
        </h1>
        <p className="text-muted-foreground mt-1">
          Tum platform yorumlarini goruntuleyip yonet
          {data?.averageRating ? ` - Ortalama: ${Number(data.averageRating).toFixed(1)}/5` : ''}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={ratingFilter} onValueChange={(v) => { setRatingFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Puan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tum Puanlar</SelectItem>
                <SelectItem value="5">5 Yildiz</SelectItem>
                <SelectItem value="4">4 Yildiz</SelectItem>
                <SelectItem value="3">3 Yildiz</SelectItem>
                <SelectItem value="2">2 Yildiz</SelectItem>
                <SelectItem value="1">1 Yildiz</SelectItem>
              </SelectContent>
            </Select>
            <Select value={publishedFilter} onValueChange={(v) => { setPublishedFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tumunu Goster</SelectItem>
                <SelectItem value="true">Yayinlanmis</SelectItem>
                <SelectItem value="false">Gizli</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        Toplam {data?.pagination?.total || 0} yorum
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {data?.reviews?.map((review: Record<string, unknown>) => (
            <motion.div
              key={review.id as string}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">{renderStars(review.rating as number)}</div>
                        <Badge variant={review.isPublished ? 'default' : 'secondary'}>
                          {review.isPublished ? 'Yayinda' : 'Gizli'}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">
                        {(review.customerName as string) || 'Anonim'}
                        {review.customerEmail ? ` (${review.customerEmail as string})` : ''}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {(review.restaurant as Record<string, string>)?.name} - {new Date(review.createdAt as string).toLocaleString('tr-TR')}
                      </p>
                      {review.comment ? (
                        <p className="text-sm bg-accent/50 p-3 rounded-lg">{review.comment as string}</p>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {data?.reviews?.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Yorum bulunamadi
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">Sayfa {page} / {data.pagination.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))} disabled={page === data.pagination.totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
