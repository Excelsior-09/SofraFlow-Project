import QRCode from 'qrcode';

export interface GenerateQrOptions {
  url: string;
  color?: string; // Brand color
  bgColor?: string;
  width?: number;
  margin?: number;
}

/**
 * Generates a Data URL for the QR code (PNG format)
 */
export async function generateQrDataUrl(options: GenerateQrOptions): Promise<string> {
  const {
    url,
    color = '#153E35',
    bgColor = '#FFFFFF',
    width = 400,
    margin = 2
  } = options;

  try {
    return await QRCode.toDataURL(url, {
      width,
      margin,
      color: {
        dark: color,
        light: bgColor
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err) {
    console.error('Failed to generate QR Data URL:', err);
    throw err;
  }
}

/**
 * Generates an SVG string representation of the QR code
 */
export async function generateQrSvg(options: GenerateQrOptions): Promise<string> {
  const {
    url,
    color = '#153E35',
    bgColor = '#FFFFFF',
    width = 400,
    margin = 2
  } = options;

  try {
    return await QRCode.toString(url, {
      type: 'svg',
      width,
      margin,
      color: {
        dark: color,
        light: bgColor
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err) {
    console.error('Failed to generate QR SVG:', err);
    throw err;
  }
}

/**
 * Trigger browser download of generated QR code
 */
export function downloadFile(content: string, filename: string, isDataUrl: boolean = true) {
  const link = document.createElement('a');
  link.download = filename;

  if (isDataUrl) {
    link.href = content;
  } else {
    const blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
    link.href = URL.createObjectURL(blob);
  }

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
