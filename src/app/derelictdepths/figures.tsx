// Hand-drawn figures, server-rendered as inline SVG: the forge camera from the side, the Miner's frame data and the
// join budget. Their numbers come from facts.json (generated from the game repo's main) or the constants below.

type Cam = { fov: number; pitch: number; distance: number; focusHeight: number; popMargin: number; popMin: number; popOutSmooth: number };

export function CameraRig({ cam }: { cam: Cam }) {
  const s = 17;
  const groundY = 300;
  const heroX = 520;
  const rootH = 3;
  const lookY = groundY - (rootH + cam.focusHeight) * s;
  const rad = (cam.pitch * Math.PI) / 180;
  const eyeX = heroX - Math.cos(rad) * cam.distance * s;
  const eyeY = lookY - Math.sin(rad) * cam.distance * s;
  const half = ((cam.fov / 2) * Math.PI) / 180;
  const ray = (a: number, len: number) => [eyeX + Math.cos(a) * len, eyeY + Math.sin(a) * len];
  const [ax, ay] = ray(rad - half, 360);
  const [bx, by] = ray(rad + half, 300);
  const arcR = 70;
  const arcX = heroX - arcR;
  const arcEndX = heroX - Math.cos(rad) * arcR;
  const arcEndY = lookY - Math.sin(rad) * arcR;
  return (
    <svg className="ml-svg" viewBox="0 0 720 360" width="720" height="360" role="img" aria-label={"the forge camera from the side: the eye sits " + cam.distance + " studs from a look point " + cam.focusHeight + " studs above the hero's root, looking down " + cam.pitch + " degrees, field of view " + cam.fov + " degrees."}>
      <defs>
        <linearGradient id="mlcone" x1="0" x2="1">
          <stop offset="0" stopColor="#e6c46c" stopOpacity="0.28" />
          <stop offset="1" stopColor="#e6c46c" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={eyeX + "," + eyeY + " " + ax + "," + ay + " " + bx + "," + by} fill="url(#mlcone)" />
      <line x1="20" y1={groundY} x2="700" y2={groundY} stroke="#4a4238" strokeWidth="3" />
      {Array.from({ length: 34 }, (_, i) => (
        <rect key={i} x={20 + i * 20} y={groundY} width="20" height="14" fill={i % 2 ? "#262019" : "#231e19"} stroke="#070605" strokeWidth="1.5" />
      ))}
      <g stroke="#070605" strokeWidth="2.5">
        <rect x={heroX - 13} y={groundY - 5 * s} width="26" height={2 * s} fill="#efe9df" rx="3" />
        <rect x={heroX - 11} y={groundY - 3 * s} width="22" height={3 * s} fill="#cfc6f2" rx="2" />
        <rect x={heroX - 16} y={groundY - 6.6 * s} width="32" height={1.7 * s} fill="#ffffff" rx="6" />
      </g>
      <text x={heroX + 22} y={groundY - 6 * s} className="muted" fontSize="13">hero (any r15 avatar)</text>
      <line x1={eyeX} y1={eyeY} x2={heroX} y2={lookY} stroke="#e6c46c" strokeWidth="2.5" strokeDasharray="7 6" />
      <circle cx={heroX} cy={lookY} r="6" fill="#e6c46c" stroke="#070605" strokeWidth="2" />
      <line x1={heroX - 110} y1={lookY} x2={heroX} y2={lookY} stroke="#8f8676" strokeWidth="1.5" strokeDasharray="3 4" />
      <path d={"m " + arcX + " " + lookY + " a " + arcR + " " + arcR + " 0 0 1 " + arcEndX + " " + arcEndY} fill="none" stroke="#e6c46c" strokeWidth="2" />
      <text x={heroX - arcR - 44} y={lookY - 4} className="amber" fontSize="15" fontWeight="700">{cam.pitch}°</text>
      <line x1={heroX + 36} y1={lookY} x2={heroX + 36} y2={groundY - rootH * s} stroke="#b3aa9c" strokeWidth="1.5" />
      <text x={heroX + 44} y={lookY + 14} fontSize="13" className="muted">+{cam.focusHeight} studs</text>
      <g transform={"translate(" + eyeX + "," + eyeY + ") rotate(" + cam.pitch + ")"}>
        <rect x="-30" y="-14" width="34" height="28" rx="5" fill="#231e19" stroke="#070605" strokeWidth="2.5" />
        <polygon points="4,-8 18,-14 18,14 4,8" fill="#4a4238" stroke="#070605" strokeWidth="2.5" />
      </g>
      <text x={eyeX - 30} y={eyeY - 26} fontSize="15" fontWeight="700">eye</text>
      <text x={(eyeX + heroX) / 2 - 92} y={(eyeY + lookY) / 2 - 22} fontSize="15" fontWeight="700" className="amber">{cam.distance} studs</text>
      <text x={eyeX - 150} y={eyeY + 70} fontSize="13" className="muted">fov {cam.fov}° (vertical)</text>
      <text x="24" y="28" fontSize="13" className="muted">side view, to scale (1 stud = {s} px)</text>
      <text x="24" y="342" fontSize="13" className="muted">a wall in the way: the eye pops in front of it ({cam.popMargin} stud margin, never closer than {cam.popMin}) and eases out in {cam.popOutSmooth} s.</text>
    </svg>
  );
}

