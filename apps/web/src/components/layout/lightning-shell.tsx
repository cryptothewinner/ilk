'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Search,
    Bell,
    Settings,
    HelpCircle,
    LayoutDashboard,
    Package,
    Users,
    BarChart3,
    ChevronDown,
    Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { label: 'Başlangıç', href: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Envanter', href: '/inventory', icon: <Package className="w-4 h-4" /> },
    { label: 'Satışlar', href: '/sales', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Müşteriler', href: '/customers', icon: <Users className="w-4 h-4" /> },
];

export function LightningShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col min-h-screen bg-lightning-gray">
            {/* Global Header */}
            <header className="h-14 bg-white border-b border-lightning-border flex items-center justify-between px-4 sticky top-0 z-50">
                <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2 px-2">
                        <div className="w-8 h-8 bg-lightning-blue rounded-md flex items-center justify-center text-white font-bold text-xl">
                            S
                        </div>
                        <span className="font-bold text-slate-800 hidden md:block">SepeNatural</span>
                    </div>

                    <div className="relative max-w-xl w-full hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Arama..."
                            className="pl-10 bg-slate-100 border-transparent focus:bg-white focus:ring-1 focus:ring-lightning-blue h-8 rounded-md transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-lightning-blue">
                        <HelpCircle className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-lightning-blue">
                        <Settings className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-lightning-blue relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
                    </Button>
                    <div className="ml-2 pl-2 border-l border-lightning-border flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            SN
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                </div>
            </header>

            {/* Navigation Tabs Bar */}
            <nav className="bg-[#f3f3f3] border-b border-lightning-border px-4 flex items-center gap-1 overflow-x-auto">
                <Button variant="ghost" size="icon" className="md:hidden text-slate-600">
                    <Menu className="w-5 h-5" />
                </Button>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2 px-4 py-3 text-[13px] font-semibold border-b-2 transition-all shrink-0 ${isActive
                                    ? 'text-lightning-blue border-lightning-blue bg-white shadow-[0_-2px_0_inset_#0176D3]'
                                    : 'text-slate-600 border-transparent hover:bg-white/50'
                                }`}
                        >
                            <span className={isActive ? 'text-lightning-blue' : 'text-slate-400'}>
                                {item.icon}
                            </span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
