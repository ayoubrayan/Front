import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart2, Activity, PieChart } from "lucide-react";
import "../css/DashboardCharts.css";

/* ─────────────────────────────────────────────
   UTILITY: build 7-day summary from movements
───────────────────────────────────────────── */
function buildWeeklyData(movements) {
  const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const map = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map[key] = { label: days[d.getDay()], in: 0, out: 0 };
  }
  movements.forEach((m) => {
    const key = m.date ? m.date.slice(0, 10) : null;
    if (key && map[key]) {
      if (m.type === "in") map[key].in += m.quantity || 1;
      else map[key].out += m.quantity || 1;
    }
  });
  return Object.values(map);
}

/* ─────────────────────────────────────────────
   1. ANIMATED AREA CHART — Weekly Stock Flow
───────────────────────────────────────────── */
function AreaChart({ data }) {
  const W = 520, H = 160;
  const PAD = { top: 10, right: 10, bottom: 28, left: 36 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.flatMap((d) => [d.in, d.out]), 1);
  const xStep = innerW / (data.length - 1 || 1);

  const toX = (i) => PAD.left + i * xStep;
  const toY = (v) => PAD.top + innerH - (v / maxVal) * innerH;

  const buildPath = (key) =>
    data.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(d[key]).toFixed(1)}`).join(" ");

  const buildArea = (key) =>
    `${buildPath(key)} L ${toX(data.length - 1).toFixed(1)} ${(PAD.top + innerH).toFixed(1)} L ${toX(0).toFixed(1)} ${(PAD.top + innerH).toFixed(1)} Z`;

  const [tooltip, setTooltip] = useState(null);

  return (
    <div className="dc-chart-box">
      <div className="dc-chart-header">
        <span className="dc-chart-icon" style={{ background: "linear-gradient(135deg,#6366f1,#818cf8)" }}>
          <Activity size={16} />
        </span>
        <div>
          <p className="dc-chart-title">Flux de stock hebdomadaire</p>
          <p className="dc-chart-sub">Entrées vs Sorties — 7 derniers jours</p>
        </div>
        <div className="dc-legend">
          <span><span className="dc-dot" style={{ background: "#6366f1" }} />Entrées</span>
          <span><span className="dc-dot" style={{ background: "#f43f5e" }} />Sorties</span>
        </div>
      </div>

      <div className="dc-svg-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
          <defs>
            <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.02" />
            </linearGradient>
            <filter id="glowF">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = PAD.top + innerH * (1 - t);
            return (
              <line key={t} x1={PAD.left} x2={W - PAD.right} y1={y} y2={y}
                stroke="rgba(100,116,139,0.12)" strokeWidth="1" strokeDasharray="4,4" />
            );
          })}

          {/* Areas */}
          <motion.path d={buildArea("out")} fill="url(#gradOut)"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
          <motion.path d={buildArea("in")} fill="url(#gradIn)"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} />

          {/* Lines */}
          <motion.path d={buildPath("out")} fill="none" stroke="#f43f5e" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round" style={{ filter: "url(#glowF)" }}
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 1.3, ease: "easeOut" }} />
          <motion.path d={buildPath("in")} fill="none" stroke="#6366f1" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" style={{ filter: "url(#glowF)" }}
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 1.3, ease: "easeOut", delay: 0.15 }} />

          {/* X labels */}
          {data.map((d, i) => (
            <text key={i} x={toX(i)} y={H - 6} textAnchor="middle"
              fontSize="10" fill="rgba(100,116,139,0.8)">{d.label}</text>
          ))}

          {/* Y label */}
          <text x={PAD.left - 4} y={PAD.top + innerH / 2} textAnchor="middle"
            fontSize="9" fill="rgba(100,116,139,0.7)"
            transform={`rotate(-90, ${PAD.left - 4}, ${PAD.top + innerH / 2})`}>Qté</text>

          {/* Hover dots */}
          {data.map((d, i) => (
            <g key={i}
              onMouseEnter={() => setTooltip({ x: toX(i), y: Math.min(toY(d.in), toY(d.out)) - 10, d })}
              onMouseLeave={() => setTooltip(null)}>
              <circle cx={toX(i)} cy={toY(d.in)} r="4" fill="#fff" stroke="#6366f1" strokeWidth="2" />
              <circle cx={toX(i)} cy={toY(d.out)} r="4" fill="#fff" stroke="#f43f5e" strokeWidth="2" />
              <rect x={toX(i) - 14} y={PAD.top} width="28" height={innerH} fill="transparent" />
            </g>
          ))}

          {/* Tooltip */}
          {tooltip && (
            <g>
              <rect x={tooltip.x - 42} y={tooltip.y - 38} width="84" height="36"
                rx="8" fill="rgba(15,23,42,0.9)" />
              <text x={tooltip.x} y={tooltip.y - 22} textAnchor="middle" fontSize="10.5" fill="#a5b4fc">
                ↑ {tooltip.d.in}
              </text>
              <text x={tooltip.x} y={tooltip.y - 8} textAnchor="middle" fontSize="10.5" fill="#fda4af">
                ↓ {tooltip.d.out}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   2. ANIMATED DONUT — Stock Health
───────────────────────────────────────────── */
function DonutChart({ totalProducts, lowStock }) {
  const healthy = Math.max(totalProducts - lowStock, 0);
  const total = totalProducts || 1;
  const healthPct = (healthy / total) * 100;
  const lowPct = (lowStock / total) * 100;

  const R = 52, CX = 80, CY = 80, SW = 14;
  const circ = 2 * Math.PI * R;

  const segments = [
    { pct: healthPct, color: "#22c55e", label: "Sain", count: healthy },
    { pct: lowPct, color: "#f97316", label: "Faible", count: lowStock },
  ];

  let cumulative = 0;

  return (
    <div className="dc-chart-box dc-chart-box--sm">
      <div className="dc-chart-header">
        <span className="dc-chart-icon" style={{ background: "linear-gradient(135deg,#22c55e,#4ade80)" }}>
          <PieChart size={16} />
        </span>
        <div>
          <p className="dc-chart-title">Santé du stock</p>
          <p className="dc-chart-sub">Produits sains vs faibles</p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          <defs>
            <filter id="donutGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <circle cx={CX} cy={CY} r={R} fill="none"
            stroke="rgba(148,163,184,0.12)" strokeWidth={SW} />

          {segments.map((seg, idx) => {
            const dashLen = (seg.pct / 100) * circ;
            const rotation = (cumulative / 100) * 360 - 90;
            cumulative += seg.pct;
            return (
              <motion.circle
                key={idx}
                cx={CX} cy={CY} r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth={SW}
                strokeLinecap="round"
                strokeDasharray={`${circ} ${circ}`}
                style={{
                  transformOrigin: `${CX}px ${CY}px`,
                  transform: `rotate(${rotation}deg)`,
                  filter: "url(#donutGlow)"
                }}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ - dashLen }}
                transition={{ duration: 1.2, ease: "easeOut", delay: idx * 0.35 }}
              />
            );
          })}

          <text x={CX} y={CY - 8} textAnchor="middle" fontSize="20" fontWeight="700" fill="#1e293b">
            {Math.round(healthPct)}%
          </text>
          <text x={CX} y={CY + 10} textAnchor="middle" fontSize="10" fill="rgba(100,116,139,0.9)">
            sain
          </text>
        </svg>

        <div className="dc-donut-legend">
          {segments.map((s, i) => (
            <div key={i} className="dc-donut-item">
              <span className="dc-donut-dot" style={{ background: s.color }} />
              <div>
                <p className="dc-donut-label">{s.label}</p>
                <p className="dc-donut-val" style={{ color: s.color }}>{s.count} produits</p>
              </div>
            </div>
          ))}
          <div className="dc-donut-item">
            <span className="dc-donut-dot" style={{ background: "#6366f1" }} />
            <div>
              <p className="dc-donut-label">Total</p>
              <p className="dc-donut-val" style={{ color: "#6366f1" }}>{totalProducts} produits</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   3. ANIMATED HORIZONTAL BAR CHART
───────────────────────────────────────────── */
function HBarChart({ movements }) {
  const map = {};
  movements.forEach((m) => {
    const k = m.product_name || "Inconnu";
    if (!map[k]) map[k] = { in: 0, out: 0 };
    if (m.type === "in") map[k].in += m.quantity || 1;
    else map[k].out += m.quantity || 1;
  });

  const items = Object.entries(map)
    .map(([name, v]) => ({ name, total: v.in + v.out, in: v.in, out: v.out }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const maxTotal = Math.max(...items.map((d) => d.total), 1);

  return (
    <div className="dc-chart-box">
      <div className="dc-chart-header">
        <span className="dc-chart-icon" style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
          <BarChart2 size={16} />
        </span>
        <div>
          <p className="dc-chart-title">Produits les plus actifs</p>
          <p className="dc-chart-sub">Par volume de mouvements récents</p>
        </div>
        <div className="dc-legend">
          <span><span className="dc-dot" style={{ background: "#6366f1" }} />Entrées</span>
          <span><span className="dc-dot" style={{ background: "#f43f5e" }} />Sorties</span>
        </div>
      </div>

      {items.length === 0 ? (
        <p style={{ color: "rgba(100,116,139,0.7)", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>
          Aucun mouvement récent
        </p>
      ) : (
        <div className="dc-bar-list">
          {items.map((d, i) => {
            const inPct = (d.in / maxTotal) * 100;
            const outPct = (d.out / maxTotal) * 100;
            return (
              <div key={i} className="dc-bar-row">
                <div className="dc-bar-label">
                  <span className="dc-bar-name">{d.name.length > 18 ? d.name.slice(0, 17) + "…" : d.name}</span>
                  <span className="dc-bar-count">{d.total}</span>
                </div>
                <div className="dc-bar-track">
                  <motion.div className="dc-bar-fill dc-bar-in"
                    initial={{ width: 0 }} animate={{ width: `${inPct}%` }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.1 }} />
                  <motion.div className="dc-bar-fill dc-bar-out"
                    initial={{ width: 0 }} animate={{ width: `${outPct}%` }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.1 + 0.12 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   4. SPARKLINE
───────────────────────────────────────────── */
function Sparkline({ values, color }) {
  const W = 80, H = 30;
  if (!values || values.length < 2) return <div style={{ width: W }} />;
  const max = Math.max(...values, 1);
  const step = W / (values.length - 1);
  const toY = (v) => H - (v / max) * H * 0.85 - 2;
  const path = values.map((v, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${toY(v).toFixed(1)}`).join(" ");
  const area = `${path} L ${((values.length - 1) * step).toFixed(1)} ${H} L 0 ${H} Z`;
  const uid = color.replace("#", "sp");

  return (
    <svg width={W} height={H} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={area} fill={`url(#${uid})`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
      <motion.path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }} />
    </svg>
  );
}

