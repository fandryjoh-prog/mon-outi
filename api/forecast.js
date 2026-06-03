<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Moteur Budget Intelligent</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/tabler-icons.min.css">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #F5F4EF; color: #1a1a18; min-height: 100vh; padding: 2rem 1rem; }
    .container { max-width: 780px; margin: 0 auto; }
    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 2rem; }
    .header-icon { width: 42px; height: 42px; border-radius: 10px; background: #EEEDFE; display: flex; align-items: center; justify-content: center; }
    .header-icon i { font-size: 22px; color: #534AB7; }
    h1 { font-size: 20px; font-weight: 500; }
    .sub { font-size: 13px; color: #888780; margin-top: 2px; }
    .card { background: #fff; border: 0.5px solid #e0dfd8; border-radius: 12px; padding: 1.25rem; margin-bottom: 14px; }
    .label { font-size: 11px; font-weight: 500; color: #888780; text-transform: uppercase; letter-spacing: .07em; margin-bottom: 10px; }
    .examples { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .btn { padding: 7px 14px; font-size: 13px; border: 0.5px solid #ccc; border-radius: 8px; cursor: pointer; background: transparent; color: #1a1a18; transition: background .15s; }
    .btn:hover { background: #f1f0eb; }
    .btn-primary { background: #534AB7; color: #fff; border-color: #534AB7; }
    .btn-primary:hover { background: #3C3489; }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    textarea { width: 100%; font-size: 13px; padding: 10px 12px; border: 0.5px solid #ccc; border-radius: 8px; background: #fff; color: #1a1a18; resize: vertical; font-family: monospace; line-height: 1.5; }
    .row { display: flex; gap: 8px; align-items: center; margin-top: 10px; flex-wrap: wrap; }
    .step { display: flex; align-items: flex-start; gap: 10px; padding: 8px 12px; border-radius: 8px; margin-bottom: 6px; transition: background .3s; }
    .dot { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; border: 0.5px solid #ddd; }
    .step-label { font-size: 13px; font-weight: 500; }
    .step-detail { font-size: 12px; margin-top: 2px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin .9s linear infinite; display: inline-block; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 14px; }
    .metric { background: #f5f4ef; border-radius: 8px; padding: .75rem 1rem; }
    .metric-label { font-size: 12px; color: #888780; margin-bottom: 4px; }
    .metric-val { font-size: 20px; font-weight: 500; }
    .metric-sub { font-size: 11px; color: #888780; margin-top: 3px; }
    .analyse { font-size: 13px; line-height: 1.85; color: #1a1a18; white-space: pre-wrap; }
    .actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
    hr { border: none; border-top: 0.5px solid #e0dfd8; margin: 1.25rem 0; }
    #zone-result { display: none; }
  </style>
</head>
<body>
<div class="container">

  <div class="header">
    <div class="header-icon"><i class="ti ti-brain"></i></div>
    <div>
      <h1>Moteur de budget intelligent</h1>
      <div class="sub">Analyse, prévoit et conseille — compatible avec n'importe quel système</div>
    </div>
  </div>

  <!-- SAISIE -->
  <div class="card">
    <div class="label">Vos données — collez n'importe quel format</div>
    <div class="examples">
      <button class="btn" onclick="ex('simple')">Exemple mensuel</button>
      <button class="btn" onclick="ex('firebase')">Format Firebase</button>
      <button class="btn" onclick="ex('csv')">CSV / Tableau</button>
    </div>
    <textarea id="din" rows="10" placeholder="JSON, CSV, texte libre, export Firebase... Le moteur détecte et normalise automatiquement."></textarea>
    <div class="row">
      <button class="btn btn-primary" id="btn-go" onclick="lancer()">
        <i class="ti ti-sparkles" style="font-size:14px;vertical-align:-2px;margin-right:4px"></i>
        Analyser et conseiller
      </button>
      <span style="font-size:12px;color:#888780">Le moteur raisonne et s'adapte à vos données</span>
    </div>
  </div>

  <!-- RÉSULTAT -->
  <div id="zone-result">
    <div class="card">
      <div class="label">Raisonnement</div>
      <div id="steps"></div>
    </div>

    <div id="zmet" style="display:none">
      <div class="label">Indicateurs clés</div>
      <div class="metrics-grid" id="mgrid"></div>
    </div>

    <div id="zcons" style="display:none" class="card">
      <div class="label">Analyse et recommandations</div>
      <div class="analyse" id="ctext"></div>
    </div>

    <div id="zact" style="display:none" class="actions">
      <button class="btn" onclick="sendQ('Plan action détaillé 3 prochains mois')">Plan d\'action ↗</button>
      <button class="btn" onclick="sendQ('Comment réduire mes dépenses variables ?')">Optimiser ↗</button>
      <button class="btn" onclick="sendQ('Stratégie épargne basée sur ces données')">Épargne ↗</button>
    </div>
  </div>

</div>

<script>
const EX = {
  simple: `{
  "revenus": [
    {"mois":"2025-01","montant":850000},
    {"mois":"2025-02","montant":920000},
    {"mois":"2025-03","montant":880000},
    {"mois":"2025-04","montant":950000},
    {"mois":"2025-05","montant":910000}
  ],
  "depenses": [
    {"mois":"2025-01","categorie":"Alimentation","montant":180000},
    {"mois":"2025-02","categorie":"Alimentation","montant":195000},
    {"mois":"2025-03","categorie":"Alimentation","montant":172000},
    {"mois":"2025-04","categorie":"Alimentation","montant":210000},
    {"mois":"2025-05","categorie":"Alimentation","montant":205000},
    {"mois":"2025-01","categorie":"Transport","montant":95000},
    {"mois":"2025-02","categorie":"Transport","montant":110000},
    {"mois":"2025-03","categorie":"Transport","montant":105000},
    {"mois":"2025-04","categorie":"Transport","montant":120000},
    {"mois":"2025-05","categorie":"Transport","montant":130000},
    {"mois":"2025-04","categorie":"Loisirs","montant":60000},
    {"mois":"2025-05","categorie":"Loisirs","montant":95000}
  ],
  "planning": [
    {"date":"2025-06","titre":"Rentrée scolaire","montantPrevu":150000},
    {"date":"2025-07","titre":"Vacances","montantPrevu":200000}
  ],
  "objectifs": [
    {"categorie":"Alimentation","cible":180000},
    {"categorie":"Epargne","cible":100000}
  ]
}`,
  firebase: `{
  "revenus": [
    {"date":"2025-01-31","montant":1200000,"source":"salaire"},
    {"date":"2025-02-28","montant":1200000,"source":"salaire"},
    {"date":"2025-03-15","montant":200000,"source":"freelance"},
    {"date":"2025-03-31","montant":1200000,"source":"salaire"},
    {"date":"2025-04-30","montant":1200000,"source":"salaire"},
    {"date":"2025-05-31","montant":1200000,"source":"salaire"}
  ],
  "depenses": [
    {"date":"2025-01-05","montant":300000,"categorie":"Logement"},
    {"date":"2025-01-12","montant":180000,"categorie":"Alimentation"},
    {"date":"2025-02-05","montant":300000,"categorie":"Logement"},
    {"date":"2025-02-14","montant":200000,"categorie":"Alimentation"},
    {"date":"2025-03-05","montant":300000,"categorie":"Logement"},
    {"date":"2025-03-18","montant":190000,"categorie":"Alimentation"},
    {"date":"2025-03-28","montant":70000,"categorie":"Sante"},
    {"date":"2025-04-05","montant":300000,"categorie":"Logement"},
    {"date":"2025-04-15","montant":210000,"categorie":"Alimentation"},
    {"date":"2025-05-05","montant":300000,"categorie":"Logement"},
    {"date":"2025-05-12","montant":215000,"categorie":"Alimentation"},
    {"date":"2025-05-28","montant":80000,"categorie":"Loisirs"}
  ],
  "objectifs": [
    {"categorie":"Epargne","montantCible":200000,"priorite":5},
    {"categorie":"Logement","montantCible":300000,"priorite":3}
  ]
}`,
  csv: `mois,categorie,depense,revenu
2025-01,Alimentation,165000,750000
2025-01,Transport,88000,0
2025-02,Alimentation,178000,750000
2025-02,Transport,92000,0
2025-02,Loisirs,45000,0
2025-03,Alimentation,182000,820000
2025-03,Transport,95000,0
2025-04,Alimentation,190000,750000
2025-04,Transport,100000,0
2025-04,Loisirs,85000,0
2025-05,Alimentation,198000,780000
2025-05,Transport,108000,0
2025-05,Loisirs,92000,0`
};

function ex(k) { document.getElementById('din').value = EX[k]; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function addStep(id, icon, label, state) {
  const bg = state==='run'?'#EEEDFE':state==='done'?'#E1F5EE':'#FCEBEB';
  const tc = state==='run'?'#3C3489':state==='done'?'#085041':'#791F1F';
  const ic = state==='run'
    ? `<span class="spin"><i class="ti ti-loader-2"></i></span>`
    : state==='done' ? `<i class="ti ti-check"></i>` : `<i class="ti ti-x"></i>`;
  const el = document.createElement('div');
  el.className = 'step'; el.id = 's-'+id;
  el.style.background = bg;
  el.innerHTML = `<div class="dot" style="background:${bg};color:${tc};border-color:${tc}">${ic}</div>
    <div><div class="step-label" style="color:${tc}">${label}</div></div>`;
  document.getElementById('steps').appendChild(el);
}

function updStep(id, state, detail) {
  const el = document.getElementById('s-'+id); if (!el) return;
  const bg = state==='done'?'#E1F5EE':'#FCEBEB';
  const tc = state==='done'?'#085041':'#791F1F';
  const ic = state==='done' ? `<i class="ti ti-check"></i>` : `<i class="ti ti-x"></i>`;
  el.style.background = bg;
  el.querySelector('.dot').style.background = bg;
  el.querySelector('.dot').style.color = tc;
  el.querySelector('.dot').style.borderColor = tc;
  el.querySelector('.dot').innerHTML = ic;
  const lbl = el.querySelector('.step-label'); lbl.style.color = tc;
  if (detail) {
    const d = document.createElement('div');
    d.className = 'step-detail'; d.style.color = tc; d.textContent = detail;
    lbl.parentNode.appendChild(d);
  }
}

function showMetrics(m) {
  if (!m) return;
  const g = document.getElementById('mgrid'); g.innerHTML = '';
  const sc = { ok:'#1D9E75', warn:'#BA7517', crit:'#E24B4A' };
  Object.entries(m).forEach(([k, v]) => {
    const el = document.createElement('div'); el.className = 'metric';
    el.innerHTML = `<div class="metric-label">${k}</div>
      <div class="metric-val" style="color:${sc[v.statut]||'#1a1a18'}">${v.valeur}</div>
      ${v.sous ? `<div class="metric-sub">${v.sous}</div>` : ''}`;
    g.appendChild(el);
  });
  document.getElementById('zmet').style.display = 'block';
}

function typeText(text, el, cb) {
  let i = 0;
  function next() { if (i < text.length) { el.textContent += text[i++]; setTimeout(next, i < 30 ? 4 : 8); } else if (cb) cb(); }
  next();
}

function sendQ(q) { alert('Intégrez sendPrompt("' + q + '") selon votre système de chat.'); }

async function lancer() {
  const raw = document.getElementById('din').value.trim();
  if (!raw) { document.getElementById('din').focus(); return; }

  const btn = document.getElementById('btn-go');
  btn.disabled = true;
  btn.innerHTML = '<span class="spin"><i class="ti ti-loader-2" style="font-size:14px;vertical-align:-2px;margin-right:4px"></i></span>Analyse en cours...';

  document.getElementById('zone-result').style.display = 'block';
  document.getElementById('steps').innerHTML = '';
  document.getElementById('zmet').style.display = 'none';
  document.getElementById('zcons').style.display = 'none';
  document.getElementById('zact').style.display = 'none';
  document.getElementById('ctext').textContent = '';

  addStep('parse', 'file-text', 'Détection et normalisation du format', 'run');
  await sleep(300);

  let parsed;
  try { parsed = JSON.parse(raw); updStep('parse', 'done', 'Format JSON validé'); }
  catch {
    parsed = raw.includes(',') && raw.includes('\n') ? { raw_csv: raw } : { raw_text: raw };
    updStep('parse', 'done', parsed.raw_csv ? 'Format CSV détecté' : 'Texte libre détecté');
  }

  addStep('calc', 'chart-bar', 'Calcul statistique et détection de tendances', 'run');
  await sleep(200);

  try {
    // ─── APPEL VERS VOTRE PROXY VERCEL ───────────────────────────────────────
    const res = await fetch('/api/forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: parsed })
    });

    if (!res.ok) throw new Error('Erreur serveur : ' + res.status);
    const result = await res.json();
    // ─────────────────────────────────────────────────────────────────────────

    updStep('calc', 'done', 'Indicateurs calculés et tendances identifiées');
    addStep('prev', 'trending-up', 'Modélisation prévisionnelle sur 3 mois', 'run');
    await sleep(200);
    updStep('prev', 'done', 'Prévisions générées par catégorie');
    addStep('rec', 'bulb', 'Formulation des recommandations personnalisées', 'run');
    await sleep(200);
    updStep('rec', 'done', 'Conseils adaptés à votre profil');

    showMetrics(result.metriques);

    document.getElementById('zcons').style.display = 'block';
    typeText(result.analyse || 'Aucune analyse retournée.', document.getElementById('ctext'), () => {
      document.getElementById('zact').style.display = 'flex';
    });

  } catch (e) {
    updStep('calc', 'err', 'Erreur : ' + e.message);
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="ti ti-sparkles" style="font-size:14px;vertical-align:-2px;margin-right:4px"></i>Analyser à nouveau';
}
</script>
</body>
</html>
