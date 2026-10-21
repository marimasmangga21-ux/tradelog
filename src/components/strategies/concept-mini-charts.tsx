"use client";

import * as React from "react";

const BULL = "#b2ff05";
const BEAR = "#ff4d4d";
const BLUE = "#00d2ff";
const AMBER = "#ffaa00";
const DIM = "#7a7a7a";
const FAINT = "#3a3a3a";

interface MiniChartProps {
  id: string;
}

/* ---------------------------------- helpers --------------------------------- */

interface CandleProps {
  x: number;
  o: number;
  c: number;
  h?: number;
  l?: number;
  w?: number;
  fill?: string;
}

function Candle({ x, o, c, h, l, w = 9, fill }: CandleProps) {
  const color = fill ?? (c <= o ? BULL : BEAR);
  const top = Math.min(o, c);
  const bodyH = Math.max(Math.abs(c - o), 1.2);
  const high = h ?? top - 3;
  const low = l ?? Math.max(o, c) + 3;
  return (
    <g>
      <line x1={x} y1={high} x2={x} y2={low} stroke={color} strokeWidth={1.1} strokeLinecap="round" />
      <rect x={x - w / 2} y={top} width={w} height={bodyH} fill={color} rx={1} />
    </g>
  );
}

interface TxtProps {
  x: number;
  y: number;
  children: React.ReactNode;
  color?: string;
  size?: number;
  anchor?: "start" | "middle" | "end";
  bold?: boolean;
}

function Txt({ x, y, children, color = DIM, size = 5.8, anchor = "middle", bold = false }: TxtProps) {
  return (
    <text x={x} y={y} fill={color} fontSize={size} fontWeight={bold ? "bold" : "normal"} textAnchor={anchor}>
      {children}
    </text>
  );
}

interface ZoneProps {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  label?: string;
  labelX?: number;
  labelY?: number;
  solid?: boolean;
  opacity?: number;
  labelAnchor?: "start" | "middle" | "end";
}

