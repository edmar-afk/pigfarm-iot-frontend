/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Syringe,
  Plus,
  Search,
  CalendarDays,
  ClipboardList,
  PiggyBank,
  TrendingUp,
  Clock3,
  ChevronDown,
  Pencil,
  Trash2,
  Eye,
  X,
  FileText,
  ShieldCheck,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sprout,
} from "lucide-react";
import VaccinationModal from "../components/VaccinationModal";
import Topbar from "../components/TopBar";

const STORAGE_KEY = "pigfarm_vaccination_ledger_v1";

function readRecords() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Unable to read vaccination records:", error);
    return [];
  }
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatLongDate(dateString) {
  if (!dateString) return "No vaccination records yet";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color = "green",
  index = 0,
}) {
  const themes = {
    green: {
      icon: "bg-emerald-50 text-emerald-700",
      glow: "bg-emerald-50",
      accent: "text-emerald-700",
    },
    blue: {
      icon: "bg-sky-50 text-sky-700",
      glow: "bg-sky-50",
      accent: "text-sky-700",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700",
      glow: "bg-amber-50",
      accent: "text-amber-700",
    },
    purple: {
      icon: "bg-violet-50 text-violet-700",
      glow: "bg-violet-50",
      accent: "text-violet-700",
    },
  };

  const theme = themes[color] || themes.green;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="relative overflow-hidden rounded-[26px] border border-slate-200/70 bg-white p-5 shadow-[0_10px_40px_rgba(15,23,42,0.035)] sm:p-6"
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full ${theme.glow} opacity-70`}
      />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${theme.icon}`}
          >
            <Icon size={22} />
          </div>

          <TrendingUp size={17} className="text-slate-300" />
        </div>

        <p className="mt-6 text-sm font-medium text-slate-500">{title}</p>

        <h3 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          {value}
        </h3>

        <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
      </div>
    </motion.div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center px-5 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-emerald-50 text-emerald-700">
        <Syringe size={34} />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-900">
        No vaccination records yet
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Start keeping track of your farm's vaccination activities. Your records
        will be saved locally in this browser.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#173B2F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#245642]"
      >
        <Plus size={17} />
        Add first record
      </button>
    </div>
  );
}

