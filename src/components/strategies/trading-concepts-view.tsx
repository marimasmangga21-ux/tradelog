"use client";

import * as React from "react";
import {
  TrendingUp,
  Target,
  Zap,
  Maximize2,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ConceptMiniChart } from "@/components/strategies/concept-mini-charts";

interface ConceptData {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  color: string;
  image: string;
  description: string;
  whyItMatters: string;
  components: Array<{
    term: string;
    fullName: string;
    description: string;
    tip?: string;
    steps?: string[];
  }>;
  rules: string[];
}

const CONCEPTS: ConceptData[] = [
  {
    id: "market-structure",
    title: "1. Market Structure",
    subtitle: "Arah Tren & Pergantian Fase Pasar",
    tag: "Fondasi Arah",
    color: "#00d2ff",
    image: "/concepts/market-structure.png",
    description:
      "Market Structure adalah kerangka kerja paling fundamental untuk membaca peta pergerakan harga. Tanpa memahami struktur pasar, trader hanya menebak-nebak arah. Struktur memberi tahu kita apakah pasar sedang tren naik (bullish), tren turun (bearish), atau sedang berbalik arah.",
    whyItMatters:
      "Menghindarkan Anda dari posisi 'counter-trend' yang berbahaya dan memberikan peta jelas di mana titik aman meletakkan Stop Loss dan Take Profit.",
    components: [
      {
        term: "HH & HL",
        fullName: "Higher High & Higher Low",
        description: "Pola harga dalam tren Bullish di mana setiap puncak baru lebih tinggi dari puncak sebelumnya (HH), dan setiap lembah koreksi tidak menembus lembah sebelumnya (HL).",
        steps: [
          "Candle naik mencetak puncak baru yang lebih tinggi → HH.",
          "Koreksi turun berhenti di atas lembah sebelumnya → HL.",
          "Pola berulang = tren bullish. Cari Buy saat harga menyentuh HL."
        ]
      },
      {
        term: "LH & LL",
        fullName: "Lower High & Lower Low",
        description: "Pola harga dalam tren Bearish di mana setiap lembah baru lebih rendah (LL) dan setiap pantulan koreksi membentuk puncak yang lebih rendah (LH).",
        steps: [
          "Candle turun mencetak lembah baru yang lebih rendah → LL.",
          "Pantulan naik berhenti di bawah puncak sebelumnya → LH.",
          "Pola berulang = tren bearish. Cari Sell saat harga menyentuh LH."
        ]
      },
      {
        term: "BOS",
        fullName: "Break of Structure",
        description: "Penembusan valid (biasanya ditutup oleh body candle) melewati swing high/low sebelumnya yang mengonfirmasi bahwa tren yang sedang berlangsung masih berlanjut kuat.",
        steps: [
          "Tandai level swing high terakhir (garis biru putus-putus).",
          "Harga retrace/koreksi sebentar, lalu ada candle impulsif naik.",
          "Body candle close di atas level swing high → BOS sah. Lanjutkan Buy."
        ]
      },
      {
        term: "CHoCH",
        fullName: "Change of Character",
        description: "Sinyal peringatan awal pergantian tren: Terjadi saat harga untuk pertama kalinya menembus swing terakhir yang berlawanan (misal menembus HL terakhir dalam uptrend).",
        steps: [
          "Dalam uptrend, tandai Higher Low (HL) terakhir sebagai support kunci.",
          "Muncul candle merah besar yang menembus dan close di bawah HL tersebut.",
          "CHoCH terkonfirmasi → bias berubah jadi bearish, mulai cari Sell."
        ]
      },
      {
        term: "MSS",
        fullName: "Market Structure Shift",
        description: "Pergeseran struktur harga agresif dengan candlestick impulsif (displacement) bervolume besar, menandakan institusi telah membalikkan arah aliran pesanan (orderflow).",
        steps: [
          "Perhatikan swing low terakhir sebagai acuan.",
          "Satu candle besar (displacement) menembus swing low dengan body penuh, tanpa perlawanan.",
          "MSS terkonfirmasi → struktur berbalik; tunggu pullback ke FVG/OB hasil displacement untuk Sell."
        ]
      },
      {
        term: "Internal vs External",
        fullName: "Major Swing vs Minor Pullback",
        description: "External Structure adalah ayunan besar utama (H4/M15). Internal Structure adalah gelombang kecil di dalam pullback. Pemula sering tertipu mengira internal pullback sebagai CHoCH asli.",
        steps: [
          "Garis biru = External Structure: high dan low besar penentu tren.",
          "Garis oranye putus-putus = Internal Structure: gelombang kecil di dalam koreksi.",
          "Entry hanya saat internal selaras dengan external. Jangan anggap internal CHoCH sebagai reversal tren."
        ]
      },
      {
        term: "Strong vs Weak Swing",
        fullName: "Protected vs Targeted High/Low",
        description: "Strong Low/High adalah swing yang berhasil memecahkan rekor baru (BOS) sehingga dijaga institusi (level SL aman). Weak Low/High adalah swing yang gagal menembus rekor dan menjadi target likuiditas.",
        steps: [
          "Titik hijau = Strong Low: swing yang sudah menghasilkan BOS. Ini level SL aman (protected).",
          "Titik merah = Weak High: swing yang gagal ditembus dan berpotensi disapu.",
          "Pasang SL di belakang Strong Low, targetkan Weak High sebagai likuiditas."
        ]
      },
      {
        term: "MTF Fractal",
        fullName: "Multi-Timeframe Alignment",
        description: "Koneksi 3 lapis: Higher Timeframe (H4/D1) menentukan bias arah besar, Medium Timeframe (M15) memetakan struktur swing, dan Lower Timeframe (M1/M5) sebagai pemicu eksekusi presisi.",
        steps: [
          "Baris H4: tentukan bias arah (bullish/bearish) — ini kompas Anda.",
          "Baris M15: cari struktur swing & POI yang searah bias H4.",
          "Baris M5: tunggu trigger (pinbar/engulfing) di POI untuk entry presisi."
        ]
      },
      {
        term: "Power of 3 (AMD)",
        fullName: "Accumulation · Manipulation · Distribution",
        description: "Kerangka paling fundamental ICT. Setiap sesi dibagi 3 fase: Akumulasi (range sempit, institusi diam-diam mengisi posisi), Manipulasi (sweep palsu ke arah berlawanan untuk ambil stop loss retail), Distribusi (barulah tren sebenarnya berjalan ke arah yang benar).",
        steps: [
          "AKUMULASI: harga bergerak sempit dalam range. Terlihat membosankan — ini fase institusi mengumpulkan order.",
          "MANIPULASI: harga menjebol range ke arah BERLAWANAN dari tren asli (Judas Swing). Retail masuk ke arah jebakan, stop loss mereka diambil.",
          "DISTRIBUSI: setelah likuiditas cukup, harga berbalik dan bergerak kuat ke arah sebenarnya. Inilah arah yang kita tradingkan."
        ]
      },
      {
        term: "CISD",
        fullName: "Change in State of Delivery",
        description: "Istilah modern ICT pengganti MSS/CHoCH. Bukan sekadar menembus swing — CISD terjadi saat rangkaian candle terakhir yang mengantar harga ke high/low ekstrem berhasil ditutup balik oleh body candle (biasanya deretan candle berlawanan). Ini tanda delivery order benar-benar berubah arah.",
        steps: [
          "Tandai deretan candle terakhir (open candle) yang mengantar harga ke swing high/low ekstrem.",
          "CISD terkonfirmasi saat body candle menutup balik melewati open dari deretan candle tersebut — bukan hanya menembus satu swing.",
          "Setelah CISD, delivery berbalik. Cari FVG/OB yang terbentuk dari candle CISD itu untuk entry."
        ]
      },
      {
        term: "Body-Close Rule",
        fullName: "Validasi BOS / CHoCH Lewat Body",
        description: "Aturan paling sering dilanggar trader pemula. Sebuah level struktur hanya dianggap SAH tertembus kalau BODY candle menutup di luar level — bukan sekadar wick/sumbu yang menusuk. Wick panjang yang tembus lalu close kembali di dalam level adalah jebakan (sweep), bukan breakout.",
        steps: [
          "Tandai level swing high/low yang akan diuji.",
          "Candle menusuk level dengan WICK tapi body close kembali di dalam → BUKAN break. Ini sweep, bukan BOS.",
          "Candle close dengan BODY penuh di luar level → BOS/CHoCH sah. Barulah struktur dianggap berubah."
        ]
      },
      {
        term: "MMBM / MMSM",
        fullName: "Market Maker Buy Model / Sell Model",
        description: "Alur lengkap pergerakan institusi dalam satu siklus. MMBM (Buy Model): konsolidasi → ambil sell-side liquidity → displacement naik → retrace ke POI discount → ekspansi ke buy-side. MMSM adalah kebalikannya. Ini 'peta jalan' yang menyatukan semua komponen ICT jadi satu urutan logis.",
        steps: [
          "KONSOLIDASI: harga membentuk range. Institusi menandai BSL di atas dan SSL di bawah range.",
          "SELL-SIDE DIAMBIL: harga menyapu SSL (stop loss buyer) — likuiditas untuk mengisi posisi beli institusi.",
          "DISPLACEMENT + RETRACE: harga melesat naik menembus struktur, lalu pullback ke POI discount (OB/FVG) yang ditinggalkan displacement itu.",
          "EKSPANSI: dari POI discount harga bergerak kuat menuju BSL di atas range. Di sinilah target profit diambil."
        ]
      },
      {
        term: "Swing Failure Pattern",
        fullName: "SFP · Kegagalan Tembus Swing (SMC)",
        description: "Versi SMC dari liquidity sweep. Harga naik menguji swing high sebelumnya, menusuk sedikit dengan wick, TAPI gagal close di atasnya — lalu berbalik turun. Disebut 'failure' karena upaya menembus struktur justru gagal, dan kegagalan itu sendiri adalah sinyal reversal.",
        steps: [
          "Tandai swing high (atau swing low) terakhir yang jelas. Ini level yang akan diuji.",
          "Harga naik menguji level itu: wick menusuk sedikit di atasnya, tapi body close kembali di BAWAH level.",
          "Karena tembusnya gagal, itu tanda buyer kehabisan tenaga. Entry Sell setelah candle konfirmasi, SL di atas wick SFP."
        ]
      },
      {
        term: "QML Structure",
        fullName: "Quasimodo Level (MSNR)",
        description: "QML adalah level yang dibentuk oleh pola Quasimodo: swing high, lalu turun membuat low lebih rendah, lalu naik lagi melewati swing high sebelumnya, lalu turun. Level QML diambil dari BODY candle di puncak pertama — bukan wick. Saat harga kembali ke level itu, reaksinya sangat tajam karena itu titik di mana struktur berbalik.",
        steps: [
          "Cari pola: high (H1) → low lebih rendah (L1) → high lebih tinggi (H2) → lalu turun.",
          "Tarik level dari BODY candle H1 (bukan wick-nya). Itulah QML.",
          "Saat harga retest level body H1 tersebut, entry Sell. SL di atas wick H2, target ke low berikutnya."
        ]
      },
      {
        term: "Fresh Level",
        fullName: "Level Belum Pernah Disentuh (MSNR)",
        description: "Prinsip inti MSNR: level yang BELUM pernah di-retest jauh lebih kuat daripada level yang sudah disentuh berkali-kali. Setiap sentuhan 'memakan' order yang menunggu di level itu. Level yang masih fresh punya order penuh — reaksinya tajam. Level yang sudah 3–4 kali disentuh biasanya jebol.",
        steps: [
          "Saat menandai level, hitung sudah berapa kali level itu disentuh setelah terbentuk.",
          "Level dengan 0 sentuhan (fresh) = prioritas tertinggi. Level dengan 3+ sentuhan = hindari, order sudah habis.",
          "Selalu pilih level fresh terdekat sebagai POI, bukan level lama yang paling sering disebut orang."
        ]
      },
      {
        term: "Trendline Break",
        fullName: "Garis Naik Ditembus ke Bawah (Breakdown)",
        description: "Garis tren naik bertindak sebagai lantai (support). Ketika harga menembus lantai ini ke bawah, arah tren berubah dari naik menjadi turun. Lantai yang jebol kini berbalik fungsi menjadi atap (resistance baru) yang menahan harga.",
        steps: [
          "1. Lihat garis tren naik yang sudah menahan harga 2–3 kali pantulan.",
          "2. Tunggu harga menembus ke bawah garis dengan candle merah yang jelas (bukan cuma ekor/wick).",
          "3. Jangan langsung kejar; tunggu harga memantul naik sedikit menyentuh bawah garis (Retest). Jika ditolak, lakukan Entry Sell."
        ]
      },
      {
        term: "Trendline Throw-over",
        fullName: "Lonjakan Ekstrem Lalu Ambruk (Climax Top)",
        description: "Harga tiba-tiba naik sangat curam dan melonjak melampaui garis tren atas. Ini bukan tanda kekuatan, melainkan jebakan pembeli terakhir (FOMO buyer). Setelah energi habis, harga berbalik arah dan jatuh tajam menembus garis.",
        steps: [
          "1. Sudut kenaikan harga berubah drastis menjadi sangat tegak/ekstrem (parabolic).",
          "2. Terjadi lonjakan tajam menembus ke atas garis tren, disusul candle pembalikan merah besar.",
          "3. Hindari posisi Buy saat lonjakan ini terjadi; konfirmasi Sell saat harga jatuh kembali menembus ke bawah garis tren."
        ]
      },
      {
        term: "Trendline Rejection",
        fullName: "Garis Turun Menolak Harga (Tren Turun Lanjut)",
        description: "Garis tren turun bertindak sebagai atap (resistance). Setiap kali harga naik menyentuh atap ini, seller langsung menekan harga turun kembali. Ini tanda bahwa tren turun masih sangat sehat dan dominan.",
        steps: [
          "1. Tarik garis di atas puncak-puncak harga yang posisinya makin lama makin rendah.",
          "2. Pantau saat harga mendekati garis; cari tanda penolakan seperti jarum lilin panjang di atas (wick rejection).",
          "3. Entry Sell searah tren utama dengan Stop Loss aman tepat di atas garis tren."
        ]
      },
      {
        term: "Trendline False Break",
        fullName: "Tembus Palsu Lalu Ambruk (Bull Trap)",
        description: "Harga seolah-olah menembus garis tren turun ke atas untuk memancing orang membeli (Breakout). Namun kenaikan itu gagal bertahan dan harga ditarik jatuh kembali ke bawah garis. Buyer yang terjebak panik dan memicu aksi jual masif.",
        steps: [
          "1. Harga menembus garis tren turun ke atas, namun tanpa dorongan volume/candle besar yang meyakinkan.",
          "2. Harga mencoba bertahan di atas garis tapi gagal dan langsung ditutup kembali di bawah garis.",
          "3. Entry Sell begitu harga kembali berada di bawah garis, manfaatkan momentum panik dari buyer yang terjebak."
        ]
      }
    ],
    rules: [
      "Jangan pernah melawan arah struktur Higher Timeframe (H4 / D1).",
      "BOS valid membutuhkan penutupan body candle di luar level swing, bukan hanya sumbu (wick).",
      "Waspadai internal structure: Jangan anggap pullback kecil sebagai pembalikan tren sebelum External Swing tertembus.",
      "Setelah terjadi CHoCH/MSS, jangan langsung FOMO mengejar harga; tunggu fase koreksi (pullback) menuju POI."
    ]
  },
  {
    id: "poi",
    title: "2. Point of Interest (POI)",
    subtitle: "Area & Level Kunci Keputusan Entry",
    tag: "Zona Eksekusi",
    color: "#b2ff05",
    image: "/concepts/poi-zones.png",
    description:
      "Point of Interest (POI) adalah area spesifik pada chart di mana terdapat probabilitas tertinggi institusi/smart money akan melakukan intervensi atau harga bereaksi memantul. POI menyaring seluruh chart agar Anda hanya fokus pada zona yang benar-benar bernilai tinggi.",
    whyItMatters:
      "Menghilangkan kebiasaan trading di 'antah berantah' (tengah-tengah range) dan memberikan rasio Risk-to-Reward (R:R) maksimal dengan Stop Loss yang sangat ketat.",
    components: [
      {
        term: "Order Block (OB)",
        fullName: "Institutional Order Block",
        description: "Candle berlawanan arah terakhir sebelum terjadinya pergerakan impulsif besar pembentuk BOS/CHoCH. Merupakan jejak penumpukan order beli/jual institusi yang belum termitigasi.",
        steps: [
          "Cari candle turun terakhir (merah) sebelum rally impulsif naik.",
          "Zona body candle itu ditandai sebagai Order Block (kotak biru).",
          "Saat harga retest zona OB dan tertolak → eksekusi Buy, SL di bawah OB."
        ]
      },
      {
        term: "Breaker Block (BB)",
        fullName: "Failed Order Block Polarity Flip",
        description: "Order Block yang gagal menahan harga dan tertembus secara agresif, lalu bertransformasi menjadi level pantulan kuat dari arah sebaliknya (Support become Resistance).",
        steps: [
          "Order Block bullish dibentuk, tapi harga justru menembusnya ke bawah dengan body penuh.",
          "Zona OB yang gagal berubah status menjadi Breaker Block (resistensi baru).",
          "Harga pullback menguji sisi bawah Breaker lalu tertolak → eksekusi Sell."
        ]
      },
      {
        term: "FVG",
        fullName: "Fair Value Gap / Imbalance",
        description: "Celah harga 3-candle di mana pergerakan satu arah terjadi sangat cepat tanpa perlawanan, meninggalkan inefisiensi yang cenderung ditutup kembali seperti magnet.",
        steps: [
          "Candle 1 membentuk high, candle 2 melesat impulsif, candle 3 membentuk low.",
          "Celah antara High C1 dan Low C3 = FVG (kotak hijau).",
          "Harga cenderung kembali mengisi celah ini. Entry saat harga masuk zona FVG searah tren."
        ]
      },
      {
        term: "Inversion FVG (IFVG)",
        fullName: "Violated FVG Turned Support/Resist",
        description: "FVG gagal yang berbalik polaritas (mirip Support Become Resistance). FVG Bullish yang ditembus bersih ke bawah berubah status menjadi Resistance kuat saat di-retest dari bawah untuk Sell Entry.",
        steps: [
          "FVG bullish terbentuk dari 3 candle naik (zona kuning).",
          "Satu candle merah besar menembus & close di bawah zona → FVG gagal (inverted).",
          "Harga pullback menguji sisi bawah zona lalu tertolak → SELL. SL di atas zona."
        ]
      },
      {
        term: "Consequent Encroachment (CE)",
        fullName: "50% FVG / Midpoint Imbalance",
        description: "Garis tengah (50%) dari sebuah FVG. ICT menyebutnya Consequent Encroachment — titik paling presisi di dalam imbalance. Harga sering bereaksi tepat di CE, bukan di tepi FVG, sehingga entry di CE memberi Stop Loss jauh lebih tipis.",
        steps: [
          "Ukur tinggi FVG (dari high C1 ke low C3), lalu tarik garis tepat di 50%-nya.",
          "Tunggu harga masuk FVG dan berhenti tepat di garis CE — biasanya muncul rejection kecil di situ.",
          "Entry di CE dengan SL hanya sedikit di atas/bawah garis. R:R jauh lebih besar daripada entry di tepi FVG."
        ]
      },
      {
        term: "Balanced Price Range (BPR)",
        fullName: "Overlapping Opposite FVG",
        description: "Dua FVG berlawanan arah yang saling menumpuk. Ketika FVG naik dan FVG turun bertumpuk, area overlap-nya disebut BPR — area yang sudah 'seimbang' dan menjadi level reaksi sangat kuat karena dua inefisiensi bertemu di satu harga.",
        steps: [
          "FVG naik terbentuk saat displacement bullish, FVG turun terbentuk saat displacement bearish berikutnya.",
          "Area tempat keduanya bertumpuk (overlap) = BPR. Tandai kotak itu.",
          "Saat harga kembali ke BPR, reaksinya biasanya tajam. Entry di overlap, SL di luar BPR."
        ]
      },
      {
        term: "Supply & Demand Zone",
        fullName: "SMC Base Zone (Basis Candle)",
        description: "Fondasi SMC yang sebenarnya. Zona Supply adalah area di mana penjual institusi menumpuk order; zona Demand adalah area pembeli institusi. Berbeda dengan ICT Order Block yang memakai satu candle terakhir, SMC memakai area 'base' (konsolidasi kecil) sebelum pergerakan impulsif keluar dari zona itu.",
        steps: [
          "Cari fase konsolidasi kecil (base) — biasanya 2–5 candle dengan body pendek.",
          "Setelah base, muncul pergerakan impulsif keluar zona yang menembus struktur (BOS). Base itulah zona Supply/Demand.",
          "Harga kembali ke zona → entry searah impulsif tadi. Semakin kecil base, semakin presisi zona dan semakin tipis SL."
        ]
      },
      {
        term: "Mitigation Block",
        fullName: "Tested Order Block That Held",
        description: "Sering tertukar dengan Breaker Block. Mitigation Block adalah Order Block yang diuji kembali dan BERHASIL bertahan (tidak tertembus), lalu harga lanjut searah semula. Breaker = OB gagal (polaritas berbalik). Mitigation = OB berhasil (polaritas dipertahankan).",
        steps: [
          "Order Block terbentuk dari candle terakhir sebelum displacement naik.",
          "Harga kembali menguji zona OB tersebut — tapi kali ini zona itu menahan (tidak ditembus dengan body close).",
          "Karena OB berhasil 'dimiliki' (mitigated) dan bertahan, harga lanjut naik. Entry Buy di zona itu, SL di bawah OB."
        ]
      },
      {
        term: "Refined Order Block",
        fullName: "OB Body Only / High Probability OB",
        description: "Order Block versi kasar (whole candle termasuk wick) terlalu lebar untuk Stop Loss tipis. Refined OB mengambil hanya BODY candle OB — area open sampai close — karena di situlah order institusi benar-benar dieksekusi. Zona lebih sempit, SL lebih tipis, R:R jauh lebih besar.",
        steps: [
          "Tandai OB kasar: seluruh rentang candle terakhir sebelum displacement (open, close, high, low).",
          "Persempit ke body candle saja (open → close). Buang area wick yang tidak ada eksekusi order.",
          "Saat harga retest, entry di batas atas refined zone dengan SL di bawah body. R:R bisa 2–3× lebih baik dari OB kasar."
        ]
      },
      {
        term: "Volume Imbalance",
        fullName: "Body Gap dengan Wick Terhubung",
        description: "Celah kecil di antara dua body candle yang wick-nya masih saling terhubung. Berbeda dengan FVG yang punya ruang kosong total, Volume Imbalance hanya 'bolong' di bagian body — menandakan volume tidak seimbang tapi harga masih tersambung. Sering jadi magnet retest jangka pendek.",
        steps: [
          "Cari dua candle berurutan yang body-nya tidak bertemu (ada celah), tapi wick-nya masih bersambung.",
          "Celah body itu = Volume Imbalance. Ukurannya biasanya kecil (beberapa poin saja).",
          "Harga cenderung kembali menutup celah body tersebut sebelum lanjut. Bisa dipakai sebagai target partial atau konfirmasi entry."
        ]
      },
      {
        term: "Liquidity Void",
        fullName: "Big Body Gap / True Inefficiency",
        description: "Versi ekstrem dari imbalance: celah BESAR tanpa transaksi sama sekali — baik body maupun wick tidak tersambung. Terjadi saat news atau displacement agresif. Harga hampir selalu kembali mengisi void ini karena di area itu tidak ada pembeli/penjual yang bertransaksi.",
        steps: [
          "Cari pergerakan satu candle raksasa (biasanya saat news) yang meninggalkan ruang kosong total di bawah/atasnya.",
          "Ruang kosong itu = Liquidity Void. Beda dengan FVG: void jauh lebih lebar dan tidak punya wick penghubung.",
          "Harga akan kembali mengisi void (rebalance) sebelum arah tren berlanjut. Gunakan sebagai target take profit, bukan entry langsung."
        ]
      },
      {
        term: "BISI / SIBI",
        fullName: "Buy-Side / Sell-Side Imbalance",
        description: "Penamaan ICT untuk imbalance berdasarkan sisi mana yang tidak efisien. BISI (Buy-Side Imbalance, Sell-Side Inefficiency) = harga naik terlalu cepat sehingga sisi jual kosong; biasanya diisi saat retrace turun. SIBI (Sell-Side Imbalance, Buy-Side Inefficiency) = harga turun terlalu cepat sehingga sisi beli kosong.",
        steps: [
          "BISI muncul saat displacement NAIK: sisi jual tidak terisi. Zona ini ada di bawah harga, jadi harga retrace TURUN untuk mengisinya.",
          "SIBI muncul saat displacement TURUN: sisi beli tidak terisi. Zona ini ada di atas harga, jadi harga retrace NAIK untuk mengisinya.",
          "BISI dipakai untuk entry Buy (retest dari atas), SIBI untuk entry Sell (retest dari bawah). Arah pengisian selalu berlawanan dengan arah displacement."
        ]
      },
      {
        term: "PD Array",
        fullName: "Premium / Discount Array",
        description: "Daftar semua POI ICT yang dikelompokkan berdasarkan letaknya terhadap equilibrium 50%. Di area Premium (>50%) hanya boleh mencari Sell, dan array-nya berisi OB bearish, FVG bearish, Breaker bearish. Di area Discount (<50%) hanya boleh Buy, dengan array OB bullish, FVG bullish, Breaker bullish.",
        steps: [
          "Tarik range swing terakhir, lalu bagi dua di 50% (equilibrium).",
          "Area di atas 50% = Premium Array → daftar semua POI bearish (OB, FVG, Breaker) untuk Sell.",
          "Area di bawah 50% = Discount Array → daftar semua POI bullish untuk Buy. Pilih POI yang paling dekat harga saat ini, bukan yang paling jauh."
        ]
      },
      {
        term: "Support & Resistance",
        fullName: "Key Horizontal Levels",
        description: "Level klasik batas lantai penahan beli (Support) dan batas atap penahan jual (Resistance). Menjadi sangat kuat saat bertransformasi (RBS/SBR).",
        steps: [
          "Garis biru = level Support yang sudah diuji beberapa kali.",
          "Harga menembus Support dengan body close di bawahnya.",
          "Saat harga naik menguji level itu dari bawah dan tertolak (SBR) → eksekusi Sell."
        ]
      },
      {
        term: "SMC Order Block",
        fullName: "Base Order Block SMC",
        description: "Beda halus tapi penting dari OB ICT. OB ICT memakai SATU candle terakhir sebelum displacement. OB SMC memakai seluruh area BASE — yaitu 2–5 candle konsolidasi kecil sebelum impuls keluar. Zonanya lebih lebar tapi lebih tahan banting karena mewakili seluruh fase akumulasi, bukan satu candle.",
        steps: [
          "Cari fase base: 2–5 candle dengan body pendek yang bergerak menyamping.",
          "Setelah base, muncul impuls besar yang keluar dari zona dan menembus struktur (BOS). Seluruh area base itulah OB SMC.",
          "Saat harga retest area base, entry searah impuls. Karena zonanya lebar, entry bisa di tepi terdekat agar SL lebih tipis."
        ]
      },
      {
        term: "SMC Liquidity Void",
        fullName: "Void Setelah Base (SMC)",
        description: "Dalam SMC, liquidity void dibaca sebagai konsekuensi dari base: setelah fase konsolidasi, harga meledak keluar dan meninggalkan ruang kosong. Void ini adalah 'jejak' ketidakseimbangan antara order yang menumpuk di base dan order yang tersedia di sisi lawan. Harga cenderung kembali mengisi void sebelum melanjutkan tren.",
        steps: [
          "Temukan base konsolidasi, lalu perhatikan candle impuls yang keluar darinya.",
          "Ruang kosong yang ditinggalkan impuls itu (dari body terakhir base ke body pertama setelah impuls) = liquidity void.",
          "Harga akan kembali mengisi void tersebut (rebalance). Jadikan itu target take profit, bukan area entry."
        ]
      },
      {
        term: "SMC Premium / Discount",
        fullName: "Range Premium & Discount (SMC)",
        description: "SMC memakai konsep yang sama dengan ICT tapi dengan penekanan pada RANGE: tarik range dari swing high ke swing low terakhir, lalu bagi dua. Di atas 50% (premium) hanya cari Sell, di bawah 50% (discount) hanya cari Buy. Bedanya dengan ICT: SMC tidak memakai PD Array berlapis, cukup satu POI di area yang benar.",
        steps: [
          "Tarik range dari swing high terakhir ke swing low terakhir. Bagi dua di 50% = equilibrium.",
          "Harga di atas 50% = premium → hanya boleh cari setup Sell di zona supply.",
          "Harga di bawah 50% = discount → hanya boleh cari setup Buy di zona demand. Kalau setup muncul di area yang salah, lewati."
        ]
      },
      {
        term: "SMC Mitigation",
        fullName: "Mitigasi Zona Supply / Demand (SMC)",
        description: "Dalam SMC, 'mitigasi' berarti zona sudah dipakai dan order di dalamnya sudah terisi. Zona yang sudah dimitigasi kehilangan tenaganya — kalau harga kembali ke sana lagi, kemungkinan besar akan jebol. Ini kebalikan dari istilah ICT 'Mitigation Block' yang justru berarti zona masih valid.",
        steps: [
          "Setelah zona supply/demand terbentuk, perhatikan saat harga kembali menyentuhnya pertama kali.",
          "Sentuhan pertama = mitigasi. Order di zona itu terisi, dan reaksinya biasanya kuat.",
          "Setelah dimitigasi, tandai zona itu sebagai 'habis'. Kalau harga kembali untuk kedua/ketiga kalinya, jangan entry di sana — kemungkinan besar jebol."
        ]
      },
      {
        term: "Body Zone (MSNR)",
        fullName: "Zona Entry dari Body Candle (MSNR)",
        description: "Ciri paling khas MSNR: zona entry diambil dari BODY candle, bukan full range termasuk wick. Alasannya, wick adalah area di mana harga hanya 'mampir' — sedangkan body adalah area di mana transaksi benar-benar terjadi. Zona body jauh lebih sempit sehingga Stop Loss bisa sangat tipis.",
        steps: [
          "Tandai candle pembentuk level (candle terakhir sebelum pergerakan besar).",
          "Ambil zona dari OPEN ke CLOSE candle itu saja — buang seluruh area wick di atas dan bawahnya.",
          "Entry saat harga retest zona body tersebut. SL di luar body, bukan di luar wick. Hasilnya SL jauh lebih tipis dan R:R lebih besar."
        ]
      },
      {
        term: "Level Stacking (MSNR)",
        fullName: "Beberapa Level Body Bertumpuk",
        description: "Ketika beberapa level body candle berkumpul dalam jarak berdekatan (misal 3 level dalam rentang 10–15 pips), kekuatannya berlipat. Ini disebut level stacking. Sebaliknya, level yang berdiri sendiri jauh lebih lemah. Semakin banyak level bertumpuk di satu area, semakin besar kemungkinan harga bereaksi di sana.",
        steps: [
          "Saat menandai level body, perhatikan apakah ada level body lain dalam jarak dekat (misal < 15 pips).",
          "Kalau ada 2–3 level bertumpuk dalam satu area sempit, tandai area itu sebagai zona kuat — bukan tiga level terpisah.",
          "Prioritaskan area stacking di atas level tunggal. Entry di area stacking, SL di luar area, target ke level berikutnya."
        ]
      },
      {
        term: "QML / Fresh Level",
        fullName: "Quasimodo Level (MSNR)",
        description: "Garis horizontal sejajar dengan body bahu kiri (Left Shoulder). Dalam konsep MSNR, level body yang belum pernah disentuh (fresh) memiliki daya pantul tinggi.",
        steps: [
          "Tandai Left Shoulder (LS) lalu tarik garis horizontal dari body-nya.",
          "Harga membentuk Head (puncak tertinggi) lalu turun membuat Lower Low (LL).",
          "Saat harga kembali menguji garis QML dari LS → eksekusi entry dengan SL tipis."
        ]
      },
      {
        term: "Mitigation Chain",
        fullName: "Orderflow Mitigation Cycle",
        description: "Rantai zona POI yang telah tersentuh dan terisi (mitigated) vs zona yang masih murni (unmitigated). Zona unmitigated memiliki probabilitas reaksi jauh lebih tinggi.",
        steps: [
          "Zona abu-abu = sudah dimitigasi (pernah disentuh) → daya pantul melemah.",
          "Zona biru = fresh/unmitigated, belum pernah diuji → probabilitas reaksi tinggi.",
          "Prioritaskan entry di zona fresh. Abaikan zona yang sudah termitigasi."
        ]
      },
      {
        term: "Premium vs Discount",
        fullName: "Equilibrium Pricing (50% Range)",
        description: "Konsep perbankan: Jangan pernah membeli di area mahal (Premium > 50%), carilah Buy di area diskon (< 50%) dan Sell di area premium (> 50%).",
        steps: [
          "Ukur range swing terakhir, tarik garis 50% sebagai Equilibrium.",
          "Area di atas 50% = Premium (mahal) → hanya untuk Sell.",
          "Area di bawah 50% = Discount (murah) → hanya untuk Buy."
        ]
      }
    ],
    rules: [
      "Hanya pilih Order Block yang berhasil memecahkan struktur (menyebabkan BOS atau CHoCH).",
      "Area POI yang terbaik selalu beriringan dengan Fair Value Gap (FVG) yang belum tersentuh.",
      "Jika Order Block tertembus, jangan panik: Tandai sebagai potensi Breaker Block untuk arah berlawanan.",
      "Tandai level tepat pada body candle jika menggunakan MSNR, atau full range candle jika menggunakan SMC Order Block."
    ]
  },
  {
    id: "liquidity-trigger",
    title: "3. Liquidity & Execution Trigger",
    subtitle: "Bahan Bakar Gerakan & Konfirmasi Akhir",
    tag: "Pemicu Eksekusi",
    color: "#ffaa00",
    image: "/concepts/liquidity-triggers.png",
    description:
      "Harga di pasar keuangan tidak bergerak karena garis indikator, melainkan digerakkan oleh pencarian LIKUIDITAS (kumpulan order Stop Loss). Institusi membutuhkan volume besar untuk mengisi posisi mereka. Ketika likuiditas tersapu (sweep), itulah momen pergerakan sebenarnya dimulai.",
    whyItMatters:
      "Mengubah posisi Anda dari korban 'stop hunt' menjadi pemburu bersama pergerakan uang pintar (smart money).",
    components: [
      {
        term: "BSL & SSL",
        fullName: "Buy-Side & Sell-Side Liquidity",
        description: "BSL: Kumpulan Stop Loss trader penjual di atas swing high/Equal Highs. SSL: Kumpulan Stop Loss trader pembeli di bawah swing low/Equal Lows.",
        steps: [
          "Titik kuning di atas = BSL: stop loss para seller menumpuk di atas equal highs.",
          "Titik biru di bawah = SSL: stop loss para buyer menumpuk di bawah equal lows.",
          "Harga selalu tertarik menyapu pool ini sebelum bergerak arah sebenarnya."
        ]
      },
      {
        term: "PDH / PDL & PWH",
        fullName: "Previous Day & Week High / Low",
        description: "Level tertinggi dan terendah hari kemarin (PDH/PDL) atau minggu kemarin (PWH/PWL). Merupakan magnet likuiditas institusi terbesar yang sering disapu setiap sesi.",
        steps: [
          "Tarik garis PDH (high hari kemarin) dan PDL (low hari kemarin).",
          "Candle menusuk di atas PDH lalu close kembali di bawah → sweep PDH.",
          "Setelah sweep, harga berbalik menuju PDL → itulah target berikutnya."
        ]
      },
      {
        term: "Trendline Liquidity",
        fullName: "Diagonal Liquidity Pool",
        description: "Selain likuiditas horizontal (equal highs/lows), ada likuiditas diagonal yang menumpuk di sepanjang garis tren. Retail trader menggambar trendline dan menaruh stop loss tepat di belakangnya. Institusi tahu itu — karena itu trendline sering ditembus dulu sebelum harga berbalik.",
        steps: [
          "Gambar trendline dari 2–3 swing low/high yang rapi. Semakin sering disentuh, semakin banyak stop loss menumpuk di belakangnya.",
          "Perhatikan saat harga mendekati trendline: biasanya ada perlambatan (compression) karena retail menambah posisi.",
          "Harga menusuk trendline dengan wick panjang lalu close kembali di atasnya → trendline liquidity tersapu. Entry setelah reversal, bukan saat tusukan."
        ]
      },
      {
        term: "Judas Swing",
        fullName: "False Move Awal Sesi",
        description: "Gerakan palsu di awal sesi (biasanya London open atau New York open) yang sengaja dibuat untuk menipu. Harga bergerak tajam ke satu arah — memancing retail ikut masuk — lalu berbalik keras ke arah sebenarnya. Ini adalah fase 'Manipulation' pada Power of 3, dan biasanya menjadi titik awal tren harian.",
        steps: [
          "Sebelum sesi dibuka, harga konsolidasi sempit. Tandai high & low range Asia/pre-session.",
          "Sesi dibuka: harga melesat ke arah BERLAWANAN dari tren asli, menembus low (atau high) range dengan wick tajam. Retail ikut masuk — mereka terjebak.",
          "Harga berbalik keras dan bergerak ke arah sebenarnya sepanjang sesi. Entry setelah reversal terkonfirmasi, bukan saat tusukan Judas."
        ]
      },
      {
        term: "Silver Bullet",
        fullName: "ICT Silver Bullet Setup (Time-Based FVG)",
        description: "Setup waktu-spesifik ICT: hanya berlaku pada window 1 jam tertentu (10:00–11:00, 14:00–15:00, atau 15:00–16:00 New York). Dalam window itu, cari FVG yang terbentuk dari displacement, lalu entry saat retest. Di luar window tersebut, sinyalnya tidak valid — sekadar FVG biasa.",
        steps: [
          "Tunggu window waktu yang tepat: 10–11 AM, 2–3 PM, atau 3–4 PM New York time. Di luar itu, jangan pakai setup ini.",
          "Di dalam window, cari displacement yang meninggalkan FVG. Zona FVG itu adalah satu-satunya POI yang dipakai.",
          "Entry saat harga retest FVG tersebut, SL di sisi lain FVG, target ke likuiditas terdekat. Kalau window berakhir sebelum entry, batalkan."
        ]
      },
      {
        term: "Liquidity Sweep",
        fullName: "Stop Hunt / Turtle Soup / Judas Swing",
        description: "Tusukan jarum tajam (wick) yang menembus level kunci hanya untuk melikuidasi retail trader, lalu harga langsung berbalik arah dengan cepat ke arah semula.",
        steps: [
          "Level likuiditas (equal highs) ditandai garis kuning.",
          "Muncul candle dengan wick panjang menusuk melewati level tersebut.",
          "Candle close kembali di bawah level → sweep sah. Harga reversal; entry berlawanan arah tusukan."
        ]
      },
      {
        term: "SMC Liquidity Sweep",
        fullName: "Liquidity Grab di Equal Highs/Lows (SMC)",
        description: "Versi SMC dari sweep, tapi penekanannya pada EQUAL HIGHS / EQUAL LOWS — dua swing yang berhenti di harga hampir sama. Bagi SMC, formasi itu adalah magnet likuiditas paling jelas karena semua trader melihat level yang sama. Sweep di equal lows adalah sinyal Buy paling kuat dalam SMC.",
        steps: [
          "Cari dua swing low yang berhenti di harga hampir sama (equal lows) — atau dua swing high (equal highs).",
          "Harga menusuk level tersebut dengan wick panjang, menembus jauh melewati equal lows.",
          "Setelah likuiditas tersapu, harga close kembali di atas level. Itu konfirmasi. Entry Buy setelah candle reversal, SL di bawah wick sweep."
        ]
      },
      {
        term: "MSNR Sweep",
        fullName: "Sapuan Level Body (MSNR)",
        description: "Dalam MSNR, sweep dibaca pada level BODY, bukan level wick. Harga menusuk level body dengan wick panjang lalu close kembali di sisi semula — tanda level body itu dihormati. Karena levelnya diambil dari body, sweep MSNR biasanya lebih dangkal dan SL bisa lebih tipis dibanding sweep pada level wick.",
        steps: [
          "Tandai level dari BODY candle (open–close), bukan dari wick high/low.",
          "Harga menusuk level body itu dengan wick, tapi body close kembali di sisi semula. Itu sapuan yang sah.",
          "Entry berlawanan arah tusukan. SL cukup di luar wick sweep, dan karena levelnya body, jaraknya lebih tipis daripada pakai level wick."
        ]
      },
      {
        term: "Inducement (IDM)",
        fullName: "Retail Trap Liquidity",
        description: "Inducement adalah level swing KECIL yang sengaja dibiarkan pasar terbentuk agar retail trader mengira itu support/resistance valid. Retail masuk terlalu dini di sana, lalu level itu justru disapu (stop loss mereka diambil) sebelum harga bergerak ke POI asli. Singkatnya: IDM = umpan, True OB = tujuan sebenarnya.",
        steps: [
          "Harga turun dan membentuk swing low kecil. Level ini terlihat seperti support sah (padahal umpan) → itulah IDM.",
          "Retail melihat 'support' dan langsung Buy di sana. Stop loss mereka menumpuk tepat di bawah level IDM.",
          "Harga justru menembus IDM ke bawah. Stop loss retail tersapu → likuiditas terkumpul. Ini yang disebut sweep IDM.",
          "Setelah retail terlikuidasi, harga berbalik naik dari True OB (POI asli). Barulah entry yang benar diambil di sini, bukan di IDM."
        ]
      },
      {
        term: "SMT Divergence",
        fullName: "Smart Money Technique (Correlation)",
        description: "Perbedaan pergerakan antara 2 aset berkorelasi (misal Gold membuat Higher High, tapi DXY gagal membuat Lower Low). Konfirmasi sweep paling valid.",
        steps: [
          "Bandingkan 2 chart berkorelasi: XAUUSD vs DXY (atau EURUSD).",
          "Aset A membuat Higher High, tapi aset B gagal membuat Higher High sejenis → divergensi.",
          "Divergensi = konfirmasi kuat bahwa sweep palsu; entry mengikuti arah aset yang gagal."
        ]
      },
      {
        term: "SMC Inducement",
        fullName: "Umpan Likuiditas (SMC)",
        description: "SMC menyebut inducement sebagai swing kecil yang sengaja dibiarkan sebelum zona supply/demand utama. Retail melihat swing itu sebagai support/resistance valid dan entry di sana — lalu swing itu disapu. Bedanya dengan ICT: SMC lebih sering menyebutnya 'liquidity trap' dan menekankan bahwa IDM harus berada SEBELUM POI, bukan sesudah.",
        steps: [
          "Identifikasi zona supply/demand utama (POI) yang belum tersentuh.",
          "Perhatikan swing kecil yang terbentuk JALAN MENUJU zona itu. Swing itulah IDM — umpan untuk retail.",
          "Retail entry di IDM dan stop loss mereka tersapu saat harga menembusnya. Barulah harga masuk ke POI utama dan reversal. Entry di POI, bukan di IDM."
        ]
      },
      {
        term: "Time Killzones",
        fullName: "Algorithmic Delivery Hours",
        description: "Jendela waktu utama saat algoritma bank aktif: London Open (07:00-10:00 UTC) dan New York AM (12:00-15:00 UTC). Setup di luar killzone cenderung lambat/fakeout.",
        steps: [
          "Sesi Asia: range sempit dan datar (ditandai kotak abu-abu).",
          "London Killzone (kotak biru): volatilitas meledak, sering menyapu range Asia.",
          "New York Killzone (kotak kuning): lanjutan tren atau reversal. Eksekusi hanya di dalam kotak."
        ]
      },
      {
        term: "OTE",
        fullName: "Optimal Trade Entry (Fibonacci 62-79%)",
        description: "Zona emas Fibonacci retracement 62% - 79% di dalam FVG setelah terjadi sweep dan displacement, memberikan Risk to Reward terbaik.",
        steps: [
          "Tandai swing low (0.0) dan swing high (1.0) dari impulse terakhir.",
          "Tarik Fibonacci retracement; zona 62% – 79% adalah area OTE.",
          "Tunggu harga masuk zona OTE + konfirmasi → entry dengan SL di bawah 1.0."
        ]
      },
      {
        term: "Execution Trigger",
        fullName: "Final Confirmation Signal",
        description: "Sinyal pemicu di timeframe kecil (M1/M5) saat harga sudah berada di dalam POI, seperti pola Pinbar Rejection, Engulfing, atau mikro CHoCH.",
        steps: [
          "Harga sudah masuk ke zona POI (kotak biru).",
          "Candle 1 membentuk pinbar berekor panjang menolak zona tersebut.",
          "Candle 2 engulfing mengonfirmasi → eksekusi entry, SL di bawah ekor pinbar."
        ]
      }
    ],
    rules: [
      "Jangan masuk trade sebelum ada likuiditas (BSL/SSL, PDH/PDL, atau Inducement) yang tersapu terlebih dahulu.",
      "Jika Anda tidak bisa menemukan di mana likuiditas berada di chart, berarti posisi Anda sendiri yang akan menjadi likuiditasnya.",
      "Prioritaskan eksekusi hanya di dalam jendela jam Killzone (London Open & New York Open).",
      "Gunakan konfirmasi LTF (Lower Timeframe) di dalam POI untuk memperkecil risiko Stop Loss."
    ]
  }
];

