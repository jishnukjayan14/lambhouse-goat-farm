"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { supabase, getMonthlyRevenueSummary, getUpcomingGoatEvents } from "@/lib/supabase";
import { formatCurrency, getMonthName, getCurrentMonthYear, getMonthDateRange, formatDate, getWhatsAppShareUrl, formatWhatsAppReminderMessage } from "@/lib/utils";
import { EXPENSE_CATEGORIES, GOAT_BREEDS, FARM_PHONE1 } from "@/lib/constants";
import type { Expense, GoatBreed, MonthlyRevenue, DailyMilkData, GoatEvent } from "@/lib/types";
import { TrendingUp, TrendingDown, Droplets, Users, Milk, Leaf, DollarSign, Bell, ArrowRight, Share2, Calendar } from "lucide-react";

const MonthlyChart = dynamic(() => import("@/components/charts/MonthlyChart"), { ssr: false });
const DailyMilkChart = dynamic(() => import("@/components/charts/DailyMilkChart"), { ssr: false });
const BreedPieChart = dynamic(() => import("@/components/charts/BreedPieChart"), { ssr: false });

function StatCard({ title, value, sub, icon: Icon, color, loading }: {
  title: string; value: string; sub?: string; icon: React.ElementType; color: string; loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-emerald-900/10 p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl shadow-sm ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        {loading ? (
          <div className="h-6 w-24 mt-1 rounded skeleton" />
        ) : (
          <p className="text-xl font-black text-gray-800 leading-tight mt-0.5">{value}</p>
        )}
        {sub && <p className="text-xs text-gray-500 mt-1 font-medium">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { month, year } = getCurrentMonthYear();
  const [loading, setLoading] = useState(true);
  const [milkRevenue, setMilkRevenue] = useState(0);
  const [manureRevenue, setManureRevenue] = useState(0);
  const [goatRevenue, setGoatRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [activeGoats, setActiveGoats] = useState(0);
  const [activeCustomers, setActiveCustomers] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([]);
  const [dailyMilk, setDailyMilk] = useState<DailyMilkData[]>([]);
  const [breedData, setBreedData] = useState<{ breed: GoatBreed; count: number }[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<GoatEvent[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { startDate, endDate } = getMonthDateRange(month, year);

        const [
          milkRes, manureRes, goatSalesRes, expenseRes, recentExpRes,
          goatRes, custRes, monthlyRes, dailyRes, breedRes, remindersRes,
        ] = await Promise.all([
          supabase.from("milk_deliveries").select("amount").gte("date", startDate).lte("date", endDate).eq("status", "delivered"),
          supabase.from("manure_sales").select("amount").gte("date", startDate).lte("date", endDate),
          supabase.from("goats").select("sold_price").eq("status", "sold").gte("sold_date", startDate).lte("sold_date", endDate),
          supabase.from("expenses").select("amount").gte("date", startDate).lte("date", endDate),
          supabase.from("expenses").select("*").gte("date", startDate).lte("date", endDate).order("date", { ascending: false }).limit(5),
          supabase.from("goats").select("id", { count: "exact" }).eq("status", "active"),
          supabase.from("customers").select("id", { count: "exact" }).eq("is_active", true),
          getMonthlyRevenueSummary(6),
          supabase.from("milk_deliveries").select("date, amount, glasses").gte("date", startDate).lte("date", endDate).eq("status", "delivered").order("date"),
          supabase.from("goats").select("breed").eq("status", "active"),
          getUpcomingGoatEvents(7).catch(() => [] as GoatEvent[]),
        ]);

        const milkTotal = (milkRes.data || []).reduce((s, r) => s + (Number(r.amount) || 0), 0);
        const manureTotal = (manureRes.data || []).reduce((s, r) => s + (Number(r.amount) || 0), 0);
        const goatTotal = (goatSalesRes.data || []).reduce((s, r) => s + (Number(r.sold_price) || 0), 0);
        const expTotal = (expenseRes.data || []).reduce((s, r) => s + (Number(r.amount) || 0), 0);

        setMilkRevenue(milkTotal);
        setManureRevenue(manureTotal);
        setGoatRevenue(goatTotal);
        setExpenses(expTotal);
        setRecentExpenses(recentExpRes.data || []);
        setActiveGoats(goatRes.count || 0);
        setActiveCustomers(custRes.count || 0);
        setMonthlyData(monthlyRes);

        // Build daily milk data grouped by date
        const dailyMap = new Map<string, { glasses: number; amount: number }>();
        for (const r of dailyRes.data || []) {
          const existing = dailyMap.get(r.date) || { glasses: 0, amount: 0 };
          dailyMap.set(r.date, { glasses: existing.glasses + r.glasses, amount: existing.amount + r.amount });
        }
        const days = [];
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const entry = dailyMap.get(dateStr) || { glasses: 0, amount: 0 };
          days.push({ date: dateStr, total_glasses: entry.glasses, total_amount: entry.amount });
        }
        setDailyMilk(days);

        // Breed distribution
        const breedCount = new Map<string, number>();
        for (const g of breedRes.data || []) {
          breedCount.set(g.breed, (breedCount.get(g.breed) || 0) + 1);
        }
        setBreedData(Array.from(breedCount.entries()).map(([breed, count]) => ({ breed: breed as GoatBreed, count })));
        setUpcomingReminders(remindersRes || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [month, year]);

  const totalRevenue = milkRevenue + manureRevenue + goatRevenue;
  const netProfit = totalRevenue - expenses;
  const isProfit = netProfit >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-emerald-950/10 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Farm Overview</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Lambhouse
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">{getMonthName(month)} {year} Financial & Livestock Report</p>
        </div>
      </div>

      {/* Upcoming Health & Care Alerts (Next 7 Days) */}
      {upcomingReminders.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm flex-shrink-0 mt-0.5">
                <Bell className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    Health & Care Notice
                  </span>
                  <span className="text-xs font-bold text-amber-900">
                    {upcomingReminders.length} task(s) due within the next 7 days!
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-amber-950">
                  {upcomingReminders.slice(0, 3).map(rem => (
                    <span key={rem.id} className="inline-flex items-center gap-1 font-medium">
                      <span>•</span>
                      <b>{rem.goat?.name || "Goat"}:</b>
                      <span>{rem.description} ({formatDate(rem.date)})</span>
                    </span>
                  ))}
                  {upcomingReminders.length > 3 && (
                    <span className="text-amber-700 font-semibold">+{upcomingReminders.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>

            <Link
              href="/reminders"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow transition-all flex-shrink-0 self-start sm:self-center"
            >
              <span>View All Reminders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="col-span-2 md:col-span-3 lg:col-span-2 bg-gradient-to-br from-emerald-900 via-green-900 to-emerald-950 text-white rounded-2xl shadow-lg p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest">Net Profit ({getMonthName(month)})</p>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isProfit ? "bg-emerald-500/30 text-emerald-200" : "bg-red-500/30 text-red-200"}`}>
              {isProfit ? "Profitable" : "Deficit"}
            </span>
          </div>
          {loading ? (
            <div className="h-10 w-32 mt-2 rounded skeleton" />
          ) : (
            <div className="mt-3">
              <p className={`text-3xl font-black tracking-tight ${isProfit ? "text-white" : "text-red-300"}`}>
                {formatCurrency(netProfit)}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-200/80 font-medium">
                {isProfit ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                <span>Total Income: {formatCurrency(totalRevenue)}</span>
              </div>
            </div>
          )}
        </div>

        <StatCard title="Milk Revenue" value={formatCurrency(milkRevenue)} icon={Milk} color="bg-emerald-700" loading={loading} />
        <StatCard title="Manure Sales" value={formatCurrency(manureRevenue)} icon={Leaf} color="bg-lime-700" loading={loading} />
        <StatCard title="Goat Sales" value={formatCurrency(goatRevenue)} icon={DollarSign} color="bg-teal-700" loading={loading} />
        <StatCard title="Farm Expenses" value={formatCurrency(expenses)} icon={TrendingDown} color="bg-rose-600" loading={loading} />
        <StatCard title="Active Herd" value={String(activeGoats)} sub={`${activeCustomers} active milk customers`} icon={Droplets} color="bg-blue-600" loading={loading} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Monthly Revenue vs Expenses (6 months)</h2>
          {loading ? <div className="h-64 rounded skeleton" /> : <MonthlyChart data={monthlyData} />}
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Daily Milk Delivery — {getMonthName(month)}</h2>
          {loading ? <div className="h-56 rounded skeleton" /> : <DailyMilkChart data={dailyMilk} />}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Expenses</h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-10 rounded skeleton" />)}
            </div>
          ) : recentExpenses.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No expenses recorded this month</p>
          ) : (
            <div className="space-y-2">
              {recentExpenses.map((exp) => {
                const cat = EXPENSE_CATEGORIES[exp.category];
                return (
                  <div key={exp.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.bgColor} ${cat.color}`}>
                        {cat.label}
                      </span>
                      <span className="text-sm text-gray-600 truncate max-w-[140px]">{exp.description}</span>
                    </div>
                    <span className="text-sm font-semibold text-red-600">{formatCurrency(exp.amount)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Breed Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Herd by Breed</h2>
          {loading ? <div className="h-56 rounded skeleton" /> : <BreedPieChart data={breedData} />}
        </div>
      </div>
    </div>
  );
}
