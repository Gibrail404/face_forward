"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Chatbot from "../help/page";
import api from "@/utils/api"; // ✅ use your axios wrapper

// Dynamically import Plot with SSR disabled
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface AttendanceRecord {
  _id: string;
  emp_id: string;
  name: string;
  department: string;
  date: string;
  status: string;
}

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
    if (!isAuthed) return;

    const fetchData = async () => {
      try {
        const res = await api.get("api/attendance/sheet");
        if (res.status !== 200) return;

        const records: AttendanceRecord[] = res.data;

        // ✅ Group by date + department
        const grouped: Record<string, AttendanceData> = {};

        records.forEach((rec) => {
          const date = rec.date.split("T")[0];
          if (!grouped[date]) {
            grouped[date] = {
              date,
              HR: 0,
              Finance: 0,
              Technology: 0,
              Admin: 0,
            };
          }
          if (rec.status === "Present") {
            if (rec.department in grouped[date]) {
              grouped[date][rec.department as keyof AttendanceData]++;
            }
          }
        });

        // Sort by date
        const allDates = Object.values(grouped).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const today = new Date().toISOString().split("T")[0];
        setTodayData(allDates.find((d) => d.date === today) || null);

        // Last 7 working days
        setLast7DaysData(allDates.slice(-7));
      } catch (err) {
        console.error("Failed to fetch attendance stats:", err);
      }
    };

    fetchData();
  }, [isAuthed]);

  if (checking)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking auth...
      </div>
    );

  if (!isAuthed) return null;

  return (
    <>
      <Navbar />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 mt-[63px]">
        {/* 📊 Today’s Attendance */}
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
                  y: [
                    todayData.HR,
                    todayData.Finance,
                    todayData.Technology,
                    todayData.Admin,
                  ],
                  marker: {
                    color: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"],
                  },
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
            <p>No data available for today</p>
          )}
        </div>

        {/* 📊 Last 7 Days */}
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
        <Chatbot />
      </div>
    </>
  );
}
