#!/usr/bin/env node
/**
 * generate-multilingual-corpus.js
 * Generates multilingual cipher corpus records (French, German, Latin, Spanish, Italian).
 * Run: node scripts/generate-multilingual-corpus.js
 */
/* eslint-disable no-console */
global.window = {};
const path = require('path');
require(path.join(__dirname, '../js/ciphers/all-engines.js'));
const CE = global.window.CipherEngines;
if (!CE) { console.error('Failed to load CipherEngines'); process.exit(1); }

const fs = require('fs');
const OUT_DIR = path.join(__dirname, '../public/corpus');
const TODAY = '2026-04-27';
const CORPUS_URL = 'https://ciphermuseum.com/cipher-corpus.html';

const cleanFn = t => String(t).toUpperCase().replace(/[^A-Z]/g, '');
const idCounters = {};
function nextId(lang, ctype) {
  const k = `${ctype.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${lang}`;
  idCounters[k] = (idCounters[k] || 0) + 1;
  return `${k}-${String(idCounters[k]).padStart(3, '0')}`;
}

function testRoundtrip(eng, plain, key) {
  try {
    const ct = eng.encode(plain, key);
    if (!ct || typeof ct !== 'string' || ct === '') return false;
    if (/\?|Key required|not invertible|Need \d|must be at least/i.test(ct)) return false;
    const dt = eng.decode(ct, key);
    const cp = cleanFn(plain);
    const dcp = cleanFn(dt);
    return dcp === cp || dt === plain.toUpperCase() || dt.toUpperCase() === cp || dcp.startsWith(cp);
  } catch { return false; }
}

