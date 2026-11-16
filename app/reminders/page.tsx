"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllGoatEvents, getAllGoats, upsertGoatEvent, deleteGoatEvent } from "@/lib/supabase";
import {
  formatDate,
  getTodayString,
  calculateGestationDueDate,
  formatWhatsAppReminderMessage,
  getWhatsAppShareUrl,
} from "@/lib/utils";
import { FARM_PHONE1 } from "@/lib/constants";
import type { Goat, GoatEvent, GoatEventType } from "@/lib/types";
import {
  Bell,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Share2,
  Trash2,
  Edit2,
  X,
  Search,
  Check,
  Heart,
  Droplet,
} from "lucide-react";

const EVENT_TYPE_CONFIG: Record<
  GoatEventType,
  { label: string; icon: string; badgeClass: string; borderClass: string }
> = {
  vaccination: {
    label: "Vaccination",
    icon: "💉",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    borderClass: "border-l-red-500",
  },
  treatment: {
    label: "Medicine & Treatment",
    icon: "💊",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    borderClass: "border-l-blue-500",
  },
  deworming: {
    label: "Deworming",
    icon: "🪱",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    borderClass: "border-l-amber-500",
  },
  kidding: {
    label: "Mating & Delivery",
    icon: "🍼",
    badgeClass: "bg-purple-100 text-purple-700 border-purple-200",
    borderClass: "border-l-purple-500",
  },
  weaning: {
    label: "Kid Weaning",
    icon: "🌾",
    badgeClass: "bg-teal-100 text-teal-700 border-teal-200",
    borderClass: "border-l-teal-500",
  },
  weight_check: {
    label: "Weight Check",
    icon: "⚖️",
    badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
    borderClass: "border-l-gray-500",
  },
  other: {
    label: "General Care",
    icon: "📋",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    borderClass: "border-l-emerald-500",
  },
};

const QUICK_PRESETS: Record<string, string[]> = {
  vaccination: ["PPR Vaccine Booster", "Enterotoxaemia (ET) Vaccine", "FMD (Foot & Mouth)", "Goat Pox Vaccine", "Anthrax Annual"],
  deworming: ["Albendazole (Liquid)", "Fenbendazole Tablet", "Ivermectin Injection", "Herbal Dewormer"],
  treatment: ["Calcium & Mineral Supplement", "Vitamin AD3E Tonic", "Liver Tonic (Liv-52)", "Antibiotic Wound Spray", "Fever Medication"],
  kidding: ["Expected Delivery / Kidding", "Pregnancy Ultrasound Check", "Pre-delivery Pen Shift", "Post-delivery Kid Care"],
  other: ["Hoof Trimming", "General Vet Health Check", "Tick & Flea Dipping", "Teat Dip Sanitization"],
};