function VaccinationLedger() {
  const [records, setRecords] = useState(() => readRecords());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [notice, setNotice] = useState(null);

  // Load existing browser records and persist every subsequent change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error("Unable to save vaccination records:", error);
      setNotice({
        type: "error",
        text: "Unable to save. Browser storage may be full or unavailable.",
      });
    }
  }, [records]);

  useEffect(() => {
    if (!notice) return;

    const timeout = window.setTimeout(() => setNotice(null), 3500);

    return () => window.clearTimeout(timeout);
  }, [notice]);

  const sortedRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = records.filter((record) => {
      const matchesSearch = [
        record.vaccineName,
        record.pen,
        record.administeredBy,
        record.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

      const recordDate = new Date(`${record.date}T00:00:00`);
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      const startOfWeek = new Date(startOfToday);
      const day = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - (day === 0 ? 6 : day - 1));

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      let matchesDate = true;

      if (dateFilter === "today") {
        matchesDate = recordDate.getTime() === startOfToday.getTime();
      } else if (dateFilter === "week") {
        matchesDate = recordDate >= startOfWeek && recordDate <= now;
      } else if (dateFilter === "month") {
        matchesDate = recordDate >= startOfMonth && recordDate <= now;
      }

      return matchesSearch && matchesDate;
    });

    return filtered.sort((a, b) => {
      const dateDifference = a.date.localeCompare(b.date);

      if (dateDifference !== 0) {
        return sortOrder === "newest" ? -dateDifference : dateDifference;
      }

      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [records, search, dateFilter, sortOrder]);

  const totalPigsVaccinated = records.reduce(
    (total, record) => total + Number(record.pigCount || 0),
    0,
  );

  const todayString = new Date().toLocaleDateString("en-CA");

  const vaccinatedToday = records
    .filter((record) => record.date === todayString)
    .reduce((total, record) => total + Number(record.pigCount || 0), 0);

  const latestRecord = [...records].sort((a, b) =>
    b.date.localeCompare(a.date),
  )[0];

  const handleSave = (formData) => {
    const now = Date.now();

    if (editingRecord) {
      setRecords((previous) =>
        previous.map((record) =>
          record.id === editingRecord.id
            ? {
                ...record,
                ...formData,
                updatedAt: now,
              }
            : record,
        ),
      );

      setNotice({
        type: "success",
        text: "Vaccination record updated successfully.",
      });
    } else {
      const newRecord = {
        id: createId(),
        ...formData,
        createdAt: now,
        updatedAt: now,
      };

      setRecords((previous) => [...previous, newRecord]);

      setNotice({
        type: "success",
        text: "Vaccination record saved successfully.",
      });
    }

    setModalOpen(false);
    setEditingRecord(null);
  };

  const openAddModal = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleDelete = (record) => {
    const confirmed = window.confirm(
      `Delete the vaccination record for "${record.vaccineName}" dated ${formatDate(record.date)}? This cannot be undone.`,
    );

    if (!confirmed) return;

    setRecords((previous) => previous.filter((item) => item.id !== record.id));

    if (viewingRecord?.id === record.id) {
      setViewingRecord(null);
    }

    setNotice({
      type: "success",
      text: "Vaccination record deleted.",
    });
  };

  const exportCSV = () => {
    if (records.length === 0) {
      setNotice({
        type: "error",
        text: "There are no records to export.",
      });
      return;
    }

    const columns = [
      "Vaccination Date",
      "Vaccine Name",
      "Pigs Vaccinated",
      "Pen / Pig Group",
      "Administered By",
      "Notes",
    ];

    const escapeCSV = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = records
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((record) => [
        record.date,
        record.vaccineName,
        record.pigCount,
        record.pen,
        record.administeredBy,
        record.notes,
      ]);

    const csv = [
      columns.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `pigfarm-vaccination-ledger-${todayString}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);

    setNotice({
      type: "success",
      text: "Ledger exported as CSV.",
    });
  };

  return (
    <>
    <Topbar/>
      <div className="min-h-screen bg-[#f6f8f4] px-4 py-6 sm:px-6 lg:px-8 pt-32">
        <div className="mx-auto max-w-[1600px]">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center"
          >
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                  Farm Health Records
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Vaccination Ledger
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Keep an organized record of vaccination dates, vaccine details,
                and the number of pigs vaccinated on your farm.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={exportCSV}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Download size={17} />
                Export CSV
              </button>

              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173B2F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#245642]"
              >
                <Plus size={18} />
                Add vaccination
              </button>
            </div>
          </motion.header>

          {/* Summary banner */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mb-7 overflow-hidden rounded-[28px] bg-[#173B2F] shadow-lg"
          >
            <div className="flex flex-col gap-5 px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                  <ShieldCheck size={24} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Farm vaccination records
                  </h2>

                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-emerald-100/70">
                    Maintain a history of your farm's vaccination activities and
                    review the number of pigs vaccinated over time.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-emerald-100/90 sm:self-auto">
                <ClipboardList size={17} />
                <span>Local records only</span>
              </div>
            </div>
          </motion.section>

          {/* Ledger table */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.035)]"
          >
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <FileText size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Vaccination history
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    {sortedRecords.length}{" "}
                    {sortedRecords.length === 1 ? "record" : "records"}{" "}
                    displayed
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  aria-label="Sort vaccination records"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none transition focus:border-emerald-500"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>

            {records.length === 0 ? (
              <EmptyState onAdd={openAddModal} />
            ) : sortedRecords.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Search size={30} className="mx-auto text-slate-300" />

                <h3 className="mt-4 font-semibold text-slate-800">
                  No matching records
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try a different search term or date filter.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setDateFilter("all");
                  }}
                  className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[920px] text-left">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70">
                        <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Vaccination date
                        </th>

                        <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Vaccine details
                        </th>

                        <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Pigs vaccinated
                        </th>

                        <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Pen / pig group
                        </th>

                        <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Administered by
                        </th>

                        <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {sortedRecords.map((record, index) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(index * 0.025, 0.2) }}
                          className="transition hover:bg-emerald-50/30"
                        >
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                <CalendarDays size={18} />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {formatDate(record.date)}
                                </p>

                                <p className="mt-1 text-[11px] text-slate-400">
                                  {record.date === todayString
                                    ? "Today"
                                    : "Recorded date"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                <Syringe size={17} />
                              </div>

                              <div>
                                <p className="max-w-[180px] truncate text-sm font-semibold text-slate-800">
                                  {record.vaccineName}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  Vaccination record
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                              <PiggyBank size={15} />
                              {Number(record.pigCount).toLocaleString("en-PH")}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-slate-700">
                              {record.pen || "—"}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-600">
                              {record.administeredBy || "—"}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setViewingRecord(record)}
                                title="View details"
                                aria-label="View vaccination record"
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-sky-50 hover:text-sky-700"
                              >
                                <Eye size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() => openEditModal(record)}
                                title="Edit record"
                                aria-label="Edit vaccination record"
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(record)}
                                title="Delete record"
                                aria-label="Delete vaccination record"
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-400">
                    Showing {sortedRecords.length} of {records.length} records
                  </p>

                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck size={15} className="text-emerald-600" />
                    Stored in this browser only
                  </p>
                </div>
              </>
            )}
          </motion.section>

          {/* Latest activity */}
          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[26px] border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                  <Sprout size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">
                    Record-keeping reminder
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Good farm health documentation
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <p className="text-sm leading-6 text-slate-600">
                    Record the actual vaccination date and the number of pigs
                    treated during each activity.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <p className="text-sm leading-6 text-slate-600">
                    Include the vaccine name, pen or pig group, and
                    administrator to make past treatments easier to trace.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />

                  <p className="text-sm leading-6 text-slate-600">
                    Export your ledger periodically. Browser-local records are
                    not a substitute for a separate backup.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Add / Edit modal */}
        <VaccinationModal
          isOpen={modalOpen}
          initialData={editingRecord}
          onClose={() => {
            setModalOpen(false);
            setEditingRecord(null);
          }}
          onSubmit={handleSave}
        />

        {/* View record modal */}
        {viewingRecord && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setViewingRecord(null);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="my-auto w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between bg-[#173B2F] p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-emerald-200">
                    <Syringe size={23} />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold">
                      Vaccination details
                    </h2>

                    <p className="mt-1 text-xs text-emerald-100/70">
                      Farm health ledger
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingRecord(null)}
                  aria-label="Close details"
                  className="rounded-xl p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5 p-6">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Vaccine name
                  </p>

                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {viewingRecord.vaccineName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="text-xs text-emerald-700">Pigs vaccinated</p>

                    <p className="mt-2 text-2xl font-semibold text-emerald-900">
                      {Number(viewingRecord.pigCount).toLocaleString("en-PH")}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Vaccination date</p>

                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {formatLongDate(viewingRecord.date)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <DetailRow
                    label="Pen / pig group"
                    value={viewingRecord.pen || "Not specified"}
                  />

                  <DetailRow
                    label="Administered by"
                    value={viewingRecord.administeredBy || "Not specified"}
                  />

                  <div>
                    <p className="text-xs font-medium text-slate-400">Notes</p>

                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                      {viewingRecord.notes || "No notes added."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      const record = viewingRecord;
                      setViewingRecord(null);
                      openEditModal(record);
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#173B2F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#245642]"
                  >
                    <Pencil size={16} />
                    Edit record
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(viewingRecord)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-100 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Feedback notification */}
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            role="status"
            className={`fixed bottom-5 right-5 z-[90] flex max-w-[calc(100vw-2.5rem)] items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl sm:max-w-md ${
              notice.type === "error"
                ? "border-amber-200"
                : "border-emerald-100"
            }`}
          >
            {notice.type === "error" ? (
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-amber-600"
              />
            ) : (
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-emerald-600"
              />
            )}

            <p className="flex-1 text-sm leading-5 text-slate-700">
              {notice.text}
            </p>

            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss notification"
              className="text-slate-400 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </div>
    </>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="border-b border-slate-100 pb-3">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}

export default VaccinationLedger;
