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
  label = "Upload Image",
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
      return "Invalid file type. Please upload an image.";
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSize}MB`;
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
      setError(err instanceof Error ? err.message : "Failed to upload image");
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
              : preview
              ? "border-gray-200 dark:border-gray-700"
              : "border-dashed border-gray-300 dark:border-gray-600 hover:border-amber-500 dark:hover:border-amber-500 cursor-pointer bg-gray-50 dark:bg-gray-800/50"
          }`}
          style={{ aspectRatio }}
        >
          {preview ? (
            // Image Preview
            <>
              <Image
                src={preview}
                alt="Preview"
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
                  className="p-3 rounded-full bg-white text-gray-900 shadow-lg hover:bg-gray-100 transition-colors"
                  aria-label="Change image"
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
                  aria-label="Remove image"
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
                  <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-3" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Uploading...
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, WEBP up to {maxSize}MB
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
              className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center rounded-xl"
            >
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Recommended aspect ratio: {aspectRatio}. Maximum file size: {maxSize}MB
      </p>
    </div>
  );
};

export default ImageUpload;
