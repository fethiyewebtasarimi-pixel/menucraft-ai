"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Eye, EyeOff, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  isPublished: boolean;
  createdAt: string;
}

interface RatingStats {
  average: number;
  total: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);

  const restaurantId = "current-restaurant-id";

  const { data: stats, isLoading: statsLoading } = useQuery<RatingStats>({
    queryKey: ["review-stats", restaurantId],
    queryFn: async () => {
      const response = await fetch(
        `/api/restaurants/${restaurantId}/reviews/stats`
      );
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["reviews", restaurantId],
    queryFn: async () => {
      const response = await fetch(`/api/restaurants/${restaurantId}/reviews`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      return response.json();
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({
      reviewId,
      isPublished,
    }: {
      reviewId: string;
      isPublished: boolean;
    }) => {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished }),
      });
      if (!response.ok) throw new Error("Failed to toggle review");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", restaurantId] });
      toast.success("Yorum durumu güncellendi");
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete review");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["review-stats", restaurantId] });
      toast.success("Yorum silindi");
      setDeleteReviewId(null);
    },
  });

  const filteredReviews = reviews?.filter((review) => {
    const matchesRating =
      ratingFilter === "all" || review.rating === parseInt(ratingFilter);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && review.isPublished) ||
      (statusFilter === "hidden" && !review.isPublished);
    return matchesRating && matchesStatus;
  });

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-3 h-3",
      md: "w-5 h-5",
      lg: "w-8 h-8",
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/70"
            }`}
          />
        ))}
      </div>
    );
  };

  const isLoading = statsLoading || reviewsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="h-10 bg-muted rounded w-1/3 animate-pulse" />
        <div className="h-48 bg-muted rounded-lg animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = !reviews || reviews.length === 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Değerlendirmeler</h1>
        <p className="text-muted-foreground mt-1">
          Müşteri yorumlarını görüntüleyin ve yönetin
        </p>
      </div>

      {/* Stats Card */}
      {stats && (
        <div className="bg-card rounded-lg border border-border p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-6xl font-bold text-foreground mb-2">
                {stats.average.toFixed(1)}
              </div>
              {renderStars(Math.round(stats.average), "lg")}
              <p className="text-muted-foreground mt-4">{stats.total} değerlendirme</p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.distribution[rating as keyof typeof stats.distribution];
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm font-medium text-foreground/80">
                        {rating}
                      </span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: rating * 0.1 }}
                        className="h-full bg-yellow-400"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {!isEmpty && (
        <div className="flex flex-col sm:flex-row gap-4 bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground/80">Filtrele:</span>
          </div>
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Puan seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Puanlar</SelectItem>
              <SelectItem value="5">5 Yıldız</SelectItem>
              <SelectItem value="4">4 Yıldız</SelectItem>
              <SelectItem value="3">3 Yıldız</SelectItem>
              <SelectItem value="2">2 Yıldız</SelectItem>
              <SelectItem value="1">1 Yıldız</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Durum seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Yorumlar</SelectItem>
              <SelectItem value="published">Yayında</SelectItem>
              <SelectItem value="hidden">Gizli</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Reviews List */}
      <AnimatePresence mode="wait">
        {isEmpty ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-20 bg-card rounded-lg border border-border"
          >
            <div className="w-32 h-32 mb-6 text-muted-foreground/70">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M35 45 L40 50 L35 55"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M65 45 L60 50 L65 55"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M30 70 Q50 80 70 70"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Henüz değerlendirme yok
            </h3>
            <p className="text-muted-foreground">
              Müşterilerinizden gelen yorumlar burada görünecek
            </p>
          </motion.div>
        ) : filteredReviews && filteredReviews.length === 0 ? (
          <motion.div
            key="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-card rounded-lg border border-border"
          >
            <Filter className="w-16 h-16 text-muted-foreground/70 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Filtreye uygun yorum bulunamadı
            </h3>
            <p className="text-muted-foreground">Filtreleri değiştirmeyi deneyin</p>
          </motion.div>
        ) : (
          <motion.div
            key="reviews"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {filteredReviews?.map((review) => (
              <motion.div
                key={review.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {review.customerName}
                      </h3>
                      <Badge
                        variant={review.isPublished ? "default" : "secondary"}
                      >
                        {review.isPublished ? "Yayında" : "Gizli"}
                      </Badge>
                    </div>
                    {renderStars(review.rating, "sm")}
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      {review.isPublished ? (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground/70" />
                      )}
                      <Switch
                        checked={review.isPublished}
                        onCheckedChange={(checked) =>
                          togglePublishMutation.mutate({
                            reviewId: review.id,
                            isPublished: checked,
                          })
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteReviewId(review.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-foreground/80 leading-relaxed">{review.comment}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteReviewId}
        onOpenChange={() => setDeleteReviewId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Yorumu silmek istediğinize emin misiniz?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Yorum kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteReviewId && deleteReviewMutation.mutate(deleteReviewId)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
