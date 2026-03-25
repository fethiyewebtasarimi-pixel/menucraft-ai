import { z } from "zod";

export const tableSchema = z.object({
  number: z.string().min(1, "Table number is required").max(50),
  name: z.string().max(200).optional(),
  capacity: z.number().int().positive().max(100).optional(),
  status: z.enum(["AVAILABLE", "OCCUPIED", "RESERVED"]).optional(),
});

export type CreateTableInput = z.infer<typeof tableSchema>;
export type UpdateTableInput = z.infer<ReturnType<typeof tableSchema.partial>>;
