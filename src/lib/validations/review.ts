import { z } from "zod";

export const createReviewSchema = z.object({
  customerName: z.string().min(1, "Name is required").max(200),
  customerEmail: z.string().max(255).email("Invalid email").optional(),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().max(2000).optional(),
});

export const updateReviewSchema = z.object({
  isPublished: z.boolean(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
