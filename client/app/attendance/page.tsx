"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

interface AttendanceRecord {
  _id: string;
  emp_id: {
    name: string;
    department: string;
  };
  time: {
    punch_in: string | null;
    punch_out: string | null;
  };
  date: string;
  status: string;
}

export default function Attendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [pageSize, setPageSize] = useState(25);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0] // today
  );

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Fetch attendance data from API
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/attendance/sheet");
        const data = await res.json();
        setRecords(data);
      } catch (err) {
        console.error("Failed to fetch records", err);
      }
    };
    fetchRecords();
  }, []);

  // Filter by selected date
  useEffect(() => {
    if (!records.length) return;

    const filtered = records.filter(
      (r) => r.date.split("T")[0] === selectedDate
    );
    setFilteredRecords(filtered);
  }, [records, selectedDate]);

  // Export Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredRecords.map((r) => ({
        ID: r._id,
        Name: r.emp_id?.name,
        Department: r.emp_id?.department,
        PunchIn: r.time?.punch_in || "-",
        PunchOut: r.time?.punch_out || "-",
        Date: r.date.split("T")[0],
        Status: r.status,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Attendance_${selectedDate}.xlsx`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Attendance Records</h2>

        <div className="flex items-center space-x-4">
          {/* Date filter */}
          <input
            type="date"
            value={selectedDate}
            max={today} // block future dates
            onChange={(e) => {
              const selected = e.target.value;
              if (selected > today) {
                alert("You cannot select a future date");
                return;
              }
              setSelectedDate(selected);
            }}
            className="border p-2 rounded"
          />

          {/* Download Excel */}
          <button
            onClick={exportToExcel}
            className="bg-blue-950 flex gap-2 items-center hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-blue-700 shadow-2xs border-none transition"
          >
            Download Excel
          </button>
        </div>
      </div>

      {/* Page size */}
      <div className="flex justify-end mb-2">
        <label className="mr-2">Show</label>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="border p-1 rounded"
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* Attendance table */}
      <div className="overflow-x-auto shadow-md rounded">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Department</th>
              <th className="border p-2">Punch In</th>
              <th className="border p-2">Punch Out</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.slice(0, pageSize).map((r) => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="border p-2">{r._id}</td>
                <td className="border p-2">{r.emp_id?.name}</td>
                <td className="border p-2">{r.emp_id?.department}</td>
                <td className="border p-2">{r.time?.punch_in || "-"}</td>
                <td className="border p-2">{r.time?.punch_out || "-"}</td>
                <td className="border p-2">{r.date.split("T")[0]}</td>
                <td
                  className={`border p-2 font-semibold ${
                    r.status === "Present"
                      ? "text-green-600"
                      : r.status === "Absent"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {r.status}
                </td>
              </tr>
            ))}
            {!filteredRecords.length && (
              <tr>
                <td colSpan={7} className="text-center p-4 text-gray-500">
                  No records found for {selectedDate}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
