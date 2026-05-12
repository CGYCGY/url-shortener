"use client";

import { Download } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function QrCode({ url, slug, size = 200 }: { url: string; slug: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, {
      width: size,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then((value) => {
        if (!cancelled) setDataUrl(value);
      })
      .catch((err) => {
        console.error("Failed to generate QR code", err);
      });
    return () => {
      cancelled = true;
    };
  }, [url, size]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="rounded-md border border-border bg-white p-2"
        style={{ width: size + 16, height: size + 16 }}
      >
        {dataUrl ? (
          <img src={dataUrl} alt={`QR code for ${url}`} width={size} height={size} />
        ) : (
          <div className="h-full w-full animate-pulse rounded bg-muted" />
        )}
      </div>
      <Button asChild variant="outline" size="sm" disabled={!dataUrl}>
        <a href={dataUrl ?? "#"} download={`${slug}.png`}>
          <Download />
          Download PNG
        </a>
      </Button>
    </div>
  );
}
