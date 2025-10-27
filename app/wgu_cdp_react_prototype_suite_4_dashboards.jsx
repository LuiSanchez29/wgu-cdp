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
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Activity,
  BarChart3,
  Users,
  Globe,
  Rocket,
  Filter,
  Settings,
  Database,
  ShieldCheck,
  Percent,
} from "lucide-react";

// -----------------------------
// Mock Data Generation
// -----------------------------

const CHANNELS = ["Web", "Email", "Paid", "SMS"] as const;
const SEGMENTS = [
  "Prospects",
  "Applicants",
  "Enrolled",
  "At-Risk",
  "Alumni",
] as const;

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
    // Build a seed for pseudo-stability per day
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

// Segment-level synthetic stats
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
    channelMix: CHANNELS.map((c, j) => ({ channel: c, value: Math.round((0.2 + 0.15 * Math.sin((idx + 1) * (j + 1))) * 100) })),
    attributes: [
      { key: "Visited Learning Pages ≥3", lift: 1.9 },
      { key: "Opened Email in 7d", lift: 1.6 },
      { key: "Clicked SMS", lift: 2.2 },
      { key: "Viewed Scholarship Info", lift: 1.4 },
      { key: "Returning Visitor", lift: 1.7 },
    ],
  };
});

// Data Quality synthetic stats
const dataQualityDaily = BASE_DATA.map((d, i) => {
  const valid = Math.floor((d.Web + d.Email + d.Paid + d.SMS) * (0.92 + 0.03 * Math.sin(i / 12)));
  const invalid = Math.floor(valid * (0.06 + 0.02 * Math.cos(i / 9)));
  const stitched = Math.floor(valid * (0.55 + 0.1 * Math.sin(i / 20)));
  const matchRate = stitched / (valid + invalid);
  const duplicates = Math.floor((valid + invalid) * (0.02 + 0.01 * Math.cos(i / 7)));
  return {
    date: d.date,
    valid,
    invalid,
    stitched,
    matchRate: Math.max(0, Math.min(1, matchRate)),
    duplicates,
  };
});

// Journey synthetic stats
const journeyTemplate = [
  { stage: "Registration", key: "registration" },
  { stage: "Application", key: "application" },
  { stage: "Enrollment", key: "enrollment" },
  { stage: "Course Engagement", key: "engagement" },
];

function generateJourneyForSegment(segIndex: number) {
  const base = 10000 - segIndex * 1200;
  const reg = base;
  const app = Math.floor(reg * (0.62 + 0.06 * Math.sin(segIndex)));
  const enr = Math.floor(app * (0.55 + 0.05 * Math.cos(segIndex)));
  const eng = Math.floor(enr * (0.75 + 0.06 * Math.sin(segIndex + 1)));
  return [reg, app, enr, eng];
}

// -----------------------------
// UI Helpers
// -----------------------------

const KPICard: React.FC<{ title: string; value: string | number; icon?: React.ReactNode; sub?: string }>= ({ title, value, icon, sub }) => (
  <Card className="rounded-2xl shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm text-muted-foreground font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </CardContent>
  </Card>
);

const SectionTitle: React.FC<{icon?: React.ReactNode; children: React.ReactNode}> = ({ icon, children }) => (
  <div className="flex items-center gap-2 mb-3">
    {icon}
    <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{children}</h3>
  </div>
);

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
    <div className="h-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </div>
);

// -----------------------------
// Filters Header
// -----------------------------

