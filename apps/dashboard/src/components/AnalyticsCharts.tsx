import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SUPPORTED_LANGUAGES, type AnalyticsSummary } from '@smartguide/shared';

interface AnalyticsChartsProps {
  data: AnalyticsSummary;
}

const PIE_COLORS = ['#14B8A6', '#D4AF37', '#38BDF8', '#F59E0B', '#A78BFA', '#FB7185'];

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const landmarkChartData = data.visitsByLandmark.map((item) => ({
    ...item,
    shortName: item.name
      .replace(' Minaret', '')
      .replace(' Palace', '')
      .replace(' Fortress', '')
      .replace(' Mausoleum', ''),
  }));

  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      {/* Visits by Landmark — BarChart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg lg:col-span-7">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-white">Visits by Landmark</h2>
            <p className="text-xs text-slate-400">
              Total AI interactions vs. Snap &amp; Ask photo scans across Ichan-Qala
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
              Interactions
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-teal-400" />
              Photo Scans
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={landmarkChartData}
              margin={{ top: 8, right: 12, left: -16, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="shortName"
                tick={{ fill: '#CBD5E1', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#F8FAFC',
                }}
              />
              <Bar dataKey="visits" name="AI Interactions" fill="#D4AF37" radius={[6, 6, 0, 0]} />
              <Bar dataKey="photoScans" name="Photo Scans" fill="#14B8A6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tourists by Language — PieChart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg lg:col-span-5">
        <div className="mb-3">
          <h2 className="font-display text-lg font-bold text-white">Tourists by Language</h2>
          <p className="text-xs text-slate-400">Visitor language &amp; market origin breakdown</p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="h-56 w-56 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.touristsByLanguage}
                  dataKey="tourists"
                  nameKey="language"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={84}
                  paddingAngle={3}
                >
                  {data.touristsByLanguage.map((entry, idx) => (
                    <Cell
                      key={entry.code}
                      fill={PIE_COLORS[idx % PIE_COLORS.length]}
                      stroke="#0F172A"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full space-y-2">
            {data.touristsByLanguage.map((item, idx) => {
              const flag =
                SUPPORTED_LANGUAGES.find((lang) => lang.code === item.code)?.flag ?? '🌐';
              return (
                <div
                  key={item.code}
                  className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span aria-hidden="true">{flag}</span>
                    <div className="truncate">
                      <span className="font-semibold text-slate-100">{item.language}</span>
                      <span className="ml-1.5 text-[11px] text-slate-500 hidden xl:inline">
                        ({item.countryLabel})
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 tabular-nums text-right">
                    <span className="font-bold text-white">{item.tourists}</span>
                    <span className="ml-1.5 text-slate-400">{item.sharePercent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hourly Engagement Trend — AreaChart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg lg:col-span-12">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Hourly Tourist Activity (Last 24h UTC)
            </h2>
            <p className="text-xs text-slate-400">
              Real-time visitor engagement across QR scans and AI guide questions
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
            API Cost-to-Serve: <strong>${data.revenue.estimatedApiCostPerTouristUsd}/tourist</strong>{' '}
            · Total API Cost: <strong>${data.revenue.totalEstimatedApiCostUsd.toFixed(2)}</strong>
          </div>
        </div>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.hourlyActivity}
              margin={{ top: 8, right: 16, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="interactionsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="hour"
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#F8FAFC',
                }}
              />
              <Area
                type="monotone"
                dataKey="interactions"
                name="AI Interactions"
                stroke="#14B8A6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#interactionsGrad)"
              />
              <Area
                type="monotone"
                dataKey="tourists"
                name="Active Tourists"
                stroke="#D4AF37"
                strokeWidth={2}
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
