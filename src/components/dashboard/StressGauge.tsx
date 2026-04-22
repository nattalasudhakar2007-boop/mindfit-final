import { useEffect, useState } from "react";

interface Props {
  value: number; // 0-10
  size?: number;
}

export function StressGauge({ value, size = 160 }: Props) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius; // half circle
  const progress = (animatedValue / 10) * circumference;
  const center = size / 2;

  const getColor = (v: number) => {
    if (v <= 3.5) return "hsl(158, 40%, 45%)";
    if (v <= 6.5) return "hsl(30, 90%, 55%)";
    return "hsl(0, 70%, 55%)";
  };

  const getLabel = (v: number) => {
    if (v <= 3.5) return "Low";
    if (v <= 6.5) return "Moderate";
    return "High";
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Background arc */}
        <path
          d={`M 10 ${center} A ${radius} ${radius} 0 0 1 ${size - 10} ${center}`}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={`M 10 ${center} A ${radius} ${radius} 0 0 1 ${size - 10} ${center}`}
          fill="none"
          stroke={getColor(animatedValue)}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={circumference - progress}
          style={{ transition: "stroke-dashoffset 1s ease-out, stroke 0.5s ease" }}
        />
        {/* Value text */}
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          className="font-heading"
          fontSize="32"
          fontWeight="800"
          fill="currentColor"
        >
          {animatedValue.toFixed(1)}
        </text>
        <text
          x={center}
          y={center + 14}
          textAnchor="middle"
          fontSize="12"
          fill={getColor(animatedValue)}
          fontWeight="600"
        >
          {getLabel(animatedValue)} Stress
        </text>
      </svg>
    </div>
  );
}
