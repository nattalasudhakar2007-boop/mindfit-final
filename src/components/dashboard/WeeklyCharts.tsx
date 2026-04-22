import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  day: string;
  mood: number | null;
  stress: number | null;
  sleep: number | null;
  focus: number | null;
}

interface Props {
  data: ChartDataPoint[];
}

const chartColor = "hsl(221,68%,55%)";
const chartGreen = "hsl(158,40%,45%)";
const chartOrange = "hsl(30,90%,55%)";
const chartAccent = "hsl(262,45%,68%)";

export function WeeklyCharts({ data }: Props) {
  const hasData = data.some((d) => d.mood !== null);

  if (!hasData) {
    return (
      <Card className="rounded-2xl glass-card">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground text-sm">
            Complete a few daily check-ins to see your weekly trends here.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Fill nulls with 0 for chart rendering
  const chartData = data.map((d) => ({
    ...d,
    mood: d.mood ?? 0,
    stress: d.stress ?? 0,
    sleep: d.sleep ?? 0,
    focus: d.focus ?? 0,
  }));

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <Card className="rounded-2xl glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Mood Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,25%,90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="mood" stroke={chartColor} strokeWidth={2.5} dot={{ r: 4, fill: chartColor }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="rounded-2xl glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Stress Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,25%,90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="stress" stroke={chartOrange} fill={chartOrange} fillOpacity={0.15} strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="rounded-2xl glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Sleep Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,25%,90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 12]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="sleep" fill={chartAccent} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="rounded-2xl glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Focus Score</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,25%,90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="focus" stroke={chartGreen} strokeWidth={2.5} dot={{ r: 4, fill: chartGreen }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