// Transliterate common diacritics to ASCII
function toAscii(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Multilingual Plaintext Libraries ───

const FRENCH_TEXTS = [
  { raw: 'Nous tenons ces vérités pour évidentes en elles-mêmes', lang: 'fr' },
  { raw: 'La liberté consiste à pouvoir faire tout ce qui ne nuit pas à autrui', lang: 'fr' },
  { raw: 'Je pense donc je suis', lang: 'fr' },
  { raw: 'La République française est indivisible laïque démocratique et sociale', lang: 'fr' },
  { raw: 'Liberté égalité fraternité', lang: 'fr' },
  { raw: 'Il est aisé de faire peur aux enfants avec des fantômes', lang: 'fr' },
  { raw: 'La France est une République indivisible', lang: 'fr' },
  { raw: 'Tout ce qui est excessif est insignifiant', lang: 'fr' },
  { raw: 'Les hommes naissent et demeurent libres et égaux en droits', lang: 'fr' },
  { raw: 'Vive la France vive la République', lang: 'fr' },
  { raw: 'La patrie la loi le roi', lang: 'fr' },
  { raw: 'Le secret est l âme de toutes les grandes affaires', lang: 'fr' },
  { raw: 'Aux armes citoyens formez vos bataillons', lang: 'fr' },
  { raw: 'La garde meurt et ne se rend pas', lang: 'fr' },
  { raw: 'Impossible n est pas français', lang: 'fr' },
  { raw: 'La victoire est à nous si nous savons la prendre', lang: 'fr' },
  { raw: 'Paris vaut bien une messe', lang: 'fr' },
  { raw: 'Un pour tous tous pour un', lang: 'fr' },
  { raw: 'La raison du plus fort est toujours la meilleure', lang: 'fr' },
  { raw: 'Je n ai rien d autre à offrir que du sang de la peine des larmes et de la sueur', lang: 'fr' },
  { raw: 'Waterloo morne plaine comme une onde qui bout dans une urne trop pleine', lang: 'fr' },
  { raw: 'Demain dès l aube à l heure où blanchit la campagne', lang: 'fr' },
  { raw: 'Il faut cultiver notre jardin', lang: 'fr' },
  { raw: 'La nature est un temple où de vivants piliers laissent parfois sortir de confuses paroles', lang: 'fr' },
  { raw: 'Être ou ne pas être telle est la question', lang: 'fr' },
];

const GERMAN_TEXTS = [
  { raw: 'Ich bin ein Berliner', lang: 'de' },
  { raw: 'Die Würde des Menschen ist unantastbar', lang: 'de' },
  { raw: 'Alle Menschen sind frei und gleich an Würde und Rechten geboren', lang: 'de' },
  { raw: 'Freiheit Gleichheit Brüderlichkeit', lang: 'de' },
  { raw: 'Deutschland über alles in der Welt', lang: 'de' },
  { raw: 'Wir sind das Volk', lang: 'de' },
  { raw: 'Der Angriff beginnt bei Morgengrauen', lang: 'de' },
  { raw: 'Im Namen des deutschen Volkes', lang: 'de' },
  { raw: 'Das Geheimnis aller Macht ist das Wissen', lang: 'de' },
  { raw: 'Vorwärts immer rückwärts nimmer', lang: 'de' },
  { raw: 'Kein Kommentar zur Lage', lang: 'de' },
  { raw: 'Die Wahrheit wird euch frei machen', lang: 'de' },
  { raw: 'Einigkeit und Recht und Freiheit', lang: 'de' },
  { raw: 'Der frühe Vogel fängt den Wurm', lang: 'de' },
  { raw: 'Jeder Mensch hat Anspruch auf die in dieser Erklärung verkündeten Rechte', lang: 'de' },
  { raw: 'Keine Macht für niemand', lang: 'de' },
  { raw: 'Wir kapitulieren niemals', lang: 'de' },
  { raw: 'Das ist nicht nur nicht richtig es ist nicht einmal falsch', lang: 'de' },
  { raw: 'Im Westen nichts Neues', lang: 'de' },
  { raw: 'Arbeit macht frei', lang: 'de' },
  { raw: 'Heute Deutschland morgen die Welt', lang: 'de' },
  { raw: 'Wir werden kämpfen und wir werden siegen', lang: 'de' },
  { raw: 'Der Krieg ist aller Dinge Vater', lang: 'de' },
  { raw: 'Gott mit uns', lang: 'de' },
  { raw: 'In dieser Stunde erkläre ich die Feindseligkeiten für beendet', lang: 'de' },
];

const LATIN_TEXTS = [
  { raw: 'Gallia est omnis divisa in partes tres', lang: 'la' },
  { raw: 'Veni vidi vici', lang: 'la' },
  { raw: 'Alea iacta est', lang: 'la' },
  { raw: 'Et tu Brute', lang: 'la' },
  { raw: 'Carpe diem quam minimum credula postero', lang: 'la' },
  { raw: 'Dum Romae consulitur Saguntum expugnatur', lang: 'la' },
  { raw: 'Senatus populusque Romanus', lang: 'la' },
  { raw: 'Ars longa vita brevis', lang: 'la' },
  { raw: 'In vino veritas', lang: 'la' },
  { raw: 'Cogito ergo sum', lang: 'la' },
  { raw: 'Quid pro quo', lang: 'la' },
  { raw: 'E pluribus unum', lang: 'la' },
  { raw: 'Annuit coeptis novus ordo seclorum', lang: 'la' },
  { raw: 'Per aspera ad astra', lang: 'la' },
  { raw: 'Sic semper tyrannis', lang: 'la' },
  { raw: 'Tempus fugit', lang: 'la' },
  { raw: 'Si vis pacem para bellum', lang: 'la' },
  { raw: 'Memento mori', lang: 'la' },
  { raw: 'Nihil novi sub sole', lang: 'la' },
  { raw: 'Omnia mutantur nihil interit', lang: 'la' },
  { raw: 'Veritas vos liberabit', lang: 'la' },
  { raw: 'Fiat lux', lang: 'la' },
  { raw: 'In principio erat verbum', lang: 'la' },
  { raw: 'Mors ultima ratio est', lang: 'la' },
  { raw: 'Nemo me impune lacessit', lang: 'la' },
];

const SPANISH_TEXTS = [
  { raw: 'En un lugar de la Mancha de cuyo nombre no quiero acordarme', lang: 'es' },
  { raw: 'Todos los seres humanos nacen libres e iguales en dignidad y derechos', lang: 'es' },
  { raw: 'La libertad no se mendiga se conquista', lang: 'es' },
  { raw: 'Patria libertad o muerte', lang: 'es' },
  { raw: 'No pasarán', lang: 'es' },
  { raw: 'España una grande y libre', lang: 'es' },
  { raw: 'Viva la República española', lang: 'es' },
  { raw: 'El que no llora no mama', lang: 'es' },
  { raw: 'Podrán cortar todas las flores pero no podrán detener la primavera', lang: 'es' },
  { raw: 'En el principio era el Verbo y el Verbo era con Dios', lang: 'es' },
  { raw: 'Navegamos en un mar de ignorancia hacia islas de conocimiento', lang: 'es' },
  { raw: 'La historia es un profeta con la mirada vuelta hacia atrás', lang: 'es' },
  { raw: 'Seré breve porque lo que tengo que decir es importante', lang: 'es' },
  { raw: 'El tiempo todo lo cura', lang: 'es' },
  { raw: 'Más sabe el diablo por viejo que por diablo', lang: 'es' },
  { raw: 'Cuando una puerta se cierra otra se abre', lang: 'es' },
  { raw: 'La unión hace la fuerza', lang: 'es' },
  { raw: 'Más vale tarde que nunca', lang: 'es' },
  { raw: 'En boca cerrada no entran moscas', lang: 'es' },
  { raw: 'Camarón que se duerme se lo lleva la corriente', lang: 'es' },
  { raw: 'El que con lobos anda a aullar aprende', lang: 'es' },
  { raw: 'Saber es poder', lang: 'es' },
  { raw: 'Dime con quién andas y te diré quién eres', lang: 'es' },
  { raw: 'La mejor defensa es un buen ataque', lang: 'es' },
  { raw: 'Quien mucho abarca poco aprieta', lang: 'es' },
];

const ITALIAN_TEXTS = [
  { raw: 'Nel mezzo del cammin di nostra vita mi ritrovai per una selva oscura', lang: 'it' },
  { raw: 'Tutti gli uomini nascono liberi ed eguali in dignità e diritti', lang: 'it' },
  { raw: 'Italia una e indivisibile', lang: 'it' },
  { raw: 'Resistere resistere resistere', lang: 'it' },
  { raw: 'Il segreto è l anima di tutte le grandi imprese', lang: 'it' },
  { raw: 'Siamo tutti figli di Roma', lang: 'it' },
  { raw: 'La matematica è il linguaggio in cui Dio ha scritto l universo', lang: 'it' },
  { raw: 'Eppur si muove', lang: 'it' },
  { raw: 'Vincere e vinceremo', lang: 'it' },
  { raw: 'Roma caput mundi', lang: 'it' },
  { raw: 'Avanti popolo alla riscossa bandiera rossa trionferà', lang: 'it' },
  { raw: 'Non si può insegnare niente a un uomo si può solo aiutarlo a scoprire quello che ha già dentro', lang: 'it' },
  { raw: 'Il tempo è tiranno', lang: 'it' },
  { raw: 'Chi dorme non piglia pesci', lang: 'it' },
  { raw: 'La fortuna aiuta gli audaci', lang: 'it' },
];

const ALL_ML_TEXTS = [
  ...FRENCH_TEXTS, ...GERMAN_TEXTS, ...LATIN_TEXTS, ...SPANISH_TEXTS, ...ITALIAN_TEXTS
];

// Language metadata
const LANG_META = {
  fr: { name: 'French', alphabet: 'A-Z (French, diacritics removed)' },
  de: { name: 'German', alphabet: 'A-Z (German, umlauts transliterated)' },
  la: { name: 'Latin', alphabet: 'A-Z' },
  es: { name: 'Spanish', alphabet: 'A-Z (Spanish, diacritics removed)' },
  it: { name: 'Italian', alphabet: 'A-Z (Italian, diacritics removed)' },
};

// Engines that work well with generic A-Z text
const ML_ENGINE_CONFIGS = [
  {
    engName: 'caesar', family: 'substitution', type: 'caesar', diff: 'beginner',
    attacks: ['frequency analysis', 'brute force'],
    tags: ['classical', 'substitution', 'caesar', 'multilingual'],
    variants: [
      ['3', '3'], ['7', '7'], ['13', '13'], ['19', '19'], ['21', '21'],
    ]
  },
  {
    engName: 'rot13', family: 'substitution', type: 'rot13', diff: 'beginner',
    attacks: ['frequency analysis', 'brute force'],
    tags: ['classical', 'substitution', 'rot13', 'multilingual'],
    variants: [[null, null]],
  },
  {
    engName: 'atbash', family: 'substitution', type: 'atbash', diff: 'beginner',
    attacks: ['frequency analysis', 'known encoding'],
    tags: ['classical', 'substitution', 'atbash', 'multilingual'],
    variants: [[null, null]],
  },
  {
    engName: 'affine', family: 'substitution', type: 'affine', diff: 'beginner',
    attacks: ['frequency analysis', 'algebraic attack'],
    tags: ['classical', 'substitution', 'affine', 'multilingual'],
    variants: [['5,8', '5,8'], ['7,3', '7,3'], ['11,2', '11,2']],
  },
  {
    engName: 'vigenere', family: 'polyalphabetic', type: 'vigenere', diff: 'intermediate',
    attacks: ['Kasiski examination', 'index of coincidence'],
    tags: ['classical', 'polyalphabetic', 'vigenere', 'multilingual'],
    variants: [
      ['CIPHER', 'CIPHER'], ['SECRET', 'SECRET'], ['LEMON', 'LEMON'],
      ['MUSEUM', 'MUSEUM'], ['CRYPTO', 'CRYPTO'],
    ]
  },
  {
    engName: 'beaufort', family: 'polyalphabetic', type: 'beaufort', diff: 'intermediate',
    attacks: ['Kasiski examination', 'index of coincidence'],
    tags: ['classical', 'polyalphabetic', 'beaufort', 'multilingual'],
    variants: [['BEAUFORT', 'BEAUFORT'], ['CIPHER', 'CIPHER'], ['SECRET', 'SECRET']],
  },
  {
    engName: 'playfair', family: 'substitution', type: 'playfair', diff: 'intermediate',
    attacks: ['bigram frequency analysis', 'probable word'],
    tags: ['classical', 'substitution', 'playfair', 'multilingual'],
    variants: [['KEYWORD', 'KEYWORD'], ['CIPHER', 'CIPHER'], ['MUSEUM', 'MUSEUM']],
  },
  {
    engName: 'railFence', family: 'transposition', type: 'rail_fence', diff: 'intermediate',
    attacks: ['brute force rails', 'pattern analysis'],
    tags: ['classical', 'transposition', 'rail-fence', 'multilingual'],
    variants: [['2', '2'], ['3', '3'], ['4', '4']],
  },
  {
    engName: 'columnar', family: 'transposition', type: 'columnar_transposition', diff: 'intermediate',
    attacks: ['multiple anagramming', 'probable word'],
    tags: ['classical', 'transposition', 'columnar', 'multilingual'],
    variants: [['CIPHER', 'CIPHER'], ['ZEBRA', 'ZEBRA'], ['KEYWORD', 'KEYWORD']],
  },
  {
    engName: 'bifid', family: 'fractionation', type: 'bifid', diff: 'advanced',
    attacks: ['bigram frequency analysis', 'Polybius recovery'],
    tags: ['classical', 'fractionation', 'bifid', 'multilingual'],
    variants: [['KEYWORD', 'KEYWORD'], ['CIPHER', 'CIPHER']],
  },
  {
    engName: 'polybius', family: 'substitution', type: 'polybius', diff: 'beginner',
    attacks: ['frequency analysis', 'known encoding'],
    tags: ['classical', 'substitution', 'polybius', 'multilingual'],
    variants: [[null, null]],
  },
  {
    engName: 'autokey', family: 'polyalphabetic', type: 'autokey', diff: 'intermediate',
    attacks: ['index of coincidence', 'probable word'],
    tags: ['classical', 'polyalphabetic', 'autokey', 'multilingual'],
    variants: [['CIPHER', 'CIPHER'], ['SECRET', 'SECRET']],
  },
];

const records = [];
let total = 0;

for (const text of ALL_ML_TEXTS) {
  const plain = toAscii(text.raw);
  if (plain.length < 8) continue;
  const lang = text.lang;
  const lm = LANG_META[lang];

  for (const cfg of ML_ENGINE_CONFIGS) {
    const eng = CE[cfg.engName];
    if (!eng || !eng.encode) continue;

    for (const [keyStr, keyVal] of cfg.variants) {
      if (!testRoundtrip(eng, plain, keyStr)) continue;

      let ct;
      try { ct = eng.encode(plain, keyStr); } catch { continue; }
      if (!ct || typeof ct !== 'string' || ct === '') continue;

      const hasSpaces = /[ \n\t]/.test(ct);
      const hasPunct = /[^A-Z0-9 \n\t]/.test(ct);
      const hasLower = /[a-z]/.test(ct);
      const normLen = cleanFn(ct).length;

      const keyObj = keyVal === null ? { type: 'none', value: null } :
        (isNaN(keyVal) ? { type: 'keyword', value: keyVal } : { type: 'shift', value: parseInt(keyVal) });

      const record = {
        id: nextId(lang, cfg.type),
        title: `${cfg.type.replace(/_/g, ' ')} — ${lm.name} (${lang.toUpperCase()})`,
        cipher_family: cfg.family,
        cipher_type: cfg.type,
        plaintext: plain,
        ciphertext: ct,
        key: keyObj,
        language: lang,
        alphabet: lm.alphabet,
        text_length: ct.length,
        normalized_text_length: normLen,
        spacing: hasSpaces ? 'preserved' : 'removed',
        punctuation: hasPunct ? 'mixed' : 'removed',
        casing: hasLower ? 'mixed' : 'uppercase',
        difficulty: cfg.diff,
        source_type: 'synthetic',
        source: `Generated by Cipher Museum from public-domain ${lm.name} text`,
        license: 'CC0',
        notes: `Multilingual record — ${lm.name}. Diacritics removed for A-Z compatibility.`,
        expected_attacks: cfg.attacks,
        tags: [...cfg.tags, lang, lm.name.toLowerCase()],
        created_by: 'Cipher Museum',
        verified: true,
        dataset_version: '0.2',
        split: Math.random() < 0.7 ? 'public' : 'blind',
        transcription_quality: 'clean',
        source_provenance: {
          url: CORPUS_URL,
          archive: 'Cipher Museum Synthetic Corpus — Multilingual Extension',
          publication_date: TODAY,
          license: 'CC0'
        }
      };

      records.push(record);
      total++;
    }
  }
}

// Write multilingual JSONL
const outPath = path.join(OUT_DIR, 'multilingual.jsonl');
fs.writeFileSync(outPath, records.map(r => JSON.stringify(r)).join('\n') + '\n');

// Append to all.jsonl
const allPath = path.join(OUT_DIR, 'all.jsonl');
fs.appendFileSync(allPath, records.map(r => JSON.stringify(r)).join('\n') + '\n');

console.log(`Generated ${total} multilingual records → ${outPath}`);
console.log(`Languages: fr=${records.filter(r=>r.language==='fr').length}, de=${records.filter(r=>r.language==='de').length}, la=${records.filter(r=>r.language==='la').length}, es=${records.filter(r=>r.language==='es').length}, it=${records.filter(r=>r.language==='it').length}`);
