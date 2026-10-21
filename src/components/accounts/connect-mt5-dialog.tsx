"use client";

import * as React from "react";
import { Check, Copy, Download, ExternalLink, HelpCircle, Key, Laptop, RefreshCw, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ConnectMt5DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiSecret?: string;
}

export function ConnectMt5Dialog({ open, onOpenChange, apiSecret = "tradelog-mt5-secret-key" }: ConnectMt5DialogProps) {
  const [copiedUrl, setCopiedUrl] = React.useState(false);
  const [copiedKey, setCopiedKey] = React.useState(false);
  const [ingestUrl, setIngestUrl] = React.useState("http://localhost:3000/api/mt5/ingest");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setIngestUrl(`${window.location.origin}/api/mt5/ingest`);
    }
  }, []);

  function copyToClipboard(text: string, type: "url" | "key") {
    navigator.clipboard.writeText(text);
    if (type === "url") {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
    toast.success("Copied to clipboard!");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-[#1a1a1a] bg-[#090909] text-[#f2f2f0] p-6 shadow-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#b2ff05]/15 text-[#b2ff05]">
              <Zap className="h-4 w-4" />
            </span>
            <DialogTitle className="text-lg font-bold text-[#f2f2f0]">
              Connect MetaTrader 5 (MT5)
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#a0a0a0]">
            Sync trades automatically in real-time using Tradelog EA. 100% free, zero broker server credentials stored.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          {/* Step 1: Download EA */}
          <div className="rounded-lg border border-[#1a1a1a] bg-[#121214] p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#b2ff05]">
                  Step 1 · Download Expert Advisor
                </span>
                <p className="text-xs text-[#a0a0a0]">
                  Get the official lightweight <code className="text-[#f2f2f0]">TradelogSync.mq5</code> file.
                </p>
              </div>
              <a
                href="/TradelogSync.mq5"
                download="TradelogSync.mq5"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#b2ff05] px-3 py-1.5 text-xs font-bold text-black transition-colors hover:bg-[#8fcc04]"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download EA</span>
              </a>
            </div>
          </div>

          {/* Step 2: Configuration Credentials */}
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#b2ff05]">
              Step 2 · Copy Connection Settings to EA
            </span>

            {/* Ingest URL */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-[#a0a0a0]">InpApiUrl (Ingest Endpoint)</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={ingestUrl}
                  className="font-mono text-xs border-[#1a1a1a] bg-[#000000] text-[#f2f2f0] focus-visible:ring-[#b2ff05]"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(ingestUrl, "url")}
                  className="shrink-0 border-[#1a1a1a] bg-[#121214] text-[#a0a0a0] hover:text-[#f2f2f0]"
                >
                  {copiedUrl ? <Check className="h-3.5 w-3.5 text-[#b2ff05]" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>

            {/* Secret Key */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-[#a0a0a0]">InpApiSecret (Secret Token)</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={apiSecret}
                  className="font-mono text-xs border-[#1a1a1a] bg-[#000000] text-[#f2f2f0] focus-visible:ring-[#b2ff05]"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(apiSecret, "key")}
                  className="shrink-0 border-[#1a1a1a] bg-[#121214] text-[#a0a0a0] hover:text-[#f2f2f0]"
                >
                  {copiedKey ? <Check className="h-3.5 w-3.5 text-[#b2ff05]" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Step 3: Installation Guide */}
          <div className="rounded-lg border border-[#1a1a1a] bg-[#000000] p-4 text-xs space-y-2.5">
            <span className="font-semibold text-[#f2f2f0]">Step 3 · Pengaturan di MetaTrader 5 (Wajib Agar Otomatis)</span>
            <ol className="list-decimal pl-4 space-y-2 text-[#a0a0a0]">
              <li>
                Buka menu <span className="text-[#f2f2f0]">Tools &rarr; Options (atau tekan Ctrl+O) &rarr; tab Expert Advisors</span>.
              </li>
              <li className="text-[#b2ff05]">
                <strong>PENTING:</strong> Centang <span className="underline">Allow WebRequest for listed URL</span>, lalu klik dua kali dan tambahkan:
                <div className="mt-1 font-mono text-[11px] bg-[#121214] border border-[#2a2a2a] rounded px-2 py-1 text-[#f2f2f0]">
                  http://localhost:3000
                </div>
              </li>
              <li>
                <strong className="text-[#f2f2f0]">Untuk 2 Akun:</strong> HAPUS centang pada <em>"Disable algorithmic trading when the account has been changed"</em> agar EA tidak mati saat Anda beralih antar akun.
              </li>
              <li>
                Pasang EA <code className="text-[#b2ff05]">TradelogSync.mq5</code> ke chart (misal XAUUSD). Isi <span className="text-[#b2ff05]">InpApiUrl</span> dan <span className="text-[#b2ff05]">InpApiSecret</span>.
              </li>
            </ol>
          </div>

          {/* Quick Python Sync Info */}
          <div className="rounded-lg border border-[#b2ff05]/30 bg-[#b2ff05]/10 p-3 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[#b2ff05]">
              <Zap className="h-4 w-4" />
              <span>Sinkronisasi Otomatis Tanpa EA (Direct Sync)</span>
            </div>
            <p className="text-[#c0c0c0]">
              Tradelog sudah dilengkapi fitur <strong>Direct Multi-Account Sync</strong> yang otomatis menarik seluruh history dan posisi terbuka kedua akun secara berkala di latar belakang saat tab Tradelog aktif, atau klik tombol <strong>"Sync MT5"</strong> di bar atas kapan saja.
            </p>
          </div>

          {/* Security Banner */}
          <div className="flex items-start gap-2.5 rounded-lg border border-[#b2ff05]/20 bg-[#b2ff05]/5 p-3 text-xs text-[#a0a0a0]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#b2ff05]" />
            <span>
              <strong className="text-[#f2f2f0]">Private & Secure:</strong> Password akun dan saldo login Anda tidak pernah dikirim ke web. EA hanya mengirim ringkasan tiket deal saat trade ditutup.
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#1a1a1a] bg-[#121214] text-[#f2f2f0] hover:bg-[#1a1a1a]"
          >
            Selesai
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
