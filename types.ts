
export interface LotteryData {
  id: number;
  title: string;
  type: string;
  poetry: string;
  meaning: string;
  explanation: string;
}

export enum AppStage {
  INIT = 'INIT',
  SHAKING = 'SHAKING',
  CONFIRMING = 'CONFIRMING',
  RESULT = 'RESULT'
}

export enum BlockStatus {
  UNTHROWN = 'UNTHROWN',
  HOLY = 'HOLY', // 圣杯 (One up, one down)
  SMILE = 'SMILE', // 笑杯 (Both up)
  YIN = 'YIN' // 阴杯 (Both down)
}
