'use client';

import React from 'react';
import {
    LayoutDashboard,
    TrendingUp,
    Package,
    Users,
    ArrowUpRight,
    Clock,
    CheckCircle2
} from 'lucide-react';

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Dashboard Header */}
            <header className="bg-white border-b border-lightning-border p-4 md:px-6 shadow-sm">
                <div className="max-w-[1600px] mx-auto flex items-center gap-4">
                    <div className="p-2 bg-[#706e6b] rounded-md text-white">
                        <LayoutDashboard className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dashboard</p>
                        <h1 className="text-2xl font-bold text-slate-800 leading-tight">Hoş Geldiniz, SepeNatural</h1>
                    </div>
                </div>
            </header>

            {/* Dashboard Content */}
            <div className="flex-1 p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto w-full">

                {/* Metrics Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DashboardMetric
                        label="Çeyrek Hedefi"
                        value="%84"
                        subtext="8.4M ₺ / 10M ₺"
                        icon={<TrendingUp className="w-5 h-5 text-lightning-blue" />}
                    />
                    <DashboardMetric
                        label="Bekleyen Siparişler"
                        value="12"
                        subtext="Bugün teslim edilecek"
                        icon={<Clock className="w-5 h-5 text-amber-500" />}
                    />
                    <DashboardMetric
                        label="Tamamlanan Görevler"
                        value="24"
                        subtext="Son 7 günde"
                        icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    />
                </div>

                {/* Main Dashboard Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity / Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-lightning-border rounded shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-lightning-border bg-slate-50 flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-slate-500" />
                                    Son Hareketler
                                </h3>
                                <button className="text-xs font-semibold text-lightning-blue hover:underline">Tümünü Gör</button>
                            </div>
                            <div className="divide-y divide-slate-100">
                                <ActivityItem
                                    user="Ahmet Yılmaz"
                                    action="Yeni stok girişi yaptı"
                                    target="Omega-3 Balık Yağı (1000mg)"
                                    time="10 dk önce"
                                />
                                <ActivityItem
                                    user="Sistem"
                                    action="Kritik stok uyarısı oluşturdu"
                                    target="D Vitamini 5000 IU"
                                    time="45 dk önce"
                                    warning
                                />
                                <ActivityItem
                                    user="Mehmet Demir"
                                    action="Satış siparişi onayladı"
                                    target="#ORD-2024-089"
                                    time="2 saat önce"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Side Info / Quick Links */}
                    <div className="space-y-6">
                        <div className="bg-white border border-lightning-border rounded shadow-sm p-4">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <ArrowUpRight className="w-4 h-4 text-slate-500" />
                                Hızlı İşlemler
                            </h3>
                            <div className="space-y-2">
                                <QuickActionButton icon={<Package className="w-4 h-4 text-emerald-600" />} label="Stok Ekle" />
                                <QuickActionButton icon={<Users className="w-4 h-4 text-blue-600" />} label="Yeni Müşteri" />
                                <QuickActionButton icon={<TrendingUp className="w-4 h-4 text-purple-600" />} label="Satış Raporu" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DashboardMetric({ label, value, subtext, icon }: any) {
    return (
        <div className="bg-white p-6 border border-lightning-border rounded shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
                {icon}
            </div>
            <h3 className="text-3xl font-black text-slate-800">{value}</h3>
            <p className="text-xs text-slate-500 mt-2 font-medium">{subtext}</p>
        </div>
    );
}

function ActivityItem({ user, action, target, time, warning }: any) {
    return (
        <div className="p-4 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${warning ? 'bg-rose-500 animate-pulse' : 'bg-lightning-blue'}`} />
            <div className="flex-1">
                <p className="text-sm text-slate-800 leading-tight">
                    <span className="font-bold">{user}</span> {action}: <span className="font-semibold text-lightning-blue">{target}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">{time}</p>
            </div>
        </div>
    );
}

function QuickActionButton({ icon, label }: any) {
    return (
        <button className="w-full flex items-center justify-between p-3 rounded border border-slate-100 hover:border-lightning-blue hover:bg-lightning-blue/5 transition-all text-left">
            <div className="flex items-center gap-3">
                <div className="p-1.5 bg-slate-50 rounded group-hover:bg-white">{icon}</div>
                <span className="text-sm font-semibold text-slate-700">{label}</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300" />
        </button>
    );
}
