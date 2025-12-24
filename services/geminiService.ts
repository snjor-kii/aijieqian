import { LotteryData } from "../types";

export interface DetailedInterpretation {
  zenInsight: string;
  categories: {
    label: string;
    content: string;
  }[];
}

export const getModernInterpretation = async (lottery: LotteryData): Promise<DetailedInterpretation> => {
  const fallback: DetailedInterpretation = {
    zenInsight: "机缘流转，心中所念已有回响。签文所示乃当务之急，宜静心体察，顺势而为。",
    categories: [
      { label: "事业", content: "当下宜守不宜攻，待时而动，厚积薄发，必有回甘。" },
      { label: "感情", content: "随缘而遇，不强求，不执着。心诚则灵，静待佳期。" },
      { label: "财运", content: "谨慎理财，避开投机之念。勤俭持家，自有盈余庆贺。" },
      { label: "健康", content: "起居有时，心态平和。劳逸结合，则百病不侵。" }
    ]
  };

  try {
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.API_KEY;
    
    if (!apiKey) {
      console.warn("DEEPSEEK_API_KEY not found in environment.");
      return fallback;
    }

    const prompt = `你是一位精通传统文化、佛学禅意与现代心理学的解签大师。
请针对观音灵签第${lottery.id}签《${lottery.title}》提供详尽的深度解签。

签文数据：
诗文：${lottery.poetry}
诗意：${lottery.meaning}
解曰：${lottery.explanation}

请以 JSON 格式返回，包含以下字段：
1. zenInsight：提供一段治愈心灵的现代禅意启示（约120字）
2. categories：数组，必须包含且仅包含【事业】、【感情】、【财运】、【健康】这四个维度
   每个元素包含：
   - label: 维度名称（事业/感情/财运/健康）
   - content: 具体的深度解签建议（约60字）

语言风格：禅意深远，古雅温和。

请严格按照以下 JSON 格式返回：
{
  "zenInsight": "...",
  "categories": [
    {"label": "事业", "content": "..."},
    {"label": "感情", "content": "..."},
    {"label": "财运", "content": "..."},
    {"label": "健康", "content": "..."}
  ]
}`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位精通传统文化、佛学禅意与现代心理学的解签大师。请严格按照要求以 JSON 格式返回结果。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("Empty response from DeepSeek API");
    }

    const result = JSON.parse(text);
    
    // 验证返回格式
    if (!result.zenInsight || !Array.isArray(result.categories)) {
      throw new Error("Invalid response format");
    }

    return result;

  } catch (error) {
    console.error("AI Interpretation Error:", error);
    return fallback;
  }
};