function Zone({ x, y, w, h, color, label, labelX, labelY, solid = false, opacity = 0.14, labelAnchor = "middle" }: ZoneProps) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={color}
        fillOpacity={opacity}
        stroke={color}
        strokeOpacity={0.85}
        strokeWidth={0.9}
        strokeDasharray={solid ? undefined : "3 2"}
      />
      {label ? (
        <text
          x={labelX ?? x + w / 2}
          y={labelY ?? y + h / 2 + 2}
          fill={color}
          fontSize={5.6}
          fontWeight="bold"
          textAnchor={labelAnchor}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

interface LevelProps {
  y: number;
  color: string;
  from?: number;
  to?: number;
  label?: string;
  labelX?: number;
  labelY?: number;
  labelAnchor?: "start" | "middle" | "end";
  solid?: boolean;
}

function Level({ y, color, from = 10, to = 232, label, labelX, labelY, labelAnchor = "start", solid = false }: LevelProps) {
  return (
    <g>
      <line
        x1={from}
        y1={y}
        x2={to}
        y2={y}
        stroke={color}
        strokeWidth={1}
        strokeDasharray={solid ? undefined : "4 3"}
        strokeOpacity={0.8}
      />
      {label ? (
        <text
          x={labelX ?? from + 3}
          y={labelY ?? y - 3}
          fill={color}
          fontSize={5.6}
          fontWeight="bold"
          textAnchor={labelAnchor}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

interface BadgeProps {
  x: number;
  y: number;
  n: string | number;
  color?: string;
}

function Badge({ x, y, n, color = AMBER }: BadgeProps) {
  return (
    <g>
      <circle cx={x} cy={y} r={5.2} fill="#0b0b0b" stroke={color} strokeWidth={0.9} />
      <text x={x} y={y + 2} fill={color} fontSize={6} fontWeight="bold" textAnchor="middle">
        {n}
      </text>
    </g>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 240 105" className="w-full h-full bg-[#080808]">
      {children}
    </svg>
  );
}

/* --------------------------------- diagrams -------------------------------- */

export function ConceptMiniChart({ id }: MiniChartProps) {
  switch (id) {
    // ==========================================
    // 1. MARKET STRUCTURE
    // ==========================================
    case "HH & HL":
      return (
        <Frame>
          <line x1="52" y1="44" x2="162" y2="24" stroke={BLUE} strokeWidth="0.8" strokeDasharray="4 3" strokeOpacity="0.4" />
          <line x1="74" y1="74" x2="188" y2="52" stroke={BULL} strokeWidth="0.8" strokeDasharray="4 3" strokeOpacity="0.4" />
          <Candle x={26} o={78} c={70} h={66} l={82} />
          <Candle x={52} o={70} c={52} h={44} l={74} />
          <Candle x={78} o={52} c={64} h={48} l={72} />
          <Candle x={104} o={64} c={42} h={34} l={68} />
          <Candle x={130} o={42} c={56} h={38} l={64} />
          <Candle x={156} o={56} c={32} h={24} l={60} />
          <Candle x={182} o={32} c={46} h={28} l={54} />
          <Candle x={208} o={46} c={26} h={18} l={50} />
          <Txt x={52} y={38} color={BLUE} bold>HH 1</Txt>
          <Txt x={78} y={84} color={BULL} bold>HL 1</Txt>
          <Txt x={104} y={28} color={BLUE} bold>HH 2</Txt>
          <Txt x={130} y={76} color={BULL} bold>HL 2</Txt>
          <Txt x={156} y={18} color={BLUE} bold>HH 3</Txt>
          <Txt x={182} y={66} color={BULL} bold>HL 3</Txt>
          <Badge x={26} y={58} n={1} color={BLUE} />
          <Badge x={78} y={96} n={2} color={BULL} />
          <Badge x={208} y={10} n={3} color={AMBER} />
        </Frame>
      );

    case "LH & LL":
      return (
        <Frame>
          <line x1="78" y1="34" x2="188" y2="54" stroke={AMBER} strokeWidth="0.8" strokeDasharray="4 3" strokeOpacity="0.4" />
          <line x1="52" y1="54" x2="162" y2="76" stroke={BEAR} strokeWidth="0.8" strokeDasharray="4 3" strokeOpacity="0.4" />
          <Candle x={26} o={22} c={30} h={18} l={34} />
          <Candle x={52} o={30} c={48} h={26} l={54} />
          <Candle x={78} o={48} c={38} h={34} l={52} />
          <Candle x={104} o={38} c={60} h={34} l={66} />
          <Candle x={130} o={60} c={48} h={44} l={64} />
          <Candle x={156} o={48} c={70} h={44} l={76} />
          <Candle x={182} o={70} c={58} h={54} l={74} />
          <Candle x={208} o={58} c={78} h={54} l={84} />
          <Txt x={52} y={70} color={BEAR} bold>LL 1</Txt>
          <Txt x={78} y={26} color={AMBER} bold>LH 1</Txt>
          <Txt x={104} y={80} color={BEAR} bold>LL 2</Txt>
          <Txt x={130} y={36} color={AMBER} bold>LH 2</Txt>
          <Txt x={156} y={90} color={BEAR} bold>LL 3</Txt>
          <Txt x={182} y={46} color={AMBER} bold>LH 3</Txt>
          <Badge x={26} y={12} n={1} color={AMBER} />
          <Badge x={232} y={46} n={2} color={BEAR} />
          <Badge x={232} y={96} n={3} color={BEAR} />
        </Frame>
      );

    case "BOS":
      return (
        <Frame>
          <Level y={44} color={BLUE} from={40} to={232} />
          <Txt x={196} y={41} color={BLUE} bold size={6}>BOS</Txt>
          <Candle x={26} o={76} c={62} h={58} l={80} />
          <Candle x={52} o={62} c={48} h={44} l={66} />
          <Candle x={78} o={48} c={60} h={44} l={66} />
          <Candle x={104} o={60} c={50} h={46} l={64} />
          <Candle x={130} o={50} c={30} h={22} l={54} />
          <Candle x={156} o={30} c={16} h={10} l={34} />
          <Candle x={182} o={16} c={28} h={12} l={34} />
          <Candle x={208} o={28} c={8} h={2} l={32} />
          <Badge x={52} y={34} n={1} color={BLUE} />
          <Badge x={130} y={12} n={2} color={BULL} />
          <Badge x={182} y={56} n={3} color={AMBER} />
        </Frame>
      );

    case "CHoCH":
      return (
        <Frame>
          <Level y={72} color={BEAR} from={70} to={232} />
          <Txt x={232} y={82} color={BEAR} bold size={5.6} anchor="end">CHoCH</Txt>
          <Candle x={26} o={76} c={64} h={58} l={80} />
          <Candle x={52} o={64} c={46} h={40} l={68} />
          <Candle x={78} o={46} c={62} h={44} l={72} />
          <Candle x={104} o={62} c={40} h={32} l={66} />
          <Candle x={130} o={40} c={58} h={36} l={70} />
          <Candle x={156} o={58} c={84} h={52} l={90} />
          <Candle x={182} o={84} c={94} h={78} l={98} />
          <Candle x={208} o={94} c={86} h={80} l={100} />
          <Txt x={52} y={34} color={BLUE} bold>HH</Txt>
          <Txt x={78} y={84} color={BLUE} bold>HL</Txt>
          <Txt x={104} y={26} color={BLUE} bold>HH</Txt>
          <Badge x={130} y={64} n={1} color={BEAR} />
          <Badge x={178} y={44} n={2} color={AMBER} />
          <Badge x={232} y={92} n={3} color={BULL} />
        </Frame>
      );

    case "MSS":
      return (
        <Frame>
          <Level y={62} color={BLUE} from={12} to={232} />
          <Txt x={232} y={57} color={BLUE} bold size={5.6} anchor="end">Swing low</Txt>
          <Candle x={26} o={40} c={52} h={34} l={58} />
          <Candle x={52} o={52} c={44} h={38} l={58} />
          <Candle x={78} o={44} c={56} h={38} l={62} />
          <Candle x={104} o={56} c={46} h={42} l={60} />
          <Candle x={130} o={46} c={88} h={42} l={94} w={11} />
          <Candle x={156} o={88} c={96} h={84} l={100} />
          <Candle x={182} o={96} c={86} h={82} l={100} />
          <Candle x={208} o={86} c={98} h={82} l={102} />
          <Badge x={52} y={74} n={1} color={BLUE} />
          <Badge x={116} y={44} n={2} color={BEAR} />
          <Txt x={200} y={24} color={AMBER} bold size={6}>Displacement</Txt>
          <Badge x={156} y={78} n={3} color={AMBER} />
        </Frame>
      );

    case "Internal vs External":
      return (
        <Frame>
          <polyline points="18,86 74,20 132,68 214,14" fill="none" stroke={BLUE} strokeWidth="1.4" strokeOpacity="0.85" />
          <rect x="72" y="18" width="62" height="52" fill={AMBER} fillOpacity="0.07" stroke={AMBER} strokeOpacity="0.35" strokeWidth="0.8" strokeDasharray="3 2" />
          <polyline points="74,20 88,42 98,30 112,52 122,40 132,68" fill="none" stroke={AMBER} strokeWidth="1.1" strokeDasharray="2 1.5" />
          <circle cx="74" cy="20" r="2.4" fill={BLUE} />
          <circle cx="132" cy="68" r="2.4" fill={BLUE} />
          <Txt x={74} y={13} color={BLUE} bold>External High</Txt>
          <Txt x={132} y={80} color={BLUE} bold>External Low</Txt>
          <Txt x={80} y={62} color={AMBER} bold size={5.4} anchor="start">Internal</Txt>
          <Badge x={20} y={96} n={1} color={BLUE} />
          <Badge x={80} y={96} n={2} color={AMBER} />
          <Badge x={216} y={96} n={3} color={BULL} />
        </Frame>
      );

    case "Strong vs Weak Swing":
      return (
        <Frame>
          <Level y={50} color={BEAR} from={40} to={232} />
          <Candle x={26} o={70} c={84} h={66} l={88} />
          <Candle x={52} o={84} c={58} h={50} l={86} />
          <Candle x={78} o={58} c={72} h={54} l={78} />
          <Candle x={104} o={72} c={56} h={50} l={76} />
          <Candle x={130} o={56} c={34} h={26} l={60} />
          <Candle x={156} o={34} c={44} h={30} l={50} />
          <Candle x={182} o={44} c={22} h={16} l={48} />
          <Candle x={208} o={22} c={34} h={18} l={38} />
          <circle cx={26} cy={88} r={2.6} fill={BULL} />
          <Txt x={48} y={100} color={BULL} bold size={5.6} anchor="start">Strong Low (Protected)</Txt>
          <Txt x={232} y={44} color={BEAR} bold size={5.6} anchor="end">Weak High</Txt>
          <Badge x={26} y={70} n={1} color={BULL} />
          <Badge x={182} y={8} n={2} color={BEAR} />
          <Badge x={232} y={20} n={3} color={AMBER} />
        </Frame>
      );

    case "MTF Fractal":
      return (
        <Frame>
          <Txt x={14} y={22} color={BULL} bold size={6} anchor="start">H4</Txt>
          <Txt x={14} y={56} color={BLUE} bold size={6} anchor="start">M15</Txt>
          <Txt x={14} y={90} color={AMBER} bold size={6} anchor="start">M5</Txt>
          <Badge x={232} y={23} n={1} color={BULL} />
          <Badge x={232} y={56} n={2} color={BLUE} />
          <Badge x={232} y={89} n={3} color={AMBER} />

          <rect x="36" y="10" width="176" height="26" fill={BULL} fillOpacity="0.06" stroke={BULL} strokeOpacity="0.22" strokeWidth={0.7} />
          <line x1="70" y1="8" x2="70" y2="38" stroke={BULL} strokeWidth={1.1} />
          <rect x="62" y="13" width="16" height="20" fill={BULL} rx="1" />
          <Txt x={94} y={26} color={BULL} size={5.4} anchor="start">bias arah</Txt>

          <rect x="36" y="44" width="176" height="24" fill={BLUE} fillOpacity="0.06" stroke={BLUE} strokeOpacity="0.22" strokeWidth={0.7} />
          <polyline points="44,64 66,48 88,58 110,46 132,56 154,46 176,52 196,48" fill="none" stroke={BLUE} strokeWidth="1.2" />
          <Txt x={204} y={62} color={BLUE} size={5.4} anchor="end">struktur &amp; POI</Txt>

          <rect x="36" y="78" width="176" height="22" fill={AMBER} fillOpacity="0.06" stroke={AMBER} strokeOpacity="0.22" strokeWidth={0.7} />
          <polyline points="44,96 70,84 96,94 122,82 148,92 174,84 196,92" fill="none" stroke={AMBER} strokeWidth="1.2" />
          <circle cx="122" cy="82" r="2.6" fill={BULL} />
          <Txt x={204} y={96} color={AMBER} size={5.4} anchor="end">trigger entry</Txt>
        </Frame>
      );

    case "Power of 3 (AMD)":
      return (
        <Frame>
          {/* phase panels */}
          <rect x="6" y="8" width="70" height="88" fill={BLUE} fillOpacity="0.05" stroke={BLUE} strokeOpacity="0.25" strokeWidth="0.7" strokeDasharray="3 2" />
          <rect x="82" y="8" width="58" height="88" fill={BEAR} fillOpacity="0.05" stroke={BEAR} strokeOpacity="0.25" strokeWidth="0.7" strokeDasharray="3 2" />
          <rect x="146" y="8" width="88" height="88" fill={BULL} fillOpacity="0.05" stroke={BULL} strokeOpacity="0.25" strokeWidth="0.7" strokeDasharray="3 2" />

          {/* accumulation range */}
          <Level y={44} color={FAINT} from={6} to={150} />
          <Level y={57} color={FAINT} from={6} to={112} />

          {/* 1. accumulation */}
          <Candle x={16} o={52} c={48} h={45} l={56} w={8} />
          <Candle x={28} o={48} c={53} h={45} l={57} w={8} />
          <Candle x={40} o={53} c={47} h={44} l={56} w={8} />
          <Candle x={52} o={47} c={52} h={44} l={57} w={8} />
          <Candle x={64} o={52} c={48} h={45} l={56} w={8} />

          {/* 2. manipulation — sweep below range low */}
          <Candle x={90} o={48} c={60} h={44} l={64} />
          <Candle x={102} o={60} c={72} h={56} l={78} />
          <Candle x={114} o={72} c={62} h={58} l={76} />
          <Candle x={126} o={62} c={50} h={46} l={66} />

          {/* 3. distribution */}
          <Candle x={152} o={50} c={38} h={34} l={54} />
          <Candle x={166} o={38} c={46} h={34} l={50} />
          <Candle x={180} o={46} c={26} h={22} l={50} />
          <Candle x={194} o={26} c={34} h={22} l={38} />
          <Candle x={208} o={34} c={16} h={12} l={38} />
          <Candle x={222} o={16} c={24} h={12} l={28} />

          <Txt x={41} y={99} color={BLUE} bold size={5}>1 · AKUMULASI</Txt>
          <Txt x={111} y={99} color={BEAR} bold size={5}>2 · MANIPULASI</Txt>
          <Txt x={190} y={99} color={BULL} bold size={5}>3 · DISTRIBUSI</Txt>
          <Txt x={14} y={40} color={DIM} size={4.6} anchor="start">range sempit</Txt>
        </Frame>
      );

    case "CISD":
      return (
        <Frame>
          {/* CISD level = open dari candle bearish terakhir yang mengantar ke low */}
          <Level y={62} color={AMBER} from={152} to={232} />
          <Txt x={232} y={58} color={AMBER} bold size={4.8} anchor="end">CISD level</Txt>

          {/* bearish delivery turun */}
          <Candle x={20} o={20} c={30} h={16} l={34} />
          <Candle x={42} o={30} c={42} h={26} l={46} />
          <Candle x={64} o={42} c={52} h={38} l={56} />
          <Candle x={86} o={52} c={60} h={48} l={64} />
          <Candle x={108} o={60} c={68} h={56} l={72} />
          <Candle x={130} o={68} c={62} h={58} l={72} />

          {/* candle bearish terakhir pembuat low — open-nya jadi CISD level */}
          <Candle x={152} o={62} c={76} h={58} l={80} w={10} />

          {/* bullish delivery: body close melewati CISD level */}
          <Candle x={174} o={76} c={54} h={50} l={80} w={11} />
          <Candle x={196} o={54} c={30} h={26} l={58} />
          <Candle x={218} o={30} c={12} h={8} l={34} />

          <Badge x={152} y={48} n={1} color={AMBER} />
          <Badge x={174} y={40} n={2} color={BULL} />
          <Badge x={218} y={78} n={3} color={BLUE} />
        </Frame>
      );

    case "Body-Close Rule":
      return (
        <Frame>
          <Level y={28} color={FAINT} from={10} to={232} solid />
          <Txt x={232} y={25} color={DIM} size={4.6} anchor="end">level</Txt>

          {/* rally menuju level */}
          <Candle x={24} o={60} c={50} h={44} l={64} />
          <Candle x={48} o={50} c={40} h={34} l={54} />
          <Candle x={72} o={40} c={30} h={22} l={44} />

          {/* wick tembus tapi body close di bawah → TIDAK SAH */}
          <Candle x={96} o={30} c={34} h={18} l={44} w={10} />
          <Txt x={96} y={88} color={BEAR} bold size={4.6}>wick ≠ break</Txt>

          {/* pullback */}
          <Candle x={120} o={34} c={44} h={30} l={48} />
          <Candle x={144} o={44} c={50} h={40} l={54} />
          <Candle x={168} o={50} c={34} h={28} l={54} />

          {/* body close di atas level → SAH */}
          <Candle x={192} o={34} c={20} h={14} l={38} w={10} />
          <Txt x={192} y={88} color={BULL} bold size={4.6}>body close = sah</Txt>
          <Candle x={216} o={20} c={8} h={4} l={24} />

          <Badge x={24} y={18} n={1} color={AMBER} />
          <Badge x={96} y={12} n={2} color={BEAR} />
          <Badge x={216} y={42} n={3} color={BULL} />
        </Frame>
      );

    case "MMBM / MMSM":
      return (
        <Frame>
          {/* range liquidity */}
          <Level y={50} color={FAINT} from={10} to={232} solid />
          <Txt x={12} y={47} color={DIM} size={4.4} anchor="start">BSL</Txt>
          <Level y={64} color={FAINT} from={10} to={232} solid />
          <Txt x={12} y={72} color={DIM} size={4.4} anchor="start">SSL</Txt>

          {/* POI discount */}
          <Zone x={124} y={30} w={106} h={14} color={BLUE} />
          <Txt x={132} y={56} color={BLUE} bold size={4.6} anchor="start">POI discount</Txt>

          {/* 1. konsolidasi asli */}
          <Candle x={20} o={54} c={50} h={48} l={58} w={7} />
          <Candle x={32} o={50} c={56} h={48} l={60} w={7} />
          <Candle x={44} o={56} c={52} h={48} l={60} w={7} />

          {/* 2. sell-side diambil (sweep bawah SSL) */}
          <Candle x={58} o={52} c={64} h={48} l={70} />
          <Candle x={72} o={64} c={76} h={60} l={80} w={10} />
          <Candle x={86} o={76} c={62} h={58} l={80} />

          {/* 3. displacement naik lalu retrace ke POI discount */}
          <Candle x={100} o={62} c={40} h={36} l={66} w={10} />
          <Candle x={114} o={40} c={20} h={14} l={44} />
          <Candle x={128} o={20} c={30} h={16} l={34} />
          <Candle x={142} o={30} c={40} h={26} l={44} />
          <Candle x={156} o={40} c={36} h={32} l={44} />
          <circle cx={156} cy={38} r={2.6} fill={AMBER} />

          {/* 4. ekspansi ke BSL */}
          <Candle x={172} o={36} c={18} h={14} l={40} w={10} />
          <Candle x={186} o={18} c={26} h={12} l={30} />
          <Candle x={200} o={26} c={8} h={4} l={30} />
          <Candle x={214} o={8} c={16} h={4} l={20} />

          <Badge x={32} y={92} n={1} color={DIM} />
          <Badge x={72} y={92} n={2} color={BEAR} />
          <Badge x={156} y={92} n={3} color={BLUE} />
          <Badge x={214} y={92} n={4} color={BULL} />
        </Frame>
      );

    case "Swing Failure Pattern":
      return (
        <Frame>
          {/* level swing high sebelumnya */}
          <Level y={30} color={FAINT} from={30} to={232} solid />
          <Txt x={232} y={27} color={DIM} size={4.4} anchor="end">swing high lama</Txt>

          {/* 1. rally ke level */}
          <Candle x={22} o={68} c={58} h={54} l={72} />
          <Candle x={40} o={58} c={46} h={42} l={62} />
          <Candle x={58} o={46} c={34} h={30} l={50} />

          {/* 2. gagal menembus — wick menusuk tapi close di bawah */}
          <Candle x={76} o={34} c={40} h={22} l={48} w={10} />
          <Txt x={76} y={92} color={BEAR} bold size={4.4}>gagal tembus</Txt>

          {/* 3. reversal turun */}
          <Candle x={98} o={40} c={56} h={36} l={60} w={10} />
          <Candle x={118} o={56} c={70} h={52} l={74} />
          <Candle x={138} o={70} c={64} h={60} l={76} />
          <Candle x={158} o={64} c={82} h={60} l={86} w={10} />
          <Candle x={180} o={82} c={90} h={78} l={94} />
          <Candle x={202} o={90} c={84} h={80} l={96} />
          <Candle x={224} o={84} c={94} h={80} l={98} />

          <Badge x={58} y={18} n={1} color={DIM} />
          <Badge x={76} y={14} n={2} color={BEAR} />
          <Badge x={224} y={70} n={3} color={BULL} />
        </Frame>
      );

    case "QML Structure":
      return (
        <Frame>
          {/* QML = body candle H1 (left shoulder) */}
          <Level y={30} color={AMBER} from={14} to={232} solid />
          <Txt x={232} y={27} color={AMBER} bold size={4.4} anchor="end">QML (body H1)</Txt>

          {/* H1 — left shoulder */}
          <Candle x={24} o={64} c={30} h={24} l={70} w={10} />
          <Txt x={24} y={88} color={DIM} size={4.2}>H1</Txt>

          {/* L1 — lower low */}
          <Candle x={50} o={30} c={62} h={26} l={70} w={10} />
          <Txt x={50} y={88} color={DIM} size={4.2}>L1</Txt>

          {/* H2 — higher high (head) */}
          <Candle x={76} o={62} c={16} h={10} l={66} w={10} />
          <Txt x={76} y={88} color={BEAR} bold size={4.2}>H2</Txt>

          {/* turun menembus QML */}
          <Candle x={102} o={16} c={44} h={12} l={48} w={10} />
          <Candle x={128} o={44} c={58} h={40} l={62} />

          {/* retest ke QML dari bawah → Sell */}
          <Candle x={154} o={58} c={34} h={30} l={62} w={10} />
          <circle cx={154} cy={32} r={2.8} fill={AMBER} />

          {/* rejection turun */}
          <Candle x={180} o={34} c={56} h={30} l={60} w={10} />
          <Candle x={206} o={56} c={74} h={52} l={78} />
          <Candle x={228} o={74} c={88} h={70} l={92} w={8} />

          <Badge x={24} y={14} n={1} color={DIM} />
          <Badge x={154} y={14} n={2} color={AMBER} />
          <Badge x={228} y={54} n={3} color={BULL} />
        </Frame>
      );

    case "Fresh Level":
      return (
        <Frame>
          {/* level fresh — belum pernah disentuh */}
          <Level y={28} color={AMBER} from={14} to={190} solid />
          <Txt x={194} y={26} color={AMBER} bold size={4.4} anchor="start">fresh</Txt>

          {/* level lama — sudah disentuh berkali-kali */}
          <Level y={62} color={DIM} from={14} to={130} solid />
          <Txt x={134} y={60} color={DIM} size={4.2} anchor="start">sudah disentuh</Txt>

          {/* price naik mendekati level lama, menyentuhnya beberapa kali */}
          <Candle x={22} o={80} c={70} h={66} l={84} />
          <Candle x={44} o={70} c={62} h={58} l={74} />
          <Candle x={66} o={62} c={66} h={56} l={72} />
          <Candle x={88} o={66} c={58} h={54} l={68} />
          <Candle x={110} o={58} c={64} h={54} l={70} />
          <Candle x={132} o={64} c={56} h={52} l={68} />
          <Candle x={154} o={56} c={60} h={50} l={66} />

          {/* tembus ke level fresh */}
          <Candle x={176} o={60} c={40} h={36} l={64} w={10} />
          <Candle x={198} o={40} c={30} h={24} l={44} />
          <Candle x={220} o={30} c={18} h={14} l={34} />

          <Badge x={110} y={88} n={1} color={DIM} />
          <Badge x={154} y={88} n={2} color={DIM} />
          <Badge x={220} y={88} n={3} color={AMBER} />
        </Frame>
      );

    case "Trendline Break":
      return (
        <Frame>
          <defs>
            <marker id="tl-arr-break" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill={BEAR} />
            </marker>
          </defs>

          {/* Garis batas referensi support */}
          <line x1={20} y1={88} x2={185} y2={44} stroke="#ffffff" strokeWidth={1.8} strokeDasharray="5 4" strokeOpacity={0.85} />
          <Txt x={24} y={80} color="#ffffff" size={5} anchor="start" bold>Trendline Support</Txt>

          {/* Zigzag pergerakan harga */}
          <polyline
            points="24,78 48,46 72,74 102,36 128,58 152,86 174,66 212,100"
            fill="none"
            stroke={BEAR}
            strokeWidth={2.4}
            strokeLinejoin="round"
            strokeLinecap="round"
            markerEnd="url(#tl-arr-break)"
          />

          {/* Titik pantulan sebelum tembus */}
          <circle cx={72} cy={74} r={3.2} fill="#0b0b0b" stroke={BLUE} strokeWidth={1.4} />
          <circle cx={128} cy={58} r={3.2} fill="#0b0b0b" stroke={BLUE} strokeWidth={1.4} />

          {/* Badge 1: Jebol */}
          <Badge x={145} y={76} n={1} color={BEAR} />
          <Txt x={145} y={96} color={BEAR} bold size={5} anchor="middle">1. Breakdown</Txt>

          {/* Badge 2: Uji Ulang (Retest) */}
          <Badge x={174} y={54} n={2} color={AMBER} />
          <Txt x={174} y={44} color={AMBER} bold size={5} anchor="middle">2. Retest Bawah</Txt>

          {/* Badge 3: Turun Lanjut */}
          <Badge x={212} y={32} n={3} color={BEAR} />
          <Txt x={212} y={22} color={BEAR} bold size={5.4} anchor="middle">3. Drop Kuat</Txt>
        </Frame>
      );

    case "Trendline Throw-over":
      return (
        <Frame>
          <defs>
            <marker id="tl-arr-throw" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill={BEAR} />
            </marker>
          </defs>

          {/* Garis trendline naik curam */}
          <line x1={26} y1={90} x2={165} y2={32} stroke="#ffffff" strokeWidth={1.8} strokeDasharray="5 4" strokeOpacity={0.85} />
          <Txt x={30} y={82} color="#ffffff" size={5} anchor="start" bold>Trendline Curam</Txt>

          {/* Zigzag harga: naik -> spike tajam lewati garis -> ambruk lurus */}
          <polyline
            points="28,84 54,60 76,74 100,50 118,62 142,12 162,54 200,98"
            fill="none"
            stroke={BEAR}
            strokeWidth={2.4}
            strokeLinejoin="round"
            strokeLinecap="round"
            markerEnd="url(#tl-arr-throw)"
          />

          <circle cx={118} cy={62} r={3.2} fill="#0b0b0b" stroke={BLUE} strokeWidth={1.4} />

          {/* Badge 1: Lonjakan Melebihi Garis */}
          <Badge x={142} y={24} n={1} color={BULL} />
          <Txt x={142} y={35} color={BULL} bold size={5} anchor="middle">1. Overthrow (Spike)</Txt>

          {/* Badge 2: Balik Menembus Bawah */}
          <Badge x={168} y={62} n={2} color={BEAR} />
          <Txt x={180} y={62} color={BEAR} bold size={4.8} anchor="start">2. Balik Masuk</Txt>

          {/* Badge 3: Ambruk Cepat */}
          <Badge x={200} y={32} n={3} color={BEAR} />
          <Txt x={200} y={22} color={BEAR} bold size={5.4} anchor="middle">3. Ambruk Cepat</Txt>
        </Frame>
      );

    case "Trendline Rejection":
      return (
        <Frame>
          <defs>
            <marker id="tl-arr-rej" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill={BEAR} />
            </marker>
          </defs>

          {/* Garis trendline resistance menurun */}
          <line x1={18} y1={22} x2={205} y2={76} stroke="#ffffff" strokeWidth={1.8} strokeDasharray="5 4" strokeOpacity={0.85} />
          <Txt x={24} y={16} color="#ffffff" size={5} anchor="start" bold>Trendline Resistance</Txt>

          {/* Zigzag harga memantul di bawah garis tanpa pernah tembus */}
          <polyline
            points="24,42 46,29 72,58 98,43 124,72 150,56 172,84 186,66 214,100"
            fill="none"
            stroke={BEAR}
            strokeWidth={2.4}
            strokeLinejoin="round"
            strokeLinecap="round"
            markerEnd="url(#tl-arr-rej)"
          />

          {/* Titik sentuh dan tolak */}
          <circle cx={46} cy={29} r={3.2} fill="#0b0b0b" stroke={AMBER} strokeWidth={1.4} />
          <circle cx={98} cy={43} r={3.2} fill="#0b0b0b" stroke={AMBER} strokeWidth={1.4} />
          <circle cx={150} cy={56} r={3.2} fill="#0b0b0b" stroke={AMBER} strokeWidth={1.4} />
          <circle cx={186} cy={66} r={3.2} fill="#0b0b0b" stroke={AMBER} strokeWidth={1.4} />

          {/* Badge 1 & 2: Ditolak berulang */}
          <Badge x={98} y={30} n={1} color={AMBER} />
          <Badge x={150} y={43} n={2} color={AMBER} />
          <Txt x={150} y={34} color={AMBER} bold size={4.8} anchor="middle">Sentuh & Mantul</Txt>

          {/* Badge 3: Lanjut Turun Terus */}
          <Badge x={214} y={32} n={3} color={BEAR} />
          <Txt x={214} y={22} color={BEAR} bold size={5.4} anchor="middle">3. Tren Turun Lanjut</Txt>
        </Frame>
      );

    case "Trendline False Break":
      return (
        <Frame>
          <defs>
            <marker id="tl-arr-trap" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill={BEAR} />
            </marker>
          </defs>

          {/* Garis trendline resistance menurun */}
          <line x1={22} y1={26} x2={205} y2={74} stroke="#ffffff" strokeWidth={1.8} strokeDasharray="5 4" strokeOpacity={0.85} />
          <Txt x={26} y={20} color="#ffffff" size={5} anchor="start" bold>Trendline Resistance</Txt>

          {/* Zigzag harga tembus ke atas garis, coba bertahan tapi gagal, lalu jatuh */}
          <polyline
            points="28,52 54,34 78,64 104,24 126,46 142,28 162,56 178,82 212,100"
            fill="none"
            stroke={BEAR}
            strokeWidth={2.4}
            strokeLinejoin="round"
            strokeLinecap="round"
            markerEnd="url(#tl-arr-trap)"
          />

          {/* Badge 1: Tembus Palsu */}
          <Badge x={104} y={15} n={1} color={BULL} />
          <Txt x={104} y={6} color={BULL} bold size={4.8} anchor="middle">1. Tembus Palsu (Jebakan)</Txt>

          {/* Badge 2: Gagal Bertahan */}
          <Badge x={142} y={18} n={2} color={AMBER} />
          <Txt x={158} y={18} color={AMBER} bold size={4.8} anchor="start">2. Gagal Tahan</Txt>

          {/* Badge 3: Ambruk Keras */}
          <Badge x={178} y={92} n={3} color={BEAR} />
          <Txt x={178} y={102} color={BEAR} bold size={4.8} anchor="middle">Balik Ke Bawah Garis</Txt>

          <Txt x={212} y={22} color={BEAR} bold size={5.4} anchor="middle">3. Drop Panik</Txt>
        </Frame>
      );

    // ==========================================
    // 2. POINT OF INTEREST (POI)
    // ==========================================
    case "Order Block (OB)":
      return (
        <Frame>
          <Zone x={44} y={48} w={188} h={20} color={BLUE} />
          <Candle x={26} o={40} c={52} h={36} l={56} />
          <Candle x={52} o={52} c={64} h={48} l={68} />
          <Candle x={78} o={64} c={34} h={26} l={68} />
          <Candle x={104} o={34} c={18} h={12} l={38} />
          <Candle x={130} o={18} c={30} h={14} l={36} />
          <Candle x={156} o={30} c={52} h={26} l={58} />
          <Candle x={182} o={52} c={40} h={34} l={56} />
          <Candle x={208} o={40} c={18} h={12} l={44} />
          <Badge x={52} y={40} n={1} color={BLUE} />
          <Badge x={104} y={8} n={2} color={BULL} />
          <Badge x={156} y={72} n={3} color={AMBER} />
        </Frame>
      );

    case "Breaker Block (BB)":
      return (
        <Frame>
          <Zone x={18} y={30} w={214} h={22} color={BEAR} />
          <Candle x={26} o={34} c={48} h={30} l={52} />
          <Candle x={52} o={48} c={76} h={44} l={80} w={10} />
          <Candle x={78} o={76} c={86} h={72} l={90} />
          <Candle x={104} o={86} c={44} h={36} l={88} />
          <Candle x={130} o={44} c={64} h={40} l={68} />
          <Candle x={156} o={64} c={80} h={60} l={84} />
          <Candle x={182} o={80} c={92} h={76} l={96} />
          <Candle x={208} o={92} c={84} h={80} l={96} />
          <Badge x={26} y={20} n={1} color={BLUE} />
          <Badge x={52} y={30} n={2} color={BEAR} />
          <Badge x={104} y={26} n={3} color={AMBER} />
          <Txt x={150} y={98} color={BULL} bold size={6} anchor="middle">SELL</Txt>
        </Frame>
      );

    case "FVG":
      return (
        <Frame>
          <Zone x={26} y={26} w={206} h={28} color={BULL} />
          <Level y={54} color={FAINT} from={26} to={120} solid />
          <Level y={26} color={FAINT} from={78} to={232} solid />
          <Candle x={26} o={70} c={58} h={54} l={74} />
          <Candle x={52} o={58} c={30} h={22} l={62} w={11} />
          <Candle x={78} o={30} c={18} h={12} l={26} />
          <Candle x={104} o={18} c={32} h={14} l={38} />
          <Candle x={130} o={32} c={50} h={28} l={56} />
          <Candle x={156} o={50} c={34} h={28} l={54} />
          <Candle x={182} o={34} c={14} h={8} l={38} />
          <Candle x={208} o={14} c={28} h={10} l={32} />
          <Badge x={26} y={88} n={1} color={BLUE} />
          <Badge x={52} y={12} n={2} color={BULL} />
          <Badge x={130} y={72} n={3} color={AMBER} />
        </Frame>
      );

    case "Inversion FVG (IFVG)":
      return (
        <Frame>
          <Zone x={14} y={26} w={218} h={14} color={AMBER} />
          <Candle x={20} o={44} c={52} h={38} l={58} />
          <Candle x={36} o={52} c={14} h={10} l={50} w={10} />
          <Candle x={52} o={14} c={8} h={4} l={26} />
          <Candle x={72} o={18} c={62} h={14} l={66} w={10} />
          <Candle x={92} o={62} c={70} h={58} l={74} />
          <Candle x={112} o={70} c={44} h={40} l={74} />
          <Candle x={132} o={44} c={30} h={26} l={48} />
          <Candle x={152} o={30} c={56} h={28} l={62} />
          <Candle x={172} o={56} c={78} h={52} l={84} />
          <Candle x={192} o={78} c={92} h={74} l={96} />
          <Candle x={212} o={92} c={84} h={80} l={98} />
          <Badge x={36} y={96} n={1} color={BLUE} />
          <Badge x={72} y={80} n={2} color={BEAR} />
          <Badge x={152} y={16} n={3} color={AMBER} />
          <Txt x={140} y={100} color={BULL} bold size={6} anchor="middle">SELL</Txt>
        </Frame>
      );

    case "Consequent Encroachment (CE)":
      return (
        <Frame>
          <Zone x={78} y={30} w={154} h={28} color={BULL} />
          <Level y={30} color={FAINT} from={78} to={232} solid />
          <Level y={58} color={FAINT} from={78} to={232} solid />
          <line x1="78" y1="44" x2="232" y2="44" stroke={AMBER} strokeWidth="1.1" strokeDasharray="5 3" />
          <Txt x={8} y={42} color={AMBER} bold size={5} anchor="start">CE 50%</Txt>
          <Txt x={8} y={54} color={DIM} size={4.6} anchor="start">tengah FVG</Txt>

          {/* 1. bullish impulse membentuk FVG */}
          <Candle x={24} o={74} c={62} h={58} l={78} />
          <Candle x={46} o={62} c={32} h={26} l={66} w={11} />
          <Candle x={68} o={32} c={24} h={20} l={30} />

          {/* 2. retrace masuk FVG, ditahan di CE */}
          <Candle x={94} o={24} c={38} h={20} l={42} />
          <Candle x={116} o={38} c={44} h={40} l={48} />
          <circle cx={116} cy={44} r={2.8} fill={AMBER} />

          {/* 3. rejection dari CE lalu lanjut naik */}
          <Candle x={140} o={44} c={26} h={22} l={48} w={10} />
          <Candle x={164} o={26} c={12} h={6} l={30} />
          <Candle x={188} o={12} c={20} h={8} l={24} />
          <Candle x={212} o={20} c={4} h={0} l={24} />

          <Badge x={68} y={90} n={1} color={BLUE} />
          <Badge x={116} y={64} n={2} color={AMBER} />
          <Badge x={212} y={70} n={3} color={BULL} />
          <Txt x={140} y={96} color={BULL} bold size={5.2} anchor="start">SL di bawah CE</Txt>
        </Frame>
      );

    case "Balanced Price Range (BPR)":
      return (
        <Frame>
          {/* FVG naik */}
          <Zone x={60} y={26} w={172} h={16} color={BULL} />
          {/* FVG turun */}
          <Zone x={60} y={36} w={172} h={16} color={BEAR} />
          {/* overlap = BPR */}
          <rect x="60" y="36" width="172" height="6" fill={AMBER} fillOpacity="0.45" stroke={AMBER} strokeWidth="0.9" />

          <Txt x={8} y={32} color={BULL} bold size={4.8} anchor="start">FVG naik</Txt>
          <Txt x={8} y={44} color={AMBER} bold size={5} anchor="start">BPR</Txt>
          <Txt x={8} y={56} color={BEAR} bold size={4.8} anchor="start">FVG turun</Txt>

          {/* candle 1-3: FVG naik terbentuk */}
          <Candle x={68} o={70} c={58} h={44} l={74} />
          <Candle x={86} o={58} c={32} h={24} l={62} w={10} />
          <Candle x={104} o={32} c={22} h={16} l={30} />

          {/* naik ke puncak */}
          <Candle x={122} o={22} c={12} h={6} l={26} />
          <Candle x={140} o={12} c={18} h={8} l={22} />
          <Candle x={158} o={18} c={6} h={2} l={22} />

          {/* candle 1-3: FVG turun terbentuk */}
          <Candle x={176} o={6} c={22} h={2} l={36} />
          <Candle x={194} o={22} c={48} h={18} l={52} w={10} />
          <Candle x={212} o={48} c={58} h={54} l={62} />

          {/* kembali ke BPR lalu ditolak */}
          <Candle x={228} o={58} c={44} h={40} l={62} />

          <Badge x={104} y={90} n={1} color={BULL} />
          <Badge x={194} y={90} n={2} color={BEAR} />
          <Badge x={228} y={24} n={3} color={AMBER} />
        </Frame>
      );

    case "SMC Order Block":
      return (
        <Frame>
          {/* OB SMC = base terakhir sebelum impuls */}
          <Zone x={58} y={40} w={150} h={22} color={BLUE} />
          <Txt x={212} y={55} color={BLUE} bold size={4.4} anchor="start">OB SMC</Txt>

          {/* base: beberapa candle kecil (bukan 1 candle seperti ICT) */}
          <Candle x={22} o={72} c={64} h={60} l={76} />
          <Candle x={40} o={64} c={58} h={54} l={68} />
          <Candle x={62} o={58} c={50} h={46} l={62} w={7} />
          <Candle x={78} o={50} c={56} h={46} l={60} w={7} />
          <Candle x={94} o={56} c={48} h={44} l={60} w={7} />

          {/* impuls keluar base */}
          <Candle x={116} o={48} c={22} h={16} l={52} w={11} />
          <Candle x={140} o={22} c={10} h={4} l={26} />
          <Candle x={164} o={10} c={18} h={4} l={22} />

          {/* retest ke base */}
          <Candle x={186} o={18} c={38} h={14} l={42} />
          <Candle x={208} o={38} c={46} h={34} l={50} />
          <Candle x={230} o={46} c={26} h={22} l={50} w={9} />

          <Badge x={78} y={92} n={1} color={BLUE} />
          <Badge x={116} y={92} n={2} color={BULL} />
          <Badge x={208} y={92} n={3} color={AMBER} />
        </Frame>
      );

    case "SMC Liquidity Void":
      return (
        <Frame>
          {/* void SMC: base → gap besar → base */}
          <rect x="46" y="18" width="188" height="24" fill={AMBER} fillOpacity="0.16" stroke={AMBER} strokeWidth="0.9" strokeDasharray="3 2" />
          <Txt x={140} y={33} color={AMBER} bold size={4.6}>VOID</Txt>

          {/* base bawah */}
          <Candle x={22} o={66} c={58} h={54} l={70} />
          <Candle x={38} o={58} c={64} h={54} l={70} />

          {/* candle raksasa melompat */}
          <Candle x={62} o={56} c={14} h={10} l={58} w={13} />

          {/* base atas */}
          <Candle x={88} o={14} c={8} h={4} l={18} />
          <Candle x={106} o={8} c={13} h={4} l={17} />

          {/* rebalance turun mengisi void */}
          <Candle x={132} o={13} c={28} h={8} l={32} />
          <Candle x={152} o={28} c={42} h={24} l={46} />
          <Candle x={172} o={42} c={34} h={30} l={46} />
          <Candle x={192} o={34} c={20} h={16} l={38} w={10} />
          <Candle x={214} o={20} c={10} h={6} l={24} />

          <Badge x={38} y={92} n={1} color={DIM} />
          <Badge x={140} y={92} n={2} color={AMBER} />
          <Badge x={192} y={92} n={3} color={BULL} />
        </Frame>
      );

    case "SMC Premium / Discount":
      return (
        <Frame>
          {/* range swing */}
          <Level y={12} color={FAINT} from={10} to={232} solid />
          <Txt x={232} y={10} color={DIM} size={4.2} anchor="end">swing high</Txt>
          <Level y={94} color={FAINT} from={10} to={232} solid />
          <Txt x={232} y={92} color={DIM} size={4.2} anchor="end">swing low</Txt>

          {/* premium zone */}
          <rect x="10" y="12" width="222" height="41" fill={BEAR} fillOpacity="0.07" />
          <Txt x={16} y={22} color={BEAR} bold size={4.6} anchor="start">PREMIUM</Txt>
          <Txt x={16} y={30} color={BEAR} size={4.2} anchor="start">jangan Buy di sini</Txt>

          {/* equilibrium */}
          <Level y={53} color={AMBER} from={10} to={232} solid />
          <Txt x={16} y={51} color={AMBER} bold size={4.4} anchor="start">EQ 50%</Txt>

          {/* discount zone */}
          <rect x="10" y="53" width="222" height="41" fill={BULL} fillOpacity="0.07" />
          <Txt x={16} y={88} color={BULL} bold size={4.6} anchor="start">DISCOUNT</Txt>
          <Txt x={16} y={96} color={BULL} size={4.2} anchor="start">area Buy</Txt>

          {/* harga turun ke discount lalu naik */}
          <Candle x={86} o={22} c={32} h={18} l={36} />
          <Candle x={108} o={32} c={44} h={28} l={48} />
          <Candle x={130} o={44} c={58} h={40} l={62} />
          <Candle x={152} o={58} c={70} h={54} l={74} />
          <Candle x={174} o={70} c={62} h={58} l={74} />
          <Candle x={196} o={62} c={38} h={34} l={66} w={10} />
          <Candle x={218} o={38} c={20} h={16} l={42} />

          <circle cx={174} cy={70} r={2.8} fill={BULL} />
          <Badge x={130} y={8} n={1} color={BEAR} />
          <Badge x={232} y={72} n={2} color={BULL} />
        </Frame>
      );

    case "SMC Mitigation":
      return (
        <Frame>
          {/* zona supply yang dimitigasi */}
          <Zone x={54} y={24} w={178} h={20} color={BEAR} />
          <Txt x={232} y={22} color={BEAR} bold size={4.4} anchor="end">zona supply</Txt>

          {/* base di supply */}
          <Candle x={22} o={64} c={56} h={52} l={68} />
          <Candle x={44} o={56} c={30} h={26} l={60} w={10} />
          <Candle x={64} o={30} c={28} h={24} l={36} w={7} />
          <Candle x={80} o={28} c={33} h={24} l={37} w={7} />

          {/* impuls turun */}
          <Candle x={102} o={33} c={58} h={28} l={62} w={10} />
          <Candle x={124} o={58} c={72} h={54} l={76} />
          <Candle x={146} o={72} c={82} h={68} l={86} />

          {/* retest pertama ke supply → ditolak (mitigated) */}
          <Candle x={168} o={82} c={56} h={52} l={86} w={10} />
          <Candle x={190} o={56} c={38} h={34} l={60} />
          <Candle x={212} o={38} c={30} h={26} l={42} />

          <Badge x={80} y={92} n={1} color={BEAR} />
          <Badge x={146} y={92} n={2} color={DIM} />
          <Badge x={190} y={92} n={3} color={BEAR} />
        </Frame>
      );

    case "Body Zone (MSNR)":
      return (
        <Frame>
          {/* zona dari body candle, bukan wick */}
          <rect x="14" y="30" width="218" height="16" fill={AMBER} fillOpacity="0.2" stroke={AMBER} strokeWidth="0.9" strokeDasharray="3 2" />
          <Txt x={232} y={27} color={AMBER} bold size={4.4} anchor="end">body zone</Txt>
          <Level y={24} color={FAINT} from={14} to={218} />
          <Txt x={14} y={21} color={DIM} size={4.2} anchor="start">wick</Txt>
          <Level y={52} color={FAINT} from={14} to={218} />

          {/* candle pembentuk level */}
          <Candle x={24} o={30} c={46} h={24} l={52} w={10} />

          {/* harga turun */}
          <Candle x={50} o={46} c={62} h={42} l={66} />
          <Candle x={72} o={62} c={74} h={58} l={78} />
          <Candle x={94} o={74} c={84} h={70} l={88} />

          {/* reversal naik ke body zone */}
          <Candle x={118} o={84} c={62} h={58} l={88} w={10} />
          <Candle x={142} o={62} c={44} h={40} l={66} />
          <Candle x={166} o={44} c={36} h={30} l={48} />
          <circle cx={166} cy={38} r={2.8} fill={AMBER} />
          <Candle x={190} o={36} c={18} h={14} l={40} w={10} />
          <Candle x={214} o={18} c={8} h={4} l={22} />

          <Badge x={24} y={68} n={1} color={DIM} />
          <Badge x={120} y={20} n={2} color={AMBER} />
          <Badge x={166} y={66} n={3} color={BULL} />
        </Frame>
      );

    case "Level Stacking (MSNR)":
      return (
        <Frame>
          {/* 3 level body bertumpuk dekat */}
          <Level y={28} color={AMBER} from={14} to={232} solid />
          <Level y={36} color={AMBER} from={14} to={232} solid />
          <Level y={44} color={AMBER} from={14} to={232} solid />
          <Txt x={14} y={24} color={AMBER} bold size={4.2} anchor="start">bertumpuk</Txt>

          {/* 1 level tunggal yang jauh */}
          <Level y={78} color={DIM} from={14} to={232} solid />
          <Txt x={232} y={75} color={DIM} size={4.2} anchor="end">1 level</Txt>

          {/* harga dari bawah */}
          <Candle x={22} o={92} c={84} h={80} l={96} />
          <Candle x={44} o={84} c={76} h={72} l={88} />
          <Candle x={66} o={76} c={68} h={64} l={80} />
          <Candle x={88} o={68} c={60} h={56} l={72} />
          <Candle x={110} o={60} c={52} h={48} l={64} />
          <Candle x={132} o={52} c={46} h={42} l={56} />
          <Candle x={154} o={46} c={38} h={34} l={50} />
          <Candle x={176} o={38} c={30} h={26} l={42} w={10} />
          <Candle x={198} o={30} c={22} h={18} l={34} />
          <Candle x={220} o={22} c={12} h={8} l={26} />

          <Badge x={110} y={90} n={1} color={DIM} />
          <Badge x={176} y={90} n={2} color={AMBER} />
          <Badge x={220} y={90} n={3} color={BULL} />
        </Frame>
      );

    case "SMC Inducement":
      return (
        <Frame>
          {/* IDM SMC: swing kecil sebagai umpan */}
          <Level y={48} color={BEAR} from={40} to={112} />
          <Txt x={112} y={45} color={BEAR} bold size={4.2} anchor="end">IDM</Txt>

          {/* POI asli */}
          <Zone x={150} y={66} w={82} h={18} color={BLUE} />
          <Txt x={232} y={64} color={BLUE} bold size={4.2} anchor="end">POI asli</Txt>

          {/* harga turun, buat swing kecil */}
          <Candle x={20} o={26} c={34} h={22} l={38} />
          <Candle x={40} o={34} c={44} h={30} l={48} />
          <Candle x={60} o={44} c={38} h={34} l={48} />

          {/* retail Buy di IDM, lalu disapu */}
          <Candle x={80} o={38} c={56} h={34} l={62} w={10} />
          <Candle x={100} o={56} c={70} h={52} l={76} />

          {/* reversal dari POI asli */}
          <Candle x={122} o={70} c={60} h={56} l={76} />
          <Candle x={144} o={60} c={70} h={56} l={74} />
          <Candle x={166} o={70} c={54} h={50} l={74} w={10} />
          <Candle x={188} o={54} c={36} h={32} l={58} />
          <Candle x={210} o={36} c={20} h={16} l={40} w={10} />
          <Candle x={230} o={20} c={10} h={6} l={24} w={8} />

          <Badge x={60} y={92} n={1} color={BEAR} />
          <Badge x={100} y={92} n={2} color={DIM} />
          <Badge x={188} y={92} n={3} color={BULL} />
        </Frame>
      );

    case "Supply & Demand Zone":
      return (
        <Frame>
          <Zone x={48} y={16} w={184} h={20} color={BEAR} />
          <Zone x={48} y={70} w={184} h={20} color={BULL} />
          <Txt x={6} y={29} color={BEAR} bold size={4.8} anchor="start">SUPPLY</Txt>
          <Txt x={6} y={83} color={BULL} bold size={4.8} anchor="start">DEMAND</Txt>

          {/* 1. base konsolidasi di supply */}
          <Candle x={58} o={22} c={30} h={18} l={34} w={7} />
          <Candle x={72} o={30} c={24} h={18} l={34} w={7} />
          <Candle x={86} o={24} c={31} h={18} l={35} w={7} />

          {/* impuls turun keluar zona */}
          <Candle x={104} o={31} c={52} h={28} l={56} />
          <Candle x={122} o={52} c={68} h={48} l={72} w={10} />
          <Candle x={140} o={68} c={78} h={64} l={82} />

          {/* 2. base konsolidasi di demand */}
          <Candle x={158} o={84} c={76} h={72} l={88} w={7} />
          <Candle x={172} o={76} c={83} h={72} l={88} w={7} />
          <Candle x={186} o={83} c={75} h={71} l={87} w={7} />

          {/* impuls naik keluar zona */}
          <Candle x={204} o={75} c={54} h={50} l={80} w={10} />
          <Candle x={222} o={54} c={36} h={30} l={58} />

          <Badge x={86} y={44} n={1} color={BEAR} />
          <Badge x={186} y={100} n={2} color={BULL} />
          <Badge x={222} y={94} n={3} color={BULL} />
        </Frame>
      );

    case "Trendline Liquidity":
      return (
        <Frame>
          {/* trendline naik melalui swing low */}
          <line x1="34" y1="74" x2="225" y2="16" stroke={AMBER} strokeWidth="1.1" strokeDasharray="5 3" strokeOpacity="0.85" />
          <Txt x={8} y={30} color={AMBER} bold size={4.8} anchor="start">trendline</Txt>

          {/* swing low menyentuh garis */}
          <Candle x={34} o={70} c={58} h={54} l={74} />
          <Candle x={72} o={58} c={44} h={40} l={62} />
          <Candle x={110} o={44} c={32} h={28} l={50} />
          <Candle x={148} o={32} c={22} h={18} l={38} />

          {/* pullback turun ke garis */}
          <Candle x={168} o={22} c={32} h={18} l={36} />

          {/* sweep: wick menusuk di bawah garis, close kembali di atas */}
          <Candle x={190} o={34} c={18} h={14} l={46} w={10} />
          <circle cx={190} cy={46} r={2.8} fill={BEAR} />

          {/* lanjut naik setelah sweep */}
          <Candle x={212} o={18} c={6} h={2} l={22} />

          <Badge x={72} y={94} n={1} color={AMBER} />
          <Badge x={148} y={94} n={2} color={AMBER} />
          <Badge x={190} y={94} n={3} color={BEAR} />
          <Txt x={204} y={62} color={BEAR} bold size={4.6} anchor="start">sweep</Txt>
        </Frame>
      );

    case "Volume Imbalance":
      return (
        <Frame>
          {/* gap body = volume imbalance */}
          <rect x="86" y="42" width="70" height="12" fill={AMBER} fillOpacity="0.2" stroke={AMBER} strokeWidth="0.9" strokeDasharray="3 2" />
          <Txt x={150} y={96} color={AMBER} bold size={4.6} anchor="middle">body bolong · wick nyambung</Txt>

          <Candle x={22} o={74} c={66} h={62} l={78} />
          <Candle x={44} o={66} c={58} h={54} l={70} />
          <Candle x={66} o={58} c={48} h={44} l={62} />

          {/* candle A: body 48→38, wick bawah ke 52 */}
          <Candle x={88} o={48} c={38} h={34} l={52} w={10} />

          {/* candle B: body 54→44, wick atas ke 40 → wick nyambung, body bolong */}
          <Candle x={110} o={54} c={44} h={40} l={58} w={10} />

          <Candle x={132} o={44} c={30} h={26} l={48} w={10} />
          <Candle x={154} o={30} c={38} h={26} l={42} />

          {/* retest mengisi gap body */}
          <Candle x={178} o={38} c={48} h={34} l={52} />
          <Candle x={200} o={48} c={36} h={32} l={52} />
          <Candle x={222} o={36} c={20} h={16} l={40} w={10} />

          <Badge x={66} y={88} n={1} color={DIM} />
          <Badge x={110} y={88} n={2} color={AMBER} />
          <Badge x={200} y={88} n={3} color={BULL} />
        </Frame>
      );

    case "Liquidity Void":
      return (
        <Frame>
          {/* void: celah besar tanpa transaksi sama sekali */}
          <rect x="62" y="16" width="86" height="30" fill={AMBER} fillOpacity="0.18" stroke={AMBER} strokeWidth="0.9" strokeDasharray="3 2" />
          <Txt x={105} y={34} color={AMBER} bold size={4.6}>LIQUIDITY VOID</Txt>

          {/* 1. harga sebelum void */}
          <Candle x={22} o={66} c={60} h={56} l={70} />
          <Candle x={42} o={60} c={54} h={50} l={64} />

          {/* 2. candle raksasa — lompat total, wick tidak menyambung */}
          <Candle x={62} o={52} c={8} h={4} l={54} w={13} />

          {/* harga lanjut di atas void */}
          <Candle x={84} o={8} c={14} h={4} l={18} />
          <Candle x={106} o={14} c={6} h={2} l={18} />
          <Candle x={128} o={6} c={12} h={2} l={16} />

          {/* 3. rebalance: harga kembali turun mengisi void */}
          <Candle x={154} o={12} c={26} h={8} l={30} />
          <Candle x={176} o={26} c={40} h={22} l={44} />
          <Candle x={198} o={40} c={30} h={26} l={44} w={10} />
          <Candle x={220} o={30} c={16} h={12} l={34} />

          <Badge x={42} y={88} n={1} color={DIM} />
          <Badge x={105} y={88} n={2} color={AMBER} />
          <Badge x={198} y={88} n={3} color={BULL} />
          <Txt x={232} y={70} color={BULL} bold size={4.4} anchor="end">rebalance</Txt>
        </Frame>
      );

    case "BISI / SIBI":
      return (
        <Frame>
          {/* BISI: gap di bawah harga (displacement naik) */}
          <rect x="16" y="36" width="92" height="12" fill={BULL} fillOpacity="0.18" stroke={BULL} strokeWidth="0.9" strokeDasharray="3 2" />
          <Txt x={62} y={96} color={BULL} bold size={4.8}>BISI · buy</Txt>

          <Candle x={20} o={70} c={56} h={48} l={74} />
          <Candle x={36} o={56} c={32} h={26} l={60} w={10} />
          <Candle x={52} o={32} c={26} h={22} l={36} />
          <Candle x={68} o={26} c={38} h={22} l={42} />
          <Candle x={84} o={38} c={34} h={30} l={42} />
          <Candle x={100} o={34} c={20} h={16} l={38} />

          {/* SIBI: gap di atas harga (displacement turun) */}
          <rect x="126" y="46" width="102" height="16" fill={BEAR} fillOpacity="0.18" stroke={BEAR} strokeWidth="0.9" strokeDasharray="3 2" />
          <Txt x={177} y={96} color={BEAR} bold size={4.8}>SIBI · sell</Txt>

          <Candle x={130} o={26} c={40} h={22} l={44} />
          <Candle x={146} o={40} c={66} h={34} l={70} w={10} />
          <Candle x={162} o={66} c={72} h={62} l={76} />
          <Candle x={178} o={72} c={58} h={54} l={76} />
          <Candle x={194} o={58} c={48} h={44} l={62} />
          <Candle x={210} o={48} c={66} h={44} l={70} w={10} />
          <Candle x={226} o={66} c={78} h={62} l={82} />

          <Badge x={52} y={78} n={1} color={BULL} />
          <Badge x={162} y={78} n={2} color={BEAR} />
          <Badge x={226} y={40} n={3} color={AMBER} />
        </Frame>
      );

    case "PD Array":
      return (
        <Frame>
          {/* PREMIUM */}
          <rect x="8" y="6" width="224" height="42" fill={BEAR} fillOpacity="0.05" />
          <Txt x={12} y={15} color={BEAR} bold size={4.8} anchor="start">PREMIUM ARRAY · SELL</Txt>
          <rect x="76" y="19" width="118" height="8" fill={BEAR} fillOpacity="0.16" stroke={BEAR} strokeWidth="0.8" />
          <Txt x={198} y={25} color={BEAR} size={4.6} anchor="start">OB</Txt>
          <rect x="76" y="29" width="118" height="8" fill={BEAR} fillOpacity="0.16" stroke={BEAR} strokeWidth="0.8" />
          <Txt x={198} y={35} color={BEAR} size={4.6} anchor="start">FVG</Txt>
          <rect x="76" y="39" width="118" height="8" fill={AMBER} fillOpacity="0.2" stroke={AMBER} strokeWidth="0.8" />
          <Txt x={198} y={45} color={AMBER} size={4.6} anchor="start">BB</Txt>

          {/* equilibrium */}
          <Level y={52} color={DIM} from={8} to={232} solid />
          <Txt x={232} y={50} color={DIM} bold size={4.6} anchor="end">EQ 50%</Txt>

          {/* DISCOUNT */}
          <rect x="8" y="56" width="224" height="42" fill={BULL} fillOpacity="0.05" />
          <Txt x={12} y={95} color={BULL} bold size={4.8} anchor="start">DISCOUNT ARRAY · BUY</Txt>
          <rect x="76" y="58" width="118" height="8" fill={AMBER} fillOpacity="0.2" stroke={AMBER} strokeWidth="0.8" />
          <Txt x={198} y={64} color={AMBER} size={4.6} anchor="start">BB</Txt>
          <rect x="76" y="68" width="118" height="8" fill={BULL} fillOpacity="0.16" stroke={BULL} strokeWidth="0.8" />
          <Txt x={198} y={74} color={BULL} size={4.6} anchor="start">FVG</Txt>
          <rect x="76" y="78" width="118" height="8" fill={BULL} fillOpacity="0.16" stroke={BULL} strokeWidth="0.8" />
          <Txt x={198} y={84} color={BULL} size={4.6} anchor="start">OB</Txt>

          {/* price di area premium */}
          <Candle x={26} o={40} c={34} h={30} l={44} w={7} />
          <Candle x={44} o={34} c={26} h={22} l={38} w={7} />
          <Candle x={60} o={26} c={33} h={22} l={37} w={7} />

          {/* price di area discount */}
          <Candle x={26} o={62} c={68} h={58} l={72} w={7} />
          <Candle x={44} o={68} c={76} h={64} l={80} w={7} />
          <Candle x={60} o={76} c={69} h={65} l={81} w={7} />

          <Badge x={232} y={20} n={1} color={BEAR} />
          <Badge x={232} y={80} n={2} color={BULL} />
        </Frame>
      );

    case "Refined Order Block":
      return (
        <Frame>
          {/* OB kasar = seluruh candle termasuk wick */}
          <Zone x={52} y={32} w={138} h={26} color={BLUE} />
          {/* refined = body candle OB saja */}
          <rect x="52" y="38" width="138" height="16" fill={BULL} fillOpacity="0.24" stroke={BULL} strokeWidth="0.9" />
          <Txt x={194} y={41} color={BLUE} size={4.4} anchor="start">OB kasar</Txt>
          <Txt x={194} y={54} color={BULL} bold size={4.6} anchor="start">refined</Txt>

          <Candle x={20} o={70} c={62} h={58} l={74} />
          <Candle x={40} o={62} c={56} h={52} l={66} />
          {/* candle OB: open 54 → close 38 */}
          <Candle x={60} o={54} c={38} h={32} l={58} w={11} />
          <Candle x={82} o={38} c={16} h={10} l={42} w={11} />
          <Candle x={104} o={16} c={8} h={4} l={20} />
          <Candle x={126} o={8} c={18} h={4} l={22} />
          {/* retest ke refined zone */}
          <Candle x={146} o={18} c={34} h={14} l={38} />
          <Candle x={166} o={34} c={48} h={30} l={52} />
          <Candle x={186} o={48} c={26} h={22} l={52} w={10} />

          <Badge x={60} y={78} n={1} color={BLUE} />
          <Badge x={166} y={72} n={2} color={AMBER} />
          <Badge x={228} y={78} n={3} color={BULL} />
        </Frame>
      );

    case "Mitigation Block":
      return (
        <Frame>
          <Zone x={40} y={36} w={192} h={20} color={BLUE} label="Mitigation Block" labelX={222} labelY={50} labelAnchor="end" />
          <Candle x={24} o={66} c={52} h={48} l={70} />
          <Candle x={44} o={52} c={38} h={34} l={56} />
          <Candle x={64} o={38} c={18} h={12} l={42} w={10} />
          <Candle x={84} o={18} c={10} h={4} l={24} />
          <Candle x={104} o={10} c={44} h={6} l={48} />
          <Candle x={124} o={44} c={58} h={40} l={62} />
          <Candle x={144} o={58} c={40} h={36} l={62} />
          <Candle x={164} o={40} c={24} h={18} l={44} />
          <Candle x={184} o={24} c={14} h={8} l={28} />
          <Candle x={204} o={14} c={22} h={10} l={26} />
          <Candle x={224} o={22} c={6} h={2} l={26} />
          <Badge x={44} y={28} n={1} color={BLUE} />
          <Badge x={124} y={76} n={2} color={BULL} />
          <Badge x={224} y={76} n={3} color={BULL} />
        </Frame>
      );

    case "Support & Resistance":
      return (
        <Frame>
          <Level y={60} color={BLUE} from={10} to={232} solid />
          <Txt x={232} y={56} color={BLUE} bold size={5.6} anchor="end">SBR</Txt>
          <Candle x={26} o={72} c={54} h={50} l={76} />
          <Candle x={52} o={54} c={64} h={50} l={70} />
          <Candle x={78} o={64} c={44} h={38} l={68} />
          <Candle x={104} o={44} c={56} h={40} l={60} />
          <Candle x={130} o={56} c={86} h={52} l={92} w={10} />
          <Candle x={156} o={86} c={70} h={66} l={90} />
          <Candle x={182} o={70} c={58} h={54} l={74} />
          <Candle x={208} o={58} c={80} h={54} l={86} />
          <Badge x={26} y={40} n={1} color={BLUE} />
          <Badge x={130} y={40} n={2} color={BEAR} />
          <Badge x={182} y={42} n={3} color={AMBER} />
          <Txt x={200} y={100} color={BULL} bold size={6} anchor="middle">SELL</Txt>
        </Frame>
      );

    case "QML / Fresh Level":
      return (
        <Frame>
          <Level y={30} color={BLUE} from={48} to={232} />
          <Txt x={232} y={26} color={BLUE} bold size={5.6} anchor="end">QML</Txt>
          <polyline points="18,52 48,30 76,68 112,14 148,76 180,30 212,64" fill="none" stroke="#d8d8d8" strokeWidth="1.2" />
          <circle cx="48" cy="30" r="2.6" fill={BLUE} />
          <circle cx="112" cy="14" r="2.6" fill={BEAR} />
          <circle cx="148" cy="76" r="2.6" fill={BEAR} />
          <circle cx="180" cy="30" r="3" fill={BULL} />
          <Txt x={48} y={20} color={BLUE} bold>LS</Txt>
          <Txt x={112} y={8} color={BEAR} bold>Head</Txt>
          <Txt x={148} y={88} color={BEAR} bold>LL</Txt>
          <Txt x={232} y={94} color={BULL} bold size={6} anchor="end">ENTRY</Txt>
          <Badge x={18} y={96} n={1} color={BLUE} />
          <Badge x={112} y={96} n={2} color={BEAR} />
          <Badge x={180} y={12} n={3} color={AMBER} />
        </Frame>
      );

    case "Mitigation Chain":
      return (
        <Frame>
          <Zone x={14} y={64} w={92} h={16} color={DIM} label="Mitigated" labelX={60} labelY={74} opacity={0.1} />
          <Zone x={118} y={40} w={114} h={18} color={BLUE} label="Fresh OB" labelX={128} labelY={51} labelAnchor="start" />
          <Candle x={26} o={24} c={38} h={20} l={42} />
          <Candle x={52} o={38} c={62} h={34} l={68} />
          <Candle x={78} o={62} c={30} h={26} l={66} />
          <Candle x={104} o={30} c={44} h={26} l={48} />
          <Candle x={130} o={44} c={22} h={16} l={48} />
          <Candle x={156} o={22} c={48} h={18} l={54} />
          <Candle x={182} o={48} c={26} h={20} l={52} />
          <Candle x={208} o={26} c={8} h={2} l={30} />
          <Badge x={52} y={86} n={1} color={DIM} />
          <Badge x={208} y={62} n={2} color={BLUE} />
          <Badge x={208} y={24} n={3} color={BULL} />
        </Frame>
      );

    case "Premium vs Discount":
      return (
        <Frame>
          <rect x="8" y="10" width="224" height="42" fill={BEAR} fillOpacity="0.09" />
          <rect x="8" y="52" width="224" height="46" fill={BULL} fillOpacity="0.09" />
          <Level y={52} color="#e6e6e6" from={8} to={232} solid />
          <Txt x={14} y={20} color={BEAR} bold size={5.6} anchor="start">PREMIUM · SELL</Txt>
          <Txt x={14} y={49} color="#e6e6e6" bold size={5.4} anchor="start">50% Equilibrium</Txt>
          <Txt x={14} y={94} color={BULL} bold size={5.6} anchor="start">DISCOUNT · BUY</Txt>
          <Candle x={78} o={86} c={72} h={80} l={90} />
          <Candle x={100} o={72} c={50} h={44} l={76} />
          <Candle x={122} o={50} c={30} h={22} l={54} />
          <Candle x={144} o={30} c={16} h={10} l={34} />
          <Candle x={166} o={16} c={40} h={12} l={46} />
          <Candle x={188} o={40} c={70} h={34} l={76} />
          <Candle x={210} o={70} c={48} h={42} l={74} />
          <circle cx="188" cy="74" r="2.8" fill={BULL} />
          <Badge x={144} y={8} n={1} color={AMBER} />
          <Badge x={188} y={92} n={2} color={BULL} />
          <Badge x={232} y={20} n={3} color={BEAR} />
          <Txt x={232} y={44} color={BEAR} bold size={5.4} anchor="end">mahal</Txt>
          <Txt x={232} y={94} color={BULL} bold size={5.4} anchor="end">murah</Txt>
        </Frame>
      );

    // ==========================================
    // 3. LIQUIDITY & EXECUTION TRIGGER
    // ==========================================
    case "BSL & SSL":
      return (
        <Frame>
          <Level y={35} color={AMBER} from={30} to={232} />
          <Level y={73} color={BLUE} from={20} to={232} />
          <Txt x={34} y={31} color={AMBER} bold size={5.8} anchor="start">BSL</Txt>
          <Txt x={24} y={85} color={BLUE} bold size={5.8} anchor="start">SSL</Txt>
          <Candle x={26} o={70} c={56} h={52} l={74} />
          <Candle x={52} o={56} c={40} h={34} l={60} />
          <Candle x={78} o={40} c={62} h={36} l={66} />
          <Candle x={104} o={62} c={42} h={36} l={66} />
          <Candle x={130} o={42} c={66} h={38} l={70} />
          <Candle x={156} o={66} c={50} h={46} l={73} />
          <Candle x={182} o={50} c={30} h={24} l={54} />
          <Candle x={208} o={30} c={48} h={26} l={52} />
          <circle cx={52} cy={34} r={2.2} fill={AMBER} />
          <circle cx={104} cy={36} r={2.2} fill={AMBER} />
          <circle cx={26} cy={74} r={2.2} fill={BLUE} />
          <circle cx={156} cy={73} r={2.2} fill={BLUE} />
          <Badge x={232} y={20} n={1} color={AMBER} />
          <Badge x={232} y={92} n={2} color={BLUE} />
          <Badge x={232} y={56} n={3} color={BULL} />
        </Frame>
      );

    case "PDH / PDL & PWH":
      return (
        <Frame>
          <Level y={28} color={AMBER} from={10} to={232} solid />
          <Level y={80} color={BLUE} from={10} to={232} solid />
          <Txt x={14} y={24} color={AMBER} bold size={5.8} anchor="start">PDH</Txt>
          <Txt x={14} y={94} color={BLUE} bold size={5.8} anchor="start">PDL</Txt>
          <Candle x={26} o={60} c={44} h={40} l={64} />
          <Candle x={52} o={44} c={56} h={40} l={60} />
          <Candle x={78} o={56} c={38} h={32} l={60} />
          <Candle x={104} o={38} c={54} h={18} l={58} />
          <Candle x={130} o={54} c={70} h={50} l={76} />
          <Candle x={156} o={70} c={58} h={54} l={74} />
          <Candle x={182} o={58} c={84} h={54} l={88} />
          <Candle x={208} o={84} c={66} h={62} l={86} />
          <Badge x={104} y={8} n={1} color={BEAR} />
          <Badge x={182} y={100} n={2} color={BULL} />
          <Badge x={232} y={56} n={3} color={AMBER} />
        </Frame>
      );

    case "Liquidity Sweep":
      return (
        <Frame>
          <Level y={34} color={AMBER} from={16} to={232} />
          <Txt x={20} y={30} color={AMBER} bold size={5.6} anchor="start">Pool</Txt>
          <Candle x={26} o={60} c={46} h={42} l={64} />
          <Candle x={52} o={46} c={58} h={40} l={62} />
          <Candle x={78} o={58} c={44} h={38} l={62} />
          <Candle x={104} o={44} c={62} h={16} l={66} w={11} />
          <Candle x={130} o={62} c={80} h={58} l={86} />
          <Candle x={156} o={80} c={92} h={76} l={96} />
          <Candle x={182} o={92} c={84} h={80} l={98} />
          <Candle x={208} o={84} c={96} h={80} l={100} />
          <Badge x={104} y={8} n={1} color={BEAR} />
          <Txt x={200} y={72} color={BULL} bold size={5.8} anchor="middle">reversal</Txt>
          <path d="M 112,56 L 142,70" fill="none" stroke={BULL} strokeWidth="1.1" />
          <Badge x={232} y={54} n={2} color={BULL} />
          <Badge x={232} y={92} n={3} color={AMBER} />
        </Frame>
      );

    case "Inducement (IDM)":
      return (
        <Frame>
          {/* True OB zone (the real target) */}
          <Zone x={138} y={74} w={92} h={14} color={BLUE} />
          <Txt x={206} y={84} color={BLUE} bold size={5.4} anchor="middle">True OB</Txt>
          <Txt x={184} y={100} color={BLUE} bold size={5.6} anchor="middle">POI asli (entry di sini)</Txt>

          {/* IDM level = fake support */}
          <Level y={56} color={AMBER} from={46} to={150} />
          <Txt x={154} y={54} color={AMBER} bold size={5.6} anchor="start">IDM</Txt>

          {/* 1. Drop & small swing low forms (IDM) */}
          <Candle x={20} o={16} c={44} h={12} l={48} />
          <Candle x={46} o={44} c={52} h={40} l={58} w={9} />

          {/* 2. Bounce up - retail buys the "support" */}
          <Candle x={72} o={52} c={32} h={28} l={56} />
          <Candle x={96} o={32} c={46} h={28} l={50} />

          {/* 3. Break below IDM - stops swept */}
          <Candle x={122} o={46} c={72} h={42} l={80} w={11} />

          {/* 4. Tap True OB then strong reversal */}
          <Candle x={148} o={72} c={80} h={68} l={86} />
          <Candle x={176} o={80} c={46} h={42} l={84} />
          <Candle x={202} o={46} c={24} h={18} l={50} />
          <Candle x={226} o={24} c={10} h={6} l={28} />

          <Txt x={84} y={70} color={BEAR} bold size={5.2}>retail BUY</Txt>

          <Badge x={46} y={76} n={1} color={AMBER} />
          <Badge x={72} y={18} n={2} color={BULL} />
          <Badge x={104} y={86} n={3} color={BEAR} />
          <Badge x={232} y={36} n={4} color={BULL} />
        </Frame>
      );

    case "SMT Divergence":
      return (
        <Frame>
          <polyline points="22,44 56,20 88,32 122,12" fill="none" stroke={BULL} strokeWidth="1.3" />
          <circle cx="56" cy="20" r="2.2" fill={BULL} />
          <circle cx="122" cy="12" r="2.2" fill={BULL} />
          <Txt x={22} y={14} color={BULL} bold size={5.6} anchor="start">XAUUSD · HH</Txt>
          <line x1="16" y1="56" x2="228" y2="56" stroke={FAINT} strokeDasharray="3 3" strokeWidth={0.9} />
          <polyline points="22,76 56,60 88,70 122,62" fill="none" stroke={BEAR} strokeWidth="1.3" />
          <circle cx="56" cy="60" r="2.2" fill={BEAR} />
          <circle cx="122" cy="62" r="2.2" fill={BEAR} />
          <Txt x={44} y={94} color={BEAR} bold size={5.6} anchor="start">DXY · gagal (LH)</Txt>
          <Txt x={232} y={34} color={AMBER} bold size={6.4} anchor="end">SMT</Txt>
          <Txt x={232} y={82} color={AMBER} size={5} anchor="end">divergensi</Txt>
          <Badge x={22} y={22} n={1} color={BULL} />
          <Badge x={130} y={100} n={2} color={BEAR} />
          <Badge x={196} y={100} n={3} color={AMBER} />
        </Frame>
      );

    case "Judas Swing":
      return (
        <Frame>
          {/* session box */}
          <rect x="52" y="10" width="180" height="84" fill={AMBER} fillOpacity="0.05" stroke={AMBER} strokeOpacity="0.4" strokeWidth={0.8} strokeDasharray="3 2" />
          <Txt x={142} y={102} color={AMBER} bold size={4.6}>London open · 07:00–09:00</Txt>

          <Level y={44} color={FAINT} from={10} to={58} solid />
          <Level y={60} color={FAINT} from={10} to={58} solid />

          {/* 1. pre-session konsolidasi */}
          <Candle x={20} o={54} c={50} h={46} l={58} w={7} />
          <Candle x={32} o={50} c={56} h={46} l={60} w={7} />
          <Candle x={44} o={56} c={52} h={48} l={60} w={7} />

          {/* 2. JUDAS: wick tajam ke bawah menembus session low */}
          <Candle x={60} o={52} c={64} h={48} l={74} />
          <Candle x={74} o={64} c={78} h={58} l={84} w={10} />
          <Candle x={88} o={78} c={64} h={60} l={82} />

          {/* 3. reversal sejati ke arah berlawanan */}
          <Candle x={104} o={64} c={46} h={42} l={68} w={10} />
          <Candle x={120} o={46} c={30} h={24} l={50} />
          <Candle x={136} o={30} c={18} h={12} l={34} />
          <Candle x={152} o={18} c={26} h={12} l={30} />
          <Candle x={168} o={26} c={12} h={6} l={30} />
          <Candle x={184} o={12} c={20} h={6} l={24} />
          <Candle x={200} o={20} c={6} h={2} l={24} />
          <Candle x={216} o={6} c={14} h={2} l={18} />

          <Txt x={74} y={94} color={BEAR} bold size={4.4}>judas low</Txt>
          <Badge x={32} y={90} n={1} color={DIM} />
          <Badge x={74} y={36} n={2} color={BEAR} />
          <Badge x={216} y={90} n={3} color={BULL} />
        </Frame>
      );

    case "Silver Bullet":
      return (
        <Frame>
          {/* time window box 10:00-11:00 */}
          <rect x="120" y="8" width="96" height="88" fill={BLUE} fillOpacity="0.07" stroke={BLUE} strokeOpacity="0.6" strokeWidth={0.9} strokeDasharray="3 2" />
          <Txt x={168} y={16} color={BLUE} bold size={4.6}>10:00 – 11:00</Txt>

          {/* pre-window: drift turun */}
          <Candle x={20} o={30} c={38} h={26} l={42} />
          <Candle x={40} o={38} c={48} h={34} l={52} />
          <Candle x={60} o={48} c={58} h={44} l={62} />
          <Candle x={80} o={58} c={66} h={54} l={70} />
          <Candle x={100} o={66} c={60} h={56} l={70} />

          {/* FVG terbentuk di dalam window */}
          <Zone x={128} y={44} w={88} h={14} color={BULL} label="FVG" labelX={210} labelY={54} labelAnchor="end" />

          {/* displacement + retest + entry */}
          <Candle x={128} o={60} c={30} h={24} l={64} w={10} />
          <Candle x={148} o={30} c={40} h={26} l={44} />
          <Candle x={168} o={40} c={52} h={36} l={56} />
          <circle cx={168} cy={50} r={2.8} fill={AMBER} />
          <Candle x={188} o={52} c={22} h={18} l={56} w={10} />
          <Candle x={208} o={22} c={8} h={4} l={26} />

          <Badge x={100} y={88} n={1} color={DIM} />
          <Badge x={128} y={88} n={2} color={BULL} />
          <Badge x={208} y={88} n={3} color={BULL} />
          <Txt x={168} y={70} color={AMBER} bold size={4.4}>entry</Txt>
        </Frame>
      );

    case "Time Killzones":
      return (
        <Frame>
          <rect x="10" y="34" width="62" height="30" fill="#161616" stroke={FAINT} strokeWidth={0.8} />
          <Txt x={41} y={26} color={DIM} bold size={5.4}>Asia</Txt>
          <rect x="78" y="12" width="68" height="82" fill={BLUE} fillOpacity={0.09} stroke={BLUE} strokeOpacity={0.7} strokeWidth={0.9} strokeDasharray="3 2" />
          <Txt x={112} y={90} color={BLUE} bold size={5.4}>London</Txt>
          <rect x="152" y="12" width="76" height="82" fill={AMBER} fillOpacity={0.08} stroke={AMBER} strokeOpacity={0.7} strokeWidth={0.9} strokeDasharray="3 2" />
          <Txt x={190} y={90} color={AMBER} bold size={5.4}>New York</Txt>
          <Candle x={24} o={52} c={48} h={46} l={54} w={7} />
          <Candle x={40} o={48} c={52} h={44} l={56} w={7} />
          <Candle x={56} o={52} c={46} h={44} l={54} w={7} />
          <Candle x={96} o={46} c={24} h={18} l={50} w={10} />
          <Candle x={118} o={24} c={32} h={20} l={38} w={9} />
          <Candle x={170} o={32} c={14} h={8} l={36} w={9} />
          <Candle x={196} o={14} c={26} h={10} l={32} w={9} />
          <Badge x={41} y={76} n={1} color={DIM} />
          <Badge x={112} y={22} n={2} color={BLUE} />
          <Badge x={190} y={22} n={3} color={AMBER} />
        </Frame>
      );

    case "OTE":
      return (
        <Frame>
          <Zone x={58} y={31} w={176} h={13} color={BULL} />
          <Level y={16} color={FAINT} from={18} to={232} solid />
          <Level y={52} color={FAINT} from={18} to={232} />
          <Level y={88} color={FAINT} from={18} to={232} solid />
          <Txt x={232} y={13} color={DIM} size={5.2} anchor="end">1.0</Txt>
          <Txt x={232} y={49} color={DIM} size={5.2} anchor="end">0.5</Txt>
          <Txt x={232} y={98} color={DIM} size={5.2} anchor="end">0.0</Txt>
          <Txt x={196} y={40} color={BULL} bold size={5.6} anchor="middle">OTE 62–79%</Txt>
          <Candle x={26} o={88} c={74} h={84} l={92} />
          <Candle x={52} o={74} c={40} h={34} l={78} w={10} />
          <Candle x={78} o={40} c={18} h={10} l={44} />
          <Candle x={104} o={18} c={36} h={14} l={42} />
          <Candle x={130} o={36} c={20} h={14} l={40} />
          <Candle x={156} o={20} c={8} h={2} l={24} />
          <Candle x={182} o={8} c={18} h={4} l={22} />
          <Candle x={208} o={18} c={4} h={0} l={22} />
          <circle cx={104} cy={40} r={2.8} fill={BULL} />
          <Badge x={104} y={58} n={1} color={BULL} />
          <Txt x={122} y={60} color={BULL} bold size={5.8} anchor="start">ENTRY</Txt>
          <Badge x={52} y={98} n={2} color={AMBER} />
          <Badge x={232} y={70} n={3} color={AMBER} />
        </Frame>
      );

    case "SMC Liquidity Sweep":
      return (
        <Frame>
          {/* equal lows = liquidity */}
          <Level y={56} color={AMBER} from={20} to={232} />
          <Txt x={232} y={53} color={AMBER} bold size={4.2} anchor="end">equal lows</Txt>

          {/* dua swing low menyentuh level */}
          <Candle x={24} o={40} c={50} h={36} l={56} />
          <Candle x={48} o={50} c={38} h={34} l={56} />
          <Candle x={72} o={38} c={48} h={34} l={56} />
          <Candle x={96} o={48} c={36} h={32} l={56} />

          {/* sweep: wick tembus jauh lalu close balik */}
          <Candle x={120} o={36} c={50} h={32} l={74} w={10} />

          {/* reversal naik */}
          <Candle x={144} o={50} c={32} h={28} l={54} w={10} />
          <Candle x={168} o={32} c={20} h={14} l={36} />
          <Candle x={192} o={20} c={28} h={14} l={32} />
          <Candle x={216} o={28} c={10} h={6} l={32} w={10} />

          <Badge x={72} y={90} n={1} color={AMBER} />
          <Badge x={120} y={90} n={2} color={BEAR} />
          <Badge x={216} y={90} n={3} color={BULL} />
        </Frame>
      );

    case "MSNR Sweep":
      return (
        <Frame>
          {/* level body yang disapu */}
          <Level y={40} color={AMBER} from={16} to={232} solid />
          <Txt x={232} y={37} color={AMBER} bold size={4.2} anchor="end">body level</Txt>

          {/* harga naik ke level */}
          <Candle x={22} o={76} c={66} h={62} l={80} />
          <Candle x={44} o={66} c={56} h={52} l={70} />
          <Candle x={66} o={56} c={46} h={42} l={60} />

          {/* sapu level body: wick lewat, body close balik di bawah */}
          <Candle x={88} o={46} c={54} h={32} l={60} w={10} />

          {/* reversal turun */}
          <Candle x={112} o={54} c={68} h={50} l={72} w={10} />
          <Candle x={136} o={68} c={78} h={64} l={82} />
          <Candle x={160} o={78} c={72} h={68} l={84} />
          <Candle x={184} o={72} c={88} h={68} l={92} w={10} />
          <Candle x={208} o={88} c={96} h={84} l={100} />
          <Candle x={230} o={96} c={86} h={82} l={100} w={8} />

          <Badge x={26} y={32} n={1} color={AMBER} />
          <Badge x={88} y={20} n={2} color={BEAR} />
          <Badge x={112} y={88} n={3} color={BULL} />
          <Txt x={88} y={78} color={BEAR} bold size={4.2}>sapu body</Txt>
        </Frame>
      );

    case "Execution Trigger":
      return (
        <Frame>
          <Zone x={12} y={54} w={150} h={28} color={BLUE} label="POI" labelX={26} labelY={72} labelAnchor="start" />
          <Candle x={26} o={34} c={46} h={30} l={50} />
          <Candle x={52} o={46} c={38} h={34} l={50} />
          <Candle x={78} o={38} c={52} h={34} l={56} />
          <Candle x={104} o={52} c={70} h={48} l={84} w={10} />
          <Candle x={130} o={70} c={44} h={40} l={74} w={11} />
          <Candle x={156} o={44} c={24} h={18} l={48} />
          <Candle x={182} o={24} c={36} h={20} l={40} />
          <Candle x={208} o={36} c={12} h={6} l={40} />
          <Badge x={104} y={92} n={1} color={AMBER} />
          <Txt x={122} y={94} color={AMBER} size={5.2} anchor="start">pinbar</Txt>
          <Badge x={130} y={30} n={2} color={BULL} />
          <Badge x={208} y={86} n={3} color={BULL} />
          <Txt x={208} y={100} color={BULL} bold size={5.6} anchor="middle">EXECUTE</Txt>
        </Frame>
      );

    default:
      return null;
  }
}
