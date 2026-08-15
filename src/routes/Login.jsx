import React, { useEffect, useState } from "react";

function Login() {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await fetch(
          "https://pigfarmbackend.pythonanywhere.com/api/temperature-humidity/latest/",
        );

        if (!response.ok) {
          throw new Error("Django API request failed");
        }

        const data = await response.json();

        setTemperature(data.temperature);
        setHumidity(data.humidity);
        setError("");
      } catch (error) {
        console.error("Django connection error:", error);
        setError("Cannot connect to sensor backend");
      }
    };

    fetchSensorData();

    // Update every 3 seconds
    const interval = setInterval(fetchSensorData, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>ESP32 Sensor</h1>

      {temperature !== null && humidity !== null ? (
        <>
          <p>Temperature: {temperature.toFixed(2)} °C</p>
          <p>Humidity: {humidity.toFixed(2)} %</p>
        </>
      ) : (
        <p>Waiting for sensor...</p>
      )}

      {error && <p>{error}</p>}
    </div>
  );
}

export default Login;
