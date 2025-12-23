
import { GoogleGenAI, Type } from "@google/genai";
import { LotteryData } from "../types";

export interface DetailedInterpretation {
  zenInsight: string;
  categories: {
    label: string;
    content: string;
  }[];
}

export const getModernInterpretation = async (lottery: LotteryData): Promise<DetailedInterpretation> => {
  // 核心修复：在函数内部初始化，确保获取最新的 process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
      console.warn("API_KEY not found in environment.");
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
                  label: { type: Type.STRING, description: "只能是：事业、感情、财运、健康" },
                  content: { type: Type.STRING, description: "具体的深度解签建议，约60字" }
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
        2. categories：必须严格提供且仅提供【事业】、【感情】、【财运】、【健康】这四个维度的指引，每个名称严格为两个字。
        3. 语言风格：禅意深远，古雅温和。
      `,
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Interpretation Error:", error);
    return fallback;
  }
};