type Move = { name: string; startup: number; active: number; recovery: number; cancel?: number; dmg: number };

const MINER: Move[] = [
  { name: "combo 1", startup: 5, active: 3, recovery: 12, cancel: 8, dmg: 1 },
  { name: "combo 2", startup: 5, active: 3, recovery: 12, cancel: 8, dmg: 1 },
  { name: "combo 3", startup: 8, active: 4, recovery: 18, dmg: 2 },
  { name: "strike the vein", startup: 12, active: 4, recovery: 14, dmg: 3 },
  { name: "cave breaker (ult)", startup: 39, active: 6, recovery: 18, dmg: 6 },
];

export function SwingFrames() {
  const left = 150;
  const px = 8.4;
  const row = 44;
  const top = 46;
  const total = 63;
  const h = top + MINER.length * row + 56;
  return (
    <svg className="ml-svg" viewBox={"0 0 " + (left + total * px + 30) + " " + h} width={left + total * px + 30} height={h} role="img" aria-label="the miner's moves in frames at 60 per second: startup, active and recovery for each combo hit, the ability and the ult.">
      {Array.from({ length: Math.floor(total / 6) + 1 }, (_, i) => (
        <g key={i}>
          <line x1={left + i * 6 * px} y1={top - 10} x2={left + i * 6 * px} y2={top + MINER.length * row - 8} stroke="#2e2822" strokeWidth="1" />
          <text x={left + i * 6 * px} y={top - 16} fontSize="11" className="muted" textAnchor="middle">{i * 6}</text>
        </g>
      ))}
      <text x={left} y="16" fontSize="12" className="muted">frames (60 a second, 6 f = 0.1 s)</text>
      {MINER.map((m, i) => {
        const y = top + i * row;
        const a = left + m.startup * px;
        const b = a + m.active * px;
        const c = b + m.recovery * px;
        return (
          <g key={m.name}>
            <text x={left - 12} y={y + 18} fontSize="13.5" textAnchor="end" fontWeight="700">{m.name}</text>
            <rect x={left} y={y + 4} width={m.startup * px} height="20" fill="#e6c46c" stroke="#070605" strokeWidth="2" />
            <rect x={a} y={y + 4} width={m.active * px} height="20" fill="#ff6b6b" stroke="#070605" strokeWidth="2" />
            <rect x={b} y={y + 4} width={m.recovery * px} height="20" fill="#8f8676" stroke="#070605" strokeWidth="2" />
            {m.cancel ? <line x1={left + m.cancel * px} y1={y} x2={left + m.cancel * px} y2={y + 28} stroke="#73e8b5" strokeWidth="3" /> : null}
            <text x={c + 8} y={y + 19} fontSize="12" className="muted">{m.dmg} dmg</text>
          </g>
        );
      })}
      <g transform={"translate(" + left + "," + (h - 26) + ")"} fontSize="12.5">
        <rect width="14" height="14" fill="#e6c46c" stroke="#070605" /><text x="20" y="12">startup (wind-up)</text>
        <rect x="150" width="14" height="14" fill="#ff6b6b" stroke="#070605" /><text x="170" y="12">active (can hit)</text>
        <rect x="290" width="14" height="14" fill="#8f8676" stroke="#070605" /><text x="310" y="12">recovery</text>
        <rect x="400" y="0" width="4" height="14" fill="#73e8b5" /><text x="410" y="12">next hit can start</text>
      </g>
    </svg>
  );
}