/* ------------------------------------------------------------------ */
/* Framework separation: ICT vs SMC vs MSNR vs Universal               */
/* ------------------------------------------------------------------ */

type Framework = "ICT" | "SMC" | "MSNR" | "Universal";

const FRAMEWORK_META: Record<
  Framework,
  { label: string; color: string; origin: string; blurb: string }
> = {
  ICT: {
    label: "ICT",
    color: "#00d2ff",
    origin: "Inner Circle Trader · Michael J. Huddleston",
    blurb:
      "Berbasis likuiditas & waktu. Harga digerakkan algoritma untuk mengambil stop loss, lalu dikirim ke PD Array (FVG, OB, Breaker) pada jam tertentu (Killzone)."
  },
  SMC: {
    label: "SMC",
    color: "#b2ff05",
    origin: "Komunitas Smart Money Concept · turunan ICT",
    blurb:
      "Berbasis struktur visual. Fokus pada BOS/CHoCH untuk menentukan arah, lalu entry di zona supply-demand. Istilahnya lebih sederhana dari ICT."
  },
  MSNR: {
    label: "MSNR",
    color: "#ffaa00",
    origin: "Market Structure & New Range · gaya body-based",
    blurb:
      "Berbasis level body candle yang masih fresh (belum pernah disentuh). Level diambil dari body, bukan full wick, sehingga SL jauh lebih tipis."
  },
  Universal: {
    label: "Universal",
    color: "#8c8c8c",
    origin: "Price action klasik · dipakai semua aliran",
    blurb:
      "Konsep dasar yang tidak dimiliki satu aliran saja: struktur high/low, level support-resistance, dan pola konfirmasi candle."
  }
};

