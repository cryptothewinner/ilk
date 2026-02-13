'use client';

import { BookOpen } from 'lucide-react';

export default function ProductionRecipesPage() {
    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Üretim Reçeteleri</h1>
                    <p className="text-sm text-slate-500">Ürün reçetelerini ve malzeme listelerini yönetin</p>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <p className="text-slate-400">Bu sayfa yakında aktif olacaktır.</p>
            </div>
        </div>
    );
}
