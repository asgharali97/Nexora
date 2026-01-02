"use client";

import React, { SVGProps, useMemo, useState } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { AnimatePresence, motion } from "motion/react";
import { TrendingUp, TrendingDown } from "lucide-react";
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
import { cn } from "@/src/lib/utils";
import { JetBrains_Mono } from "next/font/google";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface BarChartDataItem {
  [key: string]: string | number;
}

interface ReusableBarChartProps {
  title: string;
  description?: string;
  data: BarChartDataItem[];
  xAxisKey: string;
  yAxisKey: string;
  showTrend?: boolean;
  trendValue?: number;
  trendLabel?: string;
  color?: string;
  height?: number;
  orientation?: "horizontal" | "vertical";
  showTooltip?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  xAxisFormatter?: (value: string) => string;
  yAxisWidth?: number;
  barSize?: number;
}

export function MonochromeBarChart({
  title,
  description,
  data,
  xAxisKey,
  yAxisKey,
  showTrend = false,
  trendValue,
  trendLabel,
  color = "var(--primary)",
  height = 300,
  orientation = "vertical",
  showTooltip = true,
  valuePrefix = "",
  valueSuffix = "",
  xAxisFormatter,
  yAxisWidth = 150,
  barSize,
}: ReusableBarChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const activeData = useMemo(() => {
    if (activeIndex === undefined) return null;
    return data[activeIndex];
  }, [activeIndex, data]);

  const chartConfig: ChartConfig = {
    [yAxisKey]: {
      label: yAxisKey.charAt(0).toUpperCase() + yAxisKey.slice(1),
      color: color,
    },
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${valuePrefix}${(value / 1000000).toFixed(1)}M${valueSuffix}`;
    }
    if (value >= 1000) {
      return `${valuePrefix}${(value / 1000).toFixed(1)}K${valueSuffix}`;
    }
    return `${valuePrefix}${value}${valueSuffix}`;
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

  const formatDisplayValue = (value: number) => {
    return `${valuePrefix}${value}${valueSuffix}`;
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span
            className={cn(jetBrainsMono.className, "text-2xl tracking-tighter")}
          >
            {activeData
              ? formatDisplayValue(activeData[yAxisKey] as number)
              : title}
          </span>
          {showTrend && trendValue !== undefined && (
            <Badge
              variant="secondary"
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
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {trendLabel && (
          <p className="text-xs text-muted-foreground mt-1">{trendLabel}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <AnimatePresence mode="wait">
          <ChartContainer
            config={chartConfig}
            className="w-full"
            style={{ height: `${height}px` }}
          >
            {orientation === "vertical" ? (
              <BarChart
                accessibilityLayer
                data={data}
                onMouseLeave={() => setActiveIndex(undefined)}
                margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey={xAxisKey}
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
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
                <Bar
                  dataKey={yAxisKey}
                  fill={color}
                  maxBarSize={barSize}
                  shape={
                    <CustomBar
                      setActiveIndex={setActiveIndex}
                      activeIndex={activeIndex}
                      fill={color}
                      formatValue={formatDisplayValue}
                    />
                  }
                />
              </BarChart>
            ) : (
              <BarChart
                accessibilityLayer
                data={data}
                layout="vertical"
                onMouseLeave={() => setActiveIndex(undefined)}
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
              >
                <YAxis
                  dataKey={xAxisKey}
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={yAxisWidth}
                  tickFormatter={(value) => {
                    if (value.length > 25) {
                      return value.substring(0, 25) + "...";
                    }
                    return value;
                  }}
                />
                <XAxis type="number" hide />
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
                <Bar
                  dataKey={yAxisKey}
                  fill={color}
                  maxBarSize={barSize}
                  shape={
                    <CustomBar
                      setActiveIndex={setActiveIndex}
                      activeIndex={activeIndex}
                      fill={color}
                      formatValue={formatDisplayValue}
                      orientation="horizontal"
                    />
                  }
                />
              </BarChart>
            )}
          </ChartContainer>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

interface CustomBarProps extends SVGProps<SVGSVGElement> {
  setActiveIndex: (index?: number) => void;
  index?: number;
  activeIndex?: number;
  value?: number;
  formatValue: (value: number) => string;
  orientation?: "vertical" | "horizontal";
}

const CustomBar = (props: CustomBarProps) => {
  const {
    fill,
    x,
    y,
    width,
    height,
    index,
    activeIndex,
    value,
    formatValue,
    orientation = "vertical",
  } = props;

  const xPos = Number(x || 0);
  const yPos = Number(y || 0);
  const realWidth = Number(width || 0);
  const realHeight = Number(height || 0);
  const isActive = index === activeIndex;
  const collapsedSize = 2;

  if (orientation === "horizontal") {
    const barY = isActive ? yPos : yPos + (realHeight - collapsedSize) / 2;
    const textY = yPos + realHeight / 2;

    return (
      <g onMouseEnter={() => props.setActiveIndex(index)}>
        <motion.rect
          style={{
            willChange: "transform, height",
          }}
          x={x}
          initial={{ height: collapsedSize, y: barY }}
          animate={{
            height: isActive ? realHeight : collapsedSize,
            y: barY,
          }}
          transition={{
            duration: activeIndex === index ? 0.5 : 1,
            type: "spring",
          }}
          width={width}
          fill={fill}
        />
        {isActive && value !== undefined && (
          <motion.text
            style={{
              willChange: "transform, opacity",
            }}
            className={jetBrainsMono.className}
            key={index}
            initial={{ opacity: 0, x: 10, filter: "blur(3px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 10, filter: "blur(3px)" }}
            transition={{ duration: 0.1 }}
            x={xPos + realWidth + 5}
            y={textY}
            dominantBaseline="middle"
            fill={fill}
            fontSize={12}
          >
            {formatValue(value)}
          </motion.text>
        )}
      </g>
    );
  }

  const barX = isActive ? xPos : xPos + (realWidth - collapsedSize) / 2;
  const textX = xPos + realWidth / 2;

  return (
    <g onMouseEnter={() => props.setActiveIndex(index)}>
      <motion.rect
        style={{
          willChange: "transform, width",
        }}
        y={y}
        initial={{ width: collapsedSize, x: barX }}
        animate={{ width: isActive ? realWidth : collapsedSize, x: barX }}
        transition={{
          duration: activeIndex === index ? 0.5 : 1,
          type: "spring",
        }}
        height={height}
        fill={fill}
      />
      {isActive && value !== undefined && (
        <motion.text
          style={{
            willChange: "transform, opacity",
          }}
          className={jetBrainsMono.className}
          key={index}
          initial={{ opacity: 0, y: -10, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(3px)" }}
          transition={{ duration: 0.1 }}
          x={textX}
          y={yPos - 5}
          textAnchor="middle"
          fill={fill}
          fontSize={12}
        >
          {formatValue(value)}
        </motion.text>
      )}
    </g>
  );
};