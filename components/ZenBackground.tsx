
import React from 'react';

const ZenBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-[#1a1a1a] overflow-hidden">
      {/* Soft circular glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#b31b1b] opacity-10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#d4af37] opacity-10 blur-[120px] rounded-full"></div>
      
      {/* Subtle ink texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')]"></div>
    </div>
  );
};

export default ZenBackground;
