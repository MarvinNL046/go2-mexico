const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

const MEXICO_STYLE_MAP: Record<string, string> = {
  'city-guide': 'colorful Mexican colonial architecture, vibrant streets, painted buildings',
  'food': 'authentic Mexican street food, tacos, mole, colorful market stalls, fresh ingredients',
  'activities': 'ancient Mayan ruins, cenotes with crystal clear water, adventure activities',
  'practical': 'Mexican airport, currency exchange, travel essentials on colorful woven textile',
  'budget': 'local Mexican market scene, peso coins and bills, affordable street food',
  'seasonal': 'Day of the Dead decorations, Mexican festivals, seasonal flowers and traditions',
  'beaches': 'turquoise Caribbean beach Mexico, white sand, palm trees, crystal clear water',
  'culture': 'traditional Mexican art, murals, Frida Kahlo style, colorful papel picado',
  'nature': 'Mexican cenote, jungle, wildlife, copper canyon, monarch butterflies',
};

const BASE_STYLE =
  'photorealistic travel photography, vibrant colors, golden hour lighting, high quality, wide angle shot';

function buildPrompt(title: string, category: string): string {
  const styleHint = MEXICO_STYLE_MAP[category] ?? 'beautiful Mexican landscape, travel destination';
  return `${styleHint}, ${title}, ${BASE_STYLE}`;
}

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
}

export async function generateBlogImage(
  title: string,
  category: string
): Promise<Buffer | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set, skipping image generation');
    return null;
  }

  const prompt = buildPrompt(title, category);

  let response: Response;
  try {
    response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      }),
    });
  } catch (err) {
    console.error(
      'Gemini API request failed:',
      err instanceof Error ? err.message : err
    );
    return null;
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '(unreadable body)');
    console.error(`Gemini API error ${response.status}: ${text}`);
    return null;
  }

  let data: GeminiResponse;
  try {
    data = (await response.json()) as GeminiResponse;
  } catch (err) {
    console.error(
      'Failed to parse Gemini response:',
      err instanceof Error ? err.message : err
    );
    return null;
  }

  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith('image/'));

  if (!imagePart?.inlineData?.data) {
    console.warn('No image data found in Gemini response for prompt:', prompt);
    return null;
  }

  try {
    return Buffer.from(imagePart.inlineData.data, 'base64');
  } catch (err) {
    console.error(
      'Failed to decode base64 image data:',
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
