import { useState, useEffect } from "react";

interface RangeSliderProps {
  minValue: number;
  maxValue: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (min: number, max: number) => void;
  formatValue?: (value: number) => string;
  label?: string;
  error?: string;
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M PLN`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k PLN`;
  }
  return `${value} PLN`;
};

const RangeSlider = ({
  minValue,
  maxValue,
  min = 0,
  max = 1000000,
  step = 10000,
  onChange,
  formatValue = formatCurrency,
  label,
  error,
}: RangeSliderProps) => {
  const [localMin, setLocalMin] = useState(minValue);
  const [localMax, setLocalMax] = useState(maxValue);

  useEffect(() => {
    setLocalMin(minValue);
    setLocalMax(maxValue);
  }, [minValue, maxValue]);

  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, localMax - step);
    setLocalMin(newMin);
    onChange(newMin, localMax);
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, localMin + step);
    setLocalMax(newMax);
    onChange(localMin, newMax);
  };

  const minPercent = ((localMin - min) / (max - min)) * 100;
  const maxPercent = ((localMax - min) / (max - min)) * 100;

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text font-semibold">{label}</span>
        </label>
      )}
      
      {/* Value display */}
      <div className="flex justify-between items-center mb-4">
        <div className="badge badge-primary badge-lg px-4 py-3 text-sm font-medium">
          {formatValue(localMin)}
        </div>
        <div className="flex-1 flex justify-center">
          <span className="text-base-content/50">—</span>
        </div>
        <div className="badge badge-primary badge-lg px-4 py-3 text-sm font-medium">
          {formatValue(localMax)}
        </div>
      </div>

      {/* Slider container */}
      <div className="relative h-2 mb-6">
        {/* Track background */}
        <div className="absolute w-full h-2 bg-base-300 rounded-full" />
        
        {/* Active track */}
        <div
          className="absolute h-2 bg-primary rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* Min slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none z-20
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-primary-content
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-primary
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-primary-content
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:shadow-md"
        />

        {/* Max slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none z-20
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-primary-content
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-primary
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-primary-content
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:shadow-md"
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-base-content/50">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>

      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

export default RangeSlider;
