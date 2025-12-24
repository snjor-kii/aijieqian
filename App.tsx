
import React, { useState, useEffect } from 'react';
import { AppStage, BlockStatus, LotteryData } from './types';
import { LOTTERY_DATABASE } from './constants';
import ZenBackground from './components/ZenBackground';
import DivinationBlocks from './components/DivinationBlocks';
import TraditionalTube from './components/TraditionalTube';
import { getModernInterpretation, DetailedInterpretation } from './services/geminiService';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.INIT);
  const [currentLottery, setCurrentLottery] = useState<LotteryData | null>(null);
  const [blockStatus, setBlockStatus] = useState<BlockStatus>(BlockStatus.UNTHROWN);
  const [isThrowing, setIsThrowing] = useState(false);
  const [aiResult, setAiResult] = useState<DetailedInterpretation | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [showStick, setShowStick] = useState(false);

  // 核心逻辑：如果 API Key 缺失，为了保证体验，将抽签范围缩小到经过深度人工预制的前 10 签
  const handleStartDraw = () => {
    setStage(AppStage.SHAKING);
    setShowStick(false);
    
    setTimeout(() => {
      setShowStick(true);
      setTimeout(() => {
        const hasKey = !!process.env.API_KEY;
        // 如果没有 Key，只在前 10 签中抽取（索引 0-9）
        const maxRange = hasKey ? LOTTERY_DATABASE.length : 10;
        const randomIndex = Math.floor(Math.random() * maxRange);
        
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
          getModernInterpretation(currentLottery).then(result => {
            setAiResult(result);
            setIsLoadingInsight(false);
            setStage(AppStage.RESULT);
          }).catch(() => {
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
    setAiResult(null);
    setShowStick(false);
  };

  const formatPoetryLines = (poetry: string) => {
    return poetry.split(/[。，？！\s、；：.?!,;:]+/).filter(line => line.trim().length > 0);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center p-4 sm:p-12 overflow-y-auto scroll-hide">
      <ZenBackground />

      <header className="text-center mt-4 mb-8 animate-fade-in ink-fade-in">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-[0.3em] text-[#d4af37] mb-2">观音灵签</h1>
        {!process.env.API_KEY && (
          <div className="text-[10px] text-red-900/40 bg-red-900/5 px-2 py-1 rounded inline-block mb-2">精华预览模式</div>
        )}
        <p className="text-[10px] sm:text-base text-gray-500 font-light tracking-widest">
          「 一方签文，千载智慧，照见古今人生路 」
        </p>
      </header>

      <main className="w-full max-w-lg flex flex-col items-center">
        
        {stage === AppStage.INIT && (
          <div className="flex flex-col items-center animate-fade-in ink-fade-in mt-10 px-4">
            <div className="text-center text-gray-300 space-y-4 mb-16">
              <p className="text-xl font-light tracking-[0.2em]">请阖目观想</p>
              <p className="text-xl font-light tracking-[0.2em]">心中默念所求之事</p>
            </div>
            <button
              onClick={handleStartDraw}
              className="px-14 py-4 bg-[#8b0000] text-white rounded-full text-lg tracking-[0.5em] shadow-2xl hover:bg-[#a00000] transition-all transform hover:scale-105 active:scale-95 border-b-4 border-[#5a0000] font-bold"
            >
              求签
            </button>
          </div>
        )}

        {stage === AppStage.SHAKING && (
          <div className="flex flex-col items-center space-y-12 py-10 animate-fade-in">
            <TraditionalTube isShaking={!showStick} showStick={showStick} />
            <p className="text-[#d4af37] animate-pulse tracking-[0.3em] text-lg font-light">
              {showStick ? '灵签已现' : '正在感应机缘...'}
            </p>
          </div>
        )}

        {stage === AppStage.CONFIRMING && (
          <div className="w-full text-center space-y-4 animate-fade-in ink-fade-in px-4">
            <h2 className="text-xl text-[#d4af37] tracking-[0.4em] font-medium mb-8">掷筊确认</h2>
            
            <DivinationBlocks status={blockStatus} isAnimating={isThrowing} />

            <div className="h-20 flex items-center justify-center">
              {blockStatus !== BlockStatus.UNTHROWN && !isThrowing && (
                <div className={`text-base font-bold tracking-[0.2em] px-6 py-2 rounded-full bg-black/40 border ${blockStatus === BlockStatus.HOLY ? 'text-green-400 border-green-900/50' : 'text-red-400 border-red-900/50'}`}>
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
                className="px-14 py-4 bg-[#d4af37] text-black rounded-full text-base font-bold tracking-[0.3em] shadow-xl hover:bg-[#eec643] transition-all disabled:opacity-50 border-b-4 border-[#b3952f] mt-4"
              >
                {blockStatus === BlockStatus.UNTHROWN ? '掷 筊' : '再 掷'}
              </button>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                <div className="text-[#d4af37] animate-pulse tracking-[0.4em] text-sm font-light">正在由 AI 解签...</div>
              </div>
            )}
          </div>
        )}

        {stage === AppStage.RESULT && currentLottery && aiResult && (
          <div className="w-full max-w-md bg-[#fdfaf1] paper-texture rounded-sm shadow-2xl p-6 sm:p-10 text-gray-800 animate-fade-in ink-fade-in relative mb-12 border border-[#d4af37]/10">
            <div className="absolute top-0 right-6 w-8 h-12 bg-[#881f1c] rounded-b-sm flex items-center justify-center text-white text-[12px] font-bold shadow-md z-10">
               {currentLottery.type.slice(0,2)}
            </div>

            <div className="text-center mb-10 pt-4">
              <div className="text-[10px] tracking-[0.8em] text-red-900/30 font-bold mb-3 uppercase">第 {currentLottery.id} 签</div>
              <h2 className="text-3xl sm:text-4xl font-bold text-red-900 tracking-[0.2em] leading-tight">
                {currentLottery.title}
              </h2>
              <div className="w-10 h-[1px] bg-red-900/10 mx-auto mt-8"></div>
            </div>

            <div className="space-y-10">
              <section className="text-center">
                <h3 className="text-[10px] tracking-[0.5em] text-red-800/40 font-bold mb-6 flex justify-center items-center gap-2">
                  <span className="w-1 h-1 bg-red-800/10 rounded-full"></span> 诗 曰 <span className="w-1 h-1 bg-red-800/10 rounded-full"></span>
                </h3>
                <div className="flex flex-col items-center space-y-3">
                  {formatPoetryLines(currentLottery.poetry).map((line, idx) => (
                    <p key={idx} className="text-2xl sm:text-3xl font-serif tracking-[0.3em] text-gray-900 font-medium italic leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-2 gap-4 border-y border-dashed border-red-900/10 py-8">
                 <div className="bg-[#f0ece2]/30 p-4 rounded-sm">
                   <h4 className="text-[10px] tracking-[0.3em] text-gray-400 font-bold mb-2 text-center">诗意</h4>
                   <p className="text-xs text-gray-700 leading-relaxed text-center">{currentLottery.meaning}</p>
                 </div>
                 <div className="bg-[#f0ece2]/30 p-4 rounded-sm">
                   <h4 className="text-[10px] tracking-[0.3em] text-gray-400 font-bold mb-2 text-center">解曰</h4>
                   <p className="text-xs text-gray-700 leading-relaxed text-center">{currentLottery.explanation}</p>
                 </div>
              </div>

              <section className="pt-2">
                <h3 className="text-[10px] tracking-[0.5em] text-red-800/40 font-bold mb-8 text-center">各 项 详 解</h3>
                <div className="space-y-8">
                  {aiResult.categories.map((cat, idx) => (
                    <div key={idx} className="group flex items-start gap-5 animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <div className="flex-none flex flex-col items-center">
                        <div className="w-10 h-10 bg-[#881f1c] text-white flex items-center justify-center rounded-sm shadow-md relative group-hover:scale-105 transition-transform">
                           <span className="text-[11px] font-bold tracking-widest leading-none flex flex-col items-center">
                             {cat.label.slice(0, 2)}
                           </span>
                           <div className="absolute inset-[2px] border border-white/10 rounded-[1px]"></div>
                        </div>
                        <div className="w-[1px] h-full bg-gradient-to-b from-red-900/20 to-transparent mt-3 flex-1"></div>
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-[13px] sm:text-sm text-gray-800 leading-[1.8] font-light text-justify">
                          {cat.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-red-900/[0.03] p-8 rounded-sm border border-red-900/5 mt-4 shadow-inner">
                <h3 className="text-[10px] tracking-[0.5em] text-red-800/50 font-bold mb-4 text-center">禅 悟 · 当 下 启 示</h3>
                <p className="text-base text-gray-800 leading-[2] font-light italic text-justify">
                  {aiResult.zenInsight}
                </p>
              </section>
            </div>

            <button
              onClick={handleReset}
              className="w-full mt-12 py-5 bg-transparent border border-red-900/30 text-red-900 rounded-sm font-bold tracking-[0.6em] hover:bg-red-900 hover:text-white transition-all text-xs active:scale-[0.98] shadow-sm uppercase"
            >
              功 德 圆 满
            </button>
          </div>
        )}
      </main>

      <footer className="mt-auto py-8 opacity-20 text-[8px] tracking-[0.6em] text-gray-500 text-center uppercase">
        解签 POWERED BY DeepSeek AI
      </footer>
    </div>
  );
};

export default App;
