"use client";

import { useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useSpring, useMotionValueEvent } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import { Badge } from "@/src/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface AreaChartDataItem {
  [key: string]: string | number;
}

interface ReusableAreaChartProps {
  title: string;
  description?: string;
  data: AreaChartDataItem[];
  xAxisKey: string;
  yAxisKey: string;
  showTrend?: boolean;
  trendValue?: number;
  trendLabel?: string;
  color?: string;
  height?: number;
  showAnimation?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  xAxisFormatter?: (value: string) => string;
}

export function ClipAreaChart({
  title,
  description,
  data,
  xAxisKey,
  yAxisKey,
  showTrend = false,
  trendValue,
  trendLabel,
  color = "#3b82f6",
  height = 300,
  showAnimation = true,
  showGrid = true,
  showTooltip = true,
  valuePrefix = "",
  valueSuffix = "",
  xAxisFormatter,
}: ReusableAreaChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [axis, setAxis] = useState(0);

  const springX = useSpring(0, {
    damping: 30,
    stiffness: 100,
  });
  const springY = useSpring(0, {
    damping: 30,
    stiffness: 100,
  });

  useMotionValueEvent(springX, "change", (latest) => {
    setAxis(latest);
  });

  const chartConfig: ChartConfig = {
    [yAxisKey]: {
      label: yAxisKey.charAt(0).toUpperCase() + yAxisKey.slice(1),
      color: color,
    },
  };

  const formatValue = (value: number) => {
    return `${valuePrefix}${value.toFixed(0)}${valueSuffix}`;
  };

  const getTrendColor = () => {
    if (!trendValue) return "text-muted-foreground";
    return trendValue > 0 ? "text-green-500" : "text-red-500";
  };

  const getTrendBgColor = () => {
    if (!trendValue) return "bg-muted";
    return trendValue > 0 ? "bg-green-500/10" : "bg-red-500/10";
  };

  const defaultXAxisFormatter = (value: string) => {
    if (value.length > 3) {
      return value.slice(0, 3);
    }
    return value;
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showAnimation ? (
              <CardTitle>
                {formatValue(springY.get())}
                {showTrend && trendValue !== undefined && (
                  <Badge
                    variant="secondary"
                    className={`${getTrendColor()} ${getTrendBgColor()} border-none ml-2`}
                  >
                    {trendValue > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : trendValue < 0 ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : null}
                    <span>
                      {trendValue > 0 ? "+" : ""}
                      {trendValue}%
                    </span>
                  </Badge>
                )}
              </CardTitle>
            ) : (
              <CardTitle>
                {title}
                {showTrend && trendValue !== undefined && (
                  <Badge
                    variant="secondary"
                    className={`${getTrendColor()} ${getTrendBgColor()} border-none ml-2`}
                  >
                    {trendValue > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : trendValue < 0 ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : null}
                    <span>
                      {trendValue > 0 ? "+" : ""}
                      {trendValue}%
                    </span>
                  </Badge>
                )}
              </CardTitle>
            )}
          </div>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
        {trendLabel && !showAnimation && (
          <p className="text-xs text-muted-foreground mt-1">{trendLabel}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer
          ref={chartRef}
          className="w-full overflow-visible"
          config={chartConfig}
          style={{ height: `${height}px` }}
        >
          <AreaChart
            className="overflow-visible"
            accessibilityLayer
            data={data}
            onMouseMove={(state) => {
              if (!showAnimation) return;
              const x = state.activeCoordinate?.x;
              const dataValue = state.activePayload?.[0]?.value;
              if (x && dataValue !== undefined) {
                springX.set(x);
                springY.set(dataValue);
              }
            }}
            onMouseLeave={() => {
              if (!showAnimation) return;
              springX.set(chartRef.current?.getBoundingClientRect().width || 0);
              springY.jump(data[data.length - 1]?.[yAxisKey] as number || 0);
            }}
            margin={{
              right: 0,
              left: 0,
              top: 10,
              bottom: 10,
            }}
          >
            {showGrid && (
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                horizontalCoordinatesGenerator={(props) => {
                  const { height } = props;
                  return [0, height - 30];
                }}
              />
            )}
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={xAxisFormatter || defaultXAxisFormatter}
            />
            {showTooltip && (
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel={false}
                    formatter={(value) => formatValue(value as number)}
                  />
                }
              />
            )}
            <Area
              dataKey={yAxisKey}
              type="monotone"
              fill={`url(#gradient-area-${yAxisKey})`}
              fillOpacity={0.4}
              stroke={color}
              strokeWidth={2}
              clipPath={
                showAnimation
                  ? `inset(0 ${
                      Number(chartRef.current?.getBoundingClientRect().width) -
                      axis
                    } 0 0)`
                  : undefined
              }
            />
            {showAnimation && (
              <>
                <line
                  x1={axis}
                  y1={0}
                  x2={axis}
                  y2="85%"
                  stroke={color}
                  strokeDasharray="3 3"
                  strokeLinecap="round"
                  strokeOpacity={0.2}
                />
                <rect
                  x={Math.max(0, axis - 50)}
                  y={0}
                  width={50}
                  height={18}
                  fill={color}
                  rx={4}
                />
                <text
                  x={Math.max(25, axis - 25)}
                  fontWeight={600}
                  y={13}
                  textAnchor="middle"
                  fill="var(--primary-foreground)"
                  fontSize={12}
                >
                  {formatValue(springY.get())}
                </text>
              </>
            )}
            <Area
              dataKey={yAxisKey}
              type="monotone"
              fill="none"
              stroke={color}
              strokeOpacity={0.1}
            />
            <defs>
              <linearGradient
                id={`gradient-area-${yAxisKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}