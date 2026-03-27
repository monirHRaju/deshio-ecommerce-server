import { Request, Response } from 'express';
import Product from '../models/product.model';
import Category from '../models/category.model';
import Review from '../models/review.model';
import AppError from '../utils/AppError';
import asyncHandler from '../utils/asyncHandler';
import { geminiModelForChat } from '../utils/gemini';
import { geminiModelTags } from '../utils/gemini';
import sendResponse from '../utils/sendResponse';

// POST /api/v1/ai/generate-description
// Body: { title, category, brand?, specs? }
const generateProductDescription = asyncHandler(async (req: Request, res: Response) => {
  const { title, category, brand, specs } = req.body;
  if (!title || !category) throw new AppError('Title and category are required', 400);

  const specsText =
    specs && Array.isArray(specs) && specs.length > 0
      ? `\nKey specifications:\n${specs.map((s: string) => `- ${s}`).join('\n')}`
      : '';

  const prompt = `You are a professional product copywriter for an electronics e-commerce store.
Write a compelling, SEO-friendly product description for the following electronics product.
The description should be 150-250 words, highlight key benefits, use bullet points for features, and end with a compelling call-to-action.

Product: ${title}
Category: ${category}${brand ? `\nBrand: ${brand}` : ''}${specsText}

Format the response as:
[2-3 sentence overview paragraph]

Key Features:
• [feature 1]
• [feature 2]
• [feature 3]
• [feature 4]
• [feature 5]

[1 sentence call-to-action]`;

  const result = await geminiModelTags.generateContent(prompt);
  const description = result.response.text();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Description generated successfully',
    data: { description },
  });
});

// POST /api/v1/ai/generate-tags
// Body: { title, category }
const generateProductTags = asyncHandler(async (req: Request, res: Response) => {
  const { title, category } = req.body;
  if (!title || !category) throw new AppError('Title and category are required', 400);

  const prompt = `Generate 6-8 relevant SEO tags/keywords for this electronics product.
Product: ${title}
Category: ${category}

Return ONLY a JSON array of lowercase strings. Example: ["tag1", "tag2", "tag3"]
No explanation, just the JSON array.`;

  const result = await geminiModelTags.generateContent(prompt);
  const text = result.response.text().trim();

  let tags: string[] = [];
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) tags = JSON.parse(jsonMatch[0]);
  } catch {
    tags = text
      .replace(/["\[\]]/g, '')
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Tags generated successfully',
    data: { tags },
  });
});

// POST /api/v1/ai/smart-search
// Body: { query }
const smartSearch = asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query) throw new AppError('Search query is required', 400);

  const prompt = `You are a search assistant for an electronics e-commerce store.
Extract structured search filters from this natural language query.

Query: "${query}"

Return ONLY a valid JSON object with these optional fields:
{
  "search": "keyword string for text search",
  "category": "category name or null",
  "brand": "brand name or null",
  "priceMin": number or null,
  "priceMax": number or null,
  "sort": "price | -price | rating | -createdAt | null"
}

No explanation, just the JSON object.`;

  const result = await geminiModelTags.generateContent(prompt);
  const text = result.response.text().trim();

  let filters: Record<string, any> = {};
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) filters = JSON.parse(jsonMatch[0]);
  } catch {
    filters = { search: query };
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Smart search filters extracted',
    data: { filters },
  });
});

// POST /api/v1/ai/summarize-reviews  (public — no auth required)
// Body: { productId }
const summarizeReviews = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.body;
  if (!productId) throw new AppError('productId is required', 400);

  const reviews = await Review.find({ productId }).populate('userId', 'name').lean();

  if (reviews.length === 0) {
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'No reviews to summarize',
      data: { summary: 'No customer reviews yet. Be the first to share your experience!', reviewCount: 0 },
    });
  }

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  const reviewLines = reviews
    .map((r) => `★${r.rating}/5 — "${r.comment}"`)
    .join('\n');

  const prompt = `You are an AI assistant for an electronics e-commerce store.
Analyze these ${reviews.length} customer reviews (avg rating: ${avgRating}/5) and write a concise, balanced AI summary (3–4 sentences) to help a buyer decide.
- Start with the overall sentiment
- Highlight the top 2 pros customers mention
- Mention any notable concern if present
- End with a recommendation sentence
Be objective, helpful, and conversational. Do NOT use bullet points.

Reviews:
${reviewLines}`;

  const result = await geminiModelTags.generateContent(prompt);
  const summary = result.response.text().trim();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Review summary generated',
    data: { summary, reviewCount: reviews.length, avgRating: Number(avgRating) },
  });
});

// POST /api/v1/ai/chat  (public — no auth required)
// Body: { message, history: { role: 'user' | 'model', content: string }[] }
const chatWithAssistant = asyncHandler(async (req: Request, res: Response) => {
  const { message, history } = req.body;
  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new AppError('Message is required', 400);
  }

  // Fetch store context
  const [products, categories] = await Promise.all([
    Product.find({})
      .select('title price brand rating stock discount')
      .populate('category', 'name')
      .limit(100)
      .lean(),
    Category.find({}).select('name slug').lean(),
  ]);

  const categoryList = categories.map((c) => c.name).join(', ');
  const productList = products
    .map((p) => {
      const catName = typeof p.category === 'object' && p.category !== null ? (p.category as any).name : 'Uncategorized';
      const stockStatus = p.stock === 0 ? 'OUT OF STOCK' : `${p.stock} in stock`;
      const discount = p.discount ?? 0;
      const priceStr = discount > 0 ? `$${(p.price * (1 - discount / 100)).toFixed(2)} (was $${p.price})` : `$${p.price}`;
      return `- ${p.title} | ${catName} | ${priceStr}${p.brand ? ` | ${p.brand}` : ''} | Rating: ${p.rating}/5 | ${stockStatus}`;
    })
    .join('\n');

  const systemPrompt = `You are "Deshio Assistant", a friendly and knowledgeable shopping assistant for Deshio, a modern electronics e-commerce store.

Your capabilities:
- Help customers find products by describing what they need
- Answer questions about specific products (specs, pricing, availability)
- Compare products and make recommendations
- Provide information about categories and brands available in the store

Rules:
- Be concise and helpful. Keep responses under 150 words unless the user asks for detail.
- When recommending products, mention the product name, price, and a key highlight.
- If a product is out of stock (stock = 0), mention that it is currently unavailable.
- Do not make up products that are not in the catalog below.
- Use a warm, conversational tone.
- If the user asks about orders, returns, or shipping, let them know they can check their account page or contact support.

=== STORE CATALOG ===
Categories: ${categoryList}

Products:
${productList}
=== END CATALOG ===`;

  // Build conversation string from history (truncate to last 20 messages)
  const recentHistory = Array.isArray(history) ? history.slice(-20) : [];
  const conversationLines = recentHistory
    .map((h: { role: string; content: string }) =>
      h.role === 'user' ? `Customer: ${h.content}` : `Assistant: ${h.content}`
    )
    .join('\n');

  const fullPrompt = `${systemPrompt}\n\n${conversationLines ? `Conversation so far:\n${conversationLines}\n\n` : ''}Customer: ${message.trim()}`;

  const result = await geminiModelForChat.generateContent(fullPrompt);
  const reply = result.response.text().trim();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Chat response generated',
    data: { reply },
  });
});

export const aiControllers = {
  generateProductDescription,
  generateProductTags,
  smartSearch,
  summarizeReviews,
  chatWithAssistant,
};