const FRAMEWORK_ORDER: Framework[] = ["ICT", "SMC", "MSNR", "Universal"];

/* ------------------------------ level: dasar vs lanjutan ------------------------------ */

type Level = "dasar" | "lanjutan";

const LEVEL_META: Record<Level, { label: string; color: string; blurb: string }> = {
  dasar: {
    label: "Dasar",
    color: "#b2ff05",
    blurb: "Wajib dikuasai dulu. Kalau ini belum hafal, konsep lanjutan hanya akan membingungkan."
  },
  lanjutan: {
    label: "Lanjutan",
    color: "#8c8c8c",
    blurb: "Detail & variasi. Buka setelah dasar-dasarnya sudah otomatis, bukan dihafal."
  }
};

/**
 * Hanya istilah yang masuk daftar ini yang dianggap "Lanjutan".
 * Sisanya otomatis "Dasar" — supaya konsep baru tidak pernah hilang dari tampilan.
 */
const ADVANCED_TERMS = new Set<string>([
  // Market Structure
  "Internal vs External",
  "Strong vs Weak Swing",
  "CISD",
  "MMBM / MMSM",
  "Swing Failure Pattern",
  "Level Stacking (MSNR)",
  "Trendline Throw-over",
  "Trendline False Break",
  // POI
  "Mitigation Block",
  "Refined Order Block",
  "Consequent Encroachment (CE)",
  "Balanced Price Range (BPR)",
  "Volume Imbalance",
  "Liquidity Void",
  "BISI / SIBI",
  "PD Array",
  "Mitigation Chain",
  "SMC Order Block",
  "SMC Liquidity Void",
  "SMC Mitigation",
  // Liquidity
  "Silver Bullet",
  "SMT Divergence",
  "OTE",
  "SMC Liquidity Sweep",
  "SMC Inducement"
]);