function KpiCard({ label, value, delta, sparkValues, color, icon: Icon }) {
  const isPositive = delta >= 0;
  return (
    <motion.div className="dc-kpi-card"
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}
      transition={{ type: "spring", stiffness: 300 }}>
      <div className="dc-kpi-header">
        <span className="dc-kpi-icon" style={{ background: `${color}20`, color }}>
          <Icon size={14} />
        </span>
        <span className="dc-kpi-label">{label}</span>
      </div>
      <div className="dc-kpi-body">
        <span className="dc-kpi-value" style={{ color }}>{value}</span>
        <Sparkline values={sparkValues} color={color} />
      </div>
      <div className={`dc-kpi-delta ${isPositive ? "dc-kpi-up" : "dc-kpi-down"}`}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        <span>{Math.abs(delta)}% vs hier</span>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
export default function DashboardCharts({ data, loading }) {
  if (loading) return null;

  const movements = data.recent_movements || [];
  const weeklyData = buildWeeklyData(movements);

  const todayIn  = weeklyData[weeklyData.length - 1]?.in  || 0;
  const yesterdayIn  = weeklyData[weeklyData.length - 2]?.in  || 1;
  const todayOut = weeklyData[weeklyData.length - 1]?.out || 0;
  const yesterdayOut = weeklyData[weeklyData.length - 2]?.out || 1;

  const deltIn  = Math.round(((todayIn  - yesterdayIn)  / (yesterdayIn  || 1)) * 100);
  const deltOut = Math.round(((todayOut - yesterdayOut) / (yesterdayOut || 1)) * 100);

  return (
    <motion.div className="dc-root"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}>

      {/* Section divider */}
      <div className="dc-section-header">
        <span className="dc-section-line" />
        <span className="dc-section-label">Analytiques</span>
        <span className="dc-section-line" />
      </div>

      {/* KPI row */}
      <div className="dc-kpi-row">
        <KpiCard label="Entrées aujourd'hui" value={todayIn} delta={deltIn}
          sparkValues={weeklyData.map(d => d.in)} color="#6366f1" icon={TrendingUp} />
        <KpiCard label="Sorties aujourd'hui" value={todayOut} delta={-Math.abs(deltOut)}
          sparkValues={weeklyData.map(d => d.out)} color="#f43f5e" icon={TrendingDown} />
        <KpiCard label="Alertes stock" value={data.low_stock_alerts?.length || 0} delta={0}
          sparkValues={[0,1,0,2,1,0, data.low_stock_alerts?.length || 0]}
          color="#f97316" icon={Activity} />
      </div>

      {/* Charts grid */}
      <div className="dc-charts-grid">
        <div className="dc-col-wide">
          <AreaChart data={weeklyData} />
        </div>
        <div className="dc-col-narrow">
          <DonutChart
            totalProducts={data.stats?.totalProducts || 0}
            lowStock={data.stats?.lowStock || 0}
          />
        </div>
      </div>

      {/* Bar chart full width */}
      <HBarChart movements={movements} />
    </motion.div>
  );
}
