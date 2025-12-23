
import React from 'react';

interface TraditionalTubeProps {
  isShaking: boolean;
  showStick: boolean;
}

const TraditionalTube: React.FC<TraditionalTubeProps> = ({ isShaking, showStick }) => {
  return (
    <div className={`relative w-24 h-48 mx-auto tube-container ${isShaking ? 'animate-tube-shake' : ''}`}>
      {/* 签筒主体 */}
      <div className="absolute inset-0 bg-[#713300] border-[3px] border-[#532300] rounded-t-lg rounded-b-2xl shadow-2xl z-20">
        {/* 顶部盖边 */}
        <div className="absolute top-0 left-[-3px] right-[-3px] h-6 bg-[#532300] rounded-t-lg border-b border-[#3b1700]"></div>
        
        {/* 装饰带 */}
        <div className="absolute top-12 left-0 right-0 h-2 bg-[#532300]/50 border-y border-[#3b1700]/30"></div>
        <div className="absolute bottom-10 left-0 right-0 h-2 bg-[#532300]/50 border-y border-[#3b1700]/30"></div>

        {/* 莲花纹章 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-60">
            <svg viewBox="0 0 40 40" className="w-12 h-12 fill-none stroke-[#be5a00]">
                <path d="M20 8 Q16 16 20 24 Q24 16 20 8" strokeWidth="1.5"/>
                <path d="M12 14 Q16 18 20 24 Q14 20 12 14" strokeWidth="1.5"/>
                <path d="M28 14 Q24 18 20 24 Q26 20 28 14" strokeWidth="1.5"/>
                <path d="M6 18 Q12 20 20 24 Q10 22 6 18" strokeWidth="1.5"/>
                <path d="M34 18 Q28 20 20 24 Q30 22 34 18" strokeWidth="1.5"/>
                <circle cx="20" cy="28" r="1.5" fill="#be5a00"/>
            </svg>
        </div>
      </div>

      {/* 签条 */}
      <div 
        className={`absolute left-1/2 w-2 h-32 bg-[#fff0ed] rounded-sm z-10 transition-all duration-500 border-x border-gray-200 shadow-sm
        ${showStick ? 'animate-stick-rise' : 'top-10 -translate-x-1/2 opacity-0'}`}
      >
        <div className="absolute top-0 left-0 right-0 h-6 bg-[#881f1c] rounded-t-sm"></div>
      </div>
      
      {/* 内部阴影遮罩 */}
      <div className="absolute inset-0 bg-black/10 rounded-t-lg rounded-b-2xl z-30 pointer-events-none"></div>
    </div>
  );
};

export default TraditionalTube;