const levelOf = (term: string): Level => (ADVANCED_TERMS.has(term) ? "lanjutan" : "dasar");

const COMPONENT_FRAMEWORK: Record<string, Framework> = {
  // Market Structure
  "HH & HL": "Universal",
  "LH & LL": "Universal",
  BOS: "SMC",
  CHoCH: "SMC",
  MSS: "ICT",
  "Internal vs External": "ICT",
  "Strong vs Weak Swing": "ICT",
  "MTF Fractal": "ICT",
  "Power of 3 (AMD)": "ICT",
  CISD: "ICT",
  "Body-Close Rule": "Universal",
  "MMBM / MMSM": "ICT",
  "Swing Failure Pattern": "SMC",
  "QML Structure": "MSNR",
  "Fresh Level": "MSNR",
  "Trendline Break": "Universal",
  "Trendline Throw-over": "ICT",
  "Trendline Rejection": "Universal",
  "Trendline False Break": "SMC",
  // POI
  "Order Block (OB)": "ICT",
  "Breaker Block (BB)": "ICT",
  "Mitigation Block": "ICT",
  "Refined Order Block": "ICT",
  FVG: "ICT",
  "Inversion FVG (IFVG)": "ICT",
  "Consequent Encroachment (CE)": "ICT",
  "Balanced Price Range (BPR)": "ICT",
  "Volume Imbalance": "ICT",
  "Liquidity Void": "ICT",
  "BISI / SIBI": "ICT",
  "PD Array": "ICT",
  "Supply & Demand Zone": "SMC",
  "SMC Order Block": "SMC",
  "SMC Liquidity Void": "SMC",
  "SMC Premium / Discount": "SMC",
  "SMC Mitigation": "SMC",
  "Trendline Liquidity": "SMC",
  "Body Zone (MSNR)": "MSNR",
  "Level Stacking (MSNR)": "MSNR",
  "Support & Resistance": "Universal",
  "QML / Fresh Level": "MSNR",
  "Mitigation Chain": "ICT",
  "Premium vs Discount": "ICT",
  // Liquidity
  "BSL & SSL": "ICT",
  "PDH / PDL & PWH": "ICT",
  "Liquidity Sweep": "ICT",
  "SMC Liquidity Sweep": "SMC",
  "MSNR Sweep": "MSNR",
  "Judas Swing": "ICT",
  "Silver Bullet": "ICT",
  "Inducement (IDM)": "ICT",
  "SMC Inducement": "SMC",
  "SMT Divergence": "ICT",
  "Time Killzones": "ICT",
  OTE: "ICT",
  "Execution Trigger": "Universal"
};

