import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface CalendarPickerProps {
  activeDates?: string[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  onViewDateChange?: (date: Date) => void;
  defaultView?: 'week' | 'month' | 'year';
  showViewSwitcher?: boolean;
}

const formatDate = (date: Date): string => {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().split('T')[0];
};

const todayStr = formatDate(new Date());
const DAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

const CalendarPicker: React.FC<CalendarPickerProps> = ({
  activeDates = [],
  selectedDate = '',
  onSelectDate,
  onViewDateChange,
  defaultView = 'week',
  showViewSwitcher = true,
}) => {
  const {
    setIsDateSelectModalOpen,
    selectedCalendarDate,
    setSelectedCalendarDate,
    setCalendarActiveDates,
  } = useAppContext();

  const [calendarView, setCalendarView] = useState<'week' | 'month' | 'year'>(defaultView);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  const touchStartX = useRef<number | null>(null);
  const activeDateSet = new Set(activeDates);

  const navigate = (direction: 'prev' | 'next') => {
    const d = new Date(calendarDate);
    if (calendarView === 'week') {
      d.setDate(d.getDate() + (direction === 'next' ? 7 : -7));
    } else if (calendarView === 'month') {
      d.setMonth(d.getMonth() + (direction === 'next' ? 1 : -1));
    } else {
      d.setFullYear(d.getFullYear() + (direction === 'next' ? 1 : -1));
    }
    setCalendarDate(d);
    onViewDateChange?.(d);
  };

  const goToToday = () => {
    const today = new Date();
    setCalendarDate(today);
    onViewDateChange?.(today);
    onSelectDate?.(formatDate(today));
  };

  // Sync internal calendarDate when global selectedCalendarDate changes from the modal
  useEffect(() => {
    setCalendarDate(selectedCalendarDate);
    onViewDateChange?.(selectedCalendarDate);
    onSelectDate?.(formatDate(selectedCalendarDate));
  }, [selectedCalendarDate]);

  const handleOpenModal = () => {
    setSelectedCalendarDate(calendarDate);
    setCalendarActiveDates(activeDates);
    setIsDateSelectModalOpen(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) navigate(diff < 0 ? 'next' : 'prev');
    touchStartX.current = null;
  };

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const headerLabel =
    calendarView === 'year'
      ? `${year}年`
      : `${year}年 ${month + 1}月`;

  // Compute the week days for the current week
  const getWeekDays = () => {
    const start = new Date(calendarDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 select-none overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        {/* Month/Year label */}
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-1.5 group py-1 px-2 -ml-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
            {headerLabel}
          </span>
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-400 dark:border-t-gray-500 group-hover:border-t-primary transition-colors mt-0.5" />
        </button>

        <div className="flex items-center gap-2">
          {showViewSwitcher && (
            <div className="flex bg-gray-100 dark:bg-gray-700 p-0.5 rounded-lg">
              {(['week', 'month', 'year'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setCalendarView(v)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                    calendarView === v
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {v === 'week' ? '週' : v === 'month' ? '月' : '年'}
                </button>
              ))}
            </div>
          )}
          {/* Today button */}
          <button
            onClick={goToToday}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-bold text-white bg-primary hover:bg-primary/90 transition-all shadow-sm active:scale-95"
          >
            今
          </button>
        </div>
      </div>

      {/* ── Week View ── */}
      {calendarView === 'week' && (
        <div className="px-2 pb-4">
          {/* Day labels */}
          <div className="grid grid-cols-7 mb-1 px-7">
            {DAY_LABELS.map(d => (
              <div key={d} className="text-center text-[11px] font-medium text-gray-400 dark:text-gray-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Dates row with side arrows */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('prev')}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="grid grid-cols-7 flex-1">
              {getWeekDays().map((date, i) => {
                const dateStr = formatDate(date);
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === todayStr;
                const active = activeDateSet.has(dateStr);

                // Check if date is within 7 days of selectedDate
                let isInRange = false;
                let isRangeStart = false;
                let isRangeEnd = false;

                const dTime = new Date(date).setHours(0,0,0,0);
                
                if (selectedDate) {
                  const sel = new Date(selectedDate);
                  const selTime = new Date(sel).setHours(0,0,0,0);
                  const endTime = selTime + 7 * 86400000;
                  
                  isInRange = dTime >= selTime && dTime < endTime;
                  isRangeStart = dTime === selTime;
                  isRangeEnd = dTime === endTime - 86400000;
                } else {
                  const today = new Date();
                  const todayTime = today.setHours(0,0,0,0);
                  const endTime = todayTime + 7 * 86400000;
                  
                  isInRange = dTime >= todayTime && dTime < endTime;
                  isRangeStart = dTime === todayTime;
                  isRangeEnd = dTime === endTime - 86400000;
                }

                return (
                  <button
                    key={i}
                    onClick={() => onSelectDate?.(dateStr)}
                    className={`flex flex-col items-center justify-center py-1.5 transition-all relative ${
                      isInRange ? 'bg-primary/5 dark:bg-primary/10' : ''
                    } ${
                      isInRange && (i === 0 || isRangeStart) ? 'rounded-l-xl' : ''
                    } ${
                      isInRange && (i === 6 || isRangeEnd) ? 'rounded-r-xl' : ''
                    }`}
                  >
                    <span
                      className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all z-10 ${
                        isSelected
                          ? 'bg-gray-900 dark:bg-primary text-white shadow-md'
                          : isToday
                          ? 'text-primary font-bold hover:bg-orange-50 dark:hover:bg-orange-900/20'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {String(date.getDate()).padStart(2, '0')}
                    </span>
                    <div
                      className={`mt-0.5 w-1.5 h-1.5 rounded-full transition-colors ${
                        active ? 'bg-primary' : 'bg-transparent'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => navigate('next')}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Month View ── */}
      {calendarView === 'month' && (
        <div className="px-4 pb-4">
          {/* Nav row */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate('prev')}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
              {year}年 {month + 1}月
            </span>
            <button
              onClick={() => navigate('next')}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_LABELS.map(d => (
              <div key={d} className="text-center text-[11px] font-medium text-gray-400 dark:text-gray-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {(() => {
              const firstDay = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const cells: React.ReactNode[] = [];

              for (let i = 0; i < firstDay; i++) {
                cells.push(<div key={`e-${i}`} className="h-9" />);
              }
              for (let i = 1; i <= daysInMonth; i++) {
                const date = new Date(year, month, i);
                const dateStr = formatDate(date);
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === todayStr;
                const active = activeDateSet.has(dateStr);
                const colIndex = (firstDay + i - 1) % 7;

                // Check range highlight (same logic as Week view)
                let isInRange = false;
                let isRangeStart = false;
                let isRangeEnd = false;

                const dTime = new Date(date).setHours(0,0,0,0);
                
                if (selectedDate) {
                  const sel = new Date(selectedDate);
                  const selTime = new Date(sel).setHours(0,0,0,0);
                  const endTime = selTime + 7 * 86400000;
                  
                  isInRange = dTime >= selTime && dTime < endTime;
                  isRangeStart = dTime === selTime;
                  isRangeEnd = dTime === endTime - 86400000;
                } else {
                  const today = new Date();
                  const todayTime = today.setHours(0,0,0,0);
                  const endTime = todayTime + 7 * 86400000;
                  
                  isInRange = dTime >= todayTime && dTime < endTime;
                  isRangeStart = dTime === todayTime;
                  isRangeEnd = dTime === endTime - 86400000;
                }

                cells.push(
                  <button
                    key={i}
                    onClick={() => onSelectDate?.(dateStr)}
                    className={`flex flex-col items-center justify-center py-0.5 relative ${
                      isInRange ? 'bg-primary/5 dark:bg-primary/10' : ''
                    } ${
                      isInRange && (colIndex === 0 || isRangeStart) ? 'rounded-l-lg' : ''
                    } ${
                      isInRange && (colIndex === 6 || isRangeEnd) ? 'rounded-r-lg' : ''
                    }`}
                  >
                    <span
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all z-10 ${
                        isSelected
                          ? 'bg-gray-900 dark:bg-primary text-white shadow-md'
                          : isToday
                          ? 'text-primary font-bold hover:bg-orange-50 dark:hover:bg-orange-900/20'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {i}
                    </span>
                    <div
                      className={`mt-0.5 w-1 h-1 rounded-full ${active ? 'bg-primary' : 'bg-transparent'}`}
                    />
                  </button>
                );
              }
              return cells;
            })()}
          </div>
        </div>
      )}

      {/* ── Year View ── */}
      {calendarView === 'year' && (
        <div className="px-4 pb-4">
          {/* Nav row */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate('prev')}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{year}年</span>
            <button
              onClick={() => navigate('next')}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }, (_, i) => {
              const hasActivity = activeDates.some(d => {
                const date = new Date(d);
                return date.getFullYear() === year && date.getMonth() === i;
              });
              const isCurrentMonth =
                i === new Date().getMonth() && year === new Date().getFullYear();

              return (
                <button
                  key={i}
                  onClick={() => {
                    setCalendarDate(new Date(year, i, 1));
                    setCalendarView('month');
                  }}
                  className={`py-3 rounded-xl text-sm font-bold transition-all border relative ${
                    isCurrentMonth
                      ? 'border-gray-900 dark:border-gray-400 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {i + 1}月
                  {hasActivity && (
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPicker;
