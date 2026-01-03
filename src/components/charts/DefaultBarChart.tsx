"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Bar, BarChart, XAxis } from "recharts";
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

interface DefaultBarChartDataItem {
  [key: string]: string | number;
}

interface ReusableDefaultBarChartProps {
  title: string;
  description?: string;
  data: DefaultBarChartDataItem[];
  xAxisKey: string;
  yAxisKey: string;
  showTrend?: boolean;
  trendValue?: number;
  trendLabel?: string;
  color?: string;
  showTooltip?: boolean;
  showPattern?: boolean;
  xAxisFormatter?: (value: string) => string;
  radius?: number;
}

export function DefaultBarChart({
  title,
  description,
  data,
  xAxisKey,
  yAxisKey,
  showTrend = false,
  trendValue,
  trendLabel,
  color = "var(--chart-1)",
  showTooltip = true,
  showPattern = true,
  xAxisFormatter,
  radius = 4,
}: ReusableDefaultBarChartProps) {
  const chartConfig: ChartConfig = {
    [yAxisKey]: {
      label: yAxisKey.charAt(0).toUpperCase() + yAxisKey.slice(1),
      color: color,
    },
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
    <Card>
      <CardHeader>
        <CardTitle>
          {title}
          {showTrend && trendValue !== undefined && (
            <Badge
              variant="outline"
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
        {description && <CardDescription>{description}</CardDescription>}
        {trendLabel && !description && (
          <CardDescription>{trendLabel}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            {showPattern && (
              <>
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="85%"
                  fill={`url(#default-pattern-dots-${yAxisKey})`}
                />
                <defs>
                  <DottedBackgroundPattern id={`default-pattern-dots-${yAxisKey}`} />
                </defs>
              </>
            )}
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={xAxisFormatter || defaultXAxisFormatter}
            />
            {showTooltip && (
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
            )}
            <Bar
              dataKey={yAxisKey}
              fill={color}
              radius={radius}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

interface DottedBackgroundPatternProps {
  id?: string;
}

const DottedBackgroundPattern = ({ id = "default-pattern-dots" }: DottedBackgroundPatternProps) => {
  return (
    <pattern
      id={id}
      x="0"
      y="0"
      width="10"
      height="10"
      patternUnits="userSpaceOnUse"
    >
      <circle
        className="dark:text-muted/40 text-muted"
        cx="2"
        cy="2"
        r="1"
        fill="currentColor"
      />
    </pattern>
  );
};