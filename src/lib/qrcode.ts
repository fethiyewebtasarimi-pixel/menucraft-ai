import QRCode from "qrcode";

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

/**
 * Generates a QR code as a base64 data URL
 * @param url - The URL to encode in the QR code
 * @param options - QR code generation options
 * @returns Promise resolving to a data URL string
 */
export async function generateQRCodeDataURL(
  url: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    width = 300,
    margin = 2,
    color = { dark: "#000000", light: "#FFFFFF" },
    errorCorrectionLevel = "M",
  } = options;

  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width,
      margin,
      color,
      errorCorrectionLevel,
    });

    return dataUrl;
  } catch (error) {
    console.error("Error generating QR code data URL:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Generates a QR code as an SVG string
 * @param url - The URL to encode in the QR code
 * @param options - QR code generation options
 * @returns Promise resolving to an SVG string
 */
export async function generateQRCodeSVG(
  url: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    width = 300,
    margin = 2,
    color = { dark: "#000000", light: "#FFFFFF" },
    errorCorrectionLevel = "M",
  } = options;

  try {
    const svg = await QRCode.toString(url, {
      type: "svg",
      width,
      margin,
      color,
      errorCorrectionLevel,
    });

    return svg;
  } catch (error) {
    console.error("Error generating QR code SVG:", error);
    throw new Error("Failed to generate QR code SVG");
  }
}

/**
 * Generates a QR code and returns it as a canvas element (browser only)
 * @param url - The URL to encode in the QR code
 * @param options - QR code generation options
 * @returns Promise resolving to an HTMLCanvasElement
 */
export async function generateQRCodeCanvas(
  url: string,
  options: QRCodeOptions = {}
): Promise<HTMLCanvasElement> {
  const {
    width = 300,
    margin = 2,
    color = { dark: "#000000", light: "#FFFFFF" },
    errorCorrectionLevel = "M",
  } = options;

  try {
    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, url, {
      width,
      margin,
      color,
      errorCorrectionLevel,
    });

    return canvas;
  } catch (error) {
    console.error("Error generating QR code canvas:", error);
    throw new Error("Failed to generate QR code canvas");
  }
}

/**
 * Downloads a QR code image from a data URL
 * @param dataUrl - The data URL of the QR code image
 * @param filename - The desired filename (without extension)
 */
export function downloadQRCode(dataUrl: string, filename: string = "qrcode"): void {
  try {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading QR code:", error);
    throw new Error("Failed to download QR code");
  }
}

/**
 * Downloads a QR code SVG
 * @param svg - The SVG string of the QR code
 * @param filename - The desired filename (without extension)
 */
export function downloadQRCodeSVG(svg: string, filename: string = "qrcode"): void {
  try {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading QR code SVG:", error);
    throw new Error("Failed to download QR code SVG");
  }
}

/**
 * Generates a menu QR code URL for a restaurant
 * @param restaurantSlug - The restaurant's slug
 * @param baseUrl - The base URL (defaults to window.location.origin in browser)
 * @returns The full menu URL
 */
export function generateMenuURL(
  restaurantSlug: string,
  baseUrl?: string
): string {
  const base =
    baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/menu/${restaurantSlug}`;
}

/**
 * Generates a QR code for a restaurant menu with custom branding
 * @param restaurantSlug - The restaurant's slug
 * @param options - QR code generation options
 * @returns Promise resolving to a data URL string
 */
export async function generateRestaurantMenuQR(
  restaurantSlug: string,
  options: QRCodeOptions & { baseUrl?: string } = {}
): Promise<string> {
  const { baseUrl, ...qrOptions } = options;
  const menuUrl = generateMenuURL(restaurantSlug, baseUrl);
  return generateQRCodeDataURL(menuUrl, qrOptions);
}

/**
 * Generates a printable QR code with restaurant branding
 * @param restaurantSlug - The restaurant's slug
 * @param restaurantName - The restaurant's name
 * @param options - QR code generation options with branding
 * @returns Promise resolving to a data URL of a composed image
 */
export async function generateBrandedQRCode(
  restaurantSlug: string,
  restaurantName: string,
  options: QRCodeOptions & {
    baseUrl?: string;
    brandColor?: string;
    logo?: string;
  } = {}
): Promise<string> {
  const { baseUrl, brandColor = "#f59e0b", logo, ...qrOptions } = options;

  // Generate the base QR code
  const menuUrl = generateMenuURL(restaurantSlug, baseUrl);
  const qrDataUrl = await generateQRCodeDataURL(menuUrl, {
    ...qrOptions,
    color: {
      dark: brandColor,
      light: "#FFFFFF",
    },
  });

  // Create a canvas to compose the final image
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  const width = 600;
  const height = 700;
  canvas.width = width;
  canvas.height = height;

  // White background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // Draw QR code
  const qrImage = new Image();
  await new Promise((resolve, reject) => {
    qrImage.onload = resolve;
    qrImage.onerror = reject;
    qrImage.src = qrDataUrl;
  });

  const qrSize = 400;
  const qrX = (width - qrSize) / 2;
  const qrY = 150;
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  // Draw restaurant name
  ctx.fillStyle = brandColor;
  ctx.font = "bold 32px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(restaurantName, width / 2, 100);

  // Draw instruction text
  ctx.fillStyle = "#374151";
  ctx.font = "18px sans-serif";
  ctx.fillText("Menüyü görmek için QR kodu okutun", width / 2, 620);

  // Draw powered by text
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "14px sans-serif";
  ctx.fillText("Powered by MenuCraft AI", width / 2, 670);

  // If logo is provided, draw it
  if (logo) {
    try {
      const logoImage = new Image();
      logoImage.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        logoImage.onload = resolve;
        logoImage.onerror = reject;
        logoImage.src = logo;
      });

      const logoSize = 80;
      const logoX = (width - logoSize) / 2;
      const logoY = 10;

      // Draw circle background
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(width / 2, logoY + logoSize / 2, logoSize / 2 + 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = brandColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw logo
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
      ctx.restore();
    } catch (error) {
      console.warn("Failed to load logo:", error);
    }
  }

  return canvas.toDataURL("image/png");
}

export default {
  generateQRCodeDataURL,
  generateQRCodeSVG,
  generateQRCodeCanvas,
  downloadQRCode,
  downloadQRCodeSVG,
  generateMenuURL,
  generateRestaurantMenuQR,
  generateBrandedQRCode,
};