/** Istilah yang maknanya sama tapi namanya beda antar aliran. */const SYNONYM_TABLE: Array<{ meaning: string; ict: string; smc: string; msnr: string }> = [
  { meaning: "Struktur berlanjut searah tren", ict: "Market Structure Shift searah", smc: "BOS", msnr: "Break body swing" },
  { meaning: "Struktur berbalik arah", ict: "CISD / MSS", smc: "CHoCH", msnr: "Body break + close" },
  { meaning: "Zona entry institusi", ict: "PD Array (OB / FVG / Breaker)", smc: "Supply & Demand / OB", msnr: "Fresh body level (QML)" },
  { meaning: "Umpan sebelum POI asli", ict: "Inducement", smc: "IDM / liquidity trap", msnr: "Level minor yang belum fresh" },
  { meaning: "Ambil stop loss retail", ict: "Liquidity purge / Turtle Soup", smc: "Liquidity sweep", msnr: "Sapu level minor" },
  { meaning: "Area murah vs mahal", ict: "Discount / Premium (50%)", smc: "Premium / Discount", msnr: "Range bawah vs atas" },
  { meaning: "Titik presisi di dalam zona", ict: "Consequent Encroachment (CE 50%)", smc: "Midpoint supply/demand", msnr: "50% body level" },
  { meaning: "Zona dua inefisiensi bertumpuk", ict: "Balanced Price Range (BPR)", smc: "Overlap supply & demand", msnr: "Body bertumpuk" },
  { meaning: "Pola sesi institusi", ict: "Power of 3 (AMD)", smc: "Accumulation → Expansion", msnr: "Range → Breakout → Trend" },
  { meaning: "Likuiditas di sepanjang garis", ict: "Trendline liquidity (diagonal)", smc: "Trendline liquidity", msnr: "Sapu garis tren" },
  { meaning: "Tembus garis tren berbalik arah", ict: "Trendline purge + MSS", smc: "CHoCH + TL break", msnr: "Break body trendline" },
  { meaning: "Tembus palsu jebak retail", ict: "Judas swing / Overthrow", smc: "Inducement trap / False break", msnr: "Wick sweep garis tren" },
  { meaning: "Sisi mana yang tidak efisien", ict: "BISI / SIBI", smc: "Imbalance / gap", msnr: "Body kosong" },
  { meaning: "Syarat sah tembus level", ict: "Body close (wick tidak dihitung)", smc: "Candle close valid", msnr: "Body break + close" },
  { meaning: "Siklus lengkap institusi", ict: "MMBM / MMSM", smc: "Accumulation → Distribution", msnr: "Range → Sweep → Trend" },
  { meaning: "Gagal tembus level = reversal", ict: "Liquidity sweep / Turtle Soup", smc: "Swing Failure Pattern (SFP)", msnr: "Sapu body level" },
  { meaning: "Level yang belum pernah diuji", ict: "Fresh PD Array", smc: "Untested supply/demand", msnr: "Fresh level" },
  { meaning: "Beberapa level di satu harga", ict: "Confluence / PD Array overlap", smc: "Zone bertumpuk", msnr: "Level stacking" },
  { meaning: "Batas zona entry", ict: "Full range candle (wick ikut)", smc: "Base zone 2–5 candle", msnr: "Body candle saja" },
  { meaning: "Zona sudah terpakai / habis", ict: "Mitigation Block (masih valid)", smc: "Mitigated zone (sudah habis)", msnr: "Level sudah tested" }
];

