const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_IMAGE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent";

export interface GeneratedImage {
  base64: string;
  mimeType: string;
  prompt: string;
  filePath?: string; // Absolute path on disk after saving (if saved)
}

// Thailand travel category → visual style mapping
const THAILAND_STYLE_MAP: Record<string, string> = {
  "city-guide":
    "vibrant Thai cityscape, golden temples, tuk-tuks, street vendors at dusk, warm golden hour lighting",
  food: "colorful Thai street food market, aromatic dishes, fresh ingredients, wok flames, bustling night market atmosphere",
  activities:
    "adventurous Thailand activities, lush jungle, turquoise waters, tropical scenery, sunny day",
  practical:
    "traveler in Thailand, maps and transportation, friendly locals, authentic Thai details",
  budget:
    "backpacker in Thailand, affordable guesthouses, local markets, simple but beautiful Thai scenery",
  seasonal:
    "Thai festival or seasonal celebration, lanterns, flowers, traditional costume, joyful atmosphere",
  islands:
    "pristine Thai island, crystal clear turquoise sea, limestone karsts, white sand beach, tropical paradise",
  temples:
    "majestic Thai Buddhist temple, golden spires, monks in saffron robes, incense smoke, serene atmosphere",
  default:
    "beautiful Thailand landscape, tropical scenery, rich culture, vibrant colors",
};

// Core Gemini image generation function
export async function generateImage(prompt: string): Promise<GeneratedImage> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const response = await fetch(`${GEMINI_IMAGE_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE"],
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini image API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts;

  if (!parts) {
    throw new Error("No content in Gemini response");
  }

  // Gemini API uses either inline_data (snake_case) or inlineData (camelCase)
  const imagePart = parts.find(
    (p: {
      inline_data?: { mime_type: string; data: string };
      inlineData?: { mimeType: string; data: string };
    }) => p.inline_data || p.inlineData
  );

  if (imagePart?.inlineData) {
    return {
      base64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType || "image/png",
      prompt,
    };
  }
  if (imagePart?.inline_data) {
    return {
      base64: imagePart.inline_data.data,
      mimeType: imagePart.inline_data.mime_type || "image/png",
      prompt,
    };
  }

  throw new Error("No image generated in Gemini response");
}

// Generate a Thailand travel blog featured image (16:9 landscape)
// Returns the GeneratedImage with base64 data and the publicPath.
// Does NOT write to disk — the caller is responsible for committing via GitHub API.
export async function generateBlogImage(
  title: string,
  category: string,
  slug: string
): Promise<GeneratedImage & { publicPath: string }> {
  const style =
    THAILAND_STYLE_MAP[category] || THAILAND_STYLE_MAP["default"];

  const prompt = `Create a professional, photorealistic travel photography blog header image for an article titled "${title}".
Visual style: ${style}.
Composition: Wide landscape format (16:9 aspect ratio), high resolution, magazine quality.
Must be evocative of Thailand travel — temples, beaches, street food, markets, tuk-tuks, or tropical nature depending on context.
Lighting: Natural, golden hour, or vibrant tropical daylight.
CRITICAL RULE: The image must contain ZERO text, ZERO letters, ZERO numbers, ZERO words, ZERO labels, ZERO watermarks, ZERO captions, ZERO UI elements. No characters of any language or alphabet whatsoever. Only use photographic visual elements, scenery, people (from behind or distance), architecture, food, and nature.`;

  const image = await generateImage(prompt);

  const publicPath = `/images/blog/${slug}.webp`;

  console.log(`[image-generator] Image generated for: ${slug} (not saved to disk — will be committed via GitHub API)`);

  return {
    ...image,
    publicPath,
  };
}

// Convert base64 image to a data URL for inline embedding (use sparingly)
export function toDataUrl(image: GeneratedImage): string {
  return `data:${image.mimeType};base64,${image.base64}`;
}
