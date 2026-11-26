import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { calculateEconomics } from '../lib/economics';

const usd = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
export function RevenueSimulator() {
  const [daily, setDaily] = useState(400);
  const [conversion, setConversion] = useState(25);
  const [price, setPrice] = useState(4);
  const [ai, setAi] = useState(0.04);
  const result = calculateEconomics(daily, price, conversion, ai);
  const fields = [
    {
      id: 'daily',
      label: 'Visitors per day · scenario',
      value: daily,
      set: setDaily,
      min: 50,
      max: 2000,
      step: 10,
    },
    {
      id: 'conversion',
      label: 'Paid conversion · % assumption',
      value: conversion,
      set: setConversion,
      min: 0,
      max: 60,
      step: 1,
    },
    {
      id: 'price',
      label: 'Optional pilot package · USD',
      value: price,
      set: setPrice,
      min: 3,
      max: 5,
      step: 1,
    },
  ];
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2 text-sm text-[#0e7470]">
          <Calculator size={18} />
          Pilot economics · assumptions
        </div>
        <h2 className="mt-3 font-display text-2xl text-slate-900">
          What remains after delivery costs?
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Model an optional paid museum package. These are planning scenarios,
          separate from the tourist’s trip budget and actual sales. Museum share
          30%, payment fee 2%, server $43/month.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-7 rounded-2xl border border-slate-200 bg-white p-6">
          {fields.map((field) => (
            <label
              key={field.id}
              htmlFor={`economics-${field.id}`}
              className="block text-xs text-slate-600"
            >
              <span className="flex justify-between gap-4">
                {field.label}
                <strong className="text-[#0e7470]">{field.value}</strong>
              </span>
              <input
                id={`economics-${field.id}`}
                className="mt-4 w-full accent-[#0e7470]"
                type="range"
                min={field.min}
                max={field.max}
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(Number(event.target.value))}
              />
            </label>
          ))}
          <fieldset>
            <legend className="text-xs text-slate-600">
              AI allowance per paid session
            </legend>
            <div className="mt-3 flex gap-2">
              {[0.04, 0.15].map((value) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={ai === value}
                  onClick={() => setAi(value)}
                  className={`rounded-lg border px-4 py-2 text-xs ${ai === value ? 'border-[#0e7470] bg-[#eef7f6] text-[#0e7470]' : 'border-slate-200'}`}
                >
                  ${value.toFixed(2)} {value === 0.15 ? 'stress' : 'base'}
                </button>
              ))}
            </div>
          </fieldset>
          <p className="text-xs leading-6 text-slate-500">
            30-day month. AI allowance is a model, not a maximum or a measured
            nationwide trip cost. No affiliate commission in this scenario.
          </p>
        </div>
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl bg-[#0e7470] p-6 text-white">
            <p className="text-xs uppercase tracking-wider">
              Monthly contribution · before other operating costs
            </p>
            <strong className="mt-4 block text-4xl font-medium">
              {usd(result.contribution)}
            </strong>
            <p className="mt-3 text-sm">
              {result.margin.toFixed(2)}% of gross payments ·{' '}
              {result.buyers.toLocaleString('en-US')} paid sessions
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <dl className="space-y-4 text-sm">
              {[
                ['Gross tourist payments', result.gross],
                ['Museum share · 30%', -result.museum],
                ['Payment processing · 2%', -result.payment],
                ['AI allowance', -result.ai],
                ['Server', -result.server],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex justify-between gap-6">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-medium tabular-nums text-slate-800">
                    {usd(Number(value))}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-6 text-slate-500">
              This contribution excludes salaries, content review, marketing,
              taxes, refunds and affiliate fees. Museum share is revenue before
              the museum’s own costs. Twelve similar months would contribute{' '}
              {usd(result.contribution * 12)}; seasonality is not included.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
