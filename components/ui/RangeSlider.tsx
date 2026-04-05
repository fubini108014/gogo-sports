import React, { useCallback, useEffect, useState, useRef } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  minVal: number;
  maxVal: number;
  onChange: (values: { min: number; max: number }) => void;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step = 10,
  minVal,
  maxVal,
  onChange,
}) => {
  const [minValState, setMinValState] = useState(minVal);
  const [maxValState, setMaxValState] = useState(maxVal);
  const minValRef = useRef(minVal);
  const maxValRef = useRef(maxVal);
  const range = useRef<HTMLDivElement>(null);

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minValState);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minValState, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxValState);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxValState, getPercent]);

  // Handle synchronization from props
  useEffect(() => {
    setMinValState(minVal);
    minValRef.current = minVal;
    setMaxValState(maxVal);
    maxValRef.current = maxVal;
  }, [minVal, maxVal]);

  return (
    <div className="flex items-center justify-center pt-6 pb-2 px-4">
      <div className="relative w-full">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValState}
          onChange={(event) => {
            const value = Math.min(Number(event.target.value), maxValState - step);
            setMinValState(value);
            minValRef.current = value;
            onChange({ min: value, max: maxValState });
          }}
          className="thumb thumb--left pointer-events-none absolute h-0 w-full outline-none z-[3]"
          style={{ zIndex: minValState > max - 100 ? "5" : undefined }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValState}
          onChange={(event) => {
            const value = Math.max(Number(event.target.value), minValState + step);
            setMaxValState(value);
            maxValRef.current = value;
            onChange({ min: minValState, max: value });
          }}
          className="thumb thumb--right pointer-events-none absolute h-0 w-full outline-none z-[4]"
        />

        <div className="relative w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div
            ref={range}
            className="absolute h-full bg-primary rounded-full"
          />
          <div className="absolute -top-7 left-0 text-xs font-bold text-gray-400 dark:text-gray-500">
            ${minValState}
          </div>
          <div className="absolute -top-7 right-0 text-xs font-bold text-gray-400 dark:text-gray-500">
            ${maxValState === max ? `${max}+` : maxValState}
          </div>
        </div>
      </div>

      <style>{`
        .thumb,
        .thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          -webkit-tap-highlight-color: transparent;
        }

        .thumb {
          pointer-events: none;
          position: absolute;
          height: 0;
          width: 100%;
          outline: none;
        }

        .thumb--left {
          z-index: 3;
        }

        .thumb--right {
          z-index: 4;
        }

        /* For Chrome browsers */
        .thumb::-webkit-slider-thumb {
          background-color: #ffffff;
          border: 2px solid #f97316; /* primary color */
          border-radius: 50%;
          box-shadow: 0 0 1px 1px #ced4da, 0 2px 4px rgba(0,0,0,0.1);
          cursor: pointer;
          height: 20px;
          width: 20px;
          pointer-events: all;
          position: relative;
          transition: transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out;
        }

        .thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 0 1px 1px #ced4da, 0 4px 8px rgba(0,0,0,0.15);
        }

        .thumb::-webkit-slider-thumb:active {
          transform: scale(0.95);
        }

        /* For Firefox browsers */
        .thumb::-moz-range-thumb {
          background-color: #ffffff;
          border: 2px solid #f97316;
          border-radius: 50%;
          box-shadow: 0 0 1px 1px #ced4da, 0 2px 4px rgba(0,0,0,0.1);
          cursor: pointer;
          height: 20px;
          width: 20px;
          pointer-events: all;
          position: relative;
          transition: transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out;
        }

        .thumb::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 0 1px 1px #ced4da, 0 4px 8px rgba(0,0,0,0.15);
        }

        .thumb::-moz-range-thumb:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
};

export default RangeSlider;
