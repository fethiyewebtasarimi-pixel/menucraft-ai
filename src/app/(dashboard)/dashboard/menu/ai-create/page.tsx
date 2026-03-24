"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Upload,
  Sparkles,
  ScanLine,
  Tag,
  FolderOpen,
  Check,
  Plus,
  Trash2,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface AnalyzedItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
}

interface AnalyzedMenu {
  categories: string[];
  items: AnalyzedItem[];
}

export default function AIMenuCreationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analyzedMenu, setAnalyzedMenu] = useState<AnalyzedMenu | null>(null);
  const [editedItems, setEditedItems] = useState<AnalyzedItem[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter((file) => {
      const isValidType = [
        "image/jpeg",
        "image/png",
        "image/heic",
        "application/pdf",
      ].includes(file.type);
      const isValidSize = file.size <= 20 * 1024 * 1024; // 20MB

      if (!isValidType) {
        toast.error(`${file.name}: Desteklenmeyen dosya formatı`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name}: Dosya boyutu çok büyük (max 20MB)`);
        return false;
      }
      return true;
    });

    setUploadedFiles((prev) => [...prev, ...validFiles]);

    // Generate previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const input = document.createElement("input");
    input.type = "file";
    input.files = e.dataTransfer.files;
    handleFileUpload({ target: input } as any);
  };

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) {
      toast.error("Lütfen en az bir dosya yükleyin");
      return;
    }

    setIsProcessing(true);
    setCurrentStep(2);

    try {
      // Upload images and get analysis
      const formData = new FormData();
      uploadedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/ai/analyze-menu", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      setAnalyzedMenu(data);
      setEditedItems(data.items);

      // Simulate processing delay for better UX
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentStep(3);
      }, 2000);
    } catch (error) {
      toast.error("Menü analizi sırasında bir hata oluştu");
      setIsProcessing(false);
      setCurrentStep(1);
    }
  };

  const handleGenerateDescription = async (itemId: string) => {
    try {
      const item = editedItems.find((i) => i.id === itemId);
      if (!item) return;

      const response = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: item.name, category: item.category }),
      });

      if (!response.ok) throw new Error("Failed to generate description");

      const { description } = await response.json();
      setEditedItems((items) =>
        items.map((i) => (i.id === itemId ? { ...i, description } : i))
      );
      toast.success("Açıklama oluşturuldu");
    } catch (error) {
      toast.error("Açıklama oluşturulamadı");
    }
  };

  const handleCreateMenu = async () => {
    setIsCreating(true);
    setCurrentStep(4);

    try {
      const response = await fetch("/api/restaurants/current/menu-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories: analyzedMenu?.categories || [],
          items: editedItems,
        }),
      });

      if (!response.ok) throw new Error("Failed to create menu");

      // Success animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        setIsCreating(false);
      }, 1500);
    } catch (error) {
      toast.error("Menü oluşturulurken bir hata oluştu");
      setIsCreating(false);
      setCurrentStep(3);
    }
  };

  const updateItem = (id: string, updates: Partial<AnalyzedItem>) => {
    setEditedItems((items) =>
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (id: string) => {
    setEditedItems((items) => items.filter((item) => item.id !== id));
  };

  const addNewItem = () => {
    const newItem: AnalyzedItem = {
      id: `new-${Date.now()}`,
      name: "",
      price: 0,
      description: "",
      category: analyzedMenu?.categories[0] || "",
    };
    setEditedItems((items) => [...items, newItem]);
  };

  const groupedItems = editedItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, AnalyzedItem[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto max-w-5xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step <= currentStep
                      ? "bg-amber-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step < currentStep ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      step < currentStep ? "bg-amber-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Yükle</span>
            <span>İşle</span>
            <span>Düzenle</span>
            <span>Onayla</span>
          </div>
        </div>

        {/* Steps Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Upload */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Menü Fotoğrafını Yükleyin
                </h1>
                <p className="text-gray-600">
                  AI, menünüzü otomatik olarak analiz edecek
                </p>
              </div>

              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-amber-400 transition-colors cursor-pointer"
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <Upload className="w-20 h-20 mx-auto text-gray-400 mb-4" />
                <p className="text-xl text-gray-700 mb-2">
                  Menü fotoğrafını sürükleyip bırakın
                </p>
                <p className="text-gray-500 mb-4">veya</p>
                <Button variant="outline" size="lg">
                  Dosya Seçin
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  JPG, PNG, PDF, HEIC (max 20MB)
                </p>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/heic,application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">
                    Yüklenen Dosyalar ({imagePreviews.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden border border-gray-200"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-40 object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedFiles((files) =>
                              files.filter((_, i) => i !== index)
                            );
                            setImagePreviews((previews) =>
                              previews.filter((_, i) => i !== index)
                            );
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-8">
                <Button
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={uploadedFiles.length === 0}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  Devam Et
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: AI Processing */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-xl p-12"
            >
              <div className="text-center space-y-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 mx-auto"
                >
                  <Sparkles className="w-full h-full text-amber-500" />
                </motion.div>

                <div className="space-y-6">
                  {[
                    { icon: ScanLine, text: "Menü taranıyor...", delay: 0 },
                    { icon: Sparkles, text: "Yemekler tanınıyor...", delay: 0.5 },
                    { icon: Tag, text: "Fiyatlar algılanıyor...", delay: 1 },
                    { icon: FolderOpen, text: "Kategoriler oluşturuluyor...", delay: 1.5 },
                  ].map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: step.delay }}
                      className="flex items-center justify-center gap-4"
                    >
                      <step.icon className="w-6 h-6 text-amber-500" />
                      <p className="text-lg text-gray-700">{step.text}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-center gap-2">
                  {[0, 1, 2].map((dot) => (
                    <motion.div
                      key={dot}
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: dot * 0.2,
                      }}
                      className="w-3 h-3 bg-amber-500 rounded-full"
                    />
                  ))}
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review & Edit */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Menüyü İnceleyin ve Düzenleyin
                </h1>
                <p className="text-gray-600">
                  AI tarafından analiz edilen {editedItems.length} ürün bulundu
                </p>
              </div>

              <div className="space-y-8 max-h-[600px] overflow-y-auto pr-4">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category} className="border rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {category}
                    </h3>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="border rounded-lg p-4 space-y-3 hover:border-amber-400 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-5 h-5 text-gray-400" />
                            <Input
                              value={item.name}
                              onChange={(e) =>
                                updateItem(item.id, { name: e.target.value })
                              }
                              placeholder="Ürün adı"
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              value={item.price}
                              onChange={(e) =>
                                updateItem(item.id, {
                                  price: parseFloat(e.target.value),
                                })
                              }
                              placeholder="Fiyat"
                              className="w-32"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>

                          <div className="flex gap-2">
                            <Select
                              value={item.category}
                              onValueChange={(value) =>
                                updateItem(item.id, { category: value })
                              }
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {analyzedMenu?.categories.map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGenerateDescription(item.id)}
                            >
                              <Sparkles className="w-4 h-4 mr-2" />
                              AI Açıklama Oluştur
                            </Button>
                          </div>

                          <Textarea
                            value={item.description || ""}
                            onChange={(e) =>
                              updateItem(item.id, { description: e.target.value })
                            }
                            placeholder="Ürün açıklaması..."
                            className="resize-none"
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={addNewItem}
                className="w-full mt-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                Yeni Ürün Ekle
              </Button>

              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Geri
                </Button>
                <Button
                  size="lg"
                  onClick={handleCreateMenu}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  Devam Et
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirm & Create */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl p-12"
            >
              {isCreating ? (
                <div className="text-center space-y-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 mx-auto"
                  >
                    <Loader2 className="w-full h-full text-amber-500" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Menünüz oluşturuluyor...
                  </h2>
                  <p className="text-gray-600">
                    Kategoriler ve ürünler kaydediliyor
                  </p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center space-y-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-16 h-16 text-green-600" />
                  </motion.div>

                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      Menünüz Hazır!
                    </h1>
                    <p className="text-xl text-gray-600">
                      Başarıyla {editedItems.length} ürün eklendi
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 text-left max-w-md mx-auto">
                    <h3 className="font-semibold text-gray-900 mb-4">Özet</h3>
                    <div className="space-y-2 text-gray-600">
                      <p>
                        <strong>Kategoriler:</strong>{" "}
                        {analyzedMenu?.categories.length}
                      </p>
                      <p>
                        <strong>Toplam Ürün:</strong> {editedItems.length}
                      </p>
                      <p>
                        <strong>Durum:</strong>{" "}
                        <span className="text-green-600">Aktif</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => router.push("/dashboard")}
                    >
                      Dashboard'a Dön
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => router.push("/dashboard/menu")}
                      className="bg-amber-500 hover:bg-amber-600"
                    >
                      Menüyü Görüntüle
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
