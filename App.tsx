
import React, { useState, useEffect } from 'react';
import { AppStage, BlockStatus, LotteryData } from './types';
import { LOTTERY_DATABASE } from './constants';
import ZenBackground from './components/ZenBackground';
import DivinationBlocks from './components/DivinationBlocks';
import TraditionalTube from './components/TraditionalTube';
import { getModernInterpretation } from './services/geminiService';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.INIT);
  const [currentLottery, setCurrentLottery] = useState<LotteryData | null>(null);
  const [blockStatus, setBlockStatus] = useState<BlockStatus>(BlockStatus.UNTHROWN);
  const [isThrowing, setIsThrowing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [showStick, setShowStick] = useState(false);

  const handleStartDraw = () => {
    setStage(AppStage.SHAKING);
    setShowStick(false);
    
    // 模拟摇签过程
    setTimeout(() => {
      setShowStick(true);
      // 签条弹出后停留片刻进入掷筊环节
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * LOTTERY_DATABASE.length);
        setCurrentLottery(LOTTERY_DATABASE[randomIndex]);
        setStage(AppStage.CONFIRMING);
      }, 1500);
    }, 2500);
  };

  const handleThrowBlocks = () => {
    if (isThrowing) return;
    setIsThrowing(true);
    setBlockStatus(BlockStatus.UNTHROWN);

    setTimeout(() => {
      const rand = Math.random();
      let newStatus: BlockStatus;
      // 传统概率：圣杯 50%，笑杯 25%，阴杯 25%
      if (rand < 0.5) newStatus = BlockStatus.HOLY;
      else if (rand < 0.75) newStatus = BlockStatus.SMILE;
      else newStatus = BlockStatus.YIN;

      setBlockStatus(newStatus);
      setIsThrowing(false);

      if (newStatus === BlockStatus.HOLY) {
        setIsLoadingInsight(true);
        if (currentLottery) {
          getModernInterpretation(currentLottery).then(insight => {
            setAiInsight(insight);
            setIsLoadingInsight(false);
            setStage(AppStage.RESULT);
          });
        }
      }
    }, 1200);
  };

  const handleReset = () => {
    setStage(AppStage.INIT);
    setBlockStatus(BlockStatus.UNTHROWN);
    setCurrentLottery(null);
    setAiInsight('');
    setShowStick(false);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center p-6 sm:p-12 overflow-y-auto scroll-hide">
      <ZenBackground />

      <header className="text-center mt-4 mb-8 animate-fade-in ink-fade-in">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-[0.3em] text-[#d4af37] mb-4">观音灵签</h1>
        <p className="text-sm sm:text-base text-gray-400 font-light tracking-widest">
          「 一方签文，千载智慧，照见古今人生路 」
        </p>
        <div className="w-16 h-[1px] bg-[#d4af37]/30 mx-auto mt-6"></div>
      </header>

      <main className="w-full max-w-lg flex flex-col items-center">
        
        {stage === AppStage.INIT && (
          <div className="flex flex-col items-center animate-fade-in ink-fade-in mt-10">
            <div className="text-center text-gray-300 space-y-4 mb-12">
              <p className="text-lg">请阖目观想，</p>
              <p className="text-lg">心中默念所求之事。</p>
            </div>
            <button
              onClick={handleStartDraw}
              className="px-10 py-4 bg-[#8b0000] text-white rounded-full text-lg tracking-widest shadow-2xl hover:bg-[#a00000] transition-all transform hover:scale-105 active:scale-95 border-b-4 border-[#5a0000]"
            >
              至诚求签
            </button>
          </div>
        )}

        {stage === AppStage.SHAKING && (
          <div className="flex flex-col items-center space-y-12 py-10 animate-fade-in">
            <TraditionalTube isShaking={!showStick} showStick={showStick} />
            <p className="text-[#d4af37] animate-pulse tracking-widest text-lg font-light">
              {showStick ? '灵签已现，待圣杯确之' : '签筒摇动，机缘感应中...'}
            </p>
          </div>
        )}

        {stage === AppStage.CONFIRMING && (
          <div className="w-full text-center space-y-4 animate-fade-in ink-fade-in">
            <h2 className="text-2xl text-[#d4af37] tracking-[0.2em] font-medium">掷筊确认</h2>
            <p className="text-gray-400 text-sm tracking-widest">
              获得「圣杯」方可得其解。
            </p>
            
            <DivinationBlocks status={blockStatus} isAnimating={isThrowing} />

            <div className="h-16 flex items-center justify-center">
              {blockStatus !== BlockStatus.UNTHROWN && !isThrowing && (
                <div className={`text-lg font-bold tracking-widest ${blockStatus === BlockStatus.HOLY ? 'text-green-500' : 'text-red-400'}`}>
                  {blockStatus === BlockStatus.HOLY && "圣杯 · 阴阳和合，此签属尔"}
                  {blockStatus === BlockStatus.SMILE && "笑杯 · 心意未诚，请再掷一次"}
                  {blockStatus === BlockStatus.YIN && "阴杯 · 时机未至，请再掷一次"}
                </div>
              )}
            </div>

            {!isLoadingInsight ? (
              <button
                onClick={handleThrowBlocks}
                disabled={isThrowing}
                className="px-12 py-3 bg-[#d4af37] text-black rounded-full text-base font-bold tracking-widest shadow-xl hover:bg-[#eec643] transition-all disabled:opacity-50 border-b-4 border-[#b3952f]"
              >
                {blockStatus === BlockStatus.UNTHROWN ? '掷 筊' : '再 掷'}
              </button>
            ) : (
              <div className="text-[#d4af37] animate-pulse py-3 tracking-widest">正在转译禅意...</div>
            )}
          </div>
        )}

        {stage === AppStage.RESULT && currentLottery && (
          <div className="w-full max-w-lg bg-[#fdfaf1] paper-texture rounded-sm shadow-2xl p-8 sm:p-10 text-gray-800 animate-fade-in ink-fade-in relative">
            <div className="absolute top-0 right-10 w-8 h-12 bg-red-700/80 rounded-b-md flex items-center justify-center text-white text-[10px] font-bold">
               {currentLottery.type}
            </div>

            <h2 className="text-3xl text-center font-bold text-red-900 border-b-2 border-red-900/10 pb-4 mb-6 tracking-widest">
              第 {currentLottery.id} 签 · {currentLottery.title}
            </h2>

            <div className="space-y-8">
              <section>
                <h3 className="text-xs uppercase tracking-widest text-red-800/60 font-bold mb-3 flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-800 rounded-full"></span> 诗曰
                </h3>
                <p className="text-xl sm:text-2xl leading-relaxed text-center font-serif tracking-widest italic text-gray-900">
                  {currentLottery.poetry}
                </p>
              </section>

              <div className="grid grid-cols-2 gap-4">
                 <section className="bg-gray-100/50 p-4 rounded">
                   <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">诗意</h3>
                   <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{currentLottery.meaning}</p>
                 </section>
                 <section className="bg-gray-100/50 p-4 rounded">
                   <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">解曰</h3>
                   <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{currentLottery.explanation}</p>
                 </section>
              </div>

              <section className="border-t-2 border-dashed border-red-900/10 pt-6">
                 <h3 className="text-xs uppercase tracking-widest text-red-800/60 font-bold mb-3 flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-800 rounded-full"></span> 禅悟 · 当下启示
                </h3>
                <p className="text-base text-gray-800 leading-relaxed font-light italic">
                  {aiInsight}
                </p>
              </section>
            </div>

            <button
              onClick={handleReset}
              className="w-full mt-10 py-4 border-2 border-red-900 text-red-900 rounded-sm font-bold tracking-widest hover:bg-red-900 hover:text-white transition-all uppercase text-sm"
            >
              功 德 圆 满
            </button>
          </div>
        )}
      </main>

      <footer className="mt-auto py-8 opacity-30 text-[10px] tracking-[0.4em] text-gray-500 text-center uppercase">
        解签 Powered by Gemini AI
      </footer>
    </div>
  );
};

export default App;
