/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Droplets,
  Thermometer,
  Activity,
  Clock3,
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  CircleCheck,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import ServoControl from "../components/ServoControl";
import Topbar from "../components/TopBar";

const API_BASE = "https://pigfarmbackend.pythonanywhere.com/api";

const TEMPERATURE_API = `${API_BASE}/temperature-humidity/latest/`;
const WATER_LEVEL_API = `${API_BASE}/water-level/latest/`;

// Must match the actual tank height configured on the ESP32.
const TANK_HEIGHT_CM = 100;

const REFRESH_INTERVAL_MS = 5000;

function formatTime(timestamp) {
  if (!timestamp) return "Waiting for data";

  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getLatestRecord(data) {
  // Supports either a single object or a non-empty list.
  if (Array.isArray(data)) {
    return data.length > 0 ? data[0] : null;
  }

  return data && typeof data === "object" ? data : null;
}

function getWeatherCondition(temperature, humidity) {
  if (temperature == null || humidity == null) {
    return {
      label: "Waiting for sensor",
      icon: CloudSun,
      color: "text-slate-400",
    };
  }

  if (humidity >= 80) {
    return temperature >= 30
      ? {
          label: "Hot and humid",
          icon: CloudRain,
          color: "text-indigo-500",
        }
      : {
          label: "Humid",
          icon: Cloud,
          color: "text-sky-500",
        };
  }

  if (temperature >= 30) {
    return {
      label: "Hot",
      icon: Sun,
      color: "text-amber-500",
    };
  }

  if (temperature >= 24 && humidity >= 50) {
    return {
      label: "Partly cloudy",
      icon: CloudSun,
      color: "text-sky-500",
    };
  }

  if (temperature < 24 && humidity < 60) {
    return {
      label: "Cool and dry",
      icon: Sun,
      color: "text-amber-500",
    };
  }

  return {
    label: "Cloudy",
    icon: Cloud,
    color: "text-slate-500",
  };
}

function StatCard({
  title,
  value,
  unit,
  description,
  percentage,
  icon: Icon,
  color,
  loading,
  error,
  updatedAt,
}) {
  const styles = {
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

  const colors = styles[color] || styles.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.04)]"
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-slate-50" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colors.iconBg} ${colors.iconText} ring-8 ${colors.ring}`}
          >
            <Icon size={22} />
          </div>

          {error ? (
            <AlertTriangle className="text-amber-500" size={20} />
          ) : (
            <Activity className="text-emerald-500" size={20} />
          )}
        </div>

        <p className="mt-7 text-sm font-medium text-slate-500">{title}</p>

        <div className="mt-2 flex items-baseline gap-2">
          <h3 className="text-[34px] font-semibold tracking-tight text-slate-900">
            {loading && value == null ? "..." : value == null ? "--" : value}
          </h3>

          <span className="text-sm font-medium text-slate-400">{unit}</span>
        </div>

        <p className="mt-1 text-xs text-slate-400">{description}</p>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500">
              {title === "Water Level" ? "Tank fill level" : "Sensor status"}
            </span>

            <span className="font-semibold text-slate-700">
              {percentage == null ? "--" : `${percentage.toFixed(1)}%`}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, Math.max(0, percentage ?? 0))}%`,
              }}
              transition={{ duration: 0.7 }}
              className={`h-full rounded-full ${colors.bar}`}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              error ? "bg-amber-500" : loading ? "bg-sky-500" : "bg-emerald-500"
            }`}
          />

          <span className="text-xs text-slate-500">
            {error
              ? "Connection error"
              : loading
                ? "Updating..."
                : "Latest reading received"}
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-400">
          Last successful update: {formatTime(updatedAt)}
        </p>

        {error && (
          <p className="mt-2 break-words text-xs text-amber-700">{error}</p>
        )}
      </div>
    </motion.div>
  );
}

