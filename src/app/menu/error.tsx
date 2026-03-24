"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function MenuError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
      <h2 className="text-xl font-semibold mb-2">Menü yüklenemedi</h2>
      <p className="text-muted-foreground mb-4">
        Menü bilgileri yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.
      </p>
      <Button onClick={reset} variant="outline">
        Tekrar Dene
      </Button>
    </div>
  );
}
