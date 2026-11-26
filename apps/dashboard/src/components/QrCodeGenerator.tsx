import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Laptop,
  Printer,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, type LandmarkSummary } from '@smartguide/shared';
import { getDefaultTouristAppUrl } from '../lib/api';

interface QrCodeGeneratorProps {
  landmarks: LandmarkSummary[];
}

interface QrPlaqueItem {
  id: string;
  titleEn: string;
  titleUz: string;
  subtitle: string;
  badge: string;
  path: string;
  filename: string;
}

export function QrCodeGenerator({ landmarks }: QrCodeGeneratorProps) {
  const [touristBaseUrl, setTouristBaseUrl] = useState<string>(getDefaultTouristAppUrl());
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const normalizedBase = touristBaseUrl.trim().replace(/\/+$/, '');

  const plaques: QrPlaqueItem[] = useMemo(
    () => [
      {
        id: 'main-gate',
        titleEn: 'Ichan-Qala Main Entrance',
        titleUz: "Ichan-Qal'a Asosiy Kirish Qismi",
        subtitle: 'All 5 Verified Khiva Landmarks + Snap & Ask Camera',
        badge: 'SITE HUB',
        path: '/',
        filename: 'smartguide-qr-ichan-qala-entrance.png',
      },
      ...landmarks.map((lm, index) => ({
        id: lm.slug,
        titleEn: lm.localizedNames?.en || lm.name,
        titleUz: lm.localizedNames?.uz || lm.name,
        subtitle: `${lm.builtYear} · ${lm.locationInSite}`,
        badge: `STOP #${index + 1}`,
        path: `/l/${lm.slug}`,
        filename: `smartguide-qr-${lm.slug}.png`,
      })),
    ],
    [landmarks],
  );

  useEffect(() => {
    let cancelled = false;

    async function generateAll() {
      const entries: Record<string, string> = {};
      for (const item of plaques) {
        const fullUrl = `${normalizedBase}${item.path}`;
        try {
          entries[item.id] = await QRCode.toDataURL(fullUrl, {
            width: 360,
            margin: 2,
            color: {
              dark: '#0F172A',
              light: '#FFFFFF',
            },
            errorCorrectionLevel: 'H',
          });
        } catch {
          entries[item.id] = '';
        }
      }
      if (!cancelled) {
        setQrDataUrls(entries);
      }
    }

    void generateAll();
    return () => {
      cancelled = true;
    };
  }, [normalizedBase, plaques]);

  const handleCopyUrl = async (id: string, fullUrl: string) => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 1800);
    } catch {
      // Clipboard API unavailable on non-HTTPS origin
    }
  };

  const handleDownloadPng = (dataUrl: string, filename: string) => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const setPresetLocalhost = () => setTouristBaseUrl('http://localhost:3000');
  const setPresetCurrentHost = () => {
    if (typeof window === 'undefined') return;
    setTouristBaseUrl(`http://${window.location.hostname}:3000`);
  };

  return (
    <section className="space-y-6">
      {/* Configuration Header (.no-print) */}
      <div className="no-print rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-[#0F172A]">
              <QrCode className="h-5 w-5 text-[#0E7470]" />
              <span>Museum QR Plaque Generator</span>
            </h2>
            <p className="mt-1 text-xs text-[#475569]">
              Print-ready A4 museum posters (2 or 4 plaques per sheet). Set your LAN IP or AWS domain
              below so judges can scan directly from their phones.
            </p>

            <label className="mt-3 block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0E7470]">
                Tourist PWA Base URL
              </span>
              <input
                type="url"
                value={touristBaseUrl}
                onChange={(e) => setTouristBaseUrl(e.target.value)}
                placeholder="https://khiva.smartguide.uz or http://YOUR_LAN_IP:3000"
                className="mt-1.5 w-full max-w-xl rounded-xl border border-slate-300 bg-[#F8FAFC] px-3.5 py-2 text-sm text-[#0F172A] placeholder-slate-400 focus:border-[#0E7470] focus:bg-white focus:outline-none"
              />
            </label>

            {/* FE-12: Quick Preset Buttons */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={setPresetLocalhost}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:border-[#0E7470]/45 hover:bg-[#EEF7F6] transition cursor-pointer"
              >
                <Laptop className="h-3.5 w-3.5 text-[#0E7470]" />
                <span>Localhost (:3000)</span>
              </button>
              <button
                type="button"
                onClick={setPresetCurrentHost}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:border-[#0E7470]/45 hover:bg-[#EEF7F6] transition cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5 text-[#0284C7]" />
                <span>Current Host</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0E7470] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0A5C59] cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print All QR Plaques</span>
          </button>
        </div>
      </div>

      {/* Printable A4 Plaques Grid */}
      <div className="print-grid grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {plaques.map((item) => {
          const fullUrl = `${normalizedBase}${item.path}`;
          const qrSrc = qrDataUrls[item.id];
          const isCopied = copiedId === item.id;

          return (
            <article
              key={item.id}
              className="print-card flex flex-col justify-between rounded-2xl border-2 border-[#0E7470]/30 bg-white p-5 shadow-xs"
            >
              <div>
                {/* Poster Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <span className="text-[11px] font-bold tracking-wide text-[#0E7470]">
                    SmartGuide · Ichan-Qala Official AI Guide
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#B47B38]/30 bg-[#FDF6EC] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#B47B38]">
                    <ShieldCheck className="h-3 w-3" />
                    <span>UNESCO Heritage</span>
                  </span>
                </div>

                {/* QR Frame */}
                <div className="my-4 flex flex-col items-center rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                    {qrSrc ? (
                      <img
                        src={qrSrc}
                        alt={`QR Code for ${item.titleEn}`}
                        className="h-48 w-48 object-contain"
                      />
                    ) : (
                      <div className="flex h-48 w-48 items-center justify-center text-xs text-[#475569]">
                        Generating QR...
                      </div>
                    )}
                  </div>
                  <p className="mt-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-[#0E7470]">
                    Point Camera · Instant Audio Guide · No App Download
                  </p>
                  <p className="mt-1 max-w-full truncate font-mono text-[10px] text-[#475569]">
                    {fullUrl}
                  </p>
                </div>

                {/* Monument Names EN + UZ */}
                <div className="text-center">
                  <span className="inline-block rounded-full bg-[#EEF7F6] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0E7470]">
                    {item.badge}
                  </span>
                  <h3 className="mt-1.5 font-display text-xl font-bold text-[#0F172A]">
                    {item.titleEn}
                  </h3>
                  <p className="text-xs font-semibold text-[#B47B38]">{item.titleUz}</p>

                  {/* 6 Language Flags */}
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 pt-2.5 text-xs font-medium text-[#475569]">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <span key={lang.code} className="inline-flex items-center gap-1">
                        <span aria-hidden="true">{lang.flag}</span>
                        <span className="uppercase">{lang.code}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="no-print mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => handleDownloadPng(qrSrc, item.filename)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0E7470] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0A5C59] cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>PNG</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleCopyUrl(item.id, fullUrl)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#0F172A] transition hover:border-[#0E7470]/45 cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#059669]" />
                      <span className="text-[#059669]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>

                <a
                  href={fullUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Open Tourist PWA"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-[#F8FAFC] text-[#475569] transition hover:border-[#0E7470]/45 hover:text-[#0E7470]"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
