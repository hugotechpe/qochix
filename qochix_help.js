(function () {
  if (window.QochixHelp) return;

  function normalize(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
      .replace(/[^\w\s%/().+-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const BASE_MAP = {
    'pool': 'Valor económico total puesto por el equipo (ticket, capital y trabajo valorizado).',
    'equity': 'Porcentaje de propiedad de cada socio para repartir el distribuible.',
    'distribuible': 'Monto que puede repartirse luego de costos, planilla y reserva.',
    'break even': 'Punto donde la operación deja de quemar caja y se sostiene sola.',
    'runway': 'Meses de vida con la caja actual antes de quedarse sin fondos.',
    'neto operativo': 'Porcentaje de ingresos que queda tras costos directos de operación.',
    'reserva': 'Colchón mínimo que se mantiene antes de repartir.',
    'ticket': 'Aporte de entrada por socio.',
    'sweat': 'Trabajo valorizado económicamente como parte del aporte total.',
    'roi': 'Retorno sobre inversión: retorno acumulado dividido entre inversión.',
    'facturacion': 'Ingresos brutos por marca o ecosistema.',
    'planilla': 'Costo mensual de sueldos (fundadores + equipo operativo).',
    'escenario': 'Supuesto de crecimiento: pesimista, neutro u optimista.',
    'meta 2030': 'Objetivo de sueldo mensual para 2030 que afecta curva y distribuible.',
    'meta 2032': 'Objetivo de sueldo mensual para 2032 que afecta curva y distribuible.',
    'liberacion': 'Momento en que el ingreso de Qochix supera el sueldo actual.',
    'colchon': 'Saldo luego de cubrir planilla con el neto operativo.',
    'gobierno': 'Reglas de decisión, responsabilidades y ritual de seguimiento.',
    'pacto': 'Documento marco de acuerdos y reglas del sistema.',
    'hora': 'Valor de referencia por hora para valorizar esfuerzo y coherencia de sueldos.',
    's/hora': 'Tarifa equivalente por hora; sirve para comparar carga y aporte entre socios.',
    'hrs/dia': 'Horas promedio por dia dedicadas al ecosistema.',
    'hrs/mes': 'Horas proyectadas por mes dedicadas al ecosistema.',
    'sueldo hoy': 'Ingreso mensual actual de referencia de cada socio.',
    'meta humana': 'Indicador de impacto personal para medir sostenibilidad real del acuerdo.',
    'sistema base sincronizado': 'Bloque conectado al estado compartido; se actualiza en vivo.',
    'estado vivo': 'Vista en tiempo real de KPIs clave del sistema.',
    'pre money': 'Valor de la empresa antes del nuevo aporte de capital de la ronda.',
    'valorizacion': 'Monto de referencia usado para convertir aportes en porcentaje accionario.',
    'aporte compra acciones': 'El aporte entra como aumento de capital y recalcula el porcentaje efectivo de reparto.',
    'aporte como prestamo': 'El aporte se registra como deuda o cuenta de socio, sin cambiar el porcentaje accionario.',
  };

  const FORMULA_MAP = {
    'distribuible': 'Formula: Distribuible = (Facturacion x Neto operativo) - Planilla - Reserva.',
    'pool': 'Formula: Pool = Ticket + Capital + Sweat valorizado.',
    'roi': 'Formula: ROI = Retorno acumulado / Inversion total.',
    'runway': 'Formula: Runway = Caja inicial / Burn mensual.',
    'break even': 'Formula: Break-even cuando Colchon >= 0.',
    'equity': 'Formula: Pago equity = Distribuible x (% equity / 100).',
    'burn': 'Formula: Burn = Costo mensual total - Neto generado mensual.',
    'neto operativo': 'Formula: Neto = Facturacion x % neto operativo.',
    'facturacion': 'Formula: Facturacion total = suma de marcas por escenario.',
    'colchon': 'Formula: Colchon = Neto - Planilla - Reserva.',
    'liberacion': 'Formula: Liberacion cuando Total Qochix >= Sueldo actual.',
    'equity efectivo': 'Formula: % efectivo = (valor previo del socio + aporte de ronda) / post-money.',
  };

  function defaultFromLabel(text) {
    const clean = (text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return '';
    return `Este bloque muestra: ${clean}. Úsalo para leer el estado actual y tomar decisiones con contexto compartido.`;
  }

  function tipForText(text, customMap) {
    const raw = text || '';
    const key = normalize(raw);
    if (!key) return '';
    if (customMap && customMap[key]) return customMap[key];
    let baseTip = '';
    for (const [k, v] of Object.entries(BASE_MAP)) {
      if (key.includes(k)) {
        baseTip = v;
        break;
      }
    }
    let formulaTip = '';
    for (const [k, v] of Object.entries(FORMULA_MAP)) {
      if (key.includes(k)) {
        formulaTip = v;
        break;
      }
    }
    const merged = [baseTip || '', formulaTip || ''].filter(Boolean).join(' ');
    if (merged) return merged;
    if (key.length < 4) return '';
    return defaultFromLabel(raw);
  }

  function labelFromHost(host) {
    if (!host) return '';
    const clone = host.cloneNode(true);
    clone.querySelectorAll('.q-help-badge,.hint-badge').forEach((n) => n.remove());
    return (clone.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function ensureStyles() {
    if (document.getElementById('q-help-style')) return;
    const style = document.createElement('style');
    style.id = 'q-help-style';
    style.textContent = `
      .q-help-badge{
        display:inline-flex;align-items:center;justify-content:center;
        width:15px;height:15px;margin-left:.35rem;border-radius:999px;
        border:1px solid rgba(62,207,207,.45);color:#3ECFCF;background:rgba(62,207,207,.08);
        font-size:.62rem;line-height:1;cursor:help;position:relative;vertical-align:middle;
      }
      .q-help-badge::before{content:'?';font-weight:700}
      .q-help-badge:focus-visible{outline:1px solid #D4A853;outline-offset:2px}
      .hint-badge::after{display:none !important}
      .q-help-float{
        position:fixed;left:0;top:0;z-index:4000;max-width:min(380px,88vw);min-width:220px;
        padding:.58rem .64rem;border-radius:10px;border:1px solid rgba(212,168,83,.24);
        background:rgba(8,11,17,.98);color:#c4cad8;font-size:.68rem;line-height:1.45;
        letter-spacing:0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;
        box-shadow:0 14px 34px rgba(0,0,0,.42);pointer-events:none;opacity:0;
        transform:translate(-9999px,-9999px);transition:opacity .12s ease;
      }
      .q-help-float.open{opacity:1}
      .q-help-fab{
        position:fixed;right:14px;bottom:14px;z-index:3500;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;
      }
      .q-help-btn{
        border:1px solid rgba(62,207,207,.35);background:rgba(17,21,32,.95);color:#e8ecf0;
        border-radius:999px;padding:.45rem .75rem;font-size:.72rem;cursor:pointer;
      }
      .q-help-btn:hover{border-color:#D4A853}
      .q-help-legend{
        position:fixed;left:14px;bottom:14px;z-index:3500;display:flex;gap:8px;flex-wrap:wrap;
        border:1px solid rgba(255,255,255,.1);background:rgba(17,21,32,.95);padding:.42rem .58rem;border-radius:999px;
      }
      .q-help-chip{display:inline-flex;align-items:center;gap:.34rem;font-size:.64rem;color:#c4cad8}
      .q-help-dot{width:9px;height:9px;border-radius:999px;display:inline-block}
      .q-help-dot.gold{background:#D4A853}
      .q-help-dot.teal{background:#3ECFCF}
      .q-help-dot.coral{background:#E86B5F}
      .q-help-dot.green{background:#52C97A}
      .q-help-modal{
        position:fixed;inset:0;background:rgba(5,8,12,.72);z-index:3600;display:none;align-items:center;justify-content:center;padding:1rem;
      }
      .q-help-modal.open{display:flex}
      .q-help-card{
        width:min(720px,96vw);max-height:80vh;overflow:auto;background:#111520;border:1px solid rgba(255,255,255,.12);
        border-radius:14px;padding:1rem 1rem .9rem;
      }
      .q-help-card h3{margin:0 0 .55rem;color:#D4A853;font-size:1rem}
      .q-help-list{display:grid;gap:.45rem}
      .q-help-item{padding:.5rem .6rem;border:1px solid rgba(255,255,255,.08);border-radius:8px;background:#171d2e}
      .q-help-term{font-size:.74rem;color:#e8ecf0;font-weight:600}
      .q-help-def{font-size:.72rem;color:#aeb6c9;line-height:1.45;margin-top:.15rem}
    `;
    document.head.appendChild(style);
  }

  function buildModal(usedTips, title) {
    let modal = document.getElementById('q-help-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'q-help-modal';
      modal.className = 'q-help-modal';
      modal.innerHTML = '<div class="q-help-card"><h3 id="q-help-title"></h3><div class="q-help-list" id="q-help-list"></div><div style="margin-top:.75rem;text-align:right"><button class="q-help-btn" id="q-help-close">Cerrar</button></div></div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });
      modal.querySelector('#q-help-close').addEventListener('click', () => modal.classList.remove('open'));
    }
    const list = modal.querySelector('#q-help-list');
    modal.querySelector('#q-help-title').textContent = title || 'Glosario rápido de bloques';
    list.innerHTML = usedTips.map((tip) => `<div class="q-help-item"><div class="q-help-term">${tip.term}</div><div class="q-help-def">${tip.tip}</div></div>`).join('');
    return modal;
  }

  function ensureFab(openGlossary) {
    let fab = document.getElementById('q-help-fab');
    if (fab) return;
    fab = document.createElement('div');
    fab.id = 'q-help-fab';
    fab.className = 'q-help-fab';
    fab.innerHTML = '<button class="q-help-btn" id="q-help-toggle">Modo ayuda</button><button class="q-help-btn" id="q-help-glossary">Glosario</button>';
    document.body.appendChild(fab);
    fab.querySelector('#q-help-toggle').addEventListener('click', () => {
      document.body.classList.toggle('q-help-mode');
    });
    fab.querySelector('#q-help-glossary').addEventListener('click', openGlossary);
  }

  function ensureLegend() {
    if (document.getElementById('q-help-legend')) return;
    const legend = document.createElement('div');
    legend.id = 'q-help-legend';
    legend.className = 'q-help-legend';
    legend.setAttribute('aria-label', 'Leyenda visual');
    legend.innerHTML =
      '<span class="q-help-chip"><span class="q-help-dot gold"></span>Valor clave</span>' +
      '<span class="q-help-chip"><span class="q-help-dot teal"></span>Dato vivo</span>' +
      '<span class="q-help-chip"><span class="q-help-dot green"></span>Salud/positivo</span>' +
      '<span class="q-help-chip"><span class="q-help-dot coral"></span>Riesgo/alerta</span>';
    document.body.appendChild(legend);
  }

  function isEmbeddedFrame() {
    try {
      return window.self !== window.top;
    } catch (error) {
      return true;
    }
  }

  function ensureRuntimeTooltip() {
    let box = document.getElementById('q-help-float');
    if (!box) {
      box = document.createElement('div');
      box.id = 'q-help-float';
      box.className = 'q-help-float';
      box.setAttribute('role', 'tooltip');
      document.body.appendChild(box);
    }
    if (window.__qHelpTooltipBound) return;
    window.__qHelpTooltipBound = true;

    let active = null;
    function placeTooltip(target) {
      if (!target || !box.classList.contains('open')) return;
      const rect = target.getBoundingClientRect();
      const pad = 12;
      const w = box.offsetWidth || 280;
      const h = box.offsetHeight || 80;
      let x = rect.left + (rect.width / 2) - (w / 2);
      let y = rect.top - h - 10;
      if (x < pad) x = pad;
      if (x + w > window.innerWidth - pad) x = window.innerWidth - w - pad;
      if (y < pad) y = rect.bottom + 10;
      if (y + h > window.innerHeight - pad) y = Math.max(pad, window.innerHeight - h - pad);
      box.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`;
    }

    function showFor(badge) {
      const tip = (badge.getAttribute('data-tip') || '').trim();
      if (!tip) return;
      active = badge;
      box.textContent = tip;
      box.classList.add('open');
      placeTooltip(badge);
    }
    function hide() {
      active = null;
      box.classList.remove('open');
      box.style.transform = 'translate(-9999px,-9999px)';
    }

    document.addEventListener('mouseover', (e) => {
      const badge = e.target && e.target.closest ? e.target.closest('.q-help-badge,.hint-badge') : null;
      if (!badge) return;
      showFor(badge);
    });
    document.addEventListener('mouseout', (e) => {
      const fromBadge = e.target && e.target.closest ? e.target.closest('.q-help-badge,.hint-badge') : null;
      if (!fromBadge) return;
      const to = e.relatedTarget;
      if (to && to.closest && to.closest('.q-help-badge,.hint-badge') === fromBadge) return;
      hide();
    });
    document.addEventListener('focusin', (e) => {
      const badge = e.target && e.target.closest ? e.target.closest('.q-help-badge,.hint-badge') : null;
      if (!badge) return;
      showFor(badge);
    });
    document.addEventListener('focusout', (e) => {
      const badge = e.target && e.target.closest ? e.target.closest('.q-help-badge,.hint-badge') : null;
      if (!badge) return;
      hide();
    });
    window.addEventListener('scroll', () => placeTooltip(active), true);
    window.addEventListener('resize', () => placeTooltip(active));
  }

  function init(options) {
    const selectors = (options && options.selectors) || [];
    const title = (options && options.glossaryTitle) || 'Glosario rápido de bloques';
    const customMap = (options && options.customMap) || {};
    const showGlobalUi = options && typeof options.showGlobalUi === 'boolean'
      ? options.showGlobalUi
      : !isEmbeddedFrame();
    if (!selectors.length) return;
    ensureStyles();
    const nodes = document.querySelectorAll(selectors.join(','));
    const used = [];
    function applyTipToBadge(badge, text) {
      const tip = tipForText(text, customMap) || defaultFromLabel(text) || 'Ayuda contextual del indicador.';
      badge.classList.add('q-help-badge');
      if (!badge.getAttribute('aria-label')) badge.setAttribute('aria-label', 'Mostrar ayuda');
      badge.tabIndex = 0;
      badge.setAttribute('data-tip', tip);
      badge.setAttribute('title', tip);
      return tip;
    }
    nodes.forEach((el) => {
      if (!el) return;
      const tag = (el.tagName || '').toLowerCase();
      if (tag === 'button' || tag === 'a' || tag === 'input' || tag === 'select' || tag === 'textarea') return;
      const txt = (el.textContent || '').trim();
      const tip = tipForText(txt, customMap);
      if (!tip) return;
      const existing = el.querySelector('.q-help-badge, .hint-badge');
      if (existing) {
        const currentTip = (existing.getAttribute('data-tip') || '').trim();
        const finalTip = currentTip || applyTipToBadge(existing, txt);
        if (currentTip) existing.setAttribute('title', finalTip);
        used.push({ term: txt.replace(/\s+/g, ' ').slice(0, 90), tip: finalTip });
        return;
      }
      const badge = document.createElement('span');
      badge.className = 'q-help-badge';
      applyTipToBadge(badge, txt);
      el.appendChild(badge);
      used.push({ term: txt.replace(/\s+/g, ' ').slice(0, 90), tip });
    });

    // Reparación global: cualquier badge viejo/nuevo sin tip recibe uno automáticamente.
    document.querySelectorAll('.q-help-badge,.hint-badge').forEach((badge) => {
      const hasTip = (badge.getAttribute('data-tip') || '').trim();
      if (hasTip) {
        if (!badge.getAttribute('title')) badge.setAttribute('title', hasTip);
        return;
      }
      const hostText = labelFromHost(badge.parentElement);
      const repaired = applyTipToBadge(badge, hostText);
      const term = (hostText || 'Indicador').replace(/\s+/g, ' ').slice(0, 90);
      used.push({ term, tip: repaired });
    });
    const uniq = [];
    const seen = new Set();
    used.forEach((item) => {
      const key = item.term + '|' + item.tip;
      if (seen.has(key)) return;
      seen.add(key);
      uniq.push(item);
    });
    const modal = buildModal(uniq.slice(0, 80), title);
    if (showGlobalUi) {
      ensureFab(() => modal.classList.add('open'));
      ensureLegend();
    }
    ensureRuntimeTooltip();
  }

  window.QochixHelp = { init, normalize };
})();