export default function RemindersPage() {
  const todayStr = getTodayString();
  const [events, setEvents] = useState<GoatEvent[]>([]);
  const [goats, setGoats] = useState<Goat[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("all");
  const [search, setSearch] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GoatEvent | null>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [formGoatId, setFormGoatId] = useState("");
  const [formType, setFormType] = useState<GoatEventType>("vaccination");
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState(todayStr);
  const [formNotes, setFormNotes] = useState("");
  const [formVet, setFormVet] = useState("");
  const [formCost, setFormCost] = useState("");
  
  // Mating calculation helper
  const [isMatingCalc, setIsMatingCalc] = useState(false);
  const [matingDate, setMatingDate] = useState(todayStr);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [evData, gData] = await Promise.all([
        getAllGoatEvents(),
        getAllGoats(),
      ]);
      setEvents(evData);
      setGoats(gData);
      if (gData.length > 0 && !formGoatId) {
        setFormGoatId(gData[0].id);
      }
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  }, [formGoatId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Add Modal
  const openAdd = () => {
    setEditingEvent(null);
    setFormType("vaccination");
    setFormTitle("PPR Vaccine Booster");
    setFormDate(todayStr);
    setFormNotes("");
    setFormVet("");
    setFormCost("");
    setIsMatingCalc(false);
    if (goats.length > 0) setFormGoatId(goats[0].id);
    setShowModal(true);
  };

  // Open Edit Modal
  const openEdit = (ev: GoatEvent) => {
    setEditingEvent(ev);
    setFormGoatId(ev.goat_id);
    setFormType(ev.event_type);
    setFormTitle(ev.description || "");
    setFormDate(ev.date);
    setFormNotes(ev.notes || "");
    setFormVet(ev.vet_name || "");
    setFormCost(ev.cost ? String(ev.cost) : "");
    setIsMatingCalc(false);
    setShowModal(true);
  };

  // Handle Mating Date Calculation
  const handleMatingDateChange = (mDate: string) => {
    setMatingDate(mDate);
    const dueDate = calculateGestationDueDate(mDate);
    if (dueDate) {
      setFormDate(dueDate);
      if (!formNotes.includes("Mating on")) {
        setFormNotes(prev => `Mating Date: ${formatDate(mDate)} (150 days gestation). ${prev}`.trim());
      }
    }
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGoatId) {
      alert("Please select a goat");
      return;
    }
    setSaving(true);
    try {
      await upsertGoatEvent({
        ...(editingEvent ? { id: editingEvent.id } : {}),
        goat_id: formGoatId,
        event_type: formType,
        date: formDate,
        description: formTitle.trim(),
        notes: formNotes.trim() || null,
        vet_name: formVet.trim() || null,
        cost: formCost ? parseFloat(formCost) : 0,
      });
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to save reminder.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle Completed
  const handleToggleComplete = async (ev: GoatEvent) => {
    const isCompleted = (ev.notes || "").includes("[COMPLETED]");
    let newNotes = ev.notes || "";
    if (isCompleted) {
      newNotes = newNotes.replace("[COMPLETED]", "").trim();
    } else {
      newNotes = `[COMPLETED] ${newNotes}`.trim();
    }

    try {
      await upsertGoatEvent({
        id: ev.id,
        goat_id: ev.goat_id,
        event_type: ev.event_type,
        date: ev.date,
        description: ev.description,
        notes: newNotes || null,
        vet_name: ev.vet_name,
        cost: ev.cost,
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reminder?")) return;
    try {
      await deleteGoatEvent(id);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete.");
    }
  };

  // WhatsApp Alert Share
  const handleShareWhatsApp = (ev: GoatEvent) => {
    const goat = goats.find(g => g.id === ev.goat_id) || ev.goat;
    const msg = formatWhatsAppReminderMessage(
      ev.description || "Health Care",
      goat?.name || "Goat",
      goat?.tag_number || null,
      ev.event_type,
      ev.date,
      ev.notes,
      ev.vet_name
    );
    const url = getWhatsAppShareUrl(msg, FARM_PHONE1);
    window.open(url, "_blank");
  };

  // Computations for 7-day advance reminder
  const now = new Date(todayStr);
  const in7Days = new Date(todayStr);
  in7Days.setDate(now.getDate() + 7);
  const in7DaysStr = in7Days.toISOString().split("T")[0];

  const overdueList = events.filter(e => e.date < todayStr && !(e.notes || "").includes("[COMPLETED]"));
  const todayList = events.filter(e => e.date === todayStr && !(e.notes || "").includes("[COMPLETED]"));
  const upcoming7DaysList = events.filter(
    e => e.date > todayStr && e.date <= in7DaysStr && !(e.notes || "").includes("[COMPLETED]")
  );
  const futureList = events.filter(e => e.date > in7DaysStr && !(e.notes || "").includes("[COMPLETED]"));
  const completedList = events.filter(e => (e.notes || "").includes("[COMPLETED]"));

  // Filtered display list
  const filteredEvents = events.filter(e => {
    const isCompleted = (e.notes || "").includes("[COMPLETED]");
    if (filterStatus === "pending" && isCompleted) return false;
    if (filterStatus === "completed" && !isCompleted) return false;
    if (filterType !== "all" && e.event_type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      const gName = (e.goat?.name || "").toLowerCase();
      const gTag = (e.goat?.tag_number || "").toLowerCase();
      const desc = (e.description || "").toLowerCase();
      const notes = (e.notes || "").toLowerCase();
      if (!gName.includes(q) && !gTag.includes(q) && !desc.includes(q) && !notes.includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-950/10 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Health & Care Reminders</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              WhatsApp Integrated
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">
            Schedule vaccines, medicines, deworming, mating, and delivery dates with 7-day advance WhatsApp alerts
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-green-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:from-emerald-800 hover:to-green-800 shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Care</span>
        </button>
      </div>

      {/* 4 Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="p-3 bg-red-600 rounded-xl text-white">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-red-800 uppercase tracking-wider">Due Today & Overdue</p>
            <p className="text-2xl font-black text-red-700 mt-0.5">{overdueList.length + todayList.length}</p>
            <p className="text-[11px] text-red-600 font-medium">
              {overdueList.length} Overdue • {todayList.length} Due Today
            </p>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="p-3 bg-amber-500 rounded-xl text-white">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Upcoming in 7 Days</p>
            <p className="text-2xl font-black text-amber-700 mt-0.5">{upcoming7DaysList.length}</p>
            <p className="text-[11px] text-amber-600 font-medium">1-Week Advance Notice</p>
          </div>
        </div>

        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="p-3 bg-blue-600 rounded-xl text-white">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Scheduled Later</p>
            <p className="text-2xl font-black text-blue-700 mt-0.5">{futureList.length}</p>
            <p className="text-[11px] text-blue-600 font-medium">Future Care & Gestation</p>
          </div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="p-3 bg-emerald-600 rounded-xl text-white">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">{completedList.length}</p>
            <p className="text-[11px] text-emerald-600 font-medium">Recorded in Health Log</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-950/10 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
            {[
              { id: "all", label: "All Care" },
              { id: "vaccination", label: "💉 Vaccine" },
              { id: "treatment", label: "💊 Medicine" },
              { id: "deworming", label: "🪱 Deworming" },
              { id: "kidding", label: "🍼 Mating/Delivery" },
              { id: "other", label: "📋 General" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterType === tab.id
                    ? "bg-emerald-800 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Tabs */}
          <div className="inline-flex p-1 bg-gray-100 rounded-lg text-xs font-bold border border-gray-200">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1 rounded-md transition-all ${
                filterStatus === "all" ? "bg-white text-emerald-900 shadow-sm" : "text-gray-500"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-3 py-1 rounded-md transition-all ${
                filterStatus === "pending" ? "bg-white text-emerald-900 shadow-sm" : "text-gray-500"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-3 py-1 rounded-md transition-all ${
                filterStatus === "completed" ? "bg-white text-emerald-900 shadow-sm" : "text-gray-500"
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by goat name, tag number, or medicine..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 bg-gray-50/50"
          />
        </div>
      </div>

      {/* Reminders List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 skeleton" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-950/10 p-12 text-center text-gray-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-800" />
          <p className="text-sm font-semibold text-gray-600">No care tasks or reminders found</p>
          <p className="text-xs text-gray-400 mt-1">
            Click &quot;Schedule New Care&quot; above to schedule vaccinations, deworming, or mating dates!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map(ev => {
            const config = EVENT_TYPE_CONFIG[ev.event_type] || EVENT_TYPE_CONFIG.other;
            const isCompleted = (ev.notes || "").includes("[COMPLETED]");
            const goat = goats.find(g => g.id === ev.goat_id) || ev.goat;

            // Date urgency
            const isOverdue = ev.date < todayStr && !isCompleted;
            const isDueToday = ev.date === todayStr && !isCompleted;
            const isDueSoon = ev.date > todayStr && ev.date <= in7DaysStr && !isCompleted;

            return (
              <div
                key={ev.id}
                className={`bg-white rounded-2xl shadow-sm border transition-all p-4.5 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-l-4 ${
                  isCompleted
                    ? "border-l-emerald-600 bg-emerald-50/20 opacity-80"
                    : isOverdue
                    ? "border-l-red-600 bg-red-50/20"
                    : isDueToday
                    ? "border-l-amber-500 bg-amber-50/20"
                    : isDueSoon
                    ? "border-l-orange-500 bg-orange-50/10"
                    : config.borderClass
                } border-gray-200`}
              >
                {/* Left: Info */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${config.badgeClass}`}
                    >
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                    </span>

                    {/* Urgency Badge */}
                    {isCompleted ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Done
                      </span>
                    ) : isOverdue ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        ⚠️ Overdue
                      </span>
                    ) : isDueToday ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        ⚡ Due Today!
                      </span>
                    ) : isDueSoon ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                        ⏱️ In 7 Days (Advance Alert)
                      </span>
                    ) : null}

                    <span className="text-xs text-gray-500 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>Due: <b>{formatDate(ev.date)}</b></span>
                    </span>
                  </div>

                  <h3 className="text-base font-black text-gray-900 tracking-tight">
                    {ev.description || "Care Routine"}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                    <span className="font-semibold text-emerald-900 flex items-center gap-1">
                      <span>🐐 Goat:</span>
                      <span className="underline">{goat?.name || "Herd"}</span>
                      {goat?.tag_number && (
                        <span className="font-mono text-gray-500">({goat.tag_number})</span>
                      )}
                    </span>
                    {ev.vet_name && (
                      <span className="text-gray-500">In-charge: <b>{ev.vet_name}</b></span>
                    )}
                    {ev.cost && ev.cost > 0 && (
                      <span className="text-gray-500">Cost: <b>₹{ev.cost}</b></span>
                    )}
                  </div>

                  {ev.notes && (
                    <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100 max-w-xl">
                      {ev.notes.replace("[COMPLETED]", "").trim()}
                    </p>
                  )}
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                  {/* WhatsApp Share Button */}
                  <button
                    onClick={() => handleShareWhatsApp(ev)}
                    title="Send Alert to Farm WhatsApp"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  {/* Mark as Done Toggle */}
                  <button
                    onClick={() => handleToggleComplete(ev)}
                    title={isCompleted ? "Mark as Pending" : "Mark as Completed"}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isCompleted
                        ? "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isCompleted ? "Completed" : "Done"}</span>
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEdit(ev)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(ev.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-emerald-100">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-emerald-900 text-white rounded-t-3xl">
              <div>
                <h2 className="font-bold text-base">
                  {editingEvent ? "Edit Health Care / Reminder" : "Schedule New Goat Care"}
                </h2>
                <p className="text-[11px] text-emerald-200">
                  Vaccines, Deworming, Medicines & Gestation Tracking
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Select Goat */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Select Goat *
                </label>
                <select
                  value={formGoatId}
                  onChange={e => setFormGoatId(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  {goats.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} {g.tag_number ? `(Tag: ${g.tag_number})` : ""} — {g.breed.toUpperCase()} ({g.sex})
                    </option>
                  ))}
                </select>
              </div>

              {/* Care Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Care Type *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { id: "vaccination", label: "💉 Vaccine", icon: "💉" },
                      { id: "treatment", label: "💊 Medicine", icon: "💊" },
                      { id: "deworming", label: "🪱 Deworming", icon: "🪱" },
                      { id: "kidding", label: "🍼 Mating/Kidding", icon: "🍼" },
                      { id: "weaning", label: "🌾 Weaning", icon: "🌾" },
                      { id: "other", label: "📋 General", icon: "📋" },
                    ] as const
                  ).map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setFormType(t.id);
                        if (QUICK_PRESETS[t.id] && QUICK_PRESETS[t.id].length > 0) {
                          setFormTitle(QUICK_PRESETS[t.id][0]);
                        }
                      }}
                      className={`p-2 rounded-xl border text-xs font-bold text-left transition-all ${
                        formType === t.id
                          ? "bg-emerald-50 border-emerald-600 text-emerald-900 shadow-sm"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Presets */}
              {QUICK_PRESETS[formType] && (
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Quick Suggestions (Click to fill):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PRESETS[formType].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setFormTitle(preset)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                          formTitle === preset
                            ? "bg-emerald-700 text-white border-emerald-700 font-bold"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Task Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Medicine / Care Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. PPR Vaccine Booster, Albendazole 10ml, Mating"
                  required
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Mating / Gestation Helper if Kidding selected */}
              {formType === "kidding" && (
                <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-purple-700" />
                      <span>Mating & Delivery Calculator</span>
                    </span>
                    <label className="text-[11px] text-purple-800 flex items-center gap-1 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isMatingCalc}
                        onChange={e => {
                          setIsMatingCalc(e.target.checked);
                          if (e.target.checked) handleMatingDateChange(matingDate);
                        }}
                        className="rounded text-purple-700 focus:ring-purple-600"
                      />
                      <span>Calculate from Mating Date</span>
                    </label>
                  </div>

                  {isMatingCalc && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-purple-800 uppercase">
                          Mating Date
                        </label>
                        <input
                          type="date"
                          value={matingDate}
                          onChange={e => handleMatingDateChange(e.target.value)}
                          className="w-full border border-purple-300 rounded-lg px-2.5 py-1.5 text-xs bg-white mt-0.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-purple-800 uppercase">
                          Expected Delivery (+150d)
                        </label>
                        <p className="text-xs font-black text-purple-950 mt-1.5">
                          {formDate ? formatDate(formDate) : "—"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Scheduled Due Date */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Scheduled Due Date *
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 font-medium"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  💡 Tip: The system will automatically trigger 7-day advance alerts before this date.
                </p>
              </div>

              {/* In-Charge & Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    In-charge / Vet Doctor
                  </label>
                  <input
                    type="text"
                    value={formVet}
                    onChange={e => setFormVet(e.target.value)}
                    placeholder="e.g. Dr. Roy / Jishnu"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Cost (₹ Optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formCost}
                    onChange={e => setFormCost(e.target.value)}
                    placeholder="e.g. 250"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Notes & Dosage */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Dosage / Instructions / Notes
                </label>
                <textarea
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. 1ml Sub-Cutaneous injection, give in morning with food..."
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-600 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 disabled:bg-gray-300 shadow-md"
                >
                  {saving ? "Saving..." : editingEvent ? "Update Reminder" : "Schedule Reminder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
