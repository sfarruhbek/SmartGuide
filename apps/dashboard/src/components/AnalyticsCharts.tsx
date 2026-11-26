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

const PIE_COLORS = ['#0E7470', '#0284C7', '#B47B38', '#059669', '#6366F1', '#0F172A'];

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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Visits by Landmark</h2>
            <p className="text-xs text-[#475569]">
              Total AI interactions vs. Snap &amp; Ask photo scans across Ichan-Qala
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-medium text-[#475569]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#0E7470]" />
              Interactions
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#0284C7]" />
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
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="shortName"
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#475569', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }}
                formatter={(value, name, props) => {
                  const payload = props?.payload as { sharePercent?: number } | undefined;
                  if (name === 'AI Interactions' && payload?.sharePercent !== undefined) {
                    return [`${value} (${payload.sharePercent}%)`, name];
                  }
                  return [value, name];
                }}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#0F172A',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                }}
              />
              <Bar dataKey="visits" name="AI Interactions" fill="#0E7470" radius={[6, 6, 0, 0]} />
              <Bar dataKey="photoScans" name="Photo Scans" fill="#0284C7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tourists by Language — PieChart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-5">
        <div className="mb-3">
          <h2 className="text-base font-bold text-[#0F172A]">Tourists by Language</h2>
          <p className="text-xs text-[#475569]">Visitor language &amp; market origin breakdown</p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="h-44 w-44 shrink-0 xl:h-52 xl:w-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.touristsByLanguage}
                  dataKey="tourists"
                  nameKey="language"
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={72}
                  paddingAngle={3}
                >
                  {data.touristsByLanguage.map((entry, idx) => (
                    <Cell
                      key={entry.code}
                      fill={PIE_COLORS[idx % PIE_COLORS.length]}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => {
                    const payload = props?.payload as { sharePercent?: number } | undefined;
                    if (payload?.sharePercent !== undefined) {
                      return [`${value} tourists (${payload.sharePercent}%)`, name];
                    }
                    return [`${value} tourists`, name];
                  }}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0F172A',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="min-w-0 flex-1 w-full space-y-2">
            {data.touristsByLanguage.map((item, idx) => {
              const flag =
                SUPPORTED_LANGUAGES.find((lang) => lang.code === item.code)?.flag ?? '🌐';
              return (
                <div
                  key={item.code}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-xs"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span aria-hidden="true">{flag}</span>
                    <div className="truncate">
                      <span className="font-semibold text-[#0F172A]">{item.language}</span>
                      <span className="ml-1.5 hidden text-[11px] text-[#475569] 2xl:inline">
                        ({item.countryLabel})
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right tabular-nums">
                    <span className="font-bold text-[#0F172A]">{item.tourists}</span>
                    <span className="ml-1.5 text-[#475569]">{item.sharePercent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hourly Engagement Trend — AreaChart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-12">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Hourly Tourist Activity (Last 24h)</h2>
            <p className="text-xs text-[#475569]">
              Real-time visitor engagement across QR scans and AI guide questions
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs tabular-nums text-[#059669]">
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
                <linearGradient id="interactionsGradLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0E7470" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#0E7470" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="hour"
                tick={{ fill: '#475569', fontSize: 11 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#475569', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#0F172A',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                }}
              />
              <Area
                type="monotone"
                dataKey="interactions"
                name="AI Interactions"
                stroke="#0E7470"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#interactionsGradLight)"
              />
              <Area
                type="monotone"
                dataKey="tourists"
                name="Active Tourists"
                stroke="#B47B38"
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
