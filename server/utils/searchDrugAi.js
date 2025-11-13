const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const OpenAI = require('openai');

const OPEN_AI_KEY = process.env.OPEN_AI_KEY;
const openaiClient = OPEN_AI_KEY ? new OpenAI({ apiKey: OPEN_AI_KEY }) : null;

const MAX_KEYWORDS = 5;

/**
 * Normalize keyword candidates to Title Case and ensure uniqueness.
 * @param {string[]} words
 * @returns {string[]}
 */
function normalizeKeywords(words = []) {
  const seen = new Set();
  const normalized = [];

  words.forEach((word) => {
    if (!word) return;
    const cleaned = word
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .trim();

    if (!cleaned) return;

    const title = cleaned
      .split(/\s+/)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
      .join(' ');

    const canonical = title.toLowerCase();
    if (!seen.has(canonical)) {
      seen.add(canonical);
      normalized.push(title);
    }
  });

  return normalized.slice(0, MAX_KEYWORDS);
}

/**
 * Heuristic keyword extraction from raw OCR text.
 * @param {string} text
 * @returns {string[]}
 */
function fallbackKeywords(text = '') {
  const tokens = text
    .split(/[\s\r\n,.;:(){}\[\]\/\\]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && /^[a-zA-Z0-9-]+$/.test(token));

  // Prefer tokens that look like medicine names (start with uppercase letter).
  const prioritized = tokens.filter((token) => /^[A-Z]/.test(token));
  const candidates = prioritized.length ? prioritized : tokens;

  return normalizeKeywords(candidates);
}

/**
 * Extract medicine keywords using OpenAI to refine OCR results.
 * @param {string} text
 * @returns {Promise<string[]>}
 */
async function aiExtractKeywords(text) {
  if (!openaiClient || !text.trim()) {
    return [];
  }

  try {
    const prompt = `You are an assistant that extracts drug or medicine names from OCR text. 
Respond ONLY with a JSON array of the distinct medicine names (max ${MAX_KEYWORDS} entries). 
If none are found, respond with an empty JSON array.

OCR text:
${text}`;

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content:
            'Extract distinct drug or medicine product names from provided text. Respond strictly with JSON array of strings, no additional commentary.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      return [];
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      // Try to recover if the model wrapped the JSON in markdown
      const match = raw.match(/\[.*\]/s);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        return [];
      }
    }

    if (Array.isArray(parsed)) {
      return normalizeKeywords(parsed);
    }

    return [];
  } catch (error) {
    console.error('OpenAI keyword extraction failed:', error.message);
    return [];
  }
}

/**
 * Run Tesseract OCR on the provided image path.
 * @param {string} imagePath
 * @returns {Promise<string>}
 */
async function extractText(imagePath) {
  if (!imagePath) {
    throw new Error('Image path is required for OCR.');
  }

  // Ensure file exists before processing
  await fs.promises.access(imagePath, fs.constants.R_OK);

  const { data } = await Tesseract.recognize(imagePath, 'eng', {
    tessjs_create_pdf: false,
  });

  return data?.text || '';
}

/**
 * Process an image and return OCR text plus derived keyword suggestions.
 * @param {string} imagePath
 * @returns {Promise<{ rawText: string, keywords: string[] }>}
 */
async function processImageForDrugs(imagePath) {
  const absolutePath = path.resolve(imagePath);
  const rawText = await extractText(absolutePath);

  if (!rawText.trim()) {
    return { rawText: '', keywords: [] };
  }

  const aiKeywords = await aiExtractKeywords(rawText);
  const fallback = fallbackKeywords(rawText);

  const keywords = normalizeKeywords([...aiKeywords, ...fallback]);

  return {
    rawText: rawText.trim(),
    keywords,
  };
}

module.exports = {
  processImageForDrugs,
};
