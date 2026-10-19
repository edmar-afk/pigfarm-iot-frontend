
import React, { useEffect, useState } from "react";
import { Power, RefreshCw } from "lucide-react";

const SERVO_STATUS_API =
  "https://pigfarmbackend.pythonanywhere.com/api/servo-status/";

export default function ServoControl() {
  const [servoActive, setServoActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchServoStatus() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(SERVO_STATUS_API, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (typeof data.servo_active !== "boolean") {
        throw new Error("Invalid servo status response.");
      }

      setServoActive(data.servo_active);
    } catch (err) {
      setError(`Failed to load servo status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function toggleServo() {
    if (servoActive === null || saving) return;

    const requestedState = !servoActive;

    try {
      setSaving(true);
      setError("");

      const response = await fetch(SERVO_STATUS_API, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          servo_active: requestedState,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (typeof data.servo_active !== "boolean") {
        throw new Error("Invalid servo status response.");
      }

      setServoActive(data.servo_active);
    } catch (err) {
      setError(`Failed to update servo: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    fetchServoStatus();

    const interval = setInterval(fetchServoStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Servo Control
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Remotely control your ESP32 servo
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            servoActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          <Power size={24} />
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between rounded-xl bg-gray-50 p-4">
        <div>
          <p className="text-sm text-gray-500">Current Status</p>

          <p
            className={`mt-1 text-xl font-bold ${
              servoActive
                ? "text-green-600"
                : "text-gray-700"
            }`}
          >
            {loading && servoActive === null
              ? "Loading..."
              : servoActive === null
              ? "Unknown"
              : servoActive
              ? "ON"
              : "OFF"}
          </p>
        </div>

        <span
          className={`h-3 w-3 rounded-full ${
            servoActive === null
              ? "bg-gray-400"
              : servoActive
              ? "bg-green-500"
              : "bg-gray-400"
          }`}
        />
      </div>

      <button
        onClick={toggleServo}
        disabled={servoActive === null || saving}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
          servoActive
            ? "bg-red-600 hover:bg-red-700"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        <Power size={18} />
        {saving
          ? "Updating..."
          : servoActive
          ? "Turn Servo OFF"
          : "Turn Servo ON"}
      </button>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <p>{error}</p>

          <button
            onClick={fetchServoStatus}
            className="mt-2 inline-flex items-center gap-2 font-semibold underline"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
