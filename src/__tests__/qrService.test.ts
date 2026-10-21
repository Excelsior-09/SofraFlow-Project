import { describe, it, expect } from 'vitest';
import { generateQrDataUrl, generateQrSvg } from '../services/qrService';

describe('QR Code Generation Studio', () => {
  it('generates valid PNG Data URL for stable menu URL', async () => {
    const dataUrl = await generateQrDataUrl({
      url: 'https://sofraflow.com/m/le-jardin?table=4',
      color: '#153E35'
    });

    expect(dataUrl).toBeDefined();
    expect(dataUrl.startsWith('data:image/png;base64,')).toBe(true);
  });

  it('generates valid SVG string for printable vectors', async () => {
    const svg = await generateQrSvg({
      url: 'https://sofraflow.com/m/le-jardin?table=7',
      color: '#153E35'
    });

    expect(svg).toBeDefined();
    expect(svg.includes('<svg')).toBe(true);
    expect(svg.includes('</svg>')).toBe(true);
  });
});
