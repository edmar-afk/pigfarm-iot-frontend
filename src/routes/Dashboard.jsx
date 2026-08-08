/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import {
  Droplets,
  Thermometer,
  Wheat,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  MoreHorizontal,
  ArrowUpRight,
  Activity,
  Clock3,
  CloudSun,
  Sun,
  Wind,
  CircleCheck,
  AlertTriangle,
} from "lucide-react";

const stats = [
  {
    title: "Remaining Feed",
    value: "186.4",
    unit: "kg",
    description: "Estimated 4.2 days remaining",
    percentage: 72,
    icon: Wheat,
    trend: "-8.2%",
    trendLabel: "from last week",
    trendDown: true,
    accent: "amber",
  },
  {
    title: "Water Remaining",
    value: "1,284",
    unit: "L",
    description: "Tank capacity: 2,000 L",
    percentage: 64,
    icon: Droplets,
    trend: "+4.6%",
    trendLabel: "usage efficiency",
    trendDown: false,
    accent: "blue",
  },
  {
    title: "Pig Pen Temperature",
    value: "27.4",
    unit: "°C",
    description: "Optimal range: 24–30°C",
    percentage: 82,
    icon: Thermometer,
    trend: "Optimal",
    trendLabel: "environment status",
    trendDown: false,
    accent: "green",
  },
];

const recentActivity = [
  {
    title: "Feed consumption recorded",
    description: "12.6 kg consumed",
    time: "12 min ago",
    type: "feed",
  },
  {
    title: "Water level updated",
    description: "Tank level is now at 64%",
    time: "28 min ago",
    type: "water",
  },
  {
    title: "Temperature stabilized",
    description: "Pig Pen returned to optimal range",
    time: "1 hr ago",
    type: "temperature",
  },
];

