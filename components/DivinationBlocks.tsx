
import React from 'react';
import { BlockStatus } from '../types';

interface DivinationBlocksProps {
  status: BlockStatus;
  isAnimating: boolean;
}

const DivinationBlocks: React.FC<DivinationBlocksProps> = ({ status, isAnimating }) => {
  const getRotation = (id: number) => {
    if (isAnimating) return id === 1 ? 'rotate-[720deg] translate-y-[-50px]' : 'rotate-[-720deg] translate-y-[-50px]';
    
    switch (status) {
      case BlockStatus.HOLY:
        return id === 1 ? 'rotate-[45deg]' : 'rotate-[225deg]';
      case BlockStatus.SMILE:
        return id === 1 ? 'rotate-[45deg]' : 'rotate-[45deg]';
      case BlockStatus.YIN:
        return id === 1 ? 'rotate-[225deg]' : 'rotate-[225deg]';
      default:
        return 'rotate-0 translate-y-0 opacity-40';
    }
  };

  return (
    <div className="flex justify-center items-center gap-12 py-10 h-40">
      {[1, 2].map((id) => (
        <div
          key={id}
          className={`divination-block relative w-24 h-16 ${getRotation(id)}`}
        >
          {/* Crescent Block Shape */}
          <div className="absolute inset-0 bg-[#8b0000] rounded-t-full border-b-2 border-[#5a0000] shadow-xl overflow-hidden">
            {/* Grain detail */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
            {/* Highlight */}
            <div className="absolute top-2 left-1/4 w-1/2 h-2 bg-white/10 rounded-full blur-sm"></div>
          </div>
          
          {/* Status Label on Block (Subtle) */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 font-light tracking-widest whitespace-nowrap">
            {status !== BlockStatus.UNTHROWN && !isAnimating ? (id === 1 ? '乾' : '坤') : ''}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DivinationBlocks;
