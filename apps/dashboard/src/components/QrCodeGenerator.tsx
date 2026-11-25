import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, Download, ExternalLink, Printer, QrCode } from 'lucide-react';
import type { LandmarkSummary } from '@smartguide/shared';
import { getDefaultTouristAppUrl } from '../lib/api';

interface QrCodeGeneratorProps {
  landmarks: LandmarkSummary[];
}

interface QrPlaqueItem {
  id: string;
  title: string;
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

  const plaques: QrPlaqueItem[] = [
    {
      id: 'main-gate',
      title: 'Ichan-Qala Ticket Desk · Main Entrance',
      subtitle: 'All 5 Verified Khiva Landmarks + Snap & Ask Camera',
      badge: 'SITE HUB',
      path: '/',
      filename: 'smartguide-qr-ichan-qala-entrance.png',
    },
    ...landmarks.map((lm, index) => ({
      id: lm.slug,
      title: lm.name,
      subtitle: `${lm.builtYear} · ${lm.locationInSite}`,
      badge: `MONUMENT #${index + 1}`,
      path: `/l/${lm.slug}`,
      filename: `smartguide-qr-${lm.slug}.png`,
    })),
  ];

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
              dark: '#090D16',
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
    // Re-generate whenever the base URL or landmark list changes
  }, [normalizedBase, landmarks]);

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

  return (
    <section className="space-y-6">
      {/* Configuration Header */}
      <div className="no-print rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <QrCode className="h-5 w-5 text-amber-300" />
              Museum QR Plaque Generator
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Generate print-ready QR plaques for Ichan-Qala ticket desks and monuments. Update the
              base URL below with your AWS server domain/IP before printing for live Demo Day scans.
            </p>

            <label className="mt-3 block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                Tourist PWA Base URL
              </span>
              <input
                type="url"
                value={touristBaseUrl}
                onChange={(e) => setTouristBaseUrl(e.target.value)}
                placeholder="https://khiva.smartguide.uz or http://YOUR_AWS_IP:3000"
                className="mt-1.5 w-full max-w-xl rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110 transition cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print All QR Plaques</span>
          </button>
        </div>
      </div>

      {/* Printable Plaques Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {plaques.map((item) => {
          const fullUrl = `${normalizedBase}${item.path}`;
          const qrSrc = qrDataUrls[item.id];
          const isCopied = copiedId === item.id;

          return (
            <article
              key={item.id}
              className="print-card flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/85 p-5 shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    {item.badge}
                  </span>
                  <span className="text-[11px] font-semibold text-teal-300">
                    EN · UZ · RU · JA · KO · ES
                  </span>
                </div>

                <h3 className="mt-2.5 font-display text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">{item.subtitle}</p>

                <div className="my-4 flex flex-col items-center rounded-2xl border border-slate-700/80 bg-white p-4">
                  {qrSrc ? (
                    <img
                      src={qrSrc}
                      alt={`QR Code for ${item.title}`}
                      className="h-48 w-48 object-contain"
                    />
                  ) : (
                    <div className="flex h-48 w-48 items-center justify-center text-xs text-slate-500">
                      Generating QR...
                    </div>
                  )}
                  <p className="mt-2 text-center text-[11px] font-semibold tracking-wide text-slate-900">
                    SCAN FOR VERIFIED AI AUDIO GUIDE
                  </p>
                  <p className="mt-0.5 max-w-full truncate font-mono text-[10px] text-slate-500">
                    {fullUrl}
                  </p>
                </div>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadPng(qrSrc, item.filename)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-teal-500/20 border border-teal-400/40 px-3 py-2 text-xs font-semibold text-teal-200 hover:bg-teal-500/30 transition cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>PNG</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleCopyUrl(item.id, fullUrl)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-amber-400/50 transition cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied</span>
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
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-slate-300 hover:border-amber-400/50 hover:text-amber-200 transition"
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
