"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import {
  Activity,
  BarChart3,
  Users,
  Globe,
  Rocket,
  Filter,
  Database,
  ShieldCheck,
  Percent,
} from "lucide-react";

const CHANNELS = ["Web", "Email", "Paid", "SMS"] as const;
const SEGMENTS = ["Prospects", "Applicants", "Enrolled", "At-Risk", "Alumni"] as const;

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

type Channel = typeof CHANNELS[number];
type DailyPoint = {
  date: string;
  conversions: number;
  impressions: number;
  spend: number;
} & Record<Channel, number>;

function seededRandom(seed: number) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateDailyData(days = 180, seedBase = 42): DailyPoint[] {
  const data: DailyPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = formatDate(daysAgo(i));
    const r = (off: number) => seededRandom(seedBase + i * 7 + off);
    const web = Math.floor(100 + r(1) * 200);
    const email = Math.floor(60 + r(2) * 120);
    const paid = Math.floor(80 + r(3) * 220);
    const sms = Math.floor(20 + r(4) * 70);
    const conversions = Math.floor(web * 0.06 + email * 0.09 + paid * 0.04 + sms * 0.12 + r(5) * 10);
    const impressions = (web + email + paid + sms) * 40;
    const spend = Math.round((paid * 0.9 + sms * 0.2 + r(6) * 25) * 10) / 10;
    data.push({ date, Web: web, Email: email, Paid: paid, SMS: sms, conversions, impressions, spend });
  }
  return data;
}

const BASE_DATA = generateDailyData();

const segmentStats = SEGMENTS.map((s, idx) => {
  const base = 20000 - idx * 2500;
  const engagement = 0.25 + 0.08 * Math.sin(idx + 1);
  const conversionRate = 0.03 + 0.015 * Math.cos(idx + 0.5);
  const ltv = 900 + idx * 250;
  return {
    name: s,
    size: base,
    engagement,
    conversionRate,
    ltv,
    channelMix: CHANNELS.map((c, j) => ({ 
      channel: c, 
      value: Math.round((0.2 + 0.15 * Math.sin((idx + 1) * (j + 1))) * 100) 
    })),
  };
});

const dataQualityDaily = BASE_DATA.map((d, i) => {
  const valid = Math.floor((d.Web + d.Email + d.Paid + d.SMS) * (0.92 + 0.03 * Math.sin(i / 12)));
  const invalid = Math.floor(valid * (0.06 + 0.02 * Math.cos(i / 9)));
  const stitched = Math.floor(valid * (0.55 + 0.1 * Math.sin(i / 20)));
  const matchRate = stitched / (valid + invalid);
  const duplicates = Math.floor((valid + invalid) * (0.02 + 0.01 * Math.cos(i / 7)));
  return { date: d.date, valid, invalid, stitched, matchRate: Math.max(0, Math.min(1, matchRate)), duplicates };
});

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 ${className}`}>{children}</div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-100">{children}</div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold">{children}</h3>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const KPICard = ({ title, value, icon, sub }: { title: string; value: string | number; icon?: React.ReactNode; sub?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm text-gray-600 font-medium">{title}</CardTitle>
      <div className="text-gray-400">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </CardContent>
  </Card>
);

const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
    <div className="h-full bg-blue-500" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </div>
);

const TabPerformance = ({ dataset, channel }: { dataset: typeof BASE_DATA; channel: string }) => {
  const totalConversions = dataset.reduce((sum, d) => sum + d.conversions, 0);
  const totalImpressions = dataset.reduce((sum, d) => sum + d.impressions, 0);
  const totalSpend = dataset.reduce((sum, d) => sum + d.spend, 0);
  const conversionRate = (totalConversions / totalImpressions * 100).toFixed(2);

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Conversions" value={totalConversions.toLocaleString()} icon={<Activity className="h-4 w-4" />} sub="All channels" />
        <KPICard title="Impressions" value={totalImpressions.toLocaleString()} icon={<Activity className="h-4 w-4" />} sub="Total reach" />
        <KPICard title="Spend" value={`$${totalSpend.toFixed(2)}`} icon={<Activity className="h-4 w-4" />} sub="All campaigns" />
        <KPICard title="Conv. Rate" value={`${conversionRate}%`} icon={<Activity className="h-4 w-4" />} sub="Overall" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Channel Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataset}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis />
              <Tooltip />
              <Legend />
              {CHANNELS.map((ch) => (
                <Line key={ch} type="monotone" dataKey={ch} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

const TabSegments = ({ selectedSegment }: { selectedSegment: string }) => {
  const stats = segmentStats.find((s) => s.name === selectedSegment)!;

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Segment Size" value={stats.size.toLocaleString()} sub="Total members" />
        <KPICard title="Engagement Rate" value={`${(stats.engagement * 100).toFixed(1)}%`} sub="Active" />
        <KPICard title="Conversion Rate" value={`${(stats.conversionRate * 100).toFixed(2)}%`} sub="To next stage" />
        <KPICard title="Lifetime Value" value={`$${stats.ltv}`} sub="Average LTV" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Channel Mix</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.channelMix}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

const TabJourney = ({ selectedSegment }: { selectedSegment: string }) => {
  const segIdx = SEGMENTS.indexOf(selectedSegment as any);
  const base = 10000 - segIdx * 1200;
  const reg = base;
  const app = Math.floor(reg * (0.62 + 0.06 * Math.sin(segIdx)));
  const enr = Math.floor(app * (0.55 + 0.05 * Math.cos(segIdx)));
  const eng = Math.floor(enr * (0.75 + 0.06 * Math.sin(segIdx + 1)));
  const journeyCounts = [reg, app, enr, eng];
  const journeyTemplate = ["Registration", "Application", "Enrollment", "Course Engagement"];

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Journey Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {journeyTemplate.map((stg, i) => (
              <motion.div key={stg} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
                <div className="text-xs text-gray-500 font-medium mb-1">{stg}</div>
                <div className="text-2xl font-semibold mb-1">{journeyCounts[i].toLocaleString()}</div>
                <div className="mt-3">
                  <ProgressBar value={100 - i * 18} />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const TabDataQuality =