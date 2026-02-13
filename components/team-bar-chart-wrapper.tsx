"use client";

import { TeamBarChart } from "@/components/team-bar-chart";
import { MetricDefinition } from "@/lib/types";

interface TeamBarChartWrapperProps {
  data: { name: string; [slug: string]: string | number }[];
  definitions: MetricDefinition[];
}

export function TeamBarChartWrapper({
  data,
  definitions,
}: TeamBarChartWrapperProps) {
  return <TeamBarChart data={data} definitions={definitions} />;
}