export type Point = { sha: string; bytes: number; line: number };

// Overnight builds before the refresh job started measuring each main (from the JoinBudget test's own comments).
export const JOIN_SEED: Point[] = [
  { sha: "97effd2", bytes: 1102692, line: 1230000 },
  { sha: "ec9d81fe", bytes: 1171660, line: 1300000 },
  { sha: "5da98087", bytes: 1247699, line: 1330000 },
  { sha: "8c9d041d", bytes: 1326790, line: 1360000 },
  { sha: "9150c4fe", bytes: 1358842, line: 1400000 },
  { sha: "87761afc", bytes: 1391967, line: 1400000 },
];

export function JoinBudget({ history, publishLine }: { history: Point[]; publishLine: number }) {
  const data = history.slice(-8);
  const W = 680;
  const H = 320;
  const x0 = 70;
  const y0 = 260;
  const top = Math.max(1450000, ...data.map((d) => Math.max(d.bytes, d.line) + 30000));
  const min = 1000000;
  const y = (v: number) => y0 - ((v - min) / (top - min)) * 220;
  const bw = (W - x0 - 20) / data.length;
  const ticks = [];
  for (let v = min; v <= top; v += 100000) ticks.push(v);
  return (
    <svg className="ml-svg" viewBox={"0 0 " + W + " " + H} width={W} height={H} role="img" aria-label="place size in bytes against the join budget's byte line, main by main.">
      {ticks.map((v) => (
        <g key={v}>
          <line x1={x0} x2={W - 10} y1={y(v)} y2={y(v)} stroke="#2e2822" />
          <text x={x0 - 8} y={y(v) + 4} fontSize="11" textAnchor="end" className="muted">{(v / 1e6).toFixed(1)} mb</text>
        </g>
      ))}
      <line x1={x0} x2={W - 10} y1={y(publishLine)} y2={y(publishLine)} stroke="#73e8b5" strokeWidth="2" strokeDasharray="6 5" />
      <text x={W - 12} y={y(publishLine) - 6} fontSize="11.5" textAnchor="end" fill="#73e8b5">publish line {(publishLine / 1e6).toFixed(2)} mb</text>
      {data.map((d, i) => {
        const cx = x0 + i * bw + bw / 2;
        return (
          <g key={d.sha + i}>
            <rect x={cx - bw * 0.3} y={y(d.bytes)} width={bw * 0.6} height={y0 - y(d.bytes)} fill={i === data.length - 1 ? "#e6c46c" : "#8f8676"} stroke="#070605" strokeWidth="2" />
            <line x1={cx - bw * 0.42} x2={cx + bw * 0.42} y1={y(d.line)} y2={y(d.line)} stroke="#ff6b6b" strokeWidth="3" />
            <text x={cx} y={y(d.bytes) - 6} fontSize="11" textAnchor="middle">{(d.bytes / 1e6).toFixed(2)}</text>
          </g>
        );
      })}
      <g transform={"translate(" + x0 + ",300)"} fontSize="12">
        <rect width="14" height="12" fill="#8f8676" stroke="#070605" /><text x="20" y="11">place bytes on that main</text>
        <rect x="200" y="5" width="18" height="3" fill="#ff6b6b" /><text x="224" y="11">the test's byte line then</text>
      </g>
    </svg>
  );
}
