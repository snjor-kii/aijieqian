
import { GoogleGenAI, Type } from "@google/genai";
import { LotteryData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getModernInterpretation = async (lottery: LotteryData): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        你是一位精通传统文化与心理学的禅学大师。
        请针对以下观音灵签给出一段充满智慧、现代感且治愈的「当下启示」。
        
        签号：第${lottery.id}签 - ${lottery.title}
        签型：${lottery.type}
        诗文：${lottery.poetry}
        诗意：${lottery.meaning}
        解曰：${lottery.explanation}
        
        要求：
        1. 语言优美，如清泉般涤荡心灵。
        2. 将古老的词汇转化为现代生活场景中的建议。
        3. 字数控制在150字以内。
        4. 不要使用任何格式化标签，只需纯文本。
      `,
    });

    return response.text || "禅意深远，静待心悟。";
  } catch (error) {
    console.error("AI Interpretation Error:", error);
    return "心若不动，万风奈何。请以解曰为准。";
  }
};