function StatCard({ stat, index }) {
  const Icon = stat.icon;

  const accentStyles = {
    amber: {
      iconBg: "bg-amber-50",
      iconText: "text-amber-600",
      bar: "bg-amber-500",
      ring: "ring-amber-100",
    },
    blue: {
      iconBg: "bg-sky-50",
      iconText: "text-sky-600",
      bar: "bg-sky-500",
      ring: "ring-sky-100",
    },
    green: {
      iconBg: "bg-emerald-50",
      iconText: "text-emerald-600",
      bar: "bg-emerald-500",
      ring: "ring-emerald-100",
    },
  };
  const colors = accentStyles[stat.accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -5,
        transition: { duration: 0.2 },
      }}
      className="group relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.04)]"
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-slate-50 transition-transform duration-500 group-hover:scale-150" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colors.iconBg} ${colors.iconText} ring-8 ${colors.ring}`}
          >
            <Icon size={22} strokeWidth={2} />
          </div>

          <button className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700">
            <MoreHorizontal size={20} />
          </button>
        </div>

        <div className="mt-7">
          <p className="text-sm font-medium text-slate-500">{stat.title}</p>

          <div className="mt-2 flex items-end gap-2">
            <h3 className="text-[34px] font-semibold tracking-[-0.04em] text-slate-900">
              {stat.value}
            </h3>
            <span className="mb-1.5 text-sm font-medium text-slate-400">
              {stat.unit}
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-400">{stat.description}</p>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500">Current level</span>
            <span className="font-semibold text-slate-700">
              {stat.percentage}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stat.percentage}%` }}
              transition={{
                duration: 1,
                delay: 0.35 + index * 0.1,
                ease: "easeOut",
              }}
              className={`h-full rounded-full ${colors.bar}`}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          {stat.trendDown ? (
            <TrendingDown size={15} className="text-amber-500" />
          ) : (
            <TrendingUp size={15} className="text-emerald-500" />
          )}

          <span
            className={`text-xs font-semibold ${
              stat.trendDown ? "text-amber-600" : "text-emerald-600"
            }`}
          >
            {stat.trend}
          </span>

          <span className="text-xs text-slate-400">{stat.trendLabel}</span>
        </div>
      </div>
    </motion.div>
  );
}

function Dashboard() {
  return (
    <div className="min-h-screen bg-[#f6f8f4] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        {/* =========================================================
            HEADER
        ========================================================== */}
        <motion.header
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]" />

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Pig Pen Overview
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-900 sm:text-4xl">
              Good morning, Pig Pen Manager.
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Here's what's happening across your pig Pig Pen today. Everything
              looks stable and within the expected range.
            </p>
          </div>

          <div className="w-full">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4 shadow-sm">
              {/* Decorative glow */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sky-200/30 blur-2xl" />

              <div className="relative flex items-center justify-between gap-4">
                {/* Weather icon + status */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                    <CloudSun size={25} className="text-sky-500" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Pig Pen Temperature
                      </p>

                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-medium text-emerald-600">
                        Live
                      </span>
                    </div>

                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                      Partly Cloudy
                    </p>
                  </div>
                </div>

                {/* Temperature */}
                <div className="text-right">
                  <p className="text-2xl font-bold tracking-tight text-slate-900">
                    28°
                  </p>
                  <p className="text-[11px] font-medium text-slate-400">
                    Feels like 29°
                  </p>
                </div>
              </div>

              {/* Weather details */}
              <div className="relative mt-4 grid grid-cols-3 gap-2 border-t border-slate-200/70 pt-3">
                <div className="rounded-xl bg-white/70 px-3 py-2">
                  <p className="text-[10px] font-medium text-slate-400">
                    Humidity
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-700">
                    76%
                  </p>
                </div>

                <div className="rounded-xl bg-white/70 px-3 py-2">
                  <p className="text-[10px] font-medium text-slate-400">Wind</p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-700">
                    12 km/h
                  </p>
                </div>

                <div className="rounded-xl bg-white/70 px-3 py-2">
                  <p className="text-[10px] font-medium text-slate-400">Rain</p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-700">
                    20%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* =========================================================
            Pig Pen STATUS BANNER
        ========================================================== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-7 overflow-hidden rounded-[28px] bg-[#173B2F] shadow-[0_20px_60px_rgba(23,59,47,0.15)]"
        >
          <div className="relative px-6 py-6 sm:px-8">
            {/* Background decoration */}
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/[0.04]" />
            <div className="pointer-events-none absolute -bottom-32 right-48 h-72 w-72 rounded-full bg-emerald-400/[0.04]" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-300/20">
                  <CircleCheck size={23} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-white">
                      Pig Pen operating normally
                    </h2>

                    <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-300/20">
                      All systems good
                    </span>
                  </div>

                  <p className="mt-1.5 text-sm text-emerald-100/60">
                    Feed, water, and environmental conditions are being
                    monitored continuously.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-8">
                <div>
                  <p className="text-xs text-emerald-100/50">Last updated</p>
                  <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-white">
                    <Clock3 size={14} />
                    10:42 AM
                  </div>
                </div>

                <div className="hidden h-10 w-px bg-white/10 sm:block" />

                <div>
                  <p className="text-xs text-emerald-100/50">Active Sensors</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    3 / 3 online
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* =========================================================
            STAT CARDS
        ========================================================== */}
        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Pig Pen resources
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Current inventory and environmental readings
              </p>
            </div>

            <button className="hidden items-center gap-1 text-xs font-semibold text-emerald-700 transition hover:text-emerald-900 sm:flex">
              View detailed report
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat, index) => (
              <StatCard key={stat.title} stat={stat} index={index} />
            ))}
          </div>
        </section>

        {/* =========================================================
            LOWER CONTENT
        ========================================================== */}
        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">
          {/* Resource overview */}
          <motion.section
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4 }}
            className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.04)] sm:p-7"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  Resource overview
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Current Pig Pen capacity utilization
                </p>
              </div>

              <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
                Today
              </button>
            </div>

            <div className="mt-8 space-y-7">
              {/* Feed */}
              <ResourceRow
                icon={Wheat}
                iconClass="bg-amber-50 text-amber-600"
                title="Feed Inventory"
                value="186.4 kg"
                percentage={72}
                status="Healthy"
                barClass="bg-amber-500"
              />

              {/* Water */}
              <ResourceRow
                icon={Droplets}
                iconClass="bg-sky-50 text-sky-600"
                title="Water Storage"
                value="1,284 L"
                percentage={64}
                status="Healthy"
                barClass="bg-sky-500"
              />

              {/* Temperature */}
              <ResourceRow
                icon={Thermometer}
                iconClass="bg-emerald-50 text-emerald-600"
                title="Temperature"
                value="27.4°C"
                percentage={82}
                status="Optimal"
                barClass="bg-emerald-500"
              />
            </div>

            {/* Mini weather section */}
            <div className="mt-8 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-3">
              <WeatherItem icon={Sun} title="Daylight" value="11h 42m" />

              <WeatherItem icon={Wind} title="Wind" value="12 km/h" />

              <WeatherItem icon={CloudSun} title="Humidity" value="68%" />
            </div>
          </motion.section>

          {/* Recent activity */}
          <motion.section
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.5 }}
            className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.04)] sm:p-7"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  Recent activity
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Latest Pig Pen events
                </p>
              </div>

              <button className="text-xs font-semibold text-emerald-700 hover:text-emerald-900">
                View all
              </button>
            </div>

            <div className="mt-7 space-y-1">
              {recentActivity.map((activity, index) => (
                <ActivityItem
                  key={activity.title}
                  activity={activity}
                  index={index}
                />
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   RESOURCE ROW
========================================================= */

function ResourceRow({
  icon: Icon,
  iconClass,
  title,
  value,
  percentage,
  status,
  barClass,
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
          >
            <Icon size={18} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">{title}</p>
            <p className="mt-0.5 text-xs text-slate-400">{status}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm font-semibold text-slate-800">{value}</p>
          <p className="mt-0.5 text-xs text-slate-400">{percentage}%</p>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${barClass}`}
        />
      </div>
    </div>
  );
}

/* =========================================================
   WEATHER ITEM
========================================================= */

function WeatherItem({ icon: Icon, title, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
        <Icon size={17} />
      </div>

      <div>
        <p className="text-[11px] text-slate-400">{title}</p>
        <p className="mt-0.5 text-xs font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );
}

/* =========================================================
   ACTIVITY ITEM
========================================================= */

function ActivityItem({ activity, index }) {
  const icons = {
    feed: Wheat,
    water: Droplets,
    temperature: Thermometer,
  };

  const Icon = icons[activity.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 + index * 0.1 }}
      className="group flex gap-3 rounded-2xl p-3 transition hover:bg-slate-50"
    >
      <div className="relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Icon size={17} />
        </div>

        {index !== recentActivity.length - 1 && (
          <div className="absolute left-1/2 top-12 h-5 w-px -translate-x-1/2 bg-slate-100" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col justify-between gap-1 sm:flex-row">
          <p className="text-xs font-semibold text-slate-800">
            {activity.title}
          </p>

          <span className="shrink-0 text-[10px] font-medium text-slate-400">
            {activity.time}
          </span>
        </div>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          {activity.description}
        </p>
      </div>
    </motion.div>
  );
}

export default Dashboard;
