import { z } from "zod";

export const tableSchema = z.object({
  number: z.coerce.number().int().positive("Masa numarası pozitif olmalı"),
  name: z.string().max(200).optional(),
  capacity: z.number().int().positive().max(100).optional(),
});

export type CreateTableInput = z.infer<typeof tableSchema>;
export type UpdateTableInput = z.infer<ReturnType<typeof tableSchema.partial>>;
