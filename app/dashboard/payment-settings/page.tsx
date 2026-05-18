"use client";

import { useEffect, useState } from "react";

interface BankAccount {
  id: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  branch: string;
  isActive: boolean;
}

interface CardGateway {
  id: string;
  gatewayName: string;
  displayName: string;
  publicKey: string;
  secretKey: string;
  merchantId: string;
  webhookSecret: string;
  isTestMode: boolean;
  isActive: boolean;
}

interface PaymentMethod {
  enabled: boolean;
  label: string;
}

interface PaymentSettings {
  methods: {
    cod: PaymentMethod;
    bank_transfer: PaymentMethod;
    card: PaymentMethod;
  };
  bankAccounts: BankAccount[];
  cardGateways: CardGateway[];
}

const DEFAULT_SETTINGS: PaymentSettings = {
  methods: {
    cod: { enabled: true, label: "Cash on Delivery" },
    bank_transfer: { enabled: true, label: "Bank Transfer" },
    card: { enabled: false, label: "Card Payment" },
  },
  bankAccounts: [],
  cardGateways: [],
};

const EMPTY_ACCOUNT: Omit<BankAccount, "id"> = {
  bankName: "",
  accountTitle: "",
  accountNumber: "",
  iban: "",
  branch: "",
  isActive: true,
};

const EMPTY_GATEWAY: Omit<CardGateway, "id"> = {
  gatewayName: "Stripe",
  displayName: "",
  publicKey: "",
  secretKey: "",
  merchantId: "",
  webhookSecret: "",
  isTestMode: true,
  isActive: true,
};

