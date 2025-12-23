// 注意：这里导入了 OpenAI 而不是 GoogleGenAI
import OpenAI from "openai";
import { LotteryData } from "../types";

export interface DetailedInterpretation {
  zenInsight: string;
  categories: {
    label: string;
    content: string;
  }[];
}

export const getModernInterpretation = async (lottery: LotteryData): Promise<DetailedInterpretation> => {
  // 使用 OpenAI 客户端连接到 DeepSeek
  // DeepSeek 的 API 端点：https://api.deepseek.com
  const openai = new OpenAI({
    apiKey: process.env.API_KEY, // 或使用 OPENAI_API_KEY 环境变量名
    baseURL: "https://api.deepseek.com", // DeepSeek 的 API 端点
  });

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
    // 检查 API 密钥是否存在
    if (!process.env.API_KEY) {
      console.warn("DEEPSEEK_API_KEY not found in environment.");
      // 也可以尝试使用 OPENAI_API_KEY 作为备选
      if (process.env.OPENAI_API_KEY) {
        // 如果提供了 OPENAI_API_KEY，可以使用默认的 OpenAI 配置
        // 否则返回 fallback
      } else {
        return fallback;
      }
    }

    // 构建系统提示词和用户消息
    const systemPrompt = `你是一位精通传统文化、佛学禅意与现代心理学的解签大师。
请严格按照JSON格式返回结果，确保结构完整准确。

返回格式要求：
{
  "zenInsight": "针对签意的现代禅悟启示，充满智慧且字数约120字。",
  "categories": [
    {
      "label": "事业",
      "content": "具体的深度解签建议，约60字"
    },
    {
      "label": "感情", 
      "content": "具体的深度解签建议，约60字"
    },
    {
      "label": "财运",
      "content": "具体的深度解签建议，约60字"
    },
    {
      "label": "健康",
      "content": "具体的深度解签建议，约60字"
    }
  ]
}

注意：categories数组必须包含且仅包含"事业"、"感情"、"财运"、"健康"这四个维度，每个label严格为两个字。`;

    const userMessage = `请针对观音灵签第${lottery.id}签《${lottery.title}》提供详尽的深度解签。
        
签文数据：
诗文：${lottery.poetry}
诗意：${lottery.meaning}
解曰：${lottery.explanation}

要求语言风格：禅意深远，古雅温和，具有治愈心灵的效果。`;

    // 调用 DeepSeek API
    const response = await openai.chat.completions.create({
      model: "deepseek-chat", // 或者 "deepseek-coder" 如果是代码相关
      // model: "deepseek-reasoner", // 如果需要推理能力更强的模型
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" }, // 强制返回 JSON 格式
      temperature: 0.7, // 控制创造性，0.7 比较适中
      max_tokens: 1000, // 根据返回内容的长度调整
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("Empty response from AI");
    }

    // 解析返回的 JSON
    const result = JSON.parse(content);
    
    // 验证返回的数据结构
    if (!result.zenInsight || !Array.isArray(result.categories)) {
      console.warn("AI返回的数据结构不正确，使用备用数据");
      return fallback;
    }

    return result;
  } catch (error) {
    console.error("AI Interpretation Error:", error);
    return fallback;
  }
};
