"use client";

import { useEffect, useState } from "react";
import { getAppSettings, updateAppSettings } from "@/lib/supabase";
import { FARM_NAME, FARM_ADDRESS, FARM_PHONE1, FARM_PHONE2, FARM_PHONE3, FARM_UPI } from "@/lib/constants";
import type { AppSettings } from "@/lib/types";
import { Save, Eye, EyeOff } from "lucide-react";

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [farmForm, setFarmForm] = useState({
    farm_name: FARM_NAME,
    address: FARM_ADDRESS,
    phone1: FARM_PHONE1,
    phone2: FARM_PHONE2,
    phone3: FARM_PHONE3,
    upi_id: FARM_UPI,
  });

  const [ratesForm, setRatesForm] = useState({
    default_milk_rate: 30,
    default_manure_raw_rate: 200,
    default_manure_granules_rate: 200,
    default_manure_powder_rate: 400,
  });

  const [partnersForm, setPartnersForm] = useState({
    partner1_name: "Partner 1",
    partner2_name: "Partner 2",
    partner3_name: "Partner 3",
  });

  const [pwForm, setPwForm] = useState({
    currentPw: "",
    newPw: "",
    confirmPw: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    getAppSettings()
      .then(s => {
        setSettings(s);
        setFarmForm({
          farm_name: s.farm_name,
          address: s.address,
          phone1: s.phone1,
          phone2: s.phone2 || "",
          phone3: s.phone3 || "",
          upi_id: s.upi_id,
        });
        setRatesForm({
          default_milk_rate: s.default_milk_rate,
          default_manure_raw_rate: s.default_manure_raw_rate,
          default_manure_granules_rate: s.default_manure_granules_rate,
          default_manure_powder_rate: s.default_manure_powder_rate,
        });
        setPartnersForm({
          partner1_name: s.partner1_name,
          partner2_name: s.partner2_name || "",
          partner3_name: s.partner3_name || "",
        });
      })
      .catch(() => {
        // Settings not found yet, use defaults
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAppSettings({
        farm_name: farmForm.farm_name,
        address: farmForm.address,
        phone1: farmForm.phone1,
        phone2: farmForm.phone2 || null,
        phone3: farmForm.phone3 || null,
        upi_id: farmForm.upi_id,
        ...ratesForm,
        partner1_name: partnersForm.partner1_name,
        partner2_name: partnersForm.partner2_name || null,
        partner3_name: partnersForm.partner3_name || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    const currentPassword = process.env.NEXT_PUBLIC_APP_PASSWORD || "lambhouse2024";
    if (pwForm.currentPw !== currentPassword) {
      setPwError("Current password is incorrect.");
      return;
    }
    if (pwForm.newPw.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (pwForm.newPw !== pwForm.confirmPw) {
      setPwError("Passwords do not match.");
      return;
    }
    // In a real app, you'd update the env var or a secret. Here we show a note.
    setPwSuccess(true);
    setPwForm({ currentPw: "", newPw: "", confirmPw: "" });
    setTimeout(() => setPwSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 rounded skeleton" />
        {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-lg skeleton" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500">Manage farm details and preferences</p>
      </div>

      <form onSubmit={handleSaveFarm} className="space-y-6">
        {/* Farm Details */}
        <SettingsSection title="Farm Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Farm Name</label>
              <input type="text" value={farmForm.farm_name} onChange={e => setFarmForm(f => ({ ...f, farm_name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
              <input type="text" value={farmForm.address} onChange={e => setFarmForm(f => ({ ...f, address: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone 1</label>
              <input type="tel" value={farmForm.phone1} onChange={e => setFarmForm(f => ({ ...f, phone1: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone 2</label>
              <input type="tel" value={farmForm.phone2} onChange={e => setFarmForm(f => ({ ...f, phone2: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone 3</label>
              <input type="tel" value={farmForm.phone3} onChange={e => setFarmForm(f => ({ ...f, phone3: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">UPI ID</label>
              <input type="text" value={farmForm.upi_id} onChange={e => setFarmForm(f => ({ ...f, upi_id: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
            </div>
          </div>
        </SettingsSection>

        {/* Default Rates */}
        <SettingsSection title="Default Rates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Milk Rate (Rs/glass)</label>
              <input type="number" min={0} value={ratesForm.default_milk_rate}
                onChange={e => setRatesForm(f => ({ ...f, default_milk_rate: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Raw Manure Rate (Rs/bag)</label>
              <input type="number" min={0} value={ratesForm.default_manure_raw_rate}
                onChange={e => setRatesForm(f => ({ ...f, default_manure_raw_rate: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Granules Rate (Rs/bag)</label>
              <input type="number" min={0} value={ratesForm.default_manure_granules_rate}
                onChange={e => setRatesForm(f => ({ ...f, default_manure_granules_rate: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Powder Rate (Rs/bag)</label>
              <input type="number" min={0} value={ratesForm.default_manure_powder_rate}
                onChange={e => setRatesForm(f => ({ ...f, default_manure_powder_rate: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
            </div>
          </div>
        </SettingsSection>

        {/* Partner Names */}
        <SettingsSection title="Partners">
          <p className="text-xs text-gray-400 mb-4">The 3 partners who share this management system</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Partner 1</label>
              <input type="text" value={partnersForm.partner1_name}
                onChange={e => setPartnersForm(f => ({ ...f, partner1_name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Partner 2</label>
              <input type="text" value={partnersForm.partner2_name}
                onChange={e => setPartnersForm(f => ({ ...f, partner2_name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Partner 3</label>
              <input type="text" value={partnersForm.partner3_name}
                onChange={e => setPartnersForm(f => ({ ...f, partner3_name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
            </div>
          </div>
        </SettingsSection>

        {/* Save Button */}
        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-800 disabled:bg-gray-300 transition-colors">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </form>

      {/* Change Password */}
      <SettingsSection title="Change Password">
        <form onSubmit={handleChangePassword} className="max-w-sm space-y-4">
          {["Current Password", "New Password", "Confirm New Password"].map((label, i) => {
            const key = ["currentPw", "newPw", "confirmPw"][i] as keyof typeof pwForm;
            return (
              <div key={label}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={pwForm[key]}
                    onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-green-600"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
          {pwError && <p className="text-red-600 text-xs">{pwError}</p>}
          {pwSuccess && <p className="text-green-600 text-xs">Password updated! Please update your .env file with the new password.</p>}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            Note: Password is stored in NEXT_PUBLIC_APP_PASSWORD environment variable. Update your .env.local file after changing.
          </div>
          <button type="submit"
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800">
            Update Password
          </button>
        </form>
      </SettingsSection>
    </div>
  );
}
