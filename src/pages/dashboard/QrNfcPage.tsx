import React, { useEffect, useState } from 'react';
import { QrCode, Download, Copy, Check, ExternalLink, Printer, Sliders, Smartphone, Wifi, Save } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { NoActiveRestaurantCard } from '../../components/common/NoActiveRestaurantCard';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { generateQrDataUrl, generateQrSvg, downloadFile } from '../../services/qrService';
import { supabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';

export const QrNfcPage: React.FC = () => {
  const { activeRestaurant } = useAuth();
  const { language, t } = useLanguage();
  const isEn = language === 'en';
  const [qrColor, setQrColor] = useState<string>('#153E35');
  const [includeLogo, setIncludeLogo] = useState<boolean>(true);
  const [wifiName, setWifiName] = useState<string>('');
  const [wifiPassword, setWifiPassword] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedNfc, setCopiedNfc] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Destination target is strictly General Venue (customers enter table manually)
  const selectedTable = 'general';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const baseUrl = activeRestaurant ? `${origin}/m/${activeRestaurant.slug}` : '';
  const targetUrl = baseUrl;

  // Load persistent QR settings
  useEffect(() => {
    if (!activeRestaurant) return;
    if (isSupabaseConfigured) {
      supabaseService.getQrSettings(activeRestaurant.id).then((saved) => {
        if (saved) {
          if (saved.qrColor) setQrColor(saved.qrColor);
          if (saved.includeLogo !== undefined) setIncludeLogo(saved.includeLogo);
          if (saved.wifiName) setWifiName(saved.wifiName);
          if (saved.wifiPassword) setWifiPassword(saved.wifiPassword);
        } else {
          setWifiName(`${activeRestaurant.name.replace(/\s+/g, '')}_Guest`);
          setWifiPassword('');
        }
      });
    } else {
      setWifiName(`${activeRestaurant.name.replace(/\s+/g, '')}_Guest`);
      setWifiPassword('');
    }
  }, [activeRestaurant]);

  useEffect(() => {
    if (!activeRestaurant || !targetUrl) return;
    generateQrDataUrl({
      url: targetUrl,
      color: qrColor,
      width: 400
    }).then(setQrDataUrl);
  }, [targetUrl, qrColor, activeRestaurant]);

  if (!activeRestaurant) {
    return (
      <DashboardLayout>
        <NoActiveRestaurantCard
          icon={<QrCode className="w-8 h-8" />}
          title={isEn ? 'No active establishment' : 'Aucun établissement actif'}
          description={
            isEn
              ? 'Please select or create your establishment to generate table QR codes and smart NFC tags.'
              : 'Veuillez sélectionner ou créer votre établissement pour générer vos QR codes de tables et tags NFC.'
          }
        />
      </DashboardLayout>
    );
  }

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      if (isSupabaseConfigured) {
        await supabaseService.saveQrSettings(activeRestaurant.id, {
          qrColor,
          includeLogo,
          wifiName,
          wifiPassword
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('[QrNfcPage] Failed to save QR settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyNfc = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopiedNfc(true);
    setTimeout(() => setCopiedNfc(false), 2500);
  };

  const handleDownloadPng = () => {
    if (qrDataUrl) {
      downloadFile(qrDataUrl, `${activeRestaurant.slug}-general-venue-qr.png`, true);
    }
  };

  const handleDownloadSvg = async () => {
    const svgString = await generateQrSvg({
      url: targetUrl,
      color: qrColor,
      width: 500
    });
    downloadFile(svgString, `${activeRestaurant.slug}-general-venue-qr.svg`, false);
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-forest dark:text-[#F0F4F2] font-display">
              Smart QR & NFC Studio
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary dark:text-[#97A7A0] mt-1">
              Generate stable, branded QR codes and printable table stands that stay linked even when menus change.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrintCard}
            >
              Print Table Stand
            </Button>
          </div>
        </div>

        {/* Stable URL Banner */}
        <Card className="p-4 bg-white dark:bg-[#14241F] border border-border-subtle dark:border-[#233831] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-secondary dark:text-[#97A7A0]">
              Public Menu Permanent Link
            </span>
            <p className="font-mono text-xs sm:text-sm font-semibold text-forest dark:text-gold truncate max-w-md">
              {targetUrl}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={copiedLink ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
              onClick={handleCopy}
            >
              {copiedLink ? 'Copied Link!' : 'Copy Link'}
            </Button>
            <a href={targetUrl} target="_blank" rel="noreferrer">
              <Button size="sm" variant="secondary" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                Test Link
              </Button>
            </a>
          </div>
        </Card>

        {/* Two Column Layout: Controls & Live Card Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 space-y-5 border border-border-subtle dark:border-[#233831]">
              <h3 className="font-bold text-sm text-forest dark:text-[#F0F4F2] uppercase tracking-wider font-display">
                QR Customization
              </h3>

              {/* Destination Target Selector (Strictly General venue) */}
              <div>
                <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1.5">
                  Select Destination Target
                </label>
                <select
                  value="general"
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#14241F] text-xs font-semibold text-forest dark:text-[#F0F4F2] cursor-default focus:ring-2 focus:ring-forest"
                  aria-label="Select Destination Target"
                >
                  <option value="general">
                    General venue (customers enter the table manually)
                  </option>
                </select>
                <p className="text-[11px] text-ink-secondary dark:text-[#97A7A0] mt-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>Diners scan one permanent venue QR code and enter their table number when reviewing their order.</span>
                </p>
              </div>

              {/* Color Swatches */}
              <div>
                <label className="block text-xs font-semibold text-ink-main mb-1.5">
                  QR Brand Color
                </label>
                <div className="flex items-center gap-2.5">
                  {[
                    { label: 'Forest Green', hex: '#153E35' },
                    { label: 'Gold Accent', hex: '#D9A441' },
                    { label: 'Midnight Black', hex: '#111827' },
                    { label: 'Olive Bronze', hex: '#2B4A3F' }
                  ].map(c => (
                    <button
                      key={c.hex}
                      onClick={() => setQrColor(c.hex)}
                      className={`w-9 h-9 rounded-xl border-2 transition-transform ${
                        qrColor === c.hex ? 'border-forest scale-110 shadow-sm' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* WiFi Details for Table Stand */}
              <div className="pt-3 border-t border-border-subtle space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-forest">
                  <Wifi className="w-4 h-4 text-forest" />
                  <span>Guest WiFi on Stand (Optional)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-ink-secondary block mb-1">Network Name</label>
                    <input
                      type="text"
                      value={wifiName}
                      onChange={(e) => setWifiName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border-subtle text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-ink-secondary block mb-1">Password</label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border-subtle text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold"
                    leftIcon={saveSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5" />}
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : saveSuccess ? 'Settings Saved in Supabase!' : 'Save QR & WiFi Settings'}
                  </Button>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="pt-4 border-t border-border-subtle space-y-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  leftIcon={<Download className="w-4 h-4" />}
                  onClick={handleDownloadPng}
                >
                  Download PNG (High-Res)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  leftIcon={<Download className="w-4 h-4" />}
                  onClick={handleDownloadSvg}
                >
                  Download SVG Vector
                </Button>
              </div>
            </Card>

            {/* NFC Programming Card */}
            <Card className="p-5 space-y-3 bg-forest-light border-forest/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-forest text-white flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-forest">NFC Tag Programming</h4>
                  <p className="text-[10px] text-ink-secondary">Compatible with all standard NTAG213 / NTAG215 stickers</p>
                </div>
              </div>

              <p className="text-xs text-ink-secondary leading-relaxed">
                To program table NFC pucks, copy the table URL below and write it as an NDEF URI using free apps like <strong>NFC Tools</strong> on your smartphone.
              </p>

              <Button
                variant="outline"
                size="sm"
                className="w-full bg-white text-xs"
                leftIcon={copiedNfc ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                onClick={handleCopyNfc}
              >
                {copiedNfc ? 'Copied Table NFC URL!' : 'Copy NFC Tag Target URL'}
              </Button>
            </Card>
          </div>

          {/* Printable Stand Preview (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="text-center mb-3">
              <span className="text-xs font-bold text-ink-secondary uppercase tracking-wider">
                Printable Table Stand Layout
              </span>
            </div>

            {/* Stand Card (formatted for acrylic table tent or sticker) */}
            <div
              id="printable-card"
              className="w-full max-w-sm bg-white rounded-3xl p-8 border-2 border-border-subtle shadow-elevated text-center flex flex-col items-center justify-between relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div className="w-full h-2.5 bg-forest absolute top-0 left-0" />

              {/* Restaurant Branding Header */}
              <div className="pt-2 pb-4 space-y-1">
                <div className="w-10 h-10 rounded-xl bg-forest text-gold flex items-center justify-center mx-auto mb-2 shadow-soft">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-forest font-display">
                  {activeRestaurant.name}
                </h3>
                <p className="text-[11px] text-ink-secondary font-medium">
                  {activeRestaurant.city}, Morocco
                </p>
              </div>

              {/* Table Number Pill */}
              <div className="my-1">
                <span className="px-4 py-1.5 rounded-full bg-forest-light text-forest text-xs font-extrabold tracking-wide uppercase">
                  {selectedTable === 'general' ? 'Dine-In Menu' : `Table ${selectedTable}`}
                </span>
              </div>

              {/* QR Code Graphic */}
              <div className="p-4 bg-ivory rounded-2xl border border-border-subtle my-4 shadow-inner">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Table QR Code" className="w-48 h-48 rounded-lg" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs text-ink-secondary">
                    Generating QR...
                  </div>
                )}
              </div>

              {/* Scan Prompt */}
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-forest">Scan for Digital Menu & Ordering</h4>
                <p className="text-[11px] text-ink-secondary">No app required • Open camera to browse</p>
              </div>

              {/* WiFi Footer */}
              {wifiName && (
                <div className="mt-5 pt-3 border-t border-border-subtle/80 w-full flex items-center justify-center gap-4 text-[10px] text-ink-secondary">
                  <span>WiFi: <strong className="text-ink-main">{wifiName}</strong></span>
                  <span>PW: <strong className="text-ink-main">{wifiPassword}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