export function TradingConceptsView() {
  const [selectedTab, setSelectedTab] = React.useState<string>("market-structure");
  const [frameworkFilter, setFrameworkFilter] = React.useState<"all" | Framework>("all");
  const [levelFilter, setLevelFilter] = React.useState<"all" | Level>("all");
  const [zoomImage, setZoomImage] = React.useState<{ url: string; title: string } | null>(null);

  const activeData = CONCEPTS.find((c) => c.id === selectedTab) ?? CONCEPTS[0];

  const frameworkOf = React.useCallback(
    (term: string): Framework => COMPONENT_FRAMEWORK[term] ?? "Universal",
    []
  );

  const counts = React.useMemo(() => {
    const base: Record<Framework, number> = { ICT: 0, SMC: 0, MSNR: 0, Universal: 0 };
    activeData.components.forEach((c) => {
      if (levelFilter !== "all" && levelOf(c.term) !== levelFilter) return;
      base[frameworkOf(c.term)] += 1;
    });
    return base;
  }, [activeData, frameworkOf, levelFilter]);

  const levelCounts = React.useMemo(() => {
    const base: Record<Level, number> = { dasar: 0, lanjutan: 0 };
    activeData.components.forEach((c) => {
      if (frameworkFilter !== "all" && frameworkOf(c.term) !== frameworkFilter) return;
      base[levelOf(c.term)] += 1;
    });
    return base;
  }, [activeData, frameworkFilter, frameworkOf]);

  const visibleCount = React.useMemo(
    () =>
      activeData.components.filter((c) => {
        if (frameworkFilter !== "all" && frameworkOf(c.term) !== frameworkFilter) return false;
        if (levelFilter !== "all" && levelOf(c.term) !== levelFilter) return false;
        return true;
      }).length,
    [activeData, frameworkFilter, levelFilter, frameworkOf]
  );

  const groups = React.useMemo(() => {
    return FRAMEWORK_ORDER.filter((f) => frameworkFilter === "all" || f === frameworkFilter)
      .map((f) => ({
        framework: f,
        meta: FRAMEWORK_META[f],
        items: activeData.components.filter(
          (c) =>
            frameworkOf(c.term) === f &&
            (levelFilter === "all" || levelOf(c.term) === levelFilter)
        )
      }))
      .filter((g) => g.items.length > 0);
  }, [activeData, frameworkFilter, levelFilter, frameworkOf]);

  const resetFilters = React.useCallback(() => {
    setFrameworkFilter("all");
    setLevelFilter("all");
  }, []);

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto p-1 bg-[#090909] border border-[#1a1a1a] rounded-lg">
          {CONCEPTS.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              className={cn(
                "py-2.5 px-3 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2",
                "data-[state=active]:bg-[#141414] data-[state=active]:text-foreground data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-[#262626]"
              )}
            >
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="truncate">{item.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-5 space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#1a1a1a] bg-[#090909] p-5">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-[#262626] bg-[#141414] text-xs font-mono" style={{ color: activeData.color }}>
                  {activeData.tag}
                </Badge>
                <h2 className="text-lg font-bold text-[#f2f2f0]">{activeData.title}</h2>
              </div>
              <p className="mt-1 text-xs text-[#8c8c8c]">{activeData.subtitle}</p>
            </div>
          </div>

          {/* Visual Candlestick Diagram Card */}
          <Card className="border-[#1a1a1a] bg-[#090909] overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[#f2f2f0]">
                  <span>Diagram Candlestick & Anatomi Setup</span>
                </CardTitle>
                <CardDescription className="text-xs text-[#8c8c8c]">
                  Klik gambar untuk melihat preview resolusi tinggi
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 border-[#262626] bg-[#141414] text-xs text-[#a0a0a0] hover:text-[#f2f2f0]"
                onClick={() => setZoomImage({ url: activeData.image, title: activeData.title })}
              >
                <Maximize2 className="h-3.5 w-3.5" />
                Zoom Chart
              </Button>
            </CardHeader>
            <CardContent className="pt-2">
              <div
                onClick={() => setZoomImage({ url: activeData.image, title: activeData.title })}
                className="group relative aspect-[16/8] cursor-pointer overflow-hidden rounded-lg border border-[#1a1a1a] bg-black"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeData.image}
                  alt={activeData.title}
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1 text-xs font-semibold text-[#f2f2f0] border border-[#262626]">
                    <Maximize2 className="h-3.5 w-3.5" /> Klik untuk Perbesar
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overview & Why it Matters Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-[#1a1a1a] bg-[#090909]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#5c5c5c] flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-[#00d2ff]" />
                  Definisi & Konsep
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs leading-relaxed text-[#c4c4c4]">
                  {activeData.description}
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#1a1a1a] bg-[#090909]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#5c5c5c] flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#b2ff05]" />
                  Mengapa Ini Krusial?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs leading-relaxed text-[#c4c4c4]">
                  {activeData.whyItMatters}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Components Dictionary Grid */}
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold text-[#f2f2f0] flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: activeData.color }} />
                Komponen & Istilah Inti dalam {activeData.title.split(".")[1]}
              </h3>
              <span className="text-[10px] text-[#5c5c5c] font-mono">
                {visibleCount} dari {activeData.components.length} konsep · dipisah per aliran
              </span>
            </div>

            {/* Level toggle: Dasar / Lanjutan */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-1.5">
              <span className="px-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#5c5c5c]">
                Level
              </span>
              <button
                type="button"
                onClick={() => setLevelFilter("all")}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-[10.5px] font-semibold transition-colors",
                  levelFilter === "all"
                    ? "border-[#3a3a3a] bg-[#181818] text-[#f2f2f0]"
                    : "border-transparent bg-transparent text-[#707070] hover:text-[#b0b0b0]"
                )}
              >
                Semua ({activeData.components.length})
              </button>
              {(["dasar", "lanjutan"] as Level[]).map((lv) => {
                const meta = LEVEL_META[lv];
                const active = levelFilter === lv;
                return (
                  <button
                    key={lv}
                    type="button"
                    onClick={() => setLevelFilter(active ? "all" : lv)}
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-[10.5px] font-semibold transition-colors",
                      active
                        ? "bg-[#181818]"
                        : "border-transparent bg-transparent text-[#707070] hover:text-[#b0b0b0]"
                    )}
                    style={active ? { borderColor: `${meta.color}80`, color: meta.color } : undefined}
                  >
                    {meta.label} ({levelCounts[lv]})
                  </button>
                );
              })}
              <span className="ml-auto hidden px-1.5 text-[10px] text-[#5c5c5c] sm:block">
                {levelFilter === "all"
                  ? "Mulai dari Dasar, lanjut ke Lanjutan setelah hafal."
                  : LEVEL_META[levelFilter].blurb}
              </span>
            </div>

            {/* Framework filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFrameworkFilter("all")}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[10.5px] font-semibold transition-colors",
                  frameworkFilter === "all"
                    ? "border-[#3a3a3a] bg-[#181818] text-[#f2f2f0]"
                    : "border-[#1e1e1e] bg-[#0c0c0c] text-[#707070] hover:text-[#b0b0b0]"
                )}
              >
                Semua ({visibleCount})
              </button>
              {FRAMEWORK_ORDER.map((f) => {
                const meta = FRAMEWORK_META[f];
                const active = frameworkFilter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFrameworkFilter(active ? "all" : f)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold transition-colors",
                      active
                        ? "bg-[#181818]"
                        : "border-[#1e1e1e] bg-[#0c0c0c] text-[#707070] hover:text-[#b0b0b0]"
                    )}
                    style={
                      active
                        ? { borderColor: `${meta.color}80`, color: meta.color }
                        : undefined
                    }
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: meta.color, opacity: active ? 1 : 0.55 }}
                    />
                    {meta.label} ({counts[f]})
                  </button>
                );
              })}
            </div>

            {/* Empty state when the current filter combination has no entry */}
            {groups.length === 0 && (
              <div className="rounded-lg border border-dashed border-[#222] bg-[#0a0a0a] px-4 py-8 text-center">
                <p className="text-xs text-[#8c8c8c]">
                  Tidak ada konsep
                  {frameworkFilter !== "all" && (
                    <>
                      {" "}
                      <span className="font-bold text-[#f2f2f0]">{frameworkFilter}</span>
                    </>
                  )}
                  {levelFilter !== "all" && (
                    <>
                      {" "}
                      di level{" "}
                      <span className="font-bold text-[#f2f2f0]">
                        {LEVEL_META[levelFilter].label}
                      </span>
                    </>
                  )}{" "}
                  pada modul {activeData.title}.
                </p>
                <p className="mt-1 text-[10.5px] text-[#5c5c5c]">
                  Coba lepas salah satu filter — konsep ini mungkin ada di level atau aliran lain.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-3 rounded-full border border-[#2e2e2e] bg-[#141414] px-3 py-1 text-[10.5px] font-semibold text-[#b0b0b0] hover:text-[#f2f2f0]"
                >
                  Tampilkan semua
                </button>
              </div>
            )}

            {/* Grouped by framework */}
            {groups.map((group) => (
              <div key={group.framework} className="space-y-2.5">
                <div
                  className="flex flex-col gap-1 rounded-lg border-l-2 bg-[#0a0a0a] px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  style={{ borderLeftColor: group.meta.color }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold font-mono"
                      style={{
                        color: group.meta.color,
                        backgroundColor: `${group.meta.color}14`,
                        border: `1px solid ${group.meta.color}44`
                      }}
                    >
                      {group.meta.label}
                    </span>
                    <span className="text-[10.5px] text-[#707070]">{group.meta.origin}</span>
                  </div>
                  <span className="text-[10px] text-[#5c5c5c] sm:text-right sm:max-w-[52%]">
                    {group.meta.blurb}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((comp) => (
                    <div
                      key={comp.term}
                      className="rounded-lg border border-[#1a1a1a] bg-[#0c0c0c] p-3 space-y-2.5 transition-colors hover:border-[#262626] flex flex-col overflow-hidden"
                    >
                      {/* Mini Candlestick Diagram */}
                      <div className="relative aspect-[16/7] w-full overflow-hidden rounded-md border border-[#181818] bg-[#080808]">
                        <ConceptMiniChart id={comp.term} />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#f2f2f0] font-mono px-1.5 py-0.5 rounded bg-[#181818] border border-[#222]">
                          {comp.term}
                        </span>
                        <span className="text-[10px] text-[#707070] font-medium truncate max-w-[150px]">
                          {comp.fullName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className="rounded px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-wider"
                          style={{
                            color: LEVEL_META[levelOf(comp.term)].color,
                            backgroundColor: `${LEVEL_META[levelOf(comp.term)].color}14`,
                            border: `1px solid ${LEVEL_META[levelOf(comp.term)].color}33`
                          }}
                        >
                          {LEVEL_META[levelOf(comp.term)].label}
                        </span>
                        <span className="text-[9.5px] text-[#5c5c5c]">
                          {levelOf(comp.term) === "dasar"
                            ? "wajib dikuasai"
                            : "buka setelah dasar kuat"}
                        </span>
                      </div>

                      <p className="text-[11px] leading-relaxed text-[#8c8c8c]">
                        {comp.description}
                      </p>

                      {comp.steps && comp.steps.length > 0 && (
                        <div className="space-y-1.5 rounded-md border border-[#161616] bg-[#0a0a0a] p-2">
                          {comp.steps.map((step, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span
                                className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold"
                                style={{
                                  borderColor: `${group.meta.color}66`,
                                  color: group.meta.color,
                                  backgroundColor: `${group.meta.color}14`
                                }}
                              >
                                {i + 1}
                              </span>
                              <span className="text-[10.5px] leading-snug text-[#9a9a9a]">{step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Synonym / Terminology Map */}
          <Card className="border-[#1a1a1a] bg-[#090909]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#5c5c5c] flex items-center gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-[#00d2ff]" />
                Peta Istilah: ICT vs SMC vs MSNR
              </CardTitle>
              <CardDescription className="text-[10.5px] text-[#6b6b6b]">
                Satu konsep, tiga nama berbeda. Pakai tabel ini saat menonton video dari aliran yang berbeda.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#1e1e1e]">
                      <th className="py-2 pr-3 text-[10px] font-semibold uppercase tracking-wider text-[#5c5c5c]">
                        Makna
                      </th>
                      {FRAMEWORK_ORDER.filter((f) => f !== "Universal").map((f) => (
                        <th
                          key={f}
                          className="py-2 pr-3 text-[10px] font-bold uppercase tracking-wider"
                          style={{ color: FRAMEWORK_META[f].color }}
                        >
                          {FRAMEWORK_META[f].label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SYNONYM_TABLE.map((row) => (
                      <tr key={row.meaning} className="border-b border-[#141414] last:border-0">
                        <td className="py-2 pr-3 text-[11px] text-[#c4c4c4]">{row.meaning}</td>
                        <td className="py-2 pr-3 text-[10.5px] text-[#8c8c8c]">{row.ict}</td>
                        <td className="py-2 pr-3 text-[10.5px] text-[#8c8c8c]">{row.smc}</td>
                        <td className="py-2 pr-3 text-[10.5px] text-[#8c8c8c]">{row.msnr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Golden Rules Checklist */}
          <Card className="border-[#1a1a1a] bg-[#090909]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#5c5c5c] flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-[#ffaa00]" />
                Aturan Emas (Golden Rules)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeData.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[#a0a0a0]">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#181818] border border-[#262626] text-[10px] font-mono text-[#b2ff05]">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{rule}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Tabs>

      {/* Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setZoomImage(null)}
        >
          <div
            className="relative max-h-[92vh] max-w-5xl overflow-hidden rounded-xl border border-[#262626] bg-[#090909] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1a1a1a] px-4 py-3 bg-[#0c0c0c]">
              <span className="text-xs font-bold text-[#f2f2f0]">{zoomImage.title}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7 text-[#8c8c8c] hover:text-white"
                onClick={() => setZoomImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-3 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={zoomImage.url} alt={zoomImage.title} className="w-full h-auto object-contain max-h-[78vh]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
