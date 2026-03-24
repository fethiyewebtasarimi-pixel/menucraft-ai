import { useQuery } from '@tanstack/react-query';

export interface AnalyticsResponse {
  dateRange: {
    start: string;
    end: string;
  };
  summary: {
    totalMenuViews: number;
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    totalCustomers: number;
  };
  dailyData: {
    id: string;
    date: string;
    menuViews: number;
    qrScans: number;
    uniqueVisitors: number;
    totalOrders: number;
    totalRevenue: number;
  }[];
  topSellingItems: {
    menuItem: {
      id: string;
      name: string;
      price: number;
      image?: string;
      category?: { name: string };
    };
    quantitySold: number;
    orderCount: number;
  }[];
  orderStatusDistribution: Record<string, number>;
  orderTypeDistribution: Record<string, number>;
  reviews: {
    averageRating: number;
    totalReviews: number;
  };
}

async function fetchAnalytics(
  restaurantId: string,
  startDate?: string,
  endDate?: string
): Promise<AnalyticsResponse> {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);

  const response = await fetch(
    `/api/restaurants/${restaurantId}/analytics?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }

  return response.json();
}

export function useAnalytics(
  restaurantId: string | null | undefined,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ['analytics', restaurantId, startDate, endDate],
    queryFn: () => fetchAnalytics(restaurantId!, startDate, endDate),
    enabled: !!restaurantId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
