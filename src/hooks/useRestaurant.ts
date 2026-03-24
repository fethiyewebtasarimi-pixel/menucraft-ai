import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Restaurant } from '@prisma/client';

// Types
export interface CreateRestaurantInput {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  bannerImage?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  cuisineType?: string[];
  priceRange?: string;
  openingHours?: any;
  settings?: any;
}

export interface UpdateRestaurantInput extends Partial<CreateRestaurantInput> {
  id: string;
}

// API functions
async function fetchRestaurants(): Promise<Restaurant[]> {
  const response = await fetch('/api/restaurants');
  if (!response.ok) {
    throw new Error('Failed to fetch restaurants');
  }
  return response.json();
}

async function fetchRestaurant(id: string): Promise<Restaurant> {
  const response = await fetch(`/api/restaurants/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch restaurant');
  }
  return response.json();
}

async function createRestaurant(data: CreateRestaurantInput): Promise<Restaurant> {
  const response = await fetch('/api/restaurants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create restaurant');
  }

  return response.json();
}

async function updateRestaurant(data: UpdateRestaurantInput): Promise<Restaurant> {
  const { id, ...updateData } = data;
  const response = await fetch(`/api/restaurants/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update restaurant');
  }

  return response.json();
}

async function deleteRestaurant(id: string): Promise<void> {
  const response = await fetch(`/api/restaurants/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete restaurant');
  }
}

// Query hooks
export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: fetchRestaurants,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRestaurant(id: string | null | undefined) {
  return useQuery({
    queryKey: ['restaurants', id],
    queryFn: () => fetchRestaurant(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Mutation hooks
export function useCreateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRestaurant,
    onSuccess: (newRestaurant) => {
      // Invalidate and refetch restaurants list
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });

      // Optionally set the query data for the new restaurant
      queryClient.setQueryData(['restaurants', newRestaurant.id], newRestaurant);
    },
  });
}

export function useUpdateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRestaurant,
    onSuccess: (updatedRestaurant) => {
      // Update the specific restaurant in cache
      queryClient.setQueryData(['restaurants', updatedRestaurant.id], updatedRestaurant);

      // Invalidate restaurants list to reflect changes
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
}

export function useDeleteRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRestaurant,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['restaurants', deletedId] });

      // Invalidate restaurants list
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
}
