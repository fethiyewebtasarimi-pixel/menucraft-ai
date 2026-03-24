import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MenuItem, Category } from '@prisma/client';

// Types
export interface CreateMenuItemInput {
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isAvailable?: boolean;
  isSpecial?: boolean;
  preparationTime?: number;
  allergens?: string[];
  ingredients?: string[];
  nutritionInfo?: any;
  modifiers?: any[];
}

export interface UpdateMenuItemInput extends Partial<CreateMenuItemInput> {
  id: string;
}

export interface CreateCategoryInput {
  restaurantId: string;
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

// API functions for Menu Items
async function fetchMenuItems(restaurantId: string): Promise<MenuItem[]> {
  const response = await fetch(`/api/restaurants/${restaurantId}/items`);
  if (!response.ok) {
    throw new Error('Failed to fetch menu items');
  }
  return response.json();
}

async function createMenuItem(data: CreateMenuItemInput): Promise<MenuItem> {
  const { restaurantId, ...itemData } = data;
  const response = await fetch(`/api/restaurants/${restaurantId}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(itemData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create menu item');
  }

  return response.json();
}

async function updateMenuItem(data: UpdateMenuItemInput): Promise<MenuItem> {
  const { id, ...updateData } = data;
  const response = await fetch(`/api/items/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update menu item');
  }

  return response.json();
}

async function deleteMenuItem(id: string): Promise<void> {
  const response = await fetch(`/api/items/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete menu item');
  }
}

// API functions for Categories
async function fetchCategories(restaurantId: string): Promise<Category[]> {
  const response = await fetch(`/api/restaurants/${restaurantId}/categories`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
}

async function createCategory(data: CreateCategoryInput): Promise<Category> {
  const { restaurantId, ...categoryData } = data;
  const response = await fetch(`/api/restaurants/${restaurantId}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create category');
  }

  return response.json();
}

async function updateCategory(data: UpdateCategoryInput): Promise<Category> {
  const { id, ...updateData } = data;
  const response = await fetch(`/api/categories/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update category');
  }

  return response.json();
}

async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete category');
  }
}

// Query hooks for Menu Items
export function useMenuItems(restaurantId: string | null | undefined) {
  return useQuery({
    queryKey: ['menu-items', restaurantId],
    queryFn: () => fetchMenuItems(restaurantId!),
    enabled: !!restaurantId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Mutation hooks for Menu Items
export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMenuItem,
    onSuccess: (newItem) => {
      // Invalidate menu items for this restaurant
      queryClient.invalidateQueries({
        queryKey: ['menu-items', newItem.restaurantId]
      });
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMenuItem,
    onSuccess: (updatedItem) => {
      // Invalidate menu items for this restaurant
      queryClient.invalidateQueries({
        queryKey: ['menu-items', updatedItem.restaurantId]
      });
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: (_, deletedId) => {
      // Invalidate all menu items queries
      queryClient.invalidateQueries({
        queryKey: ['menu-items']
      });
    },
  });
}

// Query hooks for Categories
export function useCategories(restaurantId: string | null | undefined) {
  return useQuery({
    queryKey: ['categories', restaurantId],
    queryFn: () => fetchCategories(restaurantId!),
    enabled: !!restaurantId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Mutation hooks for Categories
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: (newCategory) => {
      // Invalidate categories for this restaurant
      queryClient.invalidateQueries({
        queryKey: ['categories', newCategory.restaurantId]
      });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess: (updatedCategory) => {
      // Invalidate categories for this restaurant
      queryClient.invalidateQueries({
        queryKey: ['categories', updatedCategory.restaurantId]
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      // Invalidate all categories queries
      queryClient.invalidateQueries({
        queryKey: ['categories']
      });
    },
  });
}
