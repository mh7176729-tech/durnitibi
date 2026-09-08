import React, { useEffect, useRef } from 'react';
import { AdvertisementItem, AdPosition } from '../types';
import { api } from '../services/api';

interface AdSlotProps {
  position: AdPosition;
  ads: AdvertisementItem[];
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ position, ads, className = '' }) => {
  const ad = ads.find(a => a.position === position && a.isActive);
  const scriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ad && ad.type === 'script' && ad.scriptCode && scriptContainerRef.current) {
      // Safe sandbox execution for script / Adsterra / AdSense
      scriptContainerRef.current.innerHTML = '';
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');

      scriptContainerRef.current.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; }</style>
            </head>
            <body>
              ${ad.scriptCode}
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [ad]);

  if (!ad) {
    return null;
  }

  const handleClick = () => {
    if (ad.id) {
      api.recordAdClick(ad.id);
    }
  };

  return (
    <div className={`w-full my-4 flex flex-col items-center justify-center ${className}`}>
      <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 font-semibold">
        বিজ্ঞাপন • Advertisement
      </span>

      {ad.type === 'banner' && ad.imageUrl && (
        <a
          href={ad.targetUrl || '#'}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="block w-full max-w-4xl overflow-hidden rounded-lg border border-gray-200 dark:border-slate-800 shadow-xs hover:opacity-95 transition"
        >
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-full h-auto max-h-36 object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </a>
      )}

      {ad.type === 'script' && (
        <div
          ref={scriptContainerRef}
          className="w-full max-w-4xl min-h-[90px] flex items-center justify-center overflow-hidden rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900"
        />
      )}
    </div>
  );
};
