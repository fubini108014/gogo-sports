import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface DateSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  activeDates?: string[];
}

const formatDate = (date: Date): string => {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().split('T')[0];
};

const todayStr = formatDate(new Date());
const DAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

const DateSelectModal: React.FC<DateSelectModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  onSelectDate,
  activeDates = [],
}) => {
  const [viewDate, setViewDate] = useState<Date>(new Date(currentDate));
  const [view, setView] = useState<'month' | 'year' | 'decade'>('month');

  if (!isOpen) return null;

  const activeDateSet = new Set(activeDates);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const navigate = (direction: 'prev' | 'next') => {
    const d = new Date(viewDate);
    if (view === 'month') {
      d.setMonth(d.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (view === 'year') {
      d.setFullYear(d.getFullYear() + (direction === 'next' ? 1 : -1));
    } else {
      d.setFullYear(d.getFullYear() + (direction === 'next' ? 10 : -10));
    }
    setViewDate(d);
  };

  const handleDateClick = (day: number) => {
    const selected = new Date(year, month, day);
    onSelectDate(selected);
    onClose();
  };

  const handleMonthClick = (m: number) => {
    const d = new Date(viewDate);
    d.setMonth(m);
    setViewDate(d);
    setView('month');
  };

  const handleYearClick = (y: number) => {
    const d = new Date(viewDate);
    d.setFullYear(y);
    setViewDate(d);
    setView('year');
  };

  const goToToday = () => {
    const today = new Date();
    onSelectDate(today);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm mx-4 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <CalendarIcon size={18} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">選擇日期</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('prev')}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors border border-gray-100 dark:border-gray-800"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button 
              onClick={() => setView(view === 'month' ? 'year' : view === 'year' ? 'decade' : 'month')}
              className="text-base font-bold text-gray-900 dark:text-white hover:text-primary transition-colors"
            >
              {view === 'month' && `${year}年 ${month + 1}月`}
              {view === 'year' && `${year}年`}
              {view === 'decade' && `${Math.floor(year / 10) * 10} - ${Math.floor(year / 10) * 10 + 9}`}
            </button>

            <button
              onClick={() => navigate('next')}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors border border-gray-100 dark:border-gray-800"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Month View */}
          {view === 'month' && (
            <>
              <div className="grid grid-cols-7 mb-2">
                {DAY_LABELS.map(d => (
                  <div key={d} className="text-center text-xs font-bold text-gray-400 dark:text-gray-500 py-2">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const cells = [];

                  for (let i = 0; i < firstDay; i++) {
                    cells.push(<div key={`e-${i}`} className="h-10" />);
                  }
                  for (let i = 1; i <= daysInMonth; i++) {
                    const date = new Date(year, month, i);
                    const dateStr = formatDate(date);
                    const isSelected = formatDate(currentDate) === dateStr;
                    const isToday = todayStr === dateStr;

                    cells.push(
                      <button
                        key={i}
                        onClick={() => handleDateClick(i)}
                        className={`h-10 flex flex-col items-center justify-center rounded-xl text-sm font-bold transition-all relative ${
                          isSelected
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : isToday
                            ? 'text-primary bg-primary/5'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className={isSelected ? '' : 'translate-y-0.5'}>{i}</span>
                        <div className="h-1 mt-0.5">
                          {activeDateSet.has(dateStr) && (
                            <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`} />
                          )}
                        </div>
                      </button>
                    );
                  }
                  return cells;
                })()}
              </div>
            </>
          )}

          {/* Year View */}
          {view === 'year' && (
            <div className="grid grid-cols-3 gap-3">
              {MONTHS.map((m, i) => (
                <button
                  key={m}
                  onClick={() => handleMonthClick(i)}
                  className={`py-4 rounded-xl text-sm font-bold transition-all border ${
                    month === i
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary/50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {/* Decade View */}
          {view === 'decade' && (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 12 }, (_, i) => {
                const startYear = Math.floor(year / 10) * 10 - 1;
                const y = startYear + i;
                return (
                  <button
                    key={y}
                    onClick={() => handleYearClick(y)}
                    className={`py-4 rounded-xl text-sm font-bold transition-all border ${
                      year === y
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary/50'
                    }`}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
          <button
            onClick={goToToday}
            className="text-sm font-bold text-primary hover:text-orange-600 transition-colors"
          >
            回今天
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateSelectModal;
