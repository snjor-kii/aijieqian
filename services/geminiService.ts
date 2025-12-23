
import { GoogleGenAI, Type } from "@google/genai";
import { LotteryData } from "../types";

// 确保使用正确的初始化方式
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface DetailedInterpretation {
  zenInsight: string;
  categories: {
    label: string;
    content: string;
  }[];
}

export const getModernInterpretation = async (lottery: LotteryData): Promise<DetailedInterpretation> => {
  // 定义基础回退数据
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
    if (!process.env.API_KEY) {
      return fallback;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            zenInsight: { 
              type: Type.STRING, 
              description: "针对签意的现代禅悟启示，充满智慧且字数约120字。" 
            },
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING, description: "类别，如：事业、感情、财运、健康" },
                  content: { type: Type.STRING, description: "具体的深度解签建议，约50-80字" }
                },
                required: ["label", "content"]
              }
            }
          },
          required: ["zenInsight", "categories"]
        }
      },
      contents: `
        你是一位精通传统文化、佛学禅意与现代心理学的解签大师。
        请针对观音灵签第${lottery.id}签《${lottery.title}》提供详尽的深度解签。
        
        签文数据：
        诗文：${lottery.poetry}
        诗意：${lottery.meaning}
        解曰：${lottery.explanation}
        
        要求：
        1. zenInsight：提供一段治愈心灵的现代禅意启示。
        2. categories：必须提供【事业】、【感情】、【财运】、【健康】四个维度的详细指引。
        3. 语言风格：古雅与现代结合，语气温和。
      `,
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Interpretation Error:", error);
    return fallback;
  }
};