const FiltersBar: React.FC<{
  dateRange: string;
  setDateRange: (v: string) => void;
  channel: string;
  setChannel: (v: string) => void;
  segment: string;
  setSegment: (v: string) => void;
}> = ({ dateRange, setDateRange, channel, setChannel, segment, setSegment }) => {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-card border rounded-2xl">
      <Badge variant="secondary" className="rounded-xl px-3 py-1 flex items-center gap-2"><Filter className="h-4 w-4"/> Filters</Badge>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Date</span>
        <Select defaultValue={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="180">Last 180 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Channel</span>
        <Select defaultValue={channel} onValueChange={setChannel}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            {CHANNELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Segment</span>
        <Select defaultValue={segment} onValueChange={setSegment}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SEGMENTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-2"/>Configure</Button>
        <Button size="sm"><Rocket className="h-4 w-4 mr-2"/>Export Snapshot</Button>
      </div>
    </div>
  );
};

// -----------------------------
// Tab 1: Strategic Performance
// -----------------------------

const TabPerformance: React.FC<{dataset: DailyPoint[]; channel: string}> = ({ dataset, channel }) => {
  const filtered = useMemo(() => {
    if (channel === "All") return dataset;
    return dataset.map(d => ({
      ...d,
      conversions: Math.round((d as any)[channel as Channel] * (channel === "SMS" ? 0.12 : channel === "Email" ? 0.09 : channel === "Web" ? 0.06 : 0.04)),
      impressions: (d as any)[channel as Channel] * 40,
      spend: channel === "Paid" ? Math.round(((d as any)["Paid"] * 0.9 + 20) * 10) / 10 : Math.round((10 + (d as any)[channel as Channel] * 0.02) * 10) / 10
    }));
  }, [dataset, channel]);

  const totals = useMemo(() => {
    const sum = filtered.reduce(
      (acc, d) => {
        acc.conv += d.conversions;
        acc.impr += d.impressions;
        acc.spend += d.spend;
        return acc;
      },
      { conv: 0, impr: 0, spend: 0 }
    );
    const roas = sum.conv === 0 ? 0 : (sum.conv * 150) / (sum.spend || 1);
    return { sum, roas };
  }, [filtered]);

  const activeSegments = 5; // static for mock
  const profileCompletion = 78 + Math.round((filtered[filtered.length - 1]?.conversions || 0) % 5);
  const convLift = 12 + (channel === "All" ? 0 : 2);

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Conversions" value={totals.sum.conv.toLocaleString()} icon={<Activity className="h-4 w-4" />} sub="Value simulated at $150 per conversion" />
        <KPICard title="Profile Completion" value={`${profileCompletion}%`} icon={<Percent className="h-4 w-4" />} sub="Known profiles with key attributes" />
        <KPICard title="Active Segments" value={activeSegments} icon={<Users className="h-4 w-4" />} sub="Top 5 shown by activity" />
        <KPICard title="Estimated ROAS" value={`${totals.roas.toFixed(1)}x`} icon={<BarChart3 className="h-4 w-4" />} sub="Assumes $150 per conversion" />
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Conversions Over Time {channel !== "All" && <Badge variant="outline" className="ml-2">{channel}</Badge>}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filtered}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" hide/>
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="conversions" strokeWidth={2} dot={false} name="Conversions" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Channel Contribution (last period)</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHANNELS.map(c => ({ channel: c, value: filtered.reduce((acc, d) => acc + (d as any)[c as Channel], 0) }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" name="Engagement" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Spend vs. Impressions</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filtered}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopOpacity={0.6}/>
                    <stop offset="95%" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide/>
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="impressions" name="Impressions" fillOpacity={0.2} strokeWidth={2} />
                <Area type="monotone" dataKey="spend" name="Spend" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// -----------------------------
// Tab 2: Segment Intelligence
// -----------------------------

const TabSegments: React.FC<{selectedSegment: string}> = ({ selectedSegment }) => {
  const s = segmentStats.find(x => x.name === selectedSegment) || segmentStats[0];

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Segment Size" value={s.size.toLocaleString()} icon={<Users className="h-4 w-4" />} sub={selectedSegment} />
        <KPICard title="Engagement Rate" value={`${Math.round(s.engagement * 100)}%`} icon={<Activity className="h-4 w-4" />} sub="Active last 30d" />
        <KPICard title="Conversion Rate" value={`${Math.round(s.conversionRate * 1000)/10}%`} icon={<BarChart3 className="h-4 w-4" />} sub="To primary goal" />
        <KPICard title="Avg. LTV" value={`$${s.ltv.toLocaleString()}`} icon={<Globe className="h-4 w-4" />} sub="Modeled" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Cross-Channel Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={s.channelMix}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" name="Activity" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Top Predictive Attributes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {s.attributes.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 text-xs text-muted-foreground">{a.lift.toFixed(1)}x</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{a.key}</div>
                    <ProgressBar value={Math.min(100, a.lift * 40)} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// -----------------------------
// Tab 3: Journey Optimization
// -----------------------------

const TabJourney: React.FC<{selectedSegment: string}> = ({ selectedSegment }) => {
  const idx = Math.max(0, SEGMENTS.indexOf(selectedSegment as any));
  const journeyCounts = generateJourneyForSegment(idx);
  const convRates = [
    journeyCounts[1] / journeyCounts[0],
    journeyCounts[2] / journeyCounts[1],
    journeyCounts[3] / journeyCounts[2],
  ];

  return (
    <div className="grid gap-4">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Lifecycle Funnel — {selectedSegment}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {journeyTemplate.map((stg, i) => (
              <motion.div key={stg.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-4 rounded-xl border bg-card">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{stg.stage}</div>
                <div className="text-2xl font-semibold mb-1">{journeyCounts[i].toLocaleString()}</div>
                {i > 0 && (
                  <div className="text-xs text-muted-foreground">Stage CVR: {(convRates[i-1] * 100).toFixed(1)}%</div>
                )}
                <div className="mt-3"><ProgressBar value={100 - i * 18} /></div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Drop-off Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {journeyTemplate.slice(0, -1).map((stg, i) => {
                const drop = journeyCounts[i] - journeyCounts[i+1];
                const rate = (drop / journeyCounts[i]) * 100;
                return (
                  <div key={stg.key} className="flex items-center gap-3">
                    <div className="w-40 text-sm">{stg.stage} → {journeyTemplate[i+1].stage}</div>
                    <div className="flex-1"><ProgressBar value={Math.max(0, 100 - rate)} /></div>
                    <div className="w-24 text-right text-sm">-{drop.toLocaleString()} ({rate.toFixed(1)}%)</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Stage Heatmap (Engagement Signals)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              <div className="text-xs text-muted-foreground">Signal</div>
              {journeyTemplate.map((j) => (
                <div key={j.key} className="text-xs text-muted-foreground text-center">{j.stage.split(" ")[0]}</div>
              ))}
              {["Email", "Web", "Paid", "SMS", "Chat"].map((signal, r) => (
                <React.Fragment key={signal}>
                  <div className="text-xs py-1">{signal}</div>
                  {journeyTemplate.map((j, c) => {
                    const intensity = 0.25 + 0.7 * Math.abs(Math.sin(r + c + 0.7));
                    return (
                      <div key={`${signal}-${j.key}`} className="h-7 rounded" style={{ background: `rgba(79,70,229,${intensity})` }} />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// -----------------------------
// Tab 4: Data Quality & Identity Resolution
// -----------------------------

const TabDataQuality: React.FC<{dataset: typeof dataQualityDaily}> = ({ dataset }) => {
  const last = dataset[dataset.length - 1];
  const stitchedProfiles = last.stitched;
  const duplicates = last.duplicates;
  const matchRate = Math.round(last.matchRate * 1000) / 10;

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Stitched Profiles" value={stitchedProfiles.toLocaleString()} icon={<Database className="h-4 w-4" />} sub="Across ID graph" />
        <KPICard title="Duplicate Suspects" value={duplicates.toLocaleString()} icon={<ShieldCheck className="h-4 w-4" />} sub="To be reviewed" />
        <KPICard title="Match Rate" value={`${matchRate}%`} icon={<Percent className="h-4 w-4" />} sub="Valid / Total Events" />
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Match Rate Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataset}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" hide/>
              <YAxis tickFormatter={(v)=>`${Math.round(v*100)}%`} domain={[0,1]} />
              <Tooltip formatter={(v:any)=> `${Math.round(v*1000)/10}%`} />
              <Legend />
              <Line type="monotone" dataKey="matchRate" name="Match Rate" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Event Integrity (Valid vs Invalid)</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataset}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide/>
                <YAxis />
                <Tooltip />
                <Area dataKey="valid" name="Valid" type="monotone" fillOpacity={0.25} strokeWidth={2} />
                <Area dataKey="invalid" name="Invalid" type="monotone" fillOpacity={0.25} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Source Coverage (Last Snapshot)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {["Web", "CRM", "LMS", "Ad Platforms", "Email", "SMS"].map((src, i) => {
                const pct = 60 + Math.round(35 * Math.abs(Math.sin(i + 0.4)));
                return (
                  <div key={src} className="p-4 border rounded-xl">
                    <div className="text-sm font-medium mb-1">{src}</div>
                    <div className="text-xs text-muted-foreground mb-2">Coverage</div>
                    <ProgressBar value={pct} />
                    <div className="text-xs text-muted-foreground mt-1">{pct}% of expected events</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// -----------------------------
// Root Component
// -----------------------------

export default function App() {
  const [dateRange, setDateRange] = useState("90");
  const [channel, setChannel] = useState("All");
  const [segment, setSegment] = useState(SEGMENTS[0]);

  const dataset = useMemo(() => {
    const n = parseInt(dateRange, 10);
    return BASE_DATA.slice(-n);
  }, [dateRange]);

  const dqDataset = useMemo(() => dataQualityDaily.slice(-parseInt(dateRange, 10)), [dateRange]);

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center"><Rocket className="h-5 w-5"/></div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">WGU CDP Prototype Suite</h1>
              <p className="text-sm text-muted-foreground">Interactive mock dashboards powered by synthetic Tealium-like data</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Badge variant="secondary" className="rounded-xl">React + Recharts</Badge>
            <Badge variant="secondary" className="rounded-xl">Tailwind + shadcn/ui</Badge>
          </div>
        </div>
      </header>

      <FiltersBar
        dateRange={dateRange}
        setDateRange={setDateRange}
        channel={channel}
        setChannel={setChannel}
        segment={segment}
        setSegment={setSegment}
      />

      <Tabs defaultValue="performance" className="mt-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-2xl p-1 bg-muted">
          <TabsTrigger value="performance" className="rounded-xl"><BarChart3 className="h-4 w-4 mr-2"/>Performance</TabsTrigger>
          <TabsTrigger value="segments" className="rounded-xl"><Users className="h-4 w-4 mr-2"/>Segments</TabsTrigger>
          <TabsTrigger value="journey" className="rounded-xl"><Globe className="h-4 w-4 mr-2"/>Journeys</TabsTrigger>
          <TabsTrigger value="data" className="rounded-xl"><Database className="h-4 w-4 mr-2"/>Data Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="mt-4">
          <TabPerformance dataset={dataset} channel={channel} />
        </TabsContent>
        <TabsContent value="segments" className="mt-4">
          <TabSegments selectedSegment={segment} />
        </TabsContent>
        <TabsContent value="journey" className="mt-4">
          <TabJourney selectedSegment={segment} />
        </TabsContent>
        <TabsContent value="data" className="mt-4">
          <TabDataQuality dataset={dqDataset} />
        </TabsContent>
      </Tabs>

      <footer className="mt-8 text-xs text-muted-foreground">
        <p>These dashboards use **synthetic data** with realistic shapes. Swap the data layer with Tealium exports or APIs to go live.</p>
      </footer>
    </div>
  );
}