function Dashboard() {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [waterLevel, setWaterLevel] = useState(null);

  const [temperatureUpdatedAt, setTemperatureUpdatedAt] = useState(null);
  const [waterUpdatedAt, setWaterUpdatedAt] = useState(null);

  const [temperatureError, setTemperatureError] = useState("");
  const [waterError, setWaterError] = useState("");

  const [temperatureLoading, setTemperatureLoading] = useState(true);
  const [waterLoading, setWaterLoading] = useState(true);

  const fetchTemperatureData = async () => {
    try {
      const response = await fetch(TEMPERATURE_API, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      const data = getLatestRecord(result);

      if (
        !data ||
        data.temperature == null ||
        data.humidity == null ||
        !Number.isFinite(Number(data.temperature)) ||
        !Number.isFinite(Number(data.humidity))
      ) {
        throw new Error("No valid temperature/humidity reading found.");
      }

      setTemperature(Number(data.temperature));
      setHumidity(Number(data.humidity));
      setTemperatureUpdatedAt(Date.now());
      setTemperatureError("");
    } catch (error) {
      console.error("Temperature API error:", error);
      setTemperatureError(error.message || "Unable to load sensor data.");
    } finally {
      setTemperatureLoading(false);
    }
  };

  const fetchWaterLevelData = async () => {
    try {
      const response = await fetch(WATER_LEVEL_API, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      const data = getLatestRecord(result);

      if (
        !data ||
        data.level_cm == null ||
        !Number.isFinite(Number(data.level_cm))
      ) {
        throw new Error("No valid water-level reading found.");
      }

      const level = Number(data.level_cm);

      if (level < 0 || level > TANK_HEIGHT_CM) {
        throw new Error(
          `Water depth ${level} cm is outside the configured tank height.`,
        );
      }

      setWaterLevel(level);
      setWaterUpdatedAt(Date.now());
      setWaterError("");
    } catch (error) {
      console.error("Water-level API error:", error);
      setWaterError(error.message || "Unable to load water-level data.");
    } finally {
      setWaterLoading(false);
    }
  };

  useEffect(() => {
    fetchTemperatureData();
    fetchWaterLevelData();

    const temperatureInterval = setInterval(
      fetchTemperatureData,
      REFRESH_INTERVAL_MS,
    );

    const waterInterval = setInterval(fetchWaterLevelData, REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(temperatureInterval);
      clearInterval(waterInterval);
    };
  }, []);

  const waterPercentage =
    waterLevel == null ? null : (waterLevel / TANK_HEIGHT_CM) * 100;

  const weather = getWeatherCondition(temperature, humidity);
  const WeatherIcon = weather.icon;

  const overallError = Boolean(temperatureError || waterError);

  return (
    <>
    <Topbar/>
      <div className="min-h-screen bg-[#f6f8f4] px-4 py-6 sm:px-6 lg:px-8 pt-32">
        <div className="mx-auto max-w-[1600px]">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    overallError ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                />

                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Pig Pen Overview
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Pig Pen Monitoring
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Monitor water storage, temperature, and humidity using live
                readings from your ESP32 sensors.
              </p>
            </div>

            <div className="w-full lg:max-w-sm">
              <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <WeatherIcon size={25} className={weather.color} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Environment
                    </p>

                    <p className="mt-1 text-lg font-semibold text-slate-800">
                      {weather.label}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200/70 pt-3">
                  <div>
                    <p className="text-xs text-slate-400">Temperature</p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {temperature == null
                        ? "--"
                        : `${temperature.toFixed(1)} °C`}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Humidity</p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {humidity == null ? "--" : `${humidity.toFixed(1)}%`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.header>

          {/* Status banner */}
          <section className="mb-7 overflow-hidden rounded-[28px] bg-[#173B2F] shadow-lg">
            <div className="flex flex-col gap-5 px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                  {overallError ? (
                    <AlertTriangle size={23} />
                  ) : (
                    <CircleCheck size={23} />
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {overallError
                      ? "Sensor connection needs attention"
                      : "Pig Pen monitoring active"}
                  </h2>

                  <p className="mt-1.5 text-sm text-emerald-100/70">
                    {overallError
                      ? "One or more sensor APIs could not provide a current reading. Previously received values are retained."
                      : "Water level, temperature, and humidity are being monitored."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-emerald-100/80">
                <Clock3 size={16} />
                Refreshes every 5 seconds
              </div>
            </div>
          </section>

          {/* Live sensor cards */}
          <section className="mb-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Live sensor readings
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Latest values received from the Django backend
              </p>
            </div>

            {/* <ServoControl /> */}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <StatCard
                title="Water Level"
                value={waterLevel == null ? null : waterLevel.toFixed(2)}
                unit="cm"
                description={`Tank height: ${TANK_HEIGHT_CM} cm`}
                percentage={waterPercentage}
                icon={Droplets}
                color="blue"
                loading={waterLoading}
                error={waterError}
                updatedAt={waterUpdatedAt}
              />

              <StatCard
                title="Temperature"
                value={temperature == null ? null : temperature.toFixed(2)}
                unit="°C"
                description="Measured by DHT22"
                percentage={
                  temperature == null
                    ? null
                    : Math.min(100, Math.max(0, (temperature / 40) * 100))
                }
                icon={Thermometer}
                color="green"
                loading={temperatureLoading}
                error={temperatureError}
                updatedAt={temperatureUpdatedAt}
              />

              <StatCard
                title="Humidity"
                value={humidity == null ? null : humidity.toFixed(2)}
                unit="%"
                description="Measured by DHT22"
                percentage={humidity}
                icon={Wind}
                color="blue"
                loading={temperatureLoading}
                error={temperatureError}
                updatedAt={temperatureUpdatedAt}
              />
            </div>
          </section>

          {/* Water details and sensor status */}
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm sm:p-7"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <Droplets size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Water Storage
                  </h2>
                  <p className="text-xs text-slate-400">
                    Ultrasonic sensor measurement
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">
                      Current water depth
                    </p>

                    <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900">
                      {waterLevel == null
                        ? "--"
                        : `${waterLevel.toFixed(2)} cm`}
                    </p>
                  </div>

                  <p className="text-lg font-semibold text-sky-600">
                    {waterPercentage == null
                      ? "--"
                      : `${waterPercentage.toFixed(1)}%`}
                  </p>
                </div>

                <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(100, Math.max(0, waterPercentage ?? 0))}%`,
                    }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600"
                  />
                </div>

                <div className="mt-3 flex justify-between text-xs text-slate-400">
                  <span>0 cm</span>
                  <span>{TANK_HEIGHT_CM} cm</span>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Empty tank distance</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {waterLevel == null
                      ? "--"
                      : `${(TANK_HEIGHT_CM - waterLevel).toFixed(2)} cm`}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Last successful update
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {formatTime(waterUpdatedAt)}
                  </p>
                </div>
              </div>

              {waterError && (
                <p className="mt-4 text-sm text-amber-700">
                  Water API: {waterError}
                </p>
              )}
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm sm:p-7"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Sensor Status
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    API connection and data freshness
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    fetchTemperatureData();
                    fetchWaterLevelData();
                  }}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <RefreshCw size={14} />
                  Refresh
                </button>
              </div>

              <div className="mt-7 space-y-5">
                <SensorStatus
                  title="AJ-SR04M Water Sensor"
                  endpoint="/api/water-level/latest/"
                  loading={waterLoading}
                  error={waterError}
                  updatedAt={waterUpdatedAt}
                  value={
                    waterLevel == null
                      ? "No reading"
                      : `${waterLevel.toFixed(2)} cm`
                  }
                />

                <SensorStatus
                  title="DHT22 Temperature/Humidity"
                  endpoint="/api/temperature-humidity/latest/"
                  loading={temperatureLoading}
                  error={temperatureError}
                  updatedAt={temperatureUpdatedAt}
                  value={
                    temperature == null || humidity == null
                      ? "No reading"
                      : `${temperature.toFixed(1)} °C / ${humidity.toFixed(1)}%`
                  }
                />
              </div>

              <div className="mt-7 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <Activity size={18} className="mt-0.5 text-emerald-600" />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Automatic monitoring
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      The dashboard checks both endpoints every five seconds. If
                      a request fails, the last successfully received value
                      remains visible until new data arrives.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </>
  );
}

function SensorStatus({ title, endpoint, loading, error, updatedAt, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="mt-1 break-all text-xs text-slate-400">{endpoint}</p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            error
              ? "bg-amber-50 text-amber-700"
              : loading
                ? "bg-sky-50 text-sky-700"
                : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {error ? "Error" : loading ? "Loading" : "Responding"}
        </span>
      </div>

      <p className="mt-4 text-lg font-semibold text-slate-900">{value}</p>

      <p className="mt-1 text-xs text-slate-400">
        Last successful update: {formatTime(updatedAt)}
      </p>

      {error && (
        <p className="mt-2 break-words text-xs text-amber-700">{error}</p>
      )}
    </div>
  );
}

export default Dashboard;
