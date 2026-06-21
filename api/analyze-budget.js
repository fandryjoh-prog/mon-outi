module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: 'Champ data manquant' });
  const SYSTEM_PROMPT = `Tu es un moteur expert de prévision et conseil budgétaire autonome.
Tu reçois des données financières dans n'importe quel format (JSON, CSV, texte, Firebase, etc.).
TON PROCESSUS :
1. Normalise et interprète les données quel que soit leur format
2. Calcule : revenu moyen, taux d'épargne, tendances par catégorie, ratio dépenses/revenus, charges fixes vs variables
3. Prévois les 3 prochains mois par catégorie
   Formule : prévision = 0.7 × EMA(alpha=0.5) + 0.3 × tendance_linéaire
   Ajuste selon : planning d'événements, mode de vie, objectifs fixés
4. Identifie risques, opportunités et actions concrètes chiffrées
RÉPONDS UNIQUEMENT en JSON valide, sans markdown, sans backticks :
{
  "metriques": {
    "Revenu moyen":      { "valeur": "X Ar",  "statut": "ok|warn|crit", "sous": "contexte court" },
    "Taux d epargne":    { "valeur": "X %",   "statut": "ok|warn|crit", "sous": "contexte" },
    "Tendance depenses": { "valeur": "hausse|baisse|stable", "statut": "ok|warn|crit", "sous": "contexte" },
    "Risque prochain mois": { "valeur": "Faible|Moyen|Eleve", "statut": "ok|warn|crit", "sous": "contexte" }
  },
  "analyse": "Texte 400-600 mots avec ces sections :\n\nETAT ACTUEL\n...\n\nPREVISIONS 3 MOIS\n...\n\nPOINTS DE VIGILANCE\n...\n\nRECOMMANDATIONS PRIORITAIRES\n...\n\nSTRATEGIE LONG TERME\n..."
}`;
  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: 'Données à analyser :\n\n' + JSON.stringify(data, null, 2) }],
      }),
    });
    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      return res.status(anthropicRes.status).json({ error: 'Erreur API Anthropic', detail: err });
    }
    const anthropicData = await anthropicRes.json();
    const text = (anthropicData.content || []).map(b => b.text || '').join('');
    let parsed;
    try { parsed = JSON.parse(text.replace(/```json|```/g, '').trim()); }
    catch { parsed = { metriques: null, analyse: text }; }
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message });
  }
}
