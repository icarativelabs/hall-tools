// VIN helpers — shared by background.js (and testable in Node).

const VIN_TRANSLIT = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9
};
const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
const YEAR_CODES = "ABCDEFGHJKLMNPRSTVWXY123456789"; // 30-year cycle

// Pull a VIN out of highlighted text: tolerates spaces/dashes and "VIN:" labels.
function extractVin(text) {
  if (!text) return null;
  const cleaned = String(text).toUpperCase().replace(/^\s*VIN\s*[:#-]?\s*/, "").replace(/[\s-]/g, "");
  if (/^[A-HJ-NPR-Z0-9]{17}$/.test(cleaned)) return cleaned;
  // Otherwise look for a 17-char VIN inside a longer selection.
  const m = String(text).toUpperCase().match(/\b[A-HJ-NPR-Z0-9]{17}\b/);
  return m ? m[0] : null;
}

function checkDigitValid(vin) {
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const c = vin[i];
    const v = /\d/.test(c) ? Number(c) : VIN_TRANSLIT[c];
    sum += v * VIN_WEIGHTS[i];
  }
  const r = sum % 11;
  return vin[8] === (r === 10 ? "X" : String(r));
}

// Model year from 10th character; 7th character disambiguates the cycle
// (letter in position 7 => 2010+, digit => 1980–2009) for North American VINs.
function modelYear(vin) {
  const idx = YEAR_CODES.indexOf(vin[9]);
  if (idx < 0) return null;
  const base = /[A-Z]/.test(vin[6]) ? 2010 : 1980;
  return base + idx;
}

const MAKERS = [
  {
    name: "Stellantis",
    // Chrysler, Dodge, Jeep, Ram, Fiat, Alfa Romeo
    wmi: /^(1C[3-8]|2C[3-8]|3C[3-8]|1[ABDJ][3-8]|2[ABDJ][3-8]|3[ABDJ][3-8]|ZAC|ZFA|ZFB|ZAR)/,
    sticker: vin => `https://www.chrysler.com/hostd/windowsticker/getWindowStickerPdf.do?vin=${vin}`
  },
  {
    name: "Ford",
    wmi: /^([123]F[ABCDEMT]|1L[NJ]|2L[MJ]|3L[NJ]|5L[MD]|NM0|WF0|MAJ)/,
    sticker: vin => `https://www.windowsticker.forddirect.com/windowsticker.pdf?vin=${vin}`
  },
  {
    name: "GM",
    // Chevrolet, GMC, Buick, Cadillac
    wmi: /^([123]G|KL|LRB|5GA|6G)/,
    sticker: vin => `https://cws.gm.com/vs-cws/vehshop/v2/vehicle/windowsticker?vin=${vin}`
  }
];

function makerFor(vin) {
  return MAKERS.find(m => m.wmi.test(vin)) || null;
}

function analyzeVin(text) {
  const vin = extractVin(text);
  if (!vin) return null;
  return { vin, checkOk: checkDigitValid(vin), year: modelYear(vin), maker: makerFor(vin) };
}

if (typeof module !== "undefined") module.exports = { extractVin, checkDigitValid, modelYear, makerFor, analyzeVin };
