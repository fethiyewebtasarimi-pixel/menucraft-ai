"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploadProps {
  onUpload: (file: File) => Promise<string | void>;
  currentImage?: string;
  maxSize?: number; // in MB
  accept?: string;
  className?: string;
  label?: string;
  aspectRatio?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  currentImage,
  maxSize = 5,
  accept = "image/jpeg,image/png,image/webp,image/jpg",
  className = "",
  label = "Görsel Yükle",
  aspectRatio = "16/9",
}) => {
  const [preview, setPreview] = useState<string | undefined>(currentImage);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const acceptedTypes = accept.split(",").map((type) => type.trim());
    if (!acceptedTypes.some((type) => file.type.match(type))) {
      return "Geçersiz dosya türü. Lütfen bir görsel yükleyin.";
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Dosya boyutu ${maxSize}MB'dan küçük olmalıdır`;
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const uploadedUrl = await onUpload(file);
      if (uploadedUrl) {
        setPreview(uploadedUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Görsel yüklenirken hata oluştu");
      setPreview(currentImage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-foreground/80 dark:text-foreground/80 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Upload zone */}
        <motion.div
          whileHover={{ scale: preview ? 1 : 1.01 }}
          onClick={!preview ? handleClick : undefined}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative overflow-hidden rounded-xl border-2 transition-all ${
            isDragging
              ? "border-primary bg-primary/5 dark:bg-primary/20"
              : preview
              ? "border-border dark:border-border"
              : "border-dashed border-border dark:border-border hover:border-primary dark:hover:border-primary cursor-pointer bg-accent dark:bg-accent/50"
          }`}
          style={{ aspectRatio }}
        >
          {preview ? (
            // Image Preview
            <>
              <Image
                src={preview}
                alt="Önizleme"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                  className="p-3 rounded-full bg-card text-foreground shadow-lg hover:bg-muted/50 transition-colors"
                  aria-label="Görseli değiştir"
                >
                  <Upload className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="p-3 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors"
                  aria-label="Görseli kaldır"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </>
          ) : (
            // Upload Placeholder
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              {isUploading ? (
                <>
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
                  <p className="text-sm font-medium text-foreground/80 dark:text-foreground/80">
                    Yükleniyor...
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-primary dark:text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground/80 dark:text-foreground/80 mb-1">
                    Yüklemek için tıklayın veya sürükleyip bırakın
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                    PNG, JPG, WEBP - Maks. {maxSize}MB
                  </p>
                </>
              )}
            </div>
          )}
        </motion.div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isUploading && preview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-card/80 dark:bg-card/80 backdrop-blur-sm flex items-center justify-center rounded-xl"
            >
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground/80 dark:text-foreground/80">
                  Uploading...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          >
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Text */}
      <p className="mt-2 text-xs text-muted-foreground dark:text-muted-foreground">
        Önerilen en-boy oranı: {aspectRatio}. Maksimum dosya boyutu: {maxSize}MB
      </p>
    </div>
  );
};

export default ImageUpload;
