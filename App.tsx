
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
    
    setTimeout(() => {
      setShowStick(true);
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
    <div className="min-h-screen relative flex flex-col items-center p-5 sm:p-12 overflow-y-auto scroll-hide">
      <ZenBackground />

      <header className="text-center mt-2 mb-6 animate-fade-in ink-fade-in">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-[0.3em] text-[#d4af37] mb-2">观音灵签</h1>
        <p className="text-[10px] sm:text-base text-gray-400 font-light tracking-widest opacity-80">
          「 一方签文，千载智慧，照见古今人生路 」
        </p>
        <div className="w-12 h-[1px] bg-[#d4af37]/30 mx-auto mt-4"></div>
      </header>

      <main className="w-full max-w-lg flex flex-col items-center">
        
        {stage === AppStage.INIT && (
          <div className="flex flex-col items-center animate-fade-in ink-fade-in mt-10">
            <div className="text-center text-gray-300 space-y-4 mb-12">
              <p className="text-lg font-light tracking-widest">请阖目观想，</p>
              <p className="text-lg font-light tracking-widest">心中默念所求之事。</p>
            </div>
            <button
              onClick={handleStartDraw}
              className="px-12 py-4 bg-[#8b0000] text-white rounded-full text-lg tracking-[0.2em] shadow-2xl hover:bg-[#a00000] transition-all transform hover:scale-105 active:scale-95 border-b-4 border-[#5a0000] font-bold"
            >
              至诚求签
            </button>
          </div>
        )}

        {stage === AppStage.SHAKING && (
          <div className="flex flex-col items-center space-y-12 py-10 animate-fade-in">
            <TraditionalTube isShaking={!showStick} showStick={showStick} />
            <p className="text-[#d4af37] animate-pulse tracking-[0.2em] text-base font-light">
              {showStick ? '灵签已现，待圣杯确之' : '签筒摇动，机缘感应中'}
            </p>
          </div>
        )}

        {stage === AppStage.CONFIRMING && (
          <div className="w-full text-center space-y-4 animate-fade-in ink-fade-in">
            <h2 className="text-xl text-[#d4af37] tracking-[0.2em] font-medium">掷筊确认</h2>
            <p className="text-gray-400 text-xs tracking-widest opacity-70">
              获得「圣杯」方可得其解。
            </p>
            
            <DivinationBlocks status={blockStatus} isAnimating={isThrowing} />

            <div className="h-16 flex items-center justify-center">
              {blockStatus !== BlockStatus.UNTHROWN && !isThrowing && (
                <div className={`text-base font-bold tracking-widest px-4 py-2 rounded-full bg-black/20 ${blockStatus === BlockStatus.HOLY ? 'text-green-500' : 'text-red-400'}`}>
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
                className="px-14 py-3 bg-[#d4af37] text-black rounded-full text-base font-bold tracking-[0.2em] shadow-xl hover:bg-[#eec643] transition-all disabled:opacity-50 border-b-4 border-[#b3952f]"
              >
                {blockStatus === BlockStatus.UNTHROWN ? '掷 筊' : '再 掷'}
              </button>
            ) : (
              <div className="text-[#d4af37] animate-pulse py-3 tracking-[0.3em] text-sm">正在转译禅意...</div>
            )}
          </div>
        )}

        {stage === AppStage.RESULT && currentLottery && (
          <div className="w-full max-w-md bg-[#fdfaf1] paper-texture rounded-sm shadow-2xl p-6 sm:p-10 text-gray-800 animate-fade-in ink-fade-in relative mb-10">
            <div className="absolute top-0 right-6 w-7 h-10 bg-red-700/90 rounded-b-sm flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
               {currentLottery.type}
            </div>

            <h2 className="text-2xl sm:text-3xl text-center font-bold text-red-900 border-b border-red-900/10 pb-4 mb-6 tracking-tight sm:tracking-widest leading-snug">
              第 {currentLottery.id} 签 <span className="mx-1 opacity-30">·</span> {currentLottery.title}
            </h2>

            <div className="space-y-6">
              <section>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-red-800/60 font-bold mb-3 flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-800 rounded-full"></span> 诗曰
                </h3>
                <p className="text-lg sm:text-2xl leading-relaxed text-center font-serif tracking-widest text-gray-900 px-2">
                  {currentLottery.poetry}
                </p>
              </section>

              <div className="grid grid-cols-2 gap-3">
                 <section className="bg-gray-800/5 p-3 rounded-sm border border-gray-200/50">
                   <h3 className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mb-1">诗意</h3>
                   <p className="text-[11px] sm:text-xs text-gray-700 leading-normal">{currentLottery.meaning}</p>
                 </section>
                 <section className="bg-gray-800/5 p-3 rounded-sm border border-gray-200/50">
                   <h3 className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mb-1">解曰</h3>
                   <p className="text-[11px] sm:text-xs text-gray-700 leading-normal">{currentLottery.explanation}</p>
                 </section>
              </div>

              <section className="border-t border-dashed border-red-900/20 pt-5">
                 <h3 className="text-[10px] uppercase tracking-[0.2em] text-red-800/60 font-bold mb-3 flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-800 rounded-full"></span> 禅悟 · 当下启示
                </h3>
                <p className="text-sm sm:text-base text-gray-800 leading-relaxed font-light italic bg-white/40 p-3 rounded-sm border border-red-900/5">
                  {aiInsight}
                </p>
              </section>
            </div>

            <button
              onClick={handleReset}
              className="w-full mt-8 py-3.5 border border-red-900 text-red-900 rounded-sm font-bold tracking-[0.3em] hover:bg-red-900 hover:text-white transition-all text-xs active:bg-red-950 shadow-sm"
            >
              功 德 圆 满
            </button>
          </div>
        )}
      </main>

      <footer className="mt-auto py-6 opacity-40 text-[9px] tracking-[0.4em] text-gray-500 text-center uppercase">
        解签 Powered by Gemini AI
      </footer>
    </div>
  );
};

export default App;
