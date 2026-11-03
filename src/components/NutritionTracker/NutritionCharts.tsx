/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { DailyNutritionLog } from '../../types';
import { TrendingUp, AlertTriangle, CheckCircle, Scale } from 'lucide-react';

interface NutritionChartsProps {
  logs: DailyNutritionLog[];
  calorieGoal: number;
  sugarLimit: number;
}

type MetricType = 'calories' | 'sugar' | 'weight';
type TimeframeType = 7 | 14 | 30;

export const NutritionCharts: React.FC<NutritionChartsProps> = ({
  logs,
  calorieGoal,
  sugarLimit,
}) => {
  const [metric, setMetric] = useState<MetricType>('calories');
  const [timeframe, setTimeframe] = useState<TimeframeType>(7);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Generate sequence of dates for the chosen timeframe up to current date (2026-11-03)
  const chartData = useMemo(() => {
    const today = new Date('2026-11-03');
    const result = [];

    for (let i = timeframe - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const log = logs.find((l) => l.date === dateStr);

      result.push({
        dateStr,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        calories: log ? log.caloriesConsumed : 0,
        calorieGoal: log?.calorieGoal || calorieGoal,
        sugar: log ? log.sugarGrams : 0,
        sugarLimit: log?.sugarLimitGrams || sugarLimit,
        weight: log?.weightKg || null,
        hasData: !!log && (log.caloriesConsumed > 0 || !!log.weightKg),
      });
    }

    return result;
  }, [logs, timeframe, calorieGoal, sugarLimit]);

  // Derived stats
  const stats = useMemo(() => {
    const validCal = chartData.filter((d) => d.calories > 0);
    const avgCal = validCal.length ? Math.round(validCal.reduce((s, d) => s + d.calories, 0) / validCal.length) : 0;
    
    const validSugar = chartData.filter((d) => d.sugar > 0);
    const avgSugar = validSugar.length ? Math.round((validSugar.reduce((s, d) => s + d.sugar, 0) / validSugar.length) * 10) / 10 : 0;
    
    const validWeight = chartData.filter((d) => d.weight !== null).map((d) => d.weight as number);
    const latestWeight = validWeight.length ? validWeight[validWeight.length - 1] : null;
    const startWeight = validWeight.length ? validWeight[0] : null;
    const weightDelta = latestWeight && startWeight ? Math.round((latestWeight - startWeight) * 10) / 10 : 0;

    return { avgCal, avgSugar, latestWeight, weightDelta };
  }, [chartData]);

  // SVG Chart Geometry
  const svgWidth = 600;
  const svgHeight = 180;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  // Scales calculation
  const maxCalorie = Math.max(calorieGoal * 1.25, ...chartData.map((d) => d.calories), 2400);
  const maxSugar = Math.max(sugarLimit * 1.5, ...chartData.map((d) => d.sugar), 50);

  const validWeights = chartData.filter((d) => d.weight !== null).map((d) => d.weight as number);
  const minWeight = validWeights.length ? Math.floor(Math.min(...validWeights) - 1) : 65;
  const maxWeight = validWeights.length ? Math.ceil(Math.max(...validWeights) + 1) : 75;

  return (
    <div className="rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-5">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#E4DCDB] dark:border-[#352F2B]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-base font-bold text-[#2B241E] dark:text-[#EFE9E2]">
              Biometric & Intake Trends
            </span>
            <span className="text-xs text-[#7B6F63] dark:text-[#9F9184]">
              · {timeframe}-day historical curve
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs mt-1 font-mono text-[#7B6F63] dark:text-[#9F9184]">
            {metric === 'calories' && (
              <span>Average: <strong className="text-[#2B241E] dark:text-[#EFE9E2] font-semibold">{stats.avgCal} kcal/day</strong></span>
            )}
            {metric === 'sugar' && (
              <span>Average: <strong className="text-[#D9822B] font-semibold">{stats.avgSugar}g/day</strong> (Limit: {sugarLimit}g)</span>
            )}
            {metric === 'weight' && stats.latestWeight && (
              <span>Current: <strong className="text-[#2B241E] dark:text-[#EFE9E2] font-semibold">{stats.latestWeight} kg</strong> ({stats.weightDelta >= 0 ? `+${stats.weightDelta}` : stats.weightDelta} kg in period)</span>
            )}
          </div>
        </div>

        {/* Segmented metric & timeframe switches */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="flex items-center gap-1 p-1 bg-[#F4ECE3] dark:bg-[#25201C] rounded-lg">
            {(['calories', 'sugar', 'weight'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetric(m)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors whitespace-nowrap ${
                  metric === m
                    ? 'bg-white dark:bg-[#161311] text-[#2B241E] dark:text-[#EFE9E2] shadow-xs font-semibold'
                    : 'text-[#6F645A] dark:text-[#A89C90] hover:text-[#2B241E] dark:hover:text-[#EFE9E2]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 p-1 bg-[#F4ECE3] dark:bg-[#25201C] rounded-lg">
            {([7, 14, 30] as const).map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setTimeframe(days)}
                className={`px-2 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                  timeframe === days
                    ? 'bg-white dark:bg-[#161311] text-[#2B241E] dark:text-[#EFE9E2] shadow-xs font-semibold'
                    : 'text-[#6F645A] dark:text-[#A89C90]'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative mt-4 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-44 sm:h-52 overflow-visible select-none"
        >
          {/* Background grid horizontal lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + innerHeight * (1 - ratio);
            let label = '';
            if (metric === 'calories') label = `${Math.round(maxCalorie * ratio)}`;
            else if (metric === 'sugar') label = `${Math.round(maxSugar * ratio)}g`;
            else label = `${(minWeight + (maxWeight - minWeight) * ratio).toFixed(0)}kg`;

            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="2 3"
                  className="text-[#E0D7CB]/60 dark:text-[#38312B]/60"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] font-mono tabular-nums fill-[#8F8275] dark:fill-[#7A7067]"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Target Reference Line for Calories or Sugar */}
          {metric === 'calories' && (
            <g>
              {(() => {
                const targetY = padding.top + innerHeight * (1 - calorieGoal / maxCalorie);
                return (
                  <>
                    <line
                      x1={padding.left}
                      y1={targetY}
                      x2={svgWidth - padding.right}
                      y2={targetY}
                      stroke="#5B7A58"
                      strokeDasharray="4 3"
                      strokeWidth="1.5"
                    />
                    <text
                      x={svgWidth - padding.right}
                      y={targetY - 5}
                      textAnchor="end"
                      className="text-[9px] font-mono fill-[#5B7A58] font-semibold"
                    >
                      Target: {calorieGoal} kcal
                    </text>
                  </>
                );
              })()}
            </g>
          )}

          {metric === 'sugar' && (
            <g>
              {(() => {
                const targetY = padding.top + innerHeight * (1 - sugarLimit / maxSugar);
                return (
                  <>
                    <line
                      x1={padding.left}
                      y1={targetY}
                      x2={svgWidth - padding.right}
                      y2={targetY}
                      stroke="#D9822B"
                      strokeDasharray="4 3"
                      strokeWidth="1.5"
                    />
                    <text
                      x={svgWidth - padding.right}
                      y={targetY - 5}
                      textAnchor="end"
                      className="text-[9px] font-mono fill-[#D9822B] font-semibold"
                    >
                      Guideline Limit: {sugarLimit}g
                    </text>
                  </>
                );
              })()}
            </g>
          )}

          {/* Calories Bar Chart */}
          {metric === 'calories' && (
            <g>
              {chartData.map((d, idx) => {
                const slotWidth = innerWidth / chartData.length;
                const barWidth = Math.max(6, slotWidth * 0.55);
                const x = padding.left + idx * slotWidth + (slotWidth - barWidth) / 2;
                const barHeight = (d.calories / maxCalorie) * innerHeight;
                const y = padding.top + innerHeight - barHeight;
                const isOver = d.calories > calorieGoal;
                const isHovered = hoveredIndex === idx;

                return (
                  <g
                    key={d.dateStr}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(2, barHeight)}
                      rx="3"
                      fill={isOver ? '#D9822B' : '#5B7A58'}
                      opacity={isHovered ? 1 : 0.85}
                      className="transition-all duration-200"
                    />
                    {/* Date label at bottom */}
                    {(timeframe <= 14 || idx % 2 === 0) && (
                      <text
                        x={x + barWidth / 2}
                        y={svgHeight - 10}
                        textAnchor="middle"
                        className="text-[9px] font-mono tabular-nums fill-[#8F8275]"
                      >
                        {d.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Sugar Intake Bar Chart */}
          {metric === 'sugar' && (
            <g>
              {chartData.map((d, idx) => {
                const slotWidth = innerWidth / chartData.length;
                const barWidth = Math.max(6, slotWidth * 0.55);
                const x = padding.left + idx * slotWidth + (slotWidth - barWidth) / 2;
                const barHeight = (d.sugar / maxSugar) * innerHeight;
                const y = padding.top + innerHeight - barHeight;
                const isSpike = d.sugar > sugarLimit;
                const isHovered = hoveredIndex === idx;

                return (
                  <g
                    key={d.dateStr}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(2, barHeight)}
                      rx="3"
                      fill={isSpike ? '#C85A32' : '#D9822B'}
                      opacity={isHovered ? 1 : 0.85}
                      className="transition-all duration-200"
                    />
                    {(timeframe <= 14 || idx % 2 === 0) && (
                      <text
                        x={x + barWidth / 2}
                        y={svgHeight - 10}
                        textAnchor="middle"
                        className="text-[9px] font-mono tabular-nums fill-[#8F8275]"
                      >
                        {d.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Weight Trend Line Chart */}
          {metric === 'weight' && (
            <g>
              {/* Build line path connecting valid weight measurements */}
              {(() => {
                const points: { x: number; y: number; val: number; dateStr: string; label: string }[] = [];
                const slotWidth = innerWidth / (chartData.length - 1 || 1);

                chartData.forEach((d, idx) => {
                  if (d.weight !== null) {
                    const x = padding.left + idx * slotWidth;
                    const y =
                      padding.top +
                      innerHeight * (1 - (d.weight - minWeight) / (maxWeight - minWeight || 1));
                    points.push({ x, y, val: d.weight, dateStr: d.dateStr, label: d.label });
                  }
                });

                if (points.length === 0) {
                  return (
                    <text
                      x={svgWidth / 2}
                      y={svgHeight / 2}
                      textAnchor="middle"
                      className="text-xs font-serif fill-[#8F8275]"
                    >
                      No weigh-in data logged in this timeframe. Log daily weight above.
                    </text>
                  );
                }

                const pathString = points.reduce((acc, pt, idx) => {
                  return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
                }, '');

                return (
                  <>
                    <path
                      d={pathString}
                      fill="none"
                      stroke="#8C6D4F"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {points.map((pt, idx) => (
                      <g key={pt.dateStr}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="4"
                          className="fill-[#FFFDF9] dark:fill-[#1C1815] stroke-[#8C6D4F] stroke-2"
                        />
                        <text
                          x={pt.x}
                          y={pt.y - 8}
                          textAnchor="middle"
                          className="text-[9px] font-mono tabular-nums font-semibold fill-[#2B241E] dark:fill-[#EFE9E2]"
                        >
                          {pt.val.toFixed(1)}
                        </text>
                        <text
                          x={pt.x}
                          y={svgHeight - 10}
                          textAnchor="middle"
                          className="text-[9px] font-mono tabular-nums fill-[#8F8275]"
                        >
                          {pt.label}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </g>
          )}
        </svg>

        {/* Hover info badge */}
        {hoveredIndex !== null && chartData[hoveredIndex] && (
          <div className="absolute top-2 right-4 p-2 rounded-md bg-[#2B241E] text-[#FFFDF9] text-[11px] font-mono shadow-md pointer-events-none">
            <span className="font-semibold">{chartData[hoveredIndex].dateStr}:</span>{' '}
            {metric === 'calories' && `${chartData[hoveredIndex].calories} kcal`}
            {metric === 'sugar' && `${chartData[hoveredIndex].sugar}g sugar`}
            {metric === 'weight' && `${chartData[hoveredIndex].weight || 'No log'} kg`}
          </div>
        )}
      </div>
    </div>
  );
};
