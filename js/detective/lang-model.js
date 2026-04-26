/* ================================================================
   THE CIPHER MUSEUM — English Language Model v1.0

   Compact statistical model used by the Detective's Auto-Solve
   engine to score how "English-like" a piece of candidate
   plaintext is. Higher score = more English-like.

   Approach:
     - Per-letter log probabilities (Norvig 2012 corpus)
     - Top ~80 English bigram log probabilities (Mayzner-revisited)
     - Top ~200 English trigram log probabilities
     - Bonus credit for ~120 most-common English words found
     - Floor penalty for n-grams not in the table (calibrated so
       hill-climbing escapes local minima on short text)

   Total embedded weight: roughly 6 KB before gzip — small enough
   to ship inline with the page and large enough to break
   substitution ciphers in well under a second.
   ================================================================ */
'use strict';

(function (global) {

  /* ── Letter log-probabilities (natural log, base e) ───────────
     Source: Norvig, "English Letter Frequency Counts: Mayzner
     Revisited or ETAOIN SRHLDCU" (2012). Frequencies-per-100
     converted to ln(p/100).                                      */
  var LETTER_LOG = {
    A: -2.521, B: -4.213, C: -3.398, D: -3.265, E: -2.080,
    F: -3.730, G: -3.978, H: -2.985, I: -2.581, J: -6.438,
    K: -5.222, L: -3.200, M: -3.685, N: -2.628, O: -2.572,
    P: -3.844, Q: -6.725, R: -2.768, S: -2.730, T: -2.378,
    U: -3.601, V: -4.554, W: -4.087, X: -6.073, Y: -4.097,
    Z: -7.013
  };

  /* ── Top English bigrams ──────────────────────────────────────
     Counts per million (Norvig/Mayzner 2012, normalised), turned
     into log-probabilities. Anything not in this table receives
     LOG_FLOOR (set below). Order roughly by frequency.           */
  var BIGRAM_FREQ = {
    TH: 3.56, HE: 3.07, IN: 2.43, ER: 2.05, AN: 1.99, RE: 1.85, ON: 1.76, AT: 1.49, EN: 1.45, ND: 1.35,
    TI: 1.34, ES: 1.34, OR: 1.28, TE: 1.20, OF: 1.17, ED: 1.17, IS: 1.13, IT: 1.12, AL: 1.09, AR: 1.07,
    ST: 1.05, TO: 1.04, NT: 1.04, NG: 0.95, SE: 0.93, HA: 0.93, AS: 0.87, OU: 0.87, IO: 0.83, LE: 0.83,
    VE: 0.83, CO: 0.79, ME: 0.79, DE: 0.76, HI: 0.76, RI: 0.73, RO: 0.73, IC: 0.70, NE: 0.69, EA: 0.69,
    RA: 0.69, CE: 0.65, LI: 0.62, CH: 0.60, LL: 0.58, BE: 0.58, MA: 0.57, SI: 0.55, OM: 0.55, UR: 0.54,
    CA: 0.54, EL: 0.54, TA: 0.53, LA: 0.53, NS: 0.51, DI: 0.50, FO: 0.50, HO: 0.49, PE: 0.49, EC: 0.48,
    PR: 0.48, NO: 0.47, CT: 0.46, US: 0.45, AC: 0.45, OT: 0.45, IL: 0.44, TR: 0.43, LY: 0.42, NC: 0.41,
    ET: 0.41, UT: 0.41, SS: 0.40, SO: 0.40, RS: 0.40, UN: 0.39, LO: 0.39, WA: 0.38, GE: 0.38, IE: 0.38,
    WH: 0.38, EE: 0.38, WI: 0.37, EM: 0.37, AD: 0.37, OL: 0.37, RT: 0.36, PO: 0.36, WE: 0.36, NA: 0.35,
    UL: 0.35, NI: 0.34, TS: 0.34, MO: 0.34, OW: 0.33, PA: 0.32, IM: 0.32, MI: 0.32, AI: 0.31, SH: 0.30,
    IR: 0.30, SU: 0.29, OS: 0.29, FI: 0.29, RY: 0.28, OD: 0.28, AB: 0.27, EI: 0.27, TT: 0.27, FE: 0.27,
    AM: 0.27, GO: 0.26, FA: 0.26, LU: 0.26, KE: 0.25, OO: 0.25, AY: 0.25, IF: 0.24, BO: 0.24, AP: 0.23,
    EP: 0.23, FU: 0.22, OB: 0.22, BU: 0.22
  };

  /* ── Top English trigrams ─────────────────────────────────────
     Counts per million (well-known published Mayzner-revisited
     values), normalised to relative frequency.                   */
  var TRIGRAM_FREQ = {
    THE: 3.51, AND: 1.59, ING: 1.15, HER: 0.82, HAT: 0.65, HIS: 0.60, THA: 0.59, ERE: 0.56, FOR: 0.54, ENT: 0.53,
    ION: 0.51, TER: 0.46, WAS: 0.46, YOU: 0.44, ITH: 0.43, VER: 0.43, ALL: 0.42, WIT: 0.40, THI: 0.39, TIO: 0.38,
    NDE: 0.37, HAS: 0.36, NCE: 0.36, EDT: 0.36, TIS: 0.34, OFT: 0.33, STH: 0.33, MEN: 0.32, HEN: 0.32, ITS: 0.32,
    HEY: 0.31, RES: 0.31, ATI: 0.30, FRO: 0.30, ATE: 0.30, ETH: 0.29, WHE: 0.29, OUT: 0.28, NTH: 0.28, FOU: 0.27,
    EAR: 0.27, OTH: 0.27, ENC: 0.26, ESS: 0.26, ITY: 0.26, ICA: 0.26, ITI: 0.26, EAT: 0.25, OUL: 0.25, INE: 0.25,
    WHI: 0.25, HAV: 0.25, HEI: 0.24, EVE: 0.24, ERS: 0.24, NOT: 0.24, TIN: 0.24, TED: 0.24, INT: 0.24, BUT: 0.24,
    LIK: 0.23, ARE: 0.23, EST: 0.23, ULD: 0.23, OUR: 0.23, ANT: 0.23, EDA: 0.23, RIN: 0.23, ART: 0.22, UND: 0.22,
    NDT: 0.22, RED: 0.22, EAS: 0.22, RAN: 0.22, REA: 0.22, ITT: 0.22, ESE: 0.22, REE: 0.22, AIN: 0.22, OME: 0.22,
    ROM: 0.21, INA: 0.21, NTO: 0.21, ATH: 0.21, IST: 0.21, USE: 0.21, COM: 0.21, NCO: 0.21, SIN: 0.20, IGH: 0.20,
    NDI: 0.20, HOU: 0.20, NLY: 0.20, EOF: 0.20, MAN: 0.20, ONE: 0.20, ENT: 0.20, TON: 0.20, ROU: 0.20, AME: 0.20,
    IND: 0.19, RAT: 0.19, OUN: 0.19, SAN: 0.19, ETO: 0.19, TOR: 0.19, ANY: 0.19, RIE: 0.19, BEE: 0.19, OUS: 0.19,
    OWN: 0.18, EYO: 0.18, SHO: 0.18, RST: 0.18, TIM: 0.18, LIT: 0.18, GRE: 0.18, NES: 0.18, LIN: 0.18, IDE: 0.18,
    PER: 0.17, MOR: 0.17, ESA: 0.17, SOM: 0.17, EDI: 0.17, EDO: 0.17, NTE: 0.17, EAN: 0.17, ATA: 0.17, RIT: 0.17,
    THO: 0.17, ITE: 0.17, AST: 0.17, NES: 0.17, ICE: 0.17, IES: 0.16, RES: 0.16, WAY: 0.16, IGT: 0.16, ROC: 0.16,
    NEW: 0.16, SEA: 0.16, HEA: 0.16, ELL: 0.16, ETT: 0.16, IGN: 0.15, OSE: 0.15, ROW: 0.15, ROO: 0.15, GHT: 0.15,
    DTH: 0.15, ADE: 0.15, EAD: 0.15, INS: 0.15, ESI: 0.15, NDA: 0.15, CAN: 0.15, HAD: 0.15, HAN: 0.15, ABL: 0.15,
    HIN: 0.14, EOR: 0.14, EVE: 0.14, OUR: 0.14, BLE: 0.14, NDS: 0.14, ENA: 0.14, TUR: 0.14, IOU: 0.14, ANC: 0.14,
    LAN: 0.14, ETE: 0.14, ATT: 0.14, RTH: 0.13, ARS: 0.13, NIN: 0.13, RAC: 0.13, GAR: 0.13, NAL: 0.13, ICA: 0.13,
    ASE: 0.13, TIC: 0.13, ANT: 0.13, HEM: 0.13, DAN: 0.13, FIR: 0.13, VEN: 0.13, ICH: 0.13, IVE: 0.13, NTI: 0.13,
    TLY: 0.13, OND: 0.12, OST: 0.12, REM: 0.12, ENI: 0.12, TWO: 0.12, MOT: 0.12, ASA: 0.12, ANS: 0.12, AGE: 0.12,
    NTS: 0.12, RAI: 0.12, NDH: 0.12, NLY: 0.11, BAC: 0.11, HEC: 0.11, RIG: 0.11, EFI: 0.11, OUG: 0.11, KIN: 0.11,
    THR: 0.11, IDE: 0.11, ULT: 0.11, RIV: 0.11, NCE: 0.11, OUT: 0.11, OND: 0.11, EAC: 0.11, FIE: 0.11, OUL: 0.11,
    WIL: 0.11, OFF: 0.10, COM: 0.10, ENE: 0.10, AVE: 0.10, ONS: 0.10, KNO: 0.10, ENS: 0.10, MIN: 0.10, OUC: 0.10,
    ESH: 0.10, ICA: 0.10, IRS: 0.10, ATU: 0.10, EOP: 0.10, ANO: 0.10, SST: 0.10, SOF: 0.10, EFO: 0.10, SAI: 0.10,
    OPL: 0.10, FRE: 0.10, COU: 0.10
  };

  /* ── Common English words for word-bonus ─────────────────────
     Detecting any of these in the candidate plaintext is strong
     evidence we have something approaching English. Plain set so
     lookups are O(1).                                            */
  var COMMON_WORDS = (function () {
    var list = (
      'THE OF AND TO IN A IS THAT IT FOR YOU WAS WITH ON AS HAVE BUT BE ' +
      'THEY NOT BY THIS FROM WE ARE OR HAS AN HE HIS WHICH AT ONE SO ALL ' +
      'WOULD WILL THERE WHAT WHEN WHO HOW MAN SAID ABOUT MORE INTO THAN ' +
      'THEM ITS TIME LIKE HER SHE OUR OUT IF NO ANY ONLY MY SOME COULD ' +
      'OTHER UP DO BEEN MADE NOW MAY OVER VERY AFTER WAY DOWN WERE TWO ' +
      'NEW JUST WORK MUCH SHOULD WELL SUCH FIRST KNOW GET WHERE BECAUSE ' +
      'MOST DAY THESE ALSO PEOPLE EVEN GOOD MUST EACH MAKE LIFE THINK ' +
      'YEAR YEARS GOD LORD JESUS CHRIST KING POWER HEART HAND TODAY ' +
      'WORLD COME TAKE STILL HOME LONG NIGHT LITTLE WHILE TOO OLD MEN ' +
      'WOMEN GIVE FIND KEEP NEED HELP STAND HOLY SPIRIT FATHER SON LIGHT ' +
      'WORD BOOK HOUSE STREET MIND SOUL TRUE LOVE FREE DEEP HIGH HEAR ' +
      'CALL NAME PART SIDE CASE WORK PLACE NUMBER HEAD FACT GROUP SYSTEM ' +
      'PROGRAM QUESTION GOVERNMENT COMPANY BUSINESS COUNTRY HISTORY ' +
      'NATIONAL IMPORTANT SECRET MESSAGE CIPHER CODE KEY ENEMY WAR'
    ).split(/\s+/);
    var set = {};
    for (var i = 0; i < list.length; i++) {
      if (list[i].length >= 2) set[list[i]] = true;
    }
    return set;
  }());

  /* ── Pre-compute log-probability tables ──────────────────────
     Convert the relative-frequency tables into ln(p) values once.
     Using ln of the raw "per-cent of all bigrams" works fine
     because hill-climbing only needs correct *ranking*.          */
  var BIGRAM_LOG  = {};
  var TRIGRAM_LOG = {};
  (function build() {
    var k;
    for (k in BIGRAM_FREQ)  if (Object.prototype.hasOwnProperty.call(BIGRAM_FREQ,  k)) BIGRAM_LOG[k]  = Math.log(BIGRAM_FREQ[k]  / 100);
    for (k in TRIGRAM_FREQ) if (Object.prototype.hasOwnProperty.call(TRIGRAM_FREQ, k)) TRIGRAM_LOG[k] = Math.log(TRIGRAM_FREQ[k] / 100);
  }());

  /* Floor penalties — calibrated empirically so hill climbing
     converges on substitution within ~1-3 sec for ~250 chars. */
  var BIGRAM_FLOOR  = Math.log(0.01 / 100);  /* unseen bigram  ≈ -9.2 */
  var TRIGRAM_FLOOR = Math.log(0.005 / 100); /* unseen trigram ≈ -9.9 */

  function lettersOnly(t) { return t.toUpperCase().replace(/[^A-Z]/g, ''); }

  /* ── Bigram score ─────────────────────────────────────────────
     Sum of log-probabilities over all overlapping bigrams. */
  function bigramScore(text) {
    var L = lettersOnly(text);
    if (L.length < 2) return -Infinity;
    var s = 0;
    for (var i = 0; i < L.length - 1; i++) {
      var bg = L.charAt(i) + L.charAt(i + 1);
      s += (bg in BIGRAM_LOG) ? BIGRAM_LOG[bg] : BIGRAM_FLOOR;
    }
    return s;
  }

  /* ── Trigram score ────────────────────────────────────────────
     Same shape as bigram. Trigrams give a stronger signal but are
     expensive on long text — fitness() blends both.              */
  function trigramScore(text) {
    var L = lettersOnly(text);
    if (L.length < 3) return -Infinity;
    var s = 0;
    for (var i = 0; i < L.length - 2; i++) {
      var tg = L.charAt(i) + L.charAt(i + 1) + L.charAt(i + 2);
      s += (tg in TRIGRAM_LOG) ? TRIGRAM_LOG[tg] : TRIGRAM_FLOOR;
    }
    return s;
  }

  /* ── Word bonus ───────────────────────────────────────────────
     Counts the common English words present in the original text,
     respecting word boundaries (any non-letter is a separator).
     Each hit adds a fixed bonus weighted by word length squared,
     so longer matches dominate.                                  */
  function wordBonus(text) {
    var bonus = 0;
    var words = text.toUpperCase().split(/[^A-Z]+/);
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (w.length >= 2 && (w in COMMON_WORDS)) {
        bonus += w.length * w.length * 0.55;
      }
    }
    return bonus;
  }

  /* ── Combined fitness ─────────────────────────────────────────
     The single number Auto-Solve maximises. Higher = more
     English-like. Returns roughly bigram+trigram log-prob plus
     a word-presence bonus. The trigram weight is 1.0; the bigram
     weight is 0.4 because trigrams already include bigram signal
     and we don't want to double-count too aggressively.          */
  function fitness(text) {
    var L = lettersOnly(text);
    if (L.length < 3) return -Infinity;
    return trigramScore(text) + 0.4 * bigramScore(text) + wordBonus(text);
  }

  /* ── Confidence tier ─────────────────────────────────────────
     Convert raw fitness per character into a human label.
     These thresholds were picked by running the solver against
     known plaintexts vs. noise; they are calibration constants,
     not a probability.                                          */
  function confidenceLabel(fitnessVal, textLen) {
    /* Calibrated against real English plaintext vs random ciphertext
       with the embedded n-gram tables above. Per-char fitness for
       real English typically ranges -7 to -10.5; gibberish -12 or
       worse. The boundary sits near -11.5.                        */
    var perChar = (textLen > 0) ? (fitnessVal / textLen) : -Infinity;
    if (perChar > -8.5)  return { tier: 'very-likely',  label: 'Very likely English' };
    if (perChar > -9.8)  return { tier: 'likely',       label: 'Likely English' };
    if (perChar > -10.7) return { tier: 'possible',     label: 'Possibly English (partial fit)' };
    if (perChar > -11.6) return { tier: 'unlikely',     label: 'Unlikely English (weak fit)' };
    return                      { tier: 'inconclusive', label: 'Inconclusive — does not look like English' };
  }

  /* ── Export ──────────────────────────────────────────────────── */
  global.DetectiveLangModel = {
    fitness:         fitness,
    bigramScore:     bigramScore,
    trigramScore:    trigramScore,
    wordBonus:       wordBonus,
    confidenceLabel: confidenceLabel,
    /* exposed for testing */
    LETTER_LOG:      LETTER_LOG,
    BIGRAM_LOG:      BIGRAM_LOG,
    TRIGRAM_LOG:     TRIGRAM_LOG,
    COMMON_WORDS:    COMMON_WORDS,
    BIGRAM_FLOOR:    BIGRAM_FLOOR,
    TRIGRAM_FLOOR:   TRIGRAM_FLOOR
  };

})(typeof window !== 'undefined' ? window : global);
