import { useMemo } from 'react';
import { getWeeklyTotal, getCityState, getConsecutiveGreenDays, getConsecutiveNoDriveDays } from '../utils/scoring';

export default function CityView() {
  const weeklyTotal = getWeeklyTotal();
  const cityState = getCityState(weeklyTotal);
  const greenDays = getConsecutiveGreenDays();
  const noDriveDays = getConsecutiveNoDriveDays();

  const showSolar = greenDays >= 3;
  const showBikeLanes = noDriveDays >= 5;
  const showWindTurbines = greenDays >= 7;
  const showMetro = greenDays >= 2; // Elevated metro train unlock

  const config = useMemo(() => {
    switch (cityState) {
      case 'Thriving': return { skyTop: '#56CCF2', skyBot: '#2F80ED', groundColor: '#27AE60', treeCount: 6, smokeStacks: 0, vehicles: ['rickshaw', 'cycle', 'ev_scooter'], parks: true };
      case 'Struggling': return { skyTop: '#8E9EAB', skyBot: '#eef2f3', groundColor: '#78B159', treeCount: 3, smokeStacks: 1, vehicles: ['rickshaw', 'petrol_scooter', 'cab'], parks: true };
      case 'Polluted': return { skyTop: '#f12711', skyBot: '#f5af19', groundColor: '#8A9A86', treeCount: 1, smokeStacks: 2, vehicles: ['cab', 'petrol_scooter', 'suv', 'rickshaw'], parks: false };
      case 'Critical': return { skyTop: '#3a1c1c', skyBot: '#5D4037', groundColor: '#6D6D6D', treeCount: 0, smokeStacks: 3, vehicles: ['suv', 'suv', 'cab', 'cab', 'petrol_scooter'], parks: false };
      default: return { skyTop: '#56CCF2', skyBot: '#2F80ED', groundColor: '#27AE60', treeCount: 6, smokeStacks: 0, vehicles: ['rickshaw', 'cycle'], parks: true };
    }
  }, [cityState]);

  const stateColors = { Thriving: 'text-emerald-400', Struggling: 'text-yellow-400', Polluted: 'text-orange-400', Critical: 'text-red-400' };
  const stateEmoji = { Thriving: '🌿', Struggling: '🌥️', Polluted: '🏭', Critical: '🔥' };

  return (
    <div className="relative w-full" style={{ height: '60vh', minHeight: 320 }}>
      <svg viewBox="0 0 800 500" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={config.skyTop} />
            <stop offset="100%" stopColor={config.skyBot} />
          </linearGradient>
          <linearGradient id="buildGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#37474F" />
            <stop offset="100%" stopColor="#212121" />
          </linearGradient>
          <linearGradient id="buildGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#455A64" />
            <stop offset="100%" stopColor="#263238" />
          </linearGradient>
          <linearGradient id="metroGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E0E0E0" />
            <stop offset="80%" stopColor="#9E9E9E" />
            <stop offset="100%" stopColor="#BDBDBD" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="800" height="500" fill="url(#skyGrad)">
          <animate attributeName="opacity" values="0;1" dur="1s" fill="freeze" />
        </rect>

        {/* Sun/Hazy Light */}
        {cityState === 'Thriving' && (
          <circle cx="680" cy="80" r="42" fill="#F2C94C" opacity="0.9">
            <animate attributeName="r" values="40;44;40" dur="4s" repeatCount="indefinite" />
          </circle>
        )}
        {cityState === 'Struggling' && <circle cx="680" cy="90" r="38" fill="#F2C94C" opacity="0.6" />}
        {cityState === 'Polluted' && <circle cx="680" cy="110" r="45" fill="#E28743" opacity="0.4" />}
        {cityState === 'Critical' && <circle cx="680" cy="120" r="48" fill="#A83F1B" opacity="0.25" />}

        {/* Haze / Dust layers for Polluted/Critical states */}
        {(cityState === 'Polluted' || cityState === 'Critical') && (
          <g>
            <rect y="180" width="800" height="180" fill="#8d6e63" opacity="0.2" />
            <rect y="240" width="800" height="120" fill="#3e2723" opacity="0.15" />
          </g>
        )}

        {/* Background Wind Turbines */}
        {showWindTurbines && (
          <g opacity="0.85">
            {[90, 160, 230].map((x, idx) => (
              <g key={`wt-${idx}`} transform={`translate(${x}, 180)`}>
                {/* Tower */}
                <path d="M-2,140 L2,140 L1,-5 L-1,-5 Z" fill="#ECEFF1" />
                {/* Hub & Blades */}
                <circle cx="0" cy="-5" r="4" fill="#CFD8DC" />
                <g>
                  <animateTransform attributeName="transform" type="rotate" from="0 0 -5" to="360 0 -5" dur={`${3 + idx}s`} repeatCount="indefinite" />
                  <line x1="0" y1="-5" x2="0" y2="-45" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="0" y1="-5" x2="35" y2="15" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="0" y1="-5" x2="-35" y2="15" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              </g>
            ))}
          </g>
        )}

        {/* Ground background (distant green hills or gray skyline) */}
        {config.parks ? (
          <path d="M0,320 Q200,280 400,320 T800,310 L800,360 L0,360 Z" fill="#219653" opacity="0.5" />
        ) : (
          <path d="M0,330 L800,330 L800,360 L0,360 Z" fill="#757575" opacity="0.5" />
        )}

        {/* Factory / Smoke stacks */}
        {Array.from({ length: config.smokeStacks }).map((_, i) => {
          const sx = 80 + i * 110;
          return (
            <g key={`factory-${i}`}>
              {/* Factory body */}
              <rect x={sx} y="270" width="60" height="50" fill="#4E342E" />
              <polygon points={`${sx},270 ${sx + 15},250 ${sx + 30},270 ${sx + 45},250 ${sx + 60},270`} fill="#3E2723" />
              {/* Stack */}
              <rect x={sx + 20} y="200" width="16" height="70" fill="#3E2723" />
              <rect x={sx + 18} y="195" width="20" height="5" fill="#BF360C" />
              {/* Animated Smoke */}
              <circle cx={sx + 28} cy="180" r="10" fill="#78909C" opacity="0">
                <animate attributeName="cy" values="180;120;70" dur="4s" repeatCount="indefinite" />
                <animate attributeName="r" values="8;16;24" dur="4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.4;0" dur="4s" repeatCount="indefinite" />
              </circle>
              <circle cx={sx + 28} cy="180" r="10" fill="#90A4AE" opacity="0">
                <animate attributeName="cy" values="180;130;80" dur="4.2s" begin="2s" repeatCount="indefinite" />
                <animate attributeName="r" values="8;18;28" dur="4.2s" begin="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.3;0" dur="4.2s" begin="2s" repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}

        {/* Elevated Metro Bridge / Viaduct */}
        <g opacity={showMetro ? 1 : 0.1}>
          {/* Columns */}
          {[120, 280, 440, 600, 760].map((cx, idx) => (
            <g key={`column-${idx}`}>
              <rect x={cx - 8} y="220" width="16" height="100" fill="#9E9E9E" />
              <rect x={cx - 14} y="215" width="28" height="6" fill="#757575" />
            </g>
          ))}
          {/* Beam */}
          <rect x="0" y="210" width="800" height="8" fill="#BDBDBD" />
          <rect x="0" y="206" width="800" height="4" fill="#757575" />

          {/* Metro Train (Animated if unlocked) */}
          {showMetro && (
            <g>
              <animateTransform attributeName="transform" type="translate" from="-250 0" to="850 0" dur="12s" repeatCount="indefinite" />
              {/* Coaches */}
              {[0, 62, 124].map((offset) => (
                <g key={offset} transform={`translate(${offset}, 0)`}>
                  <rect x="0" y="188" width="58" height="16" fill="url(#metroGrad)" rx="2" />
                  <rect x="2" y="191" width="10" height="6" fill="#333333" rx="1" />
                  <rect x="15" y="191" width="12" height="6" fill="#333333" rx="1" />
                  <rect x="31" y="191" width="12" height="6" fill="#333333" rx="1" />
                  <rect x="46" y="191" width="10" height="6" fill="#333333" rx="1" />
                  {/* Coupler link */}
                  {offset < 124 && <rect x="58" y="195" width="5" height="3" fill="#616161" />}
                </g>
              ))}
              {/* Front windshield & headlamps */}
              <polygon points="182,188 187,194 182,204 178,204 178,188" fill="#333333" />
              <circle cx="184" cy="201" r="1.5" fill="#FFF9C4" />
            </g>
          )}
        </g>

        {/* Foreground Buildings */}
        {[
          { x: 340, w: 75, h: 180, grad: 'url(#buildGrad1)' },
          { x: 425, w: 60, h: 220, grad: 'url(#buildGrad2)' },
          { x: 495, w: 85, h: 160, grad: 'url(#buildGrad1)' },
          { x: 590, w: 70, h: 195, grad: 'url(#buildGrad2)' },
          { x: 670, w: 75, h: 170, grad: 'url(#buildGrad1)' }
        ].map((b, i) => (
          <g key={`build-${i}`}>
            <rect x={b.x} y={320 - b.h} width={b.w} height={b.h} fill={b.grad} rx="2" />
            {/* Windows */}
            {Array.from({ length: Math.floor(b.h / 32) }).map((_, rIdx) => (
              <g key={rIdx} transform={`translate(0, ${rIdx * 28})`}>
                <rect x={b.x + 8} y={320 - b.h + 12} width={12} height={14} fill="#FFF59D" opacity={Math.random() > 0.45 ? 0.9 : 0.25} rx="1" />
                <rect x={b.x + b.w - 20} y={320 - b.h + 12} width={12} height={14} fill="#FFF59D" opacity={Math.random() > 0.35 ? 0.9 : 0.25} rx="1" />
                {b.w > 70 && <rect x={b.x + b.w / 2 - 6} y={320 - b.h + 12} width={12} height={14} fill="#FFF59D" opacity={Math.random() > 0.4 ? 0.9 : 0.25} rx="1" />}
              </g>
            ))}
            {/* Solar Panels on Roof */}
            {showSolar && i % 2 === 0 && (
              <g transform={`translate(${b.x + b.w / 2 - 20}, ${320 - b.h - 8})`}>
                <rect width="40" height="8" fill="#0D47A1" rx="1" />
                <line x1="10" y1="0" x2="10" y2="8" stroke="#1565C0" strokeWidth="1" />
                <line x1="20" y1="0" x2="20" y2="8" stroke="#1565C0" strokeWidth="1" />
                <line x1="30" y1="0" x2="30" y2="8" stroke="#1565C0" strokeWidth="1" />
              </g>
            )}
          </g>
        ))}

        {/* Ground Floor Street Base */}
        <rect x="0" y="320" width="800" height="180" fill={config.groundColor} />

        {/* Parks, Gardens, Greenery */}
        {config.parks && (
          <g>
            {/* Main Garden lawn */}
            <path d="M 20,320 Q 150,335 280,320 L 280,370 L 20,370 Z" fill="#2E7D32" opacity="0.85" />
            <path d="M 520,320 Q 640,330 760,320 L 760,365 L 520,365 Z" fill="#2E7D32" opacity="0.85" />
          </g>
        )}

        {/* Trees */}
        {Array.from({ length: config.treeCount }).map((_, i) => {
          const tx = 40 + i * 110 + (i % 2 === 0 ? 15 : -10);
          return (
            <g key={`tree-${i}`} transform={`translate(${tx}, 325)`}>
              <rect x="-3" y="0" width="6" height="22" fill="#5D4037" rx="1.5" />
              {/* Foliage */}
              <ellipse cx="0" cy="-12" rx="14" ry="16" fill="#1B5E20" />
              <ellipse cx="0" cy="-14" rx="11" ry="13" fill="#2E7D32" />
            </g>
          );
        })}

        {/* Indian Road Setup */}
        <rect x="0" y="365" width="800" height="60" fill="#37474F" />
        {/* Yellow divider lane lines */}
        {[0, 120, 240, 360, 480, 600, 720].map((rx) => (
          <rect key={rx} x={rx + 20} y="393" width="50" height="4" fill="#FFD54F" opacity="0.85" />
        ))}

        {/* Green Bike Lane */}
        {showBikeLanes && (
          <g>
            <rect x="0" y="425" width="800" height="10" fill="#1B5E20" />
            <line x1="0" y1="425" x2="800" y2="425" stroke="#4CAF50" strokeWidth="1.5" />
          </g>
        )}

        {/* Vehicles (Rickshaw, scooter, cab, suv, cycle) on the road */}
        {config.vehicles.map((v, i) => {
          const vx = 50 + i * 165;
          const vy = 372 + (i % 2 === 0 ? 0 : 22);

          if (v === 'rickshaw') {
            return (
              <g key={`v-${i}`} transform={`translate(${vx}, ${vy})`}>
                {/* Auto Rickshaw Chassis */}
                <rect x="2" y="2" width="30" height="15" fill="#FFD54F" rx="3" />
                <rect x="2" y="2" width="12" height="15" fill="#212121" /> {/* Black front top */}
                {/* Windshield */}
                <rect x="14" y="4" width="8" height="6" fill="#E0F7FA" />
                {/* Wheels */}
                <circle cx="8" cy="18" r="4.5" fill="#000" />
                <circle cx="24" cy="18" r="4.5" fill="#000" />
                <circle cx="8" cy="18" r="1.5" fill="#FFF" />
                <circle cx="24" cy="18" r="1.5" fill="#FFF" />
              </g>
            );
          }
          if (v === 'petrol_scooter' || v === 'ev_scooter') {
            const color = v === 'ev_scooter' ? '#00E676' : '#FF9100';
            return (
              <g key={`v-${i}`} transform={`translate(${vx}, ${vy})`}>
                {/* Rider */}
                <circle cx="12" cy="0" r="4" fill="#37474F" />
                {/* Scooter Body */}
                <rect x="2" y="8" width="18" height="6" fill={color} rx="2" />
                <rect x="15" y="3" width="3" height="8" fill={color} />
                {/* Wheels */}
                <circle cx="5" cy="14" r="4" fill="#000" />
                <circle cx="17" cy="14" r="4" fill="#000" />
              </g>
            );
          }
          if (v === 'cab') {
            return (
              <g key={`v-${i}`} transform={`translate(${vx}, ${vy})`}>
                {/* Indian taxi/cab styling (yellow/black) */}
                <rect x="0" y="6" width="38" height="12" fill="#FFD54F" rx="3" />
                <rect x="5" y="1" width="26" height="7" fill="#212121" rx="2" />
                {/* Windows */}
                <rect x="7" y="3" width="9" height="4" fill="#E0F7FA" />
                <rect x="18" y="3" width="9" height="4" fill="#E0F7FA" />
                {/* Wheels */}
                <circle cx="8" cy="18" r="5" fill="#000" />
                <circle cx="30" cy="18" r="5" fill="#000" />
              </g>
            );
          }
          if (v === 'suv') {
            return (
              <g key={`v-${i}`} transform={`translate(${vx}, ${vy})`}>
                <rect x="0" y="2" width="46" height="16" fill="#ECEFF1" rx="2" />
                <rect x="6" y="0" width="30" height="8" fill="#37474F" rx="2" />
                <rect x="36" y="6" width="8" height="4" fill="#B0BEC5" />
                {/* Wheels */}
                <circle cx="10" cy="18" r="5.5" fill="#000" />
                <circle cx="36" cy="18" r="5.5" fill="#000" />
              </g>
            );
          }
          if (v === 'cycle') {
            return (
              <g key={`v-${i}`} transform={`translate(${vx}, ${vy + 4})`}>
                <line x1="4" y1="12" x2="20" y2="12" stroke="#4CAF50" strokeWidth="2" />
                <line x1="8" y1="12" x2="14" y2="4" stroke="#4CAF50" strokeWidth="2" />
                <circle cx="6" cy="12" r="4.5" fill="none" stroke="#212121" strokeWidth="1.5" />
                <circle cx="18" cy="12" r="4.5" fill="none" stroke="#212121" strokeWidth="1.5" />
              </g>
            );
          }
          return null;
        })}

        {/* Extra detail: Cow/Stray animal on the side (a fun Indian element) */}
        {cityState === 'Thriving' && (
          <g transform="translate(680, 320)">
            <ellipse cx="14" cy="10" rx="10" ry="7" fill="#F5F5F5" />
            <circle cx="23" cy="6" r="4" fill="#F5F5F5" />
            {/* Legs */}
            <rect x="8" y="15" width="2" height="8" fill="#E0E0E0" />
            <rect x="12" y="15" width="2" height="8" fill="#E0E0E0" />
            <rect x="16" y="15" width="2" height="8" fill="#E0E0E0" />
            <rect x="20" y="15" width="2" height="8" fill="#E0E0E0" />
            {/* Horns */}
            <path d="M 23,2 Q 25,0 23,-2" stroke="#BDBDBD" strokeWidth="1.5" fill="none" />
            <path d="M 21,2 Q 19,0 21,-2" stroke="#BDBDBD" strokeWidth="1.5" fill="none" />
          </g>
        )}
      </svg>

      {/* State Badge and indicators */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/10 shadow-lg flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">{stateEmoji[cityState]}</span>
            <span className={`text-base font-bold ${stateColors[cityState]}`}>{cityState} City</span>
          </div>
          <span className="text-white/60 text-xs font-medium">{weeklyTotal.toFixed(1)} kg CO₂ emissions this week</span>
        </div>

        {/* Tiny Unlock Icons indicator */}
        <div className="flex flex-col gap-1.5 items-end">
          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-300
            ${showMetro ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' : 'bg-white/5 text-white/30 border border-white/5'}`}>
            🚇 Metro Transit
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-300
            ${showSolar ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' : 'bg-white/5 text-white/30 border border-white/5'}`}>
            ☀️ Solar Roofs
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-300
            ${showBikeLanes ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' : 'bg-white/5 text-white/30 border border-white/5'}`}>
            🚲 Eco Lanes
          </div>
        </div>
      </div>
    </div>
  );
}
