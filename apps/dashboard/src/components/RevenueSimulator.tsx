import { useState } from 'react';
import { Calculator, Cpu, Landmark, TrendingUp, Users } from 'lucide-react';

function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-US').format(val);
}

const SCENARIO_PRESETS = [
  { label: 'Off-Season', daily: 150, price: 4, conversion: 20 },
  { label: 'Khiva Avg', daily: 400, price: 4, conversion: 25 },
  { label: 'Peak / Navruz', daily: 1200, price: 4, conversion: 35 },
  { label: 'Samarkand Scale', daily: 2000, price: 5, conversion: 40 },
] as const;

export function RevenueSimulator() {
  const [dailyTourists, setDailyTourists] = useState<number>(400);
  const [price, setPrice] = useState<number>(4);
  const [conversion, setConversion] = useState<number>(25);

  const monthlyBuyers = Math.round(dailyTourists * (conversion / 100)) * 30;
  const monthlyGross = monthlyBuyers * price;
  const annualGross = monthlyGross * 12;

  const museumMonthlyNet = monthlyGross * 0.3;
  const museumAnnualNet = annualGross * 0.3;

  const smartGuideMonthly = monthlyGross * 0.7;
  const apiCostMonthly = monthlyBuyers * 0.04;
  const grossMarginPercent =
    monthlyGross > 0 ? (((monthlyGross - apiCostMonthly) / monthlyGross) * 100).toFixed(1) : '0.0';

  const museumShareWidth = 30;
  const apiCostShareWidth = monthlyGross > 0 ? Math.min(20, (apiCostMonthly / monthlyGross) * 100) : 0;
  const smartGuideNetWidth = Math.max(0, 100 - museumShareWidth - apiCostShareWidth);

  return (
    <section className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#0E7470]/25 bg-[#EEF7F6] px-3 py-1 text-xs font-semibold text-[#0E7470]">
              <Calculator className="h-3.5 w-3.5" />
              <span>B2B2C Unit Economics Simulator</span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold text-[#0F172A]">
              Museum Revenue &amp; Margin Calculator
            </h2>
            <p className="mt-1 text-sm text-[#475569]">
              Model monthly and annual passive revenue for Ichan-Qala Museum-Reserve with $0 hardware
              investment.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-right">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#475569]">
              Monthly Paying Tourists
            </span>
            <span className="mt-0.5 block text-2xl font-bold tabular-nums text-[#0F172A]">
              {formatNumber(monthlyBuyers)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Interactive Sliders */}
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-5">
          {/* Quick Scenario Presets */}
          <div>
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#475569]">
              Quick Scenarios
            </span>
            <div className="grid grid-cols-2 gap-2">
              {SCENARIO_PRESETS.map((preset) => {
                const isActive =
                  dailyTourists === preset.daily &&
                  price === preset.price &&
                  conversion === preset.conversion;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => {
                      setDailyTourists(preset.daily);
                      setPrice(preset.price);
                      setConversion(preset.conversion);
                    }}
                    className={[
                      'rounded-xl border px-3 py-2 text-left text-xs cursor-pointer',
                      isActive
                        ? 'border-[#0E7470] bg-[#EEF7F6] text-[#0E7470]'
                        : 'border-slate-200 bg-[#F8FAFC] text-[#0F172A] hover:border-[#0E7470]/40',
                    ].join(' ')}
                  >
                    <span className="block font-semibold">{preset.label}</span>
                    <span className="block text-[10px] tabular-nums text-[#475569]">
                      {formatNumber(preset.daily)}/day · ${preset.price} · {preset.conversion}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slider 1: Daily Tourists */}
          <div className="border-t border-slate-100 pt-5">
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="daily-tourists"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F172A]"
              >
                <Users className="h-4 w-4 text-[#0E7470]" />
                <span>Independent Tourists / Day</span>
              </label>
              <span className="rounded-lg border border-slate-200 bg-[#F8FAFC] px-2.5 py-1 text-sm font-bold tabular-nums text-[#0E7470]">
                {formatNumber(dailyTourists)}
              </span>
            </div>
            <input
              id="daily-tourists"
              type="range"
              min={50}
              max={2000}
              step={10}
              value={dailyTourists}
              onChange={(e) => setDailyTourists(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-[#0E7470]"
            />
            <div className="mt-1 flex justify-between text-[11px] tabular-nums text-[#475569]">
              <span>50 / day</span>
              <span>400 (Khiva Avg)</span>
              <span>2,000 / day</span>
            </div>
          </div>

          {/* Slider 2: Ticket Add-on Price */}
          <div className="border-t border-slate-100 pt-5">
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="ticket-price"
                className="text-sm font-semibold text-[#0F172A]"
              >
                QR AI Guide Ticket Add-on
              </label>
              <span className="rounded-lg border border-slate-200 bg-[#F8FAFC] px-2.5 py-1 text-sm font-bold tabular-nums text-[#0F172A]">
                ${price}
              </span>
            </div>
            <div className="mb-3 grid grid-cols-3 gap-2">
              {[3, 4, 5].map((tier) => (
                <button
                  key={tier}
                  type="button"
                  aria-pressed={price === tier}
                  onClick={() => setPrice(tier)}
                  className={[
                    'rounded-xl border py-2 text-sm font-bold tabular-nums cursor-pointer',
                    price === tier
                      ? 'border-[#0E7470] bg-[#0E7470] text-white shadow-xs'
                      : 'border-slate-200 bg-[#F8FAFC] text-[#0F172A] hover:border-[#0E7470]/40',
                  ].join(' ')}
                >
                  ${tier}
                </button>
              ))}
            </div>
            <input
              id="ticket-price"
              type="range"
              min={3}
              max={5}
              step={1}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-[#0E7470]"
            />
          </div>

          {/* Slider 3: Conversion Rate */}
          <div className="border-t border-slate-100 pt-5">
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="conversion-rate"
                className="text-sm font-semibold text-[#0F172A]"
              >
                Ticket Desk Conversion Rate
              </label>
              <span className="rounded-lg border border-slate-200 bg-[#F8FAFC] px-2.5 py-1 text-sm font-bold tabular-nums text-[#0284C7]">
                {conversion}%
              </span>
            </div>
            <input
              id="conversion-rate"
              type="range"
              min={10}
              max={60}
              step={1}
              value={conversion}
              onChange={(e) => setConversion(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-[#0E7470]"
            />
            <div className="mt-1 flex justify-between text-[11px] tabular-nums text-[#475569]">
              <span>10%</span>
              <span>25% Target</span>
              <span>60%</span>
            </div>
          </div>
        </div>

        {/* Right: Financial Output Cards */}
        <div className="space-y-4 lg:col-span-7">
          {/* Hero Card: Museum Net Profit (30% share, $0 investment) */}
          <div className="rounded-2xl bg-gradient-to-br from-[#0E7470] to-[#059669] p-6 text-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-100">
                <Landmark className="h-4 w-4" />
                <span>Museum Net Profit (30% Share · $0 CapEx)</span>
              </span>
              <span className="rounded-full bg-white/15 px-3 py-0.5 text-xs font-semibold text-white">
                Zero Hardware Risk
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <span className="block text-xs font-medium text-emerald-100">Monthly Museum Net</span>
                <span className="mt-1 block text-4xl font-bold tabular-nums tracking-tight">
                  {formatUsd(museumMonthlyNet)}
                </span>
              </div>
              <div className="sm:border-l sm:border-white/20 sm:pl-5">
                <span className="block text-xs font-medium text-emerald-100">Annual Museum Net</span>
                <span className="mt-1 block text-4xl font-bold tabular-nums tracking-tight">
                  {formatUsd(museumAnnualNet)}
                </span>
              </div>
            </div>
          </div>

          {/* 4 Detailed Metric Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
                Gross Revenue (Monthly / Annual)
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold tabular-nums text-[#0F172A]">
                  {formatUsd(monthlyGross)}
                </span>
                <span className="text-xs font-medium text-[#475569]">/ mo</span>
              </div>
              <p className="mt-1 text-xs tabular-nums text-[#475569]">
                Annual Gross: <strong className="text-[#0F172A]">{formatUsd(annualGross)}</strong>
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
                SmartGuide Revenue (70%)
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold tabular-nums text-[#0F172A]">
                  {formatUsd(smartGuideMonthly)}
                </span>
                <span className="text-xs font-medium text-[#475569]">/ mo</span>
              </div>
              <p className="mt-1 text-xs tabular-nums text-[#475569]">
                Annual SmartGuide:{' '}
                <strong className="text-[#0F172A]">{formatUsd(smartGuideMonthly * 12)}</strong>
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
                  Gemini API Cost ($0.04/tourist)
                </span>
                <Cpu className="h-4 w-4 text-[#0284C7]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold tabular-nums text-[#0F172A]">
                  {formatUsd(apiCostMonthly)}
                </span>
                <span className="text-xs font-medium text-[#475569]">/ mo</span>
              </div>
              <p className="mt-1 text-xs tabular-nums text-[#475569]">
                Includes Vision + Verified RAG + Gemini TTS
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
                  Platform Gross Margin
                </span>
                <TrendingUp className="h-4 w-4 text-[#059669]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold tabular-nums text-[#059669]">
                  {grossMarginPercent}%
                </span>
                <span className="text-xs font-medium text-[#475569]">SaaS-grade</span>
              </div>
              <p className="mt-1 text-xs tabular-nums text-[#475569]">
                After Gemini API costs ({formatUsd(monthlyGross - apiCostMonthly)}/mo)
              </p>
            </div>
          </div>

          {/* Visual Breakdown Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="mb-2.5 flex items-center justify-between text-xs font-semibold text-[#0F172A]">
              <span>Revenue &amp; Cost Distribution</span>
              <span className="tabular-nums text-[#475569]">
                100% = {formatUsd(monthlyGross)} / mo
              </span>
            </div>
            <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                style={{ width: `${museumShareWidth}%` }}
                className="bg-[#059669]"
                title="Museum Share (30%)"
              />
              <div
                style={{ width: `${smartGuideNetWidth}%` }}
                className="bg-[#0E7470]"
                title="SmartGuide Net"
              />
              <div
                style={{ width: `${apiCostShareWidth}%` }}
                className="bg-[#0284C7]"
                title="Gemini API Cost"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#475569]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#059669]" />
                Museum Share (30%)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#0E7470]" />
                SmartGuide Platform Net
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#0284C7]" />
                Gemini API Cost (~{(100 - Number(grossMarginPercent)).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
