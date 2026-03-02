import React, { useState } from 'react';
import { X, Check, MapPin, RefreshCw } from 'lucide-react';

interface LocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocations: string[];
  onSelect: (locations: string[]) => void;
}

// Simplified paths for Taiwan counties/cities for visualization
const TAIWAN_PATH_DATA = [
  { id: '台北市', name: '台北', d: 'M 162 15 L 175 15 L 178 25 L 170 32 L 160 25 Z' },
  { id: '新北市', name: '新北', d: 'M 155 10 L 185 10 L 195 35 L 185 55 L 155 50 L 145 30 Z' },
  { id: '基隆市', name: '基隆', d: 'M 180 8 L 190 8 L 192 15 L 182 18 Z' },
  { id: '桃園市', name: '桃園', d: 'M 135 25 L 155 25 L 158 45 L 130 55 L 120 40 Z' },
  { id: '新竹縣', name: '新竹縣', d: 'M 125 50 L 145 50 L 155 75 L 130 85 L 115 70 Z' },
  { id: '新竹市', name: '新竹市', d: 'M 118 58 L 128 58 L 130 65 L 120 68 Z' },
  { id: '苗栗縣', name: '苗栗', d: 'M 105 75 L 130 80 L 140 110 L 110 115 L 95 95 Z' },
  { id: '台中市', name: '台中', d: 'M 90 110 L 135 105 L 165 135 L 130 155 L 85 145 Z' },
  { id: '彰化縣', name: '彰化', d: 'M 75 145 L 95 145 L 100 175 L 70 175 Z' },
  { id: '南投縣', name: '南投', d: 'M 105 145 L 150 145 L 170 200 L 135 225 L 105 200 Z' },
  { id: '雲林縣', name: '雲林', d: 'M 60 175 L 95 175 L 100 205 L 55 205 Z' },
  { id: '嘉義縣', name: '嘉義縣', d: 'M 50 205 L 120 210 L 130 245 L 60 255 L 45 235 Z' },
  { id: '嘉義市', name: '嘉義市', d: 'M 75 220 L 85 220 L 87 230 L 77 233 Z' },
  { id: '台南市', name: '台南', d: 'M 40 245 L 110 245 L 115 295 L 45 305 L 30 275 Z' },
  { id: '高雄市', name: '高雄', d: 'M 45 305 L 105 295 L 145 345 L 120 395 L 80 410 L 55 385 Z' },
  { id: '屏東縣', name: '屏東', d: 'M 90 405 L 130 395 L 145 445 L 125 505 L 100 505 L 85 465 Z' },
  { id: '宜蘭縣', name: '宜蘭', d: 'M 175 45 L 205 50 L 215 100 L 185 120 L 165 85 Z' },
  { id: '花蓮縣', name: '花蓮', d: 'M 165 120 L 205 120 L 210 280 L 160 280 L 145 200 Z' },
  { id: '台東縣', name: '台東', d: 'M 150 285 L 195 285 L 190 425 L 140 435 L 130 350 Z' },
  { id: '澎湖縣', name: '澎湖', d: 'M 10 180 L 30 180 L 35 210 L 15 215 Z' },
  { id: '金門縣', name: '金門', d: 'M 5 50 L 25 50 L 25 70 L 5 70 Z' },
  { id: '連江縣', name: '馬祖', d: 'M 5 10 L 20 10 L 20 20 L 5 20 Z' },
];

const LocationMapModal: React.FC<LocationMapModalProps> = ({ isOpen, onClose, selectedLocations, onSelect }) => {
  const [tempSelected, setTempSelected] = useState<string[]>(selectedLocations);

  if (!isOpen) return null;

  const toggleLocation = (loc: string) => {
    if (loc === '全台灣') {
      setTempSelected(['全台灣']);
      return;
    }
    
    setTempSelected(prev => {
      const filtered = prev.filter(i => i !== '全台灣');
      if (filtered.includes(loc)) {
        const next = filtered.filter(i => i !== loc);
        return next.length === 0 ? ['全台灣'] : next;
      } else {
        return [...filtered, loc];
      }
    });
  };

  const handleConfirm = () => {
    onSelect(tempSelected);
    onClose();
  };

  const clearAll = () => setTempSelected(['全台灣']);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[800px]">
        
        {/* Left: Map Section */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 p-6 flex flex-col items-center justify-center relative min-h-[400px]">
          <div className="absolute top-6 left-6">
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="text-primary" size={24} />
              選擇探索地區
            </h2>
            <p className="text-xs text-gray-500 mt-1">點擊地圖多選縣市</p>
          </div>

          <svg 
            viewBox="0 0 220 520" 
            className="w-full h-full max-h-[450px] drop-shadow-xl"
          >
            {TAIWAN_PATH_DATA.map((item) => {
              const isSel = tempSelected.includes(item.id) || tempSelected.includes('全台灣');
              return (
                <path
                  key={item.id}
                  d={item.d}
                  onClick={() => toggleLocation(item.id)}
                  className={`cursor-pointer transition-all duration-300 stroke-[1.5] ${
                    isSel 
                      ? 'fill-primary stroke-white dark:stroke-gray-800 scale-[1.02] filter drop-shadow-md' 
                      : 'fill-white dark:fill-gray-700 stroke-gray-200 dark:stroke-gray-600 hover:fill-orange-100 dark:hover:fill-gray-600'
                  }`}
                  style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
                />
              );
            })}
          </svg>
        </div>

        {/* Right: List & Action Section */}
        <div className="w-full md:w-64 bg-white dark:bg-gray-800 p-6 border-l border-gray-100 dark:border-gray-700 flex flex-col">
          <div className="flex justify-between items-center mb-4 md:hidden">
             <span className="font-bold text-sm">已選 {tempSelected.includes('全台灣') ? '全台' : tempSelected.length} 個地區</span>
             <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full"><X size={18} /></button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar mb-4">
             <div className="space-y-1">
                <button
                  onClick={clearAll}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${
                    tempSelected.includes('全台灣') 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  全台灣
                  {tempSelected.includes('全台灣') && <Check size={14} />}
                </button>
                <div className="h-px bg-gray-100 dark:bg-gray-700 my-2" />
                {TAIWAN_PATH_DATA.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => toggleLocation(loc.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${
                      tempSelected.includes(loc.id) 
                        ? 'bg-orange-50 dark:bg-primary/10 text-primary' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {loc.id}
                    {tempSelected.includes(loc.id) && <Check size={14} />}
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
               <span>已選擇</span>
               <button onClick={clearAll} className="flex items-center gap-1 hover:text-primary"><RefreshCw size={10} /> 重設</button>
            </div>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
               {tempSelected.map(s => (
                 <span key={s} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-[10px] font-bold text-gray-600 dark:text-gray-300">
                   {s}
                 </span>
               ))}
            </div>
            <button
              onClick={handleConfirm}
              className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              確認選擇
            </button>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="hidden md:flex absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

export default LocationMapModal;
