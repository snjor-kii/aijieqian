
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
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            zenInsight: { 
              type: Type.STRING, 
              description: "针对签意的现代禅悟启示，充满治愈感。" 
            },
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING, description: "类别名称，如：事业、感情、财运、健康" },
                  content: { type: Type.STRING, description: "具体的解签建议" }
                },
                required: ["label", "content"]
              }
            }
          },
          required: ["zenInsight", "categories"]
        }
      },
      contents: `
        你是一位精通传统文化与心理学的解签大师。
        请针对观音灵签第${lottery.id}签《${lottery.title}》提供详尽的深度解签。
        
        原始签文资料：
        诗文：${lottery.poetry}
        诗意：${lottery.meaning}
        解曰：${lottery.explanation}
        
        要求：
        1. zenInsight：提供一段100字左右的现代禅意启示，要能抚平求签者的焦虑。
        2. categories：必须包含【事业/学业】、【感情/婚姻】、【财运/交易】、【健康/平安】四个维度的详细指引。
        3. 语言风格：古雅与现代结合，语气温和且具有建设性。
      `,
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Interpretation Error:", error);
    // 更加详尽的回退内容，避免用户看到生硬的错误提示
    return {
      zenInsight: "机缘流转，心中所念已有回响。签文所示乃当务之急，宜静心体察，顺势而为。",
      categories: [
        { label: "事业", content: "当下宜守不宜攻，待时而动，厚积薄发。" },
        { label: "感情", content: "随缘而遇，不强求，不执着，心诚则灵。" },
        { label: "财运", content: "谨慎理财，避免投机，勤俭自有余庆。" },
        { label: "健康", content: "起居有常，心态平和，百病不生。" }
      ]
    };
  }
};
