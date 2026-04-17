(() => {
  const STORAGE_KEY = 'qochix_system_state_v1';
  const CHANNEL_NAME = 'qochix_system_channel_v1';
  const AÑOS = [2026, 2027, 2028, 2029, 2030, 2031, 2032];
  const MESES_POR_AÑO = [9, 12, 12, 12, 12, 12, 12];
  const SC = { p: 0.7, n: 1.0, o: 1.4 };
  const SC_LABELS = {
    p: 'Pesimista ×0.7',
    n: 'Neutro ×1.0',
    o: 'Optimista ×1.4',
  };
  const FACT0 = {
    almaria: [1200, 8500, 22000, 40000, 98100, 141900, 183400],
    ht: [4282, 11483, 22800, 39600, 55483, 70100, 88133],
  };
  const SUED_F_BASE = {
    //         2026  2027  2028  2029   2030   2031   2032
    hugo:   [    0,    0, 3000, 9000, 14000, 20000, 30000],
    rossy:  [    0, 1000, 2500, 7500,  9000, 10500, 12000],
    vera:   [    0,    0, 2000, 7500,  8500,  9200, 10000],
    mechita:[    0,    0, 1800, 6500,  8000,  9000, 10000],
  };
  const SERVICE_LINES = [
    // ── Almaria (3) — todos los precios suben 2028 ──
    {id:'al_kits',brand:'almaria',name:'B2C — Kits de plantas',unit:'kit/mes',prices:[25,25,35,35,35,35,35],vols:[16,80,160,280,500,700,900]},
    {id:'al_corp',brand:'almaria',name:'B2B — Ceremonias corporativas',unit:'persona/mes',prices:[55,55,75,75,75,75,75],vols:[8,60,160,250,700,1000,1200]},
    {id:'al_rituales',brand:'almaria',name:'Rituales (bodas, bautizos…)',unit:'persona/mes',prices:[55,55,75,75,75,75,75],vols:[5,60,150,180,450,680,950]},
    // ── HugoTech (5) — precios suben 2028 ──
    {id:'ht_1a1',brand:'ht',name:'Sesiones 1:1 coaching',unit:'hr/mes',prices:[150,150,200,200,200,200,200],vols:[15,20,28,35,48,55,65]},
    {id:'ht_talleres',brand:'ht',name:'Talleres B2B equipos',unit:'taller/mes',prices:[1250,1250,2000,2000,2000,2000,2000],vols:[1,3,3,4,7,8,10]},
    {id:'ht_fullday',brand:'ht',name:'Full Day RECOprogramando',unit:'persona/mes',prices:[100,100,400,400,400,400,400],vols:[8,24,14,18,24,32,40]},
    {id:'ht_campamento',brand:'ht',name:'Campamento inmersivo',unit:'persona/mes',prices:[0,400,1500,1500,1500,1500,1500],vols:[0,5,3,5,7,10,12]},
    {id:'ht_programa',brand:'ht',name:'Programa transformación 3m',unit:'persona/mes',prices:[0,1000,1000,3500,3500,3500,3500],vols:[0,0,2,2,3,4,6]},
  ];
  const BRAND_IDS = ['almaria', 'ht'];
  const BRAND_LABELS = { almaria: 'Almaria', ht: 'HugoTech', ambas: 'Ambas' };

  function normalizeBrandId(b) {
    if (!b) return '';
    const l = String(b).toLowerCase().replace(/\s+/g, '');
    if (l === 'hugotech' || l === 'ht') return 'ht';
    if (l === 'almaria') return 'almaria';
    if (l === 'ambas') return 'ambas';
    if (l === 'mixto') return 'mixto';
    return l;
  }

  function totalBrandCapital(person) {
    const bc = person.brandCapital || {};
    return Object.values(bc).reduce((s, v) => s + Number(v || 0), 0);
  }

  function totalBrandCash(person) {
    const bc = person.brandCash || {};
    return Object.values(bc).reduce((s, v) => s + Number(v || 0), 0);
  }

  const DEFAULTS = {
    persons: [
      { id: 'hugo', name: 'Hugo', sueldo: 30000, sueldoMarca: 0, hrs: 6, adj: 0.5, equity: 58, capital: 0,
        brandCapital: { almaria: 10000, ht: 30000 },
        brandCash: { almaria: 9400, ht: 16000 }, c: '#D4A853' },
      { id: 'rossy', name: 'Rossy', sueldo: 7000, sueldoMarca: 0, hrs: 6, adj: 0.7, equity: 22, capital: 0,
        brandCapital: { almaria: 20000 },
        brandCash: { almaria: 18800 }, c: '#3ECFCF' },
      { id: 'vera', name: 'Vera', sueldo: 6500, sueldoMarca: 0, hrs: 6, adj: 0.7, equity: 15, capital: 0,
        brandCapital: { almaria: 4000 },
        brandCash: { almaria: 3800 }, c: '#52C97A' },
      { id: 'mechita', name: 'Mechita', sueldo: 6000, sueldoMarca: 0, hrs: 5, adj: 0.7, equity: 5, capital: 0,
        brandCapital: {},
        brandCash: {}, c: '#E98EB6' },
    ],
    hires: [
      { role: 'Diana — Content HugoTech', brand: 'HugoTech', sue: 2000, growth: 1.15 },
      { role: 'María — Content Almaria', brand: 'Almaria', sue: 2000, growth: 1.15 },
      { role: 'Comercial HugoTech+Almaria', brand: 'Mixto', sue: 3000, growth: 1.20, startYear: 2027 },
      { role: 'Facilitadora Almaria', brand: 'Almaria', sue: 2500, growth: 1.25 },
    ],
    P: {
      ticket: 5000,
      tktMode: 'equal',
      tickets: { hugo: 5000, rossy: 5000, vera: 5000, mechita: 5000 },
      netoPct: 0.65,
      reserva: 3000,
      sc: 'p',
      capitalMode: 'loan',
      equityMode: 'auto_pool',
      preMoney: 5000000,
      sue29: { hugo: 9000, rossy: 7500, vera: 7500, mechita: 6500 },
      sue30: { hugo: 14000, rossy: 9000, vera: 8500, mechita: 8000 },
      sue32: { hugo: 30000, rossy: 12000, vera: 10000, mechita: 10000 },
      lineOverrides: {},
      brandOps: {},
      founderBrand: {
        hugo: 'ambas',
        rossy: 'almaria',
        vera: 'ambas',
        mechita: 'almaria',
      },
    },
    meta: {
      updatedAt: null,
      source: 'defaults',
      schemaVersion: 16,
    },
  };

  const MIGRATIONS = [
    { from: undefined, to: 2, run(s) {} },
    { from: 2, to: 3, run(s) {
      if (!s.P) s.P = {};
      if (!s.P.equityMode) s.P.equityMode = 'auto_pool';
    }},
    { from: 3, to: 4, run(s) {
      if (!s.P) s.P = {};
      if (!s.P.sue29) {
        s.P.sue29 = { hugo: 9000, rossy: 4000, vera: 4000, carlos: 8000, nicole: 6000 };
      }
    }},
    { from: 4, to: 5, run(s) {
      if (!s.P) s.P = {};
      if (!s.P.lineOverrides) s.P.lineOverrides = {};
    }},
    { from: 5, to: 6, run(s) {
      const bcDefaults = {
        hugo: { almaria: 10000, ht: 24000 },
        rossy: { almaria: 20000 },
        vera: { almaria: 4000 },
        carlos: { trazo: 62000 },
        nicole: {},
      };
      if (s.persons) {
        s.persons.forEach(p => {
          if (!p.brandCapital) p.brandCapital = bcDefaults[p.id] || {};
          p.capital = 0;
        });
      }
      if (!s.P) s.P = {};
      if (!s.P.brandOps) {
        s.P.brandOps = { trazo: { caja: 0 }, almaria: { caja: 34000 }, ht: { caja: 0 } };
      }
      if (!s.P.founderBrand) {
        s.P.founderBrand = { hugo: 'ht', rossy: 'almaria', vera: 'almaria', carlos: 'trazo', nicole: 'trazo' };
      }
    }},
    { from: 6, to: 7, run(s) {
      const cashDefaults = {
        hugo: { trazo: 12000, almaria: 10000, ht: 16000 },
        rossy: { almaria: 20000 },
        vera: { almaria: 4000 },
        carlos: {},
        nicole: {},
      };
      if (s.persons) {
        s.persons.forEach(p => {
          if (!p.brandCash) p.brandCash = cashDefaults[p.id] || {};
        });
      }
    }},
    { from: 7, to: 8, run(s) {
      if (!s.persons) return;
      const fix = {
        hugo:  { bc: { trazo: 12000, almaria: 10000, ht: 24000 }, cash: { trazo: 12000, almaria: 9400, ht: 16000 } },
        rossy: { bc: { almaria: 20000 }, cash: { almaria: 18800 } },
        vera:  { bc: { almaria: 4000 }, cash: { almaria: 3800 } },
      };
      s.persons.forEach(p => {
        const f = fix[p.id];
        if (!f) return;
        p.brandCapital = { ...(p.brandCapital || {}), ...f.bc };
        p.brandCash = { ...(p.brandCash || {}), ...f.cash };
      });
    }},
    { from: 8, to: 9, run(s) {
      const smDefaults = { carlos: 5000, nicole: 2000 };
      if (s.persons) {
        s.persons.forEach(p => {
          if (p.sueldoMarca == null) p.sueldoMarca = smDefaults[p.id] || 0;
        });
      }
    }},
    { from: 9, to: 10, run(s) {
      if (s.persons) {
        const p = s.persons.find(x => x.id === 'carlos');
        if (p && p.sueldo === 5000) p.sueldo = 8000;
      }
    }},
    { from: 10, to: 11, run(s) {
      const fixes = {
        hugo:   { sueldo: 30000, adj: 0.5, brandCapital: { trazo: 12000, almaria: 10000, ht: 10000 } },
        rossy:  { adj: 0.65 },
        carlos: { sueldo: 7000, adj: 0.6 },
        nicole: { sueldo: 4000, adj: 0.6 },
      };
      if (s.persons) {
        s.persons.forEach(p => {
          const f = fixes[p.id];
          if (!f) return;
          if (f.sueldo != null) p.sueldo = f.sueldo;
          if (f.adj != null) p.adj = f.adj;
          if (f.brandCapital) p.brandCapital = { ...(p.brandCapital || {}), ...f.brandCapital };
        });
      }
      if (s.P) {
        s.P.sue29 = { hugo: 9000, rossy: 7500, vera: 7500, carlos: 10000, nicole: 5000 };
        s.P.sue30 = { hugo: 14000, rossy: 9000, vera: 8500, carlos: 11000, nicole: 6000 };
        s.P.sue32 = { hugo: 30000, rossy: 12000, vera: 10000, carlos: 14000, nicole: 7000 };
      }
    }},
    { from: 11, to: 12, run(s) {
      const fixes = {
        hugo:   { adj: 0.4 },
        rossy:  { adj: 0.7 },
        carlos: { adj: 0.7 },
        nicole: { sueldo: 2000, adj: 1.0 },
      };
      if (s.persons) {
        s.persons.forEach(p => {
          const f = fixes[p.id];
          if (!f) return;
          if (f.sueldo != null) p.sueldo = f.sueldo;
          if (f.adj != null) p.adj = f.adj;
        });
      }
    }},
    { from: 12, to: 13, run(s) {
      const fixes = {
        hugo:   { hrs: 6, adj: 0.5, brandCapital: { ht: 30000 } },
        nicole: { sueldo: 3000 },
      };
      if (s.persons) {
        s.persons.forEach(p => {
          const f = fixes[p.id];
          if (!f) return;
          if (f.hrs != null) p.hrs = f.hrs;
          if (f.adj != null) p.adj = f.adj;
          if (f.sueldo != null) p.sueldo = f.sueldo;
          if (f.brandCapital) p.brandCapital = { ...(p.brandCapital || {}), ...f.brandCapital };
        });
      }
    }},
    { from: 13, to: 14, run(s) {} },
    { from: 14, to: 15, run(s) {} },
    { from: 15, to: 16, run(s) {
      if (s.P && s.P.founderBrand) {
        if (s.P.founderBrand.hugo === 'ht') s.P.founderBrand.hugo = 'ambas';
        if (s.P.founderBrand.vera === 'almaria') s.P.founderBrand.vera = 'ambas';
        delete s.P.founderBrand.carlos;
        delete s.P.founderBrand.nicole;
      }
    }},
  ];

  const clone = (value) => JSON.parse(JSON.stringify(value));

  function mergePerson(base, incoming) {
    return { ...base, ...(incoming || {}) };
  }

  function normalizeState(raw) {
    const next = clone(DEFAULTS);
    if (!raw || typeof raw !== 'object') return next;
    if (Array.isArray(raw.persons)) {
      next.persons = next.persons.map((person) => {
        const incoming = raw.persons.find((entry) => entry && entry.id === person.id);
        const merged = mergePerson(person, incoming);
        merged.brandCapital = { ...(person.brandCapital || {}), ...((incoming && incoming.brandCapital) || {}) };
        merged.brandCash = { ...(person.brandCash || {}), ...((incoming && incoming.brandCash) || {}) };
        return merged;
      });
    }
    if (Array.isArray(raw.hires)) {
      next.hires = DEFAULTS.hires.map((baseHire, index) => ({
        ...baseHire,
        ...((raw.hires[index]) || {}),
      }));
    }
    if (raw.P && typeof raw.P === 'object') {
      next.P = {
        ...next.P,
        ...raw.P,
        tickets: { ...next.P.tickets, ...(raw.P.tickets || {}) },
        sue29: { ...next.P.sue29, ...(raw.P.sue29 || {}) },
        sue30: { ...next.P.sue30, ...(raw.P.sue30 || {}) },
        sue32: { ...next.P.sue32, ...(raw.P.sue32 || {}) },
        lineOverrides: raw.P.lineOverrides || next.P.lineOverrides || {},
        brandOps: { ...next.P.brandOps, ...(raw.P.brandOps || {}) },
        founderBrand: { ...next.P.founderBrand, ...(raw.P.founderBrand || {}) },
      };
      if (!next.P.equityMode) next.P.equityMode = DEFAULTS.P.equityMode;
    }
    if (raw.meta && typeof raw.meta === 'object') {
      next.meta = { ...next.meta, ...raw.meta };
    }
    return next;
  }

  function applyMigrations(state) {
    const v = (state.meta && state.meta.schemaVersion) || 0;
    const target = DEFAULTS.meta.schemaVersion || 0;
    if (v >= target) return state;
    MIGRATIONS.forEach(function(m) {
      if ((m.from === undefined || m.from === v) && m.to <= target) m.run(state);
    });
    state.meta = state.meta || {};
    state.meta.schemaVersion = target;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    return state;
  }

  function getState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(DEFAULTS);
      const state = normalizeState(JSON.parse(raw));
      return applyMigrations(state);
    } catch (error) {
      return clone(DEFAULTS);
    }
  }

  let channel = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(CHANNEL_NAME);
    }
  } catch (error) {}

  function saveState(partialState, meta = {}) {
    const normalized = normalizeState(partialState);
    normalized.meta = {
      ...normalized.meta,
      ...meta,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {}
    if (channel) {
      channel.postMessage({
        type: 'qochix-state-update',
        state: normalized,
      });
    }
    try {
      window.dispatchEvent(new CustomEvent('qochix-state-update', { detail: normalized }));
    } catch (error) {}
    return normalized;
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY) return;
      listener(getState(), { via: 'storage' });
    };
    const onChannel = (event) => {
      if (!event || !event.data || event.data.type !== 'qochix-state-update') return;
      listener(normalizeState(event.data.state), { via: 'channel' });
    };
    const onLocal = (event) => {
      const next = event && event.detail ? normalizeState(event.detail) : getState();
      listener(next, { via: 'local' });
    };
    let lastStamp = '';
    const pollMs = channel ? 2000 : 600;
    const pollId = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      const next = getState();
      const stamp = (next.meta && next.meta.updatedAt) || '';
      if (stamp && stamp !== lastStamp) {
        lastStamp = stamp;
        listener(next, { via: 'poll' });
      }
    }, pollMs);
    const boot = getState();
    lastStamp = (boot.meta && boot.meta.updatedAt) || '';
    window.addEventListener('storage', onStorage);
    window.addEventListener('qochix-state-update', onLocal);
    if (channel) channel.addEventListener('message', onChannel);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('qochix-state-update', onLocal);
      if (channel) channel.removeEventListener('message', onChannel);
      window.clearInterval(pollId);
    };
  }

  function fmtCurrency(n) {
    if (n === undefined || n === null || Number.isNaN(Number(n))) return '—';
    return 'S/' + Math.round(Number(n)).toLocaleString('es-PE');
  }

  function fmtDateTime(iso) {
    if (!iso) return 'sin guardar';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'sin guardar';
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getTkt(state, id) {
    return state.P.tktMode === 'equal' ? state.P.ticket : Number(state.P.tickets[id] || 0);
  }

  function sw(person, curve) {
    const hr = Number(person.sueldo || 0) / (22 * 8);
    const hm = Number(person.hrs || 0) * 6 * 4.3;
    const vm = hr * hm;
    const adj = Number(person.adj || 0);
    const baseMarca = Number(person.sueldoMarca || 0);
    if (curve && curve.length > 0) {
      let total = 0;
      for (let i = 0; i < AÑOS.length; i++) {
        const extraQochix = Math.max(0, Number(curve[i] || 0) - baseMarca);
        const gap = Math.max(0, vm - extraQochix);
        total += gap * MESES_POR_AÑO[i];
      }
      return { hr, hm, vm, sw: total * adj };
    }
    const totalMeses = MESES_POR_AÑO.reduce((s, v) => s + v, 0);
    return { hr, hm, vm, sw: vm * totalMeses * adj };
  }

  function founderCurvesPact() {
    const out = {};
    Object.keys(SUED_F_BASE).forEach((id) => {
      out[id] = SUED_F_BASE[id].slice();
    });
    return out;
  }

  function buildSuedCurve(id, target29, target30, target32) {
    const base = SUED_F_BASE[id];
    const t29 = target29 != null && !Number.isNaN(+target29) ? Math.max(0, Math.round(+target29)) : (base[3] || 0);
    const t30 = target30 != null && !Number.isNaN(+target30) ? Math.max(0, Math.round(+target30)) : (base[4] || 0);
    const t32 = target32 != null && !Number.isNaN(+target32) ? Math.max(0, Math.round(+target32)) : (base[6] || 0);
    const b0 = base[0] || 0;
    const arr = [];
    for (let i = 0; i < 3; i += 1) {
      arr[i] = Math.round(b0 + (t29 - b0) * (i / 3));
    }
    arr[3] = t29;
    arr[4] = t30;
    arr[5] = Math.round(t30 + (t32 - t30) * 0.5);
    arr[6] = t32;
    return arr;
  }

  function metasMatchPactAnchors(state) {
    return state.persons.every((person) => (
      Number((state.P.sue29 || {})[person.id]) === SUED_F_BASE[person.id][3] &&
      Number(state.P.sue30[person.id]) === SUED_F_BASE[person.id][4] &&
      Number(state.P.sue32[person.id]) === SUED_F_BASE[person.id][6]
    ));
  }

  function activeFounderCurves(state) {
    if (metasMatchPactAnchors(state)) return founderCurvesPact();
    const out = {};
    state.persons.forEach((person) => {
      out[person.id] = buildSuedCurve(person.id, (state.P.sue29 || {})[person.id], state.P.sue30[person.id], state.P.sue32[person.id]);
    });
    return out;
  }

  function hiresCostByYear(state) {
    return AÑOS.map((_, yi) => Math.round(
      state.hires.reduce((sum, hire) => {
        const startYi = hire.startYear ? Math.max(0, AÑOS.indexOf(hire.startYear)) : 0;
        if (startYi < 0 || yi < startYi) return sum;
        return sum + Number(hire.sue || 0) * Math.pow(Number(hire.growth || 1), yi - startYi);
      }, 0)
    ));
  }

  function suedTotalsFromCurves(state, curves) {
    return AÑOS.map((_, i) => state.persons.reduce((sum, person) => sum + Number((curves[person.id] || [])[i] || 0), 0));
  }

  function computeLineRevenue(state) {
    const m = SC[state.P.sc] || 1;
    const ov = (state.P && state.P.lineOverrides) || {};
    const lines = SERVICE_LINES.map((def) => {
      const lo = ov[def.id] || {};
      const p = lo.prices || def.prices;
      const v = lo.vols || def.vols;
      const rev = AÑOS.map((_, i) => Math.round((p[i] || 0) * (v[i] || 0) * m));
      return { id: def.id, brand: def.brand, name: def.name, unit: def.unit, prices: p.slice(), vols: v.slice(), rev };
    });
    const bt = (b) => AÑOS.map((_, i) => lines.filter((l) => l.brand === b).reduce((s, l) => s + l.rev[i], 0));
    return { lines, trazo: AÑOS.map(() => 0), almaria: bt('almaria'), ht: bt('ht') };
  }

  function capSalariesToRevenue(state, targetCurves, neto, hcost) {
    const capped = {};
    state.persons.forEach(function(p) { capped[p.id] = []; });
    AÑOS.forEach(function(_, yi) {
      var available = neto[yi] - hcost[yi];
      var protectedTotal = 0;
      state.persons.forEach(function(p) {
        var prot = Number(p.sueldoMarca || 0);
        protectedTotal += prot;
      });
      var afterProtected = available - protectedTotal;
      var targets = {};
      var totalTarget = 0;
      state.persons.forEach(function(p) {
        var curveVal = Number((targetCurves[p.id] || [])[yi] || 0);
        var prot = Number(p.sueldoMarca || 0);
        var extra = Math.max(0, curveVal - prot);
        targets[p.id] = extra;
        totalTarget += extra;
      });
      var ratio = totalTarget > 0 ? Math.min(1, Math.max(0, afterProtected / totalTarget)) : 0;
      state.persons.forEach(function(p) {
        var prot = Number(p.sueldoMarca || 0);
        var actual = prot + Math.round(targets[p.id] * ratio);
        capped[p.id][yi] = actual;
      });
    });
    return capped;
  }

  function calcFactFromCurves(state, curves, opts) {
    var skipCap = opts && opts.skipCap;
    const lr = computeLineRevenue(state);
    const trazo = lr.trazo;
    const alm = lr.almaria;
    const ht = lr.ht;
    const total = AÑOS.map((_, i) => trazo[i] + alm[i] + ht[i]);
    const neto = total.map((value) => Math.round(value * Number(state.P.netoPct || 0)));
    const hcost = hiresCostByYear(state);
    const realCurves = skipCap ? curves : capSalariesToRevenue(state, curves, neto, hcost);
    const sued_f = suedTotalsFromCurves(state, realCurves);
    const sued_tot = sued_f.map((value, i) => value + hcost[i]);
    const colchon = neto.map((value, i) => value - sued_tot[i]);
    const dist = colchon.map((value) => Math.max(0, value - Number(state.P.reserva || 0)));
    const dist_no_op = neto.map((value, i) => Math.max(0, value - sued_f[i] - Number(state.P.reserva || 0)));
    return { trazo, alm, ht, total, neto, sued_f, hcost, sued_tot, colchon, dist, dist_no_op, suedCurves: realCurves, targetCurves: curves, lineRevenue: lr };
  }

  function calcMonthly(state, curves) {
    const m = SC[state.P.sc] || 1;
    const monthlyFact = [
      [2200, 1000, 450], [2800, 1200, 500], [4200, 2000, 600], [5000, 2500, 700],
      [6000, 3000, 800], [7000, 4000, 900], [8000, 5000, 1000], [9500, 6000, 1100],
      [10500, 7000, 1200], [12000, 8000, 1300], [13000, 9000, 1400], [14000, 10000, 1500],
    ].map(([t, a, h]) => Math.round((t + a + h) * m));
    const burnFijo = state.persons.reduce((sum, person) => sum + Number((curves[person.id] || [])[0] || 0), 0) + hiresCostByYear(state)[0];
    return monthlyFact.map((ingresos) => ({ ingresos, burn: burnFijo }));
  }

  function calcPool(state, curves) {
    return state.persons.reduce((sum, person) =>
      sum + getTkt(state, person.id) + Number(person.capital || 0) + totalBrandCapital(person) + totalBrandCash(person) + sw(person, curves[person.id]).sw, 0);
  }

  function calcEffectiveEquity(state, curves) {
    const base = {};
    state.persons.forEach((person) => {
      base[person.id] = Number(person.equity || 0);
    });
    if (state.P.equityMode === 'auto_pool') {
      const poolById = {};
      let totalPool = 0;
      state.persons.forEach((person) => {
        const pool = getTkt(state, person.id) + Number(person.capital || 0) + totalBrandCapital(person) + totalBrandCash(person) + sw(person, curves[person.id]).sw;
        poolById[person.id] = pool;
        totalPool += pool;
      });
      if (totalPool <= 0) return base;
      const auto = {};
      state.persons.forEach((person) => {
        auto[person.id] = Math.round((poolById[person.id] / totalPool) * 1000) / 10;
      });
      return auto;
    }
    if (state.P.capitalMode !== 'equity_round') return base;
    const preMoney = Math.max(0, Number(state.P.preMoney || 0));
    if (!preMoney) return base;
    const cashById = {};
    let totalCash = 0;
    state.persons.forEach((person) => {
      const cash = getTkt(state, person.id) + Number(person.capital || 0) + totalBrandCapital(person) + totalBrandCash(person);
      cashById[person.id] = cash;
      totalCash += cash;
    });
    const postMoney = preMoney + totalCash;
    if (!postMoney) return base;
    const effective = {};
    state.persons.forEach((person) => {
      const priorValue = (base[person.id] / 100) * preMoney;
      effective[person.id] = ((priorValue + cashById[person.id]) / postMoney) * 100;
    });
    return effective;
  }

  function calcBrandFinancials(state, lr, curves) {
    const fb = state.P.founderBrand || {};
    const brands = {};
    BRAND_IDS.forEach(b => {
      brands[b] = {
        id: b, label: BRAND_LABELS[b],
        caja: 0,
        capitalInvertido: 0,
        inversores: [],
        cashContributors: [],
        revenue: lr[b].slice(),
        burn: AÑOS.map(() => 0),
      };
    });
    state.persons.forEach(p => {
      const bc = p.brandCapital || {};
      const bCash = p.brandCash || {};
      BRAND_IDS.forEach(b => {
        const val = Number(bc[b] || 0);
        const cash = Number(bCash[b] || 0);
        if (val > 0) {
          brands[b].capitalInvertido += val;
          brands[b].inversores.push({ id: p.id, name: p.name, monto: val });
        }
        if (cash > 0) {
          brands[b].caja += cash;
          brands[b].cashContributors.push({ id: p.id, name: p.name, monto: cash });
        }
      });
    });
    state.persons.forEach(p => {
      const b = fb[p.id];
      if (!b) return;
      const curve = curves[p.id] || [];
      if (b === 'ambas') {
        AÑOS.forEach((_, i) => {
          const cost = Number(curve[i] || 0);
          const half = Math.round(cost / 2);
          brands.almaria.burn[i] += half;
          brands.ht.burn[i] += cost - half;
        });
      } else if (brands[b]) {
        AÑOS.forEach((_, i) => { brands[b].burn[i] += Number(curve[i] || 0); });
      }
    });
    state.hires.forEach(h => {
      const b = normalizeBrandId(h.brand);
      const startYi = h.startYear ? Math.max(0, AÑOS.indexOf(h.startYear)) : 0;
      if (b === 'mixto') {
        AÑOS.forEach((_, i) => {
          if (startYi > 0 && i < startYi) return;
          const cost = Math.round(Number(h.sue || 0) * Math.pow(Number(h.growth || 1), i - startYi));
          const half = Math.round(cost / 2);
          brands.almaria.burn[i] += half;
          brands.ht.burn[i] += cost - half;
        });
      } else if (brands[b]) {
        AÑOS.forEach((_, i) => {
          if (startYi > 0 && i < startYi) return;
          brands[b].burn[i] += Math.round(Number(h.sue || 0) * Math.pow(Number(h.growth || 1), i - startYi));
        });
      }
    });
    BRAND_IDS.forEach(b => {
      const br = brands[b];
      br.net = AÑOS.map((_, i) => br.burn[i] - br.revenue[i]);
      const net0 = br.net[0];
      if (net0 <= 0) {
        br.runway = 999;
        br.status = 'sustentable';
      } else if (br.caja <= 0) {
        br.runway = 0;
        br.status = 'sin_caja';
      } else {
        br.runway = Math.floor(br.caja / net0);
        br.status = br.runway >= 12 ? 'estable' : 'quemando';
      }
    });
    return brands;
  }

  function calcRunway(state, curves, lr) {
    const totalCaja = state.persons.reduce((s, p) => s + totalBrandCash(p), 0);
    const totalTickets = state.persons.reduce((s, p) => s + getTkt(state, p.id), 0);
    const capital = totalCaja + totalTickets;
    const revenue0 = (lr.trazo[0] || 0) + (lr.almaria[0] || 0) + (lr.ht[0] || 0);
    const founderBurn0 = state.persons.reduce((sum, p) => sum + Number((curves[p.id] || [])[0] || 0), 0);
    const hireBurn0 = hiresCostByYear(state)[0];
    const totalBurn0 = founderBurn0 + hireBurn0;
    const netBurn = Math.max(0, totalBurn0 - revenue0);
    const monthly = calcMonthly(state, curves);
    if (netBurn <= 0) return { months: 99, capital, burn: totalBurn0, revenue: revenue0, netBurn: 0, monthly };
    return { months: Math.floor(capital / netBurn), capital, burn: totalBurn0, revenue: revenue0, netBurn, monthly };
  }

  function calcBreakEven(fact) {
    for (let i = 0; i < AÑOS.length; i += 1) {
      if (fact.colchon[i] >= 0) return AÑOS[i];
    }
    return '2033+';
  }

  function deriveState(rawState) {
    const state = normalizeState(rawState);
    const curves = activeFounderCurves(state);
    const fact = calcFactFromCurves(state, curves);
    const factPact = calcFactFromCurves(state, founderCurvesPact(), { skipCap: true });
    const lr = fact.lineRevenue;
    const realCurves = fact.suedCurves;
    const pool = calcPool(state, realCurves);
    const brandFin = calcBrandFinancials(state, lr, realCurves);
    const runway = calcRunway(state, realCurves, lr);
    const breakEven = calcBreakEven(fact);
    const firstDistYear = AÑOS.find((year, index) => fact.dist[index] > 0) || '2033+';
    const effectiveEquity = calcEffectiveEquity(state, realCurves);
    const personCards = state.persons.map((person) => {
      const pCurve = realCurves[person.id] || [];
      const swData = sw(person, pCurve);
      const yearlyTotals = AÑOS.map((_, index) => {
        const sue = Number(pCurve[index] || 0);
        const eq = Math.round(Number(fact.dist[index] || 0) * Number(effectiveEquity[person.id] || 0) / 100);
        return sue + eq;
      });
      const crossIndex = yearlyTotals.findIndex((value) => value >= Number(person.sueldo || 0));
      const eq2032 = Math.round(fact.dist[6] * Number(effectiveEquity[person.id] || 0) / 100);
      const sue2032 = Number(state.P.sue32[person.id] || 0);
      const total2032 = sue2032 + eq2032;
      const brandCap = totalBrandCapital(person);
      const brandCash = totalBrandCash(person);
      const investment = getTkt(state, person.id) + Number(person.capital || 0) + brandCap + brandCash + swData.sw;
      return {
        id: person.id,
        name: person.name,
        color: person.c,
        equity: Number(effectiveEquity[person.id] || 0),
        baseEquity: Number(person.equity || 0),
        ticket: getTkt(state, person.id),
        capital: Number(person.capital || 0),
        brandCapital: person.brandCapital || {},
        brandCapitalTotal: brandCap,
        cashContribution: getTkt(state, person.id) + Number(person.capital || 0) + brandCap + brandCash,
        sue2030: Number(state.P.sue30[person.id] || 0),
        sue2032,
        eq2032,
        total2032,
        investment,
        yearlyTotals,
        liberationYear: crossIndex >= 0 ? AÑOS[crossIndex] : '2033+',
      };
    });
    const eqSum = personCards.reduce((sum, person) => sum + Number(person.equity || 0), 0);
    const baseEqSum = state.persons.reduce((sum, person) => sum + Number(person.equity || 0), 0);
    const total2032 = personCards.reduce((sum, person) => sum + person.total2032, 0);
    const liberatedBy2030 = personCards.filter((person) => person.liberationYear !== '2033+' && person.liberationYear <= 2030).length;
    const liberatedBy2032 = personCards.filter((person) => person.liberationYear !== '2033+' && person.liberationYear <= 2032).length;
    const initiallyUnderPaid = personCards.filter((p) => p.yearlyTotals[0] < Number(state.persons.find(x => x.id === p.id).sueldo || 0));
    const firstLiberationYear = (initiallyUnderPaid.length > 0
      ? initiallyUnderPaid.filter((p) => p.liberationYear !== '2033+').map((p) => p.liberationYear).sort((a, b) => a - b)[0]
      : personCards.filter((p) => p.liberationYear !== '2033+').map((p) => p.liberationYear).sort((a, b) => a - b)[0]
    ) || '2033+';
    const rossyCard = personCards.find((person) => person.id === 'rossy');
    return {
      state,
      years: AÑOS.slice(),
      labels: { ...SC_LABELS },
      fact,
      factPact,
      curves: realCurves,
      targetCurves: curves,
      pool,
      brandFinancials: brandFin,
      runway,
      breakEven,
      firstDistYear,
      rossyCrossYear: rossyCard ? rossyCard.liberationYear : '2033+',
      firstLiberationYear,
      liberatedBy2030,
      liberatedBy2032,
      dist2030: fact.dist[4],
      dist2032: fact.dist[6],
      totalFact2032: fact.total[6],
      personCards,
      effectiveEquity,
      eqSum,
      baseEqSum,
      total2032,
      updatedAtLabel: fmtDateTime(state.meta.updatedAt),
      scenarioLabel: SC_LABELS[state.P.sc] || SC_LABELS.p,
      fmtCurrency,
      fmtDateTime,
    };
  }

  const HISTORY_KEY = 'qochix_history_v1';
  const MAX_HISTORY = 30;

  function getHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function saveSnapshot(label) {
    const state = getState();
    const snap = { label: label || '', ts: new Date().toISOString(), state: clone(state) };
    const hist = getHistory();
    hist.push(snap);
    if (hist.length > MAX_HISTORY) hist.splice(0, hist.length - MAX_HISTORY);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(hist)); } catch (e) {}
    return snap;
  }

  function clearHistory() {
    try { localStorage.removeItem(HISTORY_KEY); } catch (e) {}
  }

  function compareScenarios(baseState) {
    const base = normalizeState(baseState || getState());
    const out = {};
    ['p', 'n', 'o'].forEach((sc) => {
      const v = clone(base);
      v.P.sc = sc;
      out[sc] = deriveState(v);
    });
    return out;
  }

  function validateEquity(rawState) {
    const s = normalizeState(rawState || getState());
    const sum = s.persons.reduce((a, p) => a + Number(p.equity || 0), 0);
    return { sum, valid: Math.abs(sum - 100) < 0.01, delta: sum - 100 };
  }

  function exportSnapshot() {
    const state = getState();
    const d = deriveState(state);
    return {
      ts: new Date().toISOString(),
      scenario: d.scenarioLabel,
      pool: d.pool,
      dist2032: d.dist2032,
      breakEven: d.breakEven,
      runwayMonths: d.runway.months,
      liberatedBy2032: d.liberatedBy2032,
      persons: d.personCards.map((p) => ({
        name: p.name, equity: +p.equity.toFixed(2), total2032: p.total2032,
        liberationYear: p.liberationYear, investment: p.investment,
      })),
      raw: state,
    };
  }

  window.QochixSystem = {
    STORAGE_KEY,
    DEFAULTS: clone(DEFAULTS),
    AÑOS: AÑOS.slice(),
    FACT0: clone(FACT0),
    SC: { ...SC },
    SC_LABELS: { ...SC_LABELS },
    SUED_F_BASE: clone(SUED_F_BASE),
    MESES_POR_AÑO: MESES_POR_AÑO.slice(),
    SERVICE_LINES: clone(SERVICE_LINES),
    BRAND_IDS: BRAND_IDS.slice(),
    BRAND_LABELS: { ...BRAND_LABELS },
    clone,
    normalizeBrandId,
    totalBrandCapital,
    totalBrandCash,
    normalizeState,
    getState,
    saveState,
    subscribe,
    deriveState,
    fmtCurrency,
    fmtDateTime,
    getHistory,
    saveSnapshot,
    clearHistory,
    compareScenarios,
    validateEquity,
    exportSnapshot,
  };
})();
