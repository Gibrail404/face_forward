"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";

// 👇 Dynamically import Plot with SSR disabled
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface AttendanceData {
  date: string;
  HR: number;
  Finance: number;
  Technology: number;
  Admin: number;
}

export default function AttendanceStats() {
  const [todayData, setTodayData] = useState<AttendanceData | null>(null);
  const [last7DaysData, setLast7DaysData] = useState<AttendanceData[]>([]);
  const { value } = useAuth({ redirectTo: "/login", verifyWithServer: true });
  const { checking, isAuthed } = value;

  useEffect(() => {
    // ✅ Mock Data - replace with API call
    if (!isAuthed) return;
    const today = {
      date: new Date().toISOString().split("T")[0],
      HR: 12,
      Finance: 8,
      Technology: 15,
      Admin: 6,
    };

    const last7 = [
      { date: "2025-09-01", HR: 10, Finance: 7, Technology: 14, Admin: 5 },
      { date: "2025-09-02", HR: 11, Finance: 6, Technology: 13, Admin: 4 },
      { date: "2025-09-03", HR: 12, Finance: 8, Technology: 15, Admin: 6 },
      { date: "2025-09-04", HR: 9, Finance: 5, Technology: 12, Admin: 4 },
      { date: "2025-09-05", HR: 14, Finance: 9, Technology: 16, Admin: 7 },
      { date: "2025-09-06", HR: 13, Finance: 7, Technology: 14, Admin: 6 },
      { date: "2025-09-07", HR: 12, Finance: 8, Technology: 15, Admin: 6 },
    ];

    setTodayData(today);
    setLast7DaysData(last7);
  }, []);
  if (checking) return <div className="min-h-screen flex items-center justify-center">Checking auth...</div>;

  if (!isAuthed) return null;


  return (
    <>
    <Navbar />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 mt-[63px]">
      {/* 📊 Date wise Attendance (Today) */}
      <div className="bg-[#FAF9F6] rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold mb-4">
          Date wise Attendance (Today)
        </h2>
        {todayData ? (
          <Plot
            data={[
              {
                type: "bar",
                x: ["HR", "Finance", "Technology", "Admin"],
                y: [todayData.HR, todayData.Finance, todayData.Technology, todayData.Admin],
                marker: { color: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"] },
              },
            ]}
            layout={{
              title: `Attendance on ${todayData.date}`,
              xaxis: { title: "Department" },
              yaxis: { title: "No. of Employees" },
              autosize: true,
            }}
            style={{ width: "100%", height: "400px" }}
          />
        ) : (
          <p>No data available</p>
        )}
      </div>

      {/* 📊 Date wise Attendance (Last 7 Days) */}
      <div className="bg-[#FAF9F6] rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold mb-4">
          Date wise Attendance (Last 7 Working Days)
        </h2>
        {last7DaysData.length > 0 ? (
          <Plot
            data={[
              {
                type: "bar",
                name: "HR",
                x: last7DaysData.map((d) => d.date),
                y: last7DaysData.map((d) => d.HR),
              },
              {
                type: "bar",
                name: "Finance",
                x: last7DaysData.map((d) => d.date),
                y: last7DaysData.map((d) => d.Finance),
              },
              {
                type: "bar",
                name: "Technology",
                x: last7DaysData.map((d) => d.date),
                y: last7DaysData.map((d) => d.Technology),
              },
              {
                type: "bar",
                name: "Admin",
                x: last7DaysData.map((d) => d.date),
                y: last7DaysData.map((d) => d.Admin),
              },
            ]}
            layout={{
              barmode: "group",
              title: "Attendance (Last 7 Working Days)",
              xaxis: { title: "Date" },
              yaxis: { title: "No. of Employees" },
              autosize: true,
            }}
            style={{ width: "100%", height: "400px" }}
          />
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
    </>
  );
}
