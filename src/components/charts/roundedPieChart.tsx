"use client";
import { LabelList, Pie, PieChart } from "recharts";
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

interface PieChartDataItem {
  name: string;
  value: number;
  fill?: string;
}

interface ReusablePieChartProps {
  title: string;
  description?: string;
  data: PieChartDataItem[];
  dataKey?: string;
  nameKey?: string;
  showTrend?: boolean;
  trendValue?: number;
  trendLabel?: string;
  innerRadius?: number;
  showLabels?: boolean;
  height?: number;
  colors?: string[];
}

const DEFAULT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function RoundedPieChart({
  title,
  description,
  data,
  dataKey = "value",
  nameKey = "name",
  showTrend = false,
  trendValue,
  trendLabel,
  innerRadius = 30,
  showLabels = true,
  height = 400,
  colors = DEFAULT_COLORS,
}: ReusablePieChartProps) {
  // Transform data to include fill colors if not provided
  const chartData = data.map((item, index) => ({
    ...item,
    fill: item.fill || colors[index % colors.length],
  }));

  // Generate dynamic chart config
  const chartConfig: ChartConfig = {
    [dataKey]: {
      label: dataKey.charAt(0).toUpperCase() + dataKey.slice(1),
    },
    ...chartData.reduce((acc, item, index) => {
      const key = item[nameKey as keyof typeof item] as string;
      acc[key] = {
        label: key,
        color: colors[index % colors.length],
      };
      return acc;
    }, {} as ChartConfig),
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const getTrendColor = () => {
    if (!trendValue) return "text-muted-foreground";
    return trendValue > 0 ? "text-green-500" : "text-red-500";
  };

  const getTrendBgColor = () => {
    if (!trendValue) return "bg-muted";
    return trendValue > 0 ? "bg-green-500/10" : "bg-red-500/10";
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <div className="flex items-center gap-2">
          <CardTitle>{title}</CardTitle>
          {showTrend && trendValue !== undefined && (
            <Badge
              variant="outline"
              className={`${getTrendColor()} ${getTrendBgColor()} border-none`}
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
        </div>
        {description && <CardDescription>{description}</CardDescription>}
        {trendLabel && (
          <p className="text-xs text-muted-foreground mt-1">{trendLabel}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className={`[&_.recharts-text]:fill-background mx-auto h-[250px] w-[250px] max-h-[${height}px]`}
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey={nameKey} hideLabel />}
            />
            <Pie
              data={chartData}
              innerRadius={innerRadius}
              dataKey={dataKey}
              nameKey={nameKey}
              radius={10}
              cornerRadius={8}
              paddingAngle={4}
            >
              {showLabels && (
                <LabelList
                  dataKey={dataKey}
                  stroke="none"
                  fontSize={12}
                  fontWeight={500}
                  fill="currentColor"
                  formatter={(value: number) => formatValue(value)}
                />
              )}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}