const GATEWAY_OPTIONS = ["Stripe", "PayFast", "JazzCash", "EasyPaisa", "Razorpay", "Square", "2Checkout", "Braintree", "Custom"];

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState<Omit<BankAccount, "id">>(EMPTY_ACCOUNT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddGateway, setShowAddGateway] = useState(false);
  const [newGateway, setNewGateway] = useState<Omit<CardGateway, "id">>(EMPTY_GATEWAY);
  const [editingGatewayId, setEditingGatewayId] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/payment-settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSettings(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updated: PaymentSettings) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/payment-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const ensureCardGateways = (s: PaymentSettings): PaymentSettings => ({
    ...s,
    cardGateways: s.cardGateways ?? [],
  });

  const addGateway = () => {
    if (!newGateway.displayName || !newGateway.publicKey) return;
    const gateway: CardGateway = { ...newGateway, id: Date.now().toString() };
    const updated = ensureCardGateways({ ...settings, cardGateways: [...(settings.cardGateways ?? []), gateway] });
    setSettings(updated);
    saveSettings(updated);
    setNewGateway(EMPTY_GATEWAY);
    setShowAddGateway(false);
  };

  const removeGateway = (id: string) => {
    const updated = ensureCardGateways({ ...settings, cardGateways: settings.cardGateways.filter((g) => g.id !== id) });
    setSettings(updated);
    saveSettings(updated);
  };

  const toggleGatewayActive = (id: string) => {
    const updated = ensureCardGateways({
      ...settings,
      cardGateways: settings.cardGateways.map((g) => g.id === id ? { ...g, isActive: !g.isActive } : g),
    });
    setSettings(updated);
    saveSettings(updated);
  };

  const toggleGatewayTestMode = (id: string) => {
    const updated = ensureCardGateways({
      ...settings,
      cardGateways: settings.cardGateways.map((g) => g.id === id ? { ...g, isTestMode: !g.isTestMode } : g),
    });
    setSettings(updated);
    saveSettings(updated);
  };

  const updateEditingGateway = (id: string, field: keyof CardGateway, value: string) => {
    setSettings((prev) => ensureCardGateways({
      ...prev,
      cardGateways: prev.cardGateways.map((g) => g.id === id ? { ...g, [field]: value } : g),
    }));
  };

  const saveEditingGateway = () => {
    saveSettings(settings);
    setEditingGatewayId(null);
  };

  const toggleMethod = (key: keyof PaymentSettings["methods"]) => {
    const updated = {
      ...settings,
      methods: {
        ...settings.methods,
        [key]: { ...settings.methods[key], enabled: !settings.methods[key].enabled },
      },
    };
    setSettings(updated);
    saveSettings(updated);
  };

  const addAccount = () => {
    if (!newAccount.bankName || !newAccount.accountNumber || !newAccount.accountTitle) return;
    const account: BankAccount = { ...newAccount, id: Date.now().toString() };
    const updated = { ...settings, bankAccounts: [...settings.bankAccounts, account] };
    setSettings(updated);
    saveSettings(updated);
    setNewAccount(EMPTY_ACCOUNT);
    setShowAddForm(false);
  };

  const removeAccount = (id: string) => {
    const updated = { ...settings, bankAccounts: settings.bankAccounts.filter((a) => a.id !== id) };
    setSettings(updated);
    saveSettings(updated);
  };

  const toggleAccountActive = (id: string) => {
    const updated = {
      ...settings,
      bankAccounts: settings.bankAccounts.map((a) =>
        a.id === id ? { ...a, isActive: !a.isActive } : a
      ),
    };
    setSettings(updated);
    saveSettings(updated);
  };

  const updateEditingAccount = (id: string, field: keyof BankAccount, value: string) => {
    setSettings((prev) => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      ),
    }));
  };

  const saveEditingAccount = () => {
    saveSettings(settings);
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#704204]" />
      </div>
    );
  }

  const METHOD_ICONS: Record<string, string> = {
    cod: "💵",
    bank_transfer: "🏦",
    card: "💳",
  };

  const METHOD_DESC: Record<string, string> = {
    cod: "Customer pays in cash upon delivery.",
    bank_transfer: "Customer transfers money directly to your bank account.",
    card: "Online card payment via configured payment gateway.",
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
        {saved && (
          <span className="text-sm text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg font-medium">
            ✓ Saved
          </span>
        )}
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Payment Methods</h2>
        <div className="space-y-4">
          {(Object.keys(settings.methods) as Array<keyof PaymentSettings["methods"]>).map((key) => {
            const method = settings.methods[key];
            return (
              <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{METHOD_ICONS[key]}</span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{method.label}</p>
                    <p className="text-xs text-gray-500">{METHOD_DESC[key]}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleMethod(key)}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                    method.enabled ? "bg-[#704204]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      method.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bank Accounts */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Bank Accounts</h2>
            <p className="text-xs text-gray-500 mt-0.5">These details are shown to customers who select Bank Transfer.</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-[#704204] text-white text-sm font-medium rounded-lg hover:bg-[#8a5626] transition-colors"
          >
            + Add Account
          </button>
        </div>

        {/* Add Account Form */}
        {showAddForm && (
          <div className="mb-5 bg-stone-50 border border-stone-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">New Bank Account</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { field: "bankName", label: "Bank Name *", placeholder: "e.g. HBL, Meezan Bank" },
                { field: "accountTitle", label: "Account Title *", placeholder: "e.g. DesigNagArtistry" },
                { field: "accountNumber", label: "Account Number *", placeholder: "e.g. 1234567890" },
                { field: "iban", label: "IBAN (Optional)", placeholder: "e.g. PK00HBL0000001234567890" },
                { field: "branch", label: "Branch (Optional)", placeholder: "e.g. Main Branch, Karachi" },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={(newAccount as any)[field]}
                    onChange={(e) => setNewAccount((prev) => ({ ...prev, [field]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#704204]"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={addAccount}
                disabled={!newAccount.bankName || !newAccount.accountNumber || !newAccount.accountTitle || saving}
                className="px-4 py-2 bg-[#704204] text-white text-sm font-medium rounded-lg hover:bg-[#8a5626] transition-colors disabled:opacity-50"
              >
                Save Account
              </button>
              <button
                onClick={() => { setShowAddForm(false); setNewAccount(EMPTY_ACCOUNT); }}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Accounts List */}
        {settings.bankAccounts.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No bank accounts added yet.
          </div>
        ) : (
          <div className="space-y-3">
            {settings.bankAccounts.map((account) => (
              <div key={account.id} className={`border rounded-xl p-4 ${account.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-70"}`}>
                {editingId === account.id ? (
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      {(["bankName", "accountTitle", "accountNumber", "iban", "branch"] as const).map((field) => (
                        <div key={field}>
                          <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                            {field.replace(/([A-Z])/g, " $1")}
                          </label>
                          <input
                            type="text"
                            value={account[field]}
                            onChange={(e) => updateEditingAccount(account.id, field, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#704204]"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveEditingAccount} className="px-4 py-1.5 bg-[#704204] text-white text-sm rounded-lg hover:bg-[#8a5626]">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 text-sm">{account.bankName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${account.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                          {account.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{account.accountTitle}</p>
                      <p className="text-sm text-gray-600 font-mono">{account.accountNumber}</p>
                      {account.iban && <p className="text-xs text-gray-500 font-mono mt-0.5">IBAN: {account.iban}</p>}
                      {account.branch && <p className="text-xs text-gray-500 mt-0.5">Branch: {account.branch}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleAccountActive(account.id)}
                        className="text-xs px-2.5 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
                      >
                        {account.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => setEditingId(account.id)}
                        className="text-xs px-2.5 py-1 border border-blue-200 rounded-lg hover:bg-blue-50 text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeAccount(account.id)}
                        className="text-xs px-2.5 py-1 border border-red-200 rounded-lg hover:bg-red-50 text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Card Payment Gateways */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Card Payment Gateways</h2>
            <p className="text-xs text-gray-500 mt-0.5">Configure your payment gateway credentials. Enable Card Payment above to activate at checkout.</p>
          </div>
          <button
            onClick={() => setShowAddGateway(true)}
            className="px-4 py-2 bg-[#704204] text-white text-sm font-medium rounded-lg hover:bg-[#8a5626] transition-colors"
          >
            + Add Gateway
          </button>
        </div>

        {/* Add Gateway Form */}
        {showAddGateway && (
          <div className="mt-4 mb-5 bg-stone-50 border border-stone-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">New Payment Gateway</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Gateway Provider *</label>
                <select
                  value={newGateway.gatewayName}
                  onChange={(e) => setNewGateway((p) => ({ ...p, gatewayName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#704204]"
                >
                  {GATEWAY_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Display Name * <span className="text-gray-400 font-normal">(shown to customers)</span></label>
                <input type="text" placeholder="e.g. Pay with Stripe" value={newGateway.displayName}
                  onChange={(e) => setNewGateway((p) => ({ ...p, displayName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#704204]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Public / Publishable Key *</label>
                <input type="text" placeholder="pk_test_..." value={newGateway.publicKey}
                  onChange={(e) => setNewGateway((p) => ({ ...p, publicKey: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#704204]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Secret Key</label>
                <input type="password" placeholder="sk_test_..." value={newGateway.secretKey}
                  onChange={(e) => setNewGateway((p) => ({ ...p, secretKey: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#704204]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Merchant ID <span className="text-gray-400 font-normal">(if required)</span></label>
                <input type="text" placeholder="e.g. MCHT-12345" value={newGateway.merchantId}
                  onChange={(e) => setNewGateway((p) => ({ ...p, merchantId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#704204]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Webhook Secret <span className="text-gray-400 font-normal">(if required)</span></label>
                <input type="password" placeholder="whsec_..." value={newGateway.webhookSecret}
                  onChange={(e) => setNewGateway((p) => ({ ...p, webhookSecret: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#704204]" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input type="checkbox" checked={newGateway.isTestMode}
                  onChange={(e) => setNewGateway((p) => ({ ...p, isTestMode: e.target.checked }))}
                  className="w-4 h-4 accent-[#704204]" />
                Test / Sandbox Mode
              </label>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={addGateway}
                disabled={!newGateway.displayName || !newGateway.publicKey || saving}
                className="px-4 py-2 bg-[#704204] text-white text-sm font-medium rounded-lg hover:bg-[#8a5626] transition-colors disabled:opacity-50">
                Save Gateway
              </button>
              <button onClick={() => { setShowAddGateway(false); setNewGateway(EMPTY_GATEWAY); }}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Gateways List */}
        {(settings.cardGateways ?? []).length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm mt-2">
            No payment gateways configured yet.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {(settings.cardGateways ?? []).map((gw) => (
              <div key={gw.id} className={`border rounded-xl p-4 ${gw.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-70"}`}>
                {editingGatewayId === gw.id ? (
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Gateway Provider</label>
                        <select value={gw.gatewayName} onChange={(e) => updateEditingGateway(gw.id, "gatewayName", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#704204]">
                          {GATEWAY_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      {(["displayName", "publicKey", "merchantId"] as const).map((field) => (
                        <div key={field}>
                          <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
                          <input type="text" value={gw[field]} onChange={(e) => updateEditingGateway(gw.id, field, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#704204]" />
                        </div>
                      ))}
                      {(["secretKey", "webhookSecret"] as const).map((field) => (
                        <div key={field}>
                          <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
                          <input type="password" value={gw[field]} onChange={(e) => updateEditingGateway(gw.id, field, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#704204]" />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveEditingGateway} className="px-4 py-1.5 bg-[#704204] text-white text-sm rounded-lg hover:bg-[#8a5626]">Save</button>
                      <button onClick={() => setEditingGatewayId(null)} className="px-4 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-gray-900 text-sm">{gw.gatewayName}</p>
                        {gw.displayName && <span className="text-xs text-gray-500">· {gw.displayName}</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${gw.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                          {gw.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${gw.isTestMode ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                          {gw.isTestMode ? "Test Mode" : "Live Mode"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-mono">{gw.publicKey ? `Public: ${gw.publicKey.slice(0, 20)}…` : "No public key set"}</p>
                      {gw.merchantId && <p className="text-xs text-gray-500 mt-0.5">Merchant ID: {gw.merchantId}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                      <button onClick={() => toggleGatewayTestMode(gw.id)}
                        className="text-xs px-2.5 py-1 border border-yellow-200 rounded-lg hover:bg-yellow-50 text-yellow-700">
                        {gw.isTestMode ? "→ Live" : "→ Test"}
                      </button>
                      <button onClick={() => toggleGatewayActive(gw.id)}
                        className="text-xs px-2.5 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
                        {gw.isActive ? "Disable" : "Enable"}
                      </button>
                      <button onClick={() => setEditingGatewayId(gw.id)}
                        className="text-xs px-2.5 py-1 border border-blue-200 rounded-lg hover:bg-blue-50 text-blue-600">Edit</button>
                      <button onClick={() => removeGateway(gw.id)}
                        className="text-xs px-2.5 py-1 border border-red-200 rounded-lg hover:bg-red-50 text-red-600">Remove</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
