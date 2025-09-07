"use client";

import api from "@/utils/api";
import { useState, useEffect } from "react";

interface Employee {
  _id: string;
  emp_id: string;
  name: string;
  department: string;
  email: string;
  hiringDate: string;
}

export default function AllEmployees({updateUser, setUpdateUser}: {updateUser: any, setUpdateUser: any}) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  // 🔹 Fetch employees
  const fetchEmployees = async () => {
    try {
      const {data} = await api.get('/api/employees/list');

      if (Array.isArray(data)) {
        setEmployees(data);
      } else if (Array.isArray(data?.data)) {
        setEmployees(data?.data);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedEmployees = employees.slice(startIndex, endIndex);
  const totalPages = Math.ceil(employees.length / limit);

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(e.target.value));
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/employees/delete/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) fetchEmployees();
    } catch (err) {
      console.error("Failed to delete employee:", err);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg mt-10 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-950">All Employees</h1>

      {paginatedEmployees.length === 0 ? (
        <div className="flex justify-center">
          <img src="/static/NoRec.png" alt="NoRecord" className="w-[70%] object-none" />
        </div>
      ) : (
        <>
          <div className="flex justify-between mb-4 items-center">
            <div className="flex gap-4 mb-4">
              Show{" "}
              <select
                value={limit}
                onChange={handleLimitChange}
                className="border px-2 py-1 rounded"
              >
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>{" "}
              entries
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full rounded-lg bg-white p-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className=" px-4 py-2  text-blue-950">SNo</th>
                  <th className=" px-4 py-2  text-blue-950">ID</th>
                  <th className=" px-4 py-2  text-blue-950">Name</th>
                  <th className=" px-4 py-2  text-blue-950">Dept</th>
                  <th className=" px-4 py-2  text-blue-950">Email</th>
                  <th className=" px-4 py-2  text-blue-950">Hiring Date</th>
                  <th className=" px-4 py-2  text-blue-950">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEmployees.map((emp, index) => (
                  <tr key={emp._id} className="text-center hover:bg-gray-50 bg-white">
                    <td className="border-b-slate-300 border-b-2 px-4 py-2">
                      {startIndex + index + 1}
                    </td>
                    <td className="border-b-slate-300 border-b-2 px-4 py-2">{emp.emp_id}</td>
                    <td className="border-b-slate-300 border-b-2 px-4 py-2">{emp.name}</td>
                    <td className="border-b-slate-300 border-b-2 px-4 py-2">{emp.department}</td>
                    <td className="border-b-slate-300 border-b-2 px-4 py-2">{emp.email}</td>
                    <td className="border-b-slate-300 border-b-2 px-4 py-2">
                      {emp.hiringDate
                        ? new Date(emp.hiringDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="border-b-slate-300 border-b-2 px-4 py-2 space-x-2">
                      <button onClick={() => setUpdateUser(emp)} className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                        Update
                      </button>
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => handleDelete(emp._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🔹 Pagination controls */}
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-3 py-1 rounded ${
                  page === i + 1
                    ? "bg-blue-900 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
