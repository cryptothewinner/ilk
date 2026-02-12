'use client';

import { useCallback } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useStockDetail, useUpdateStock } from '@/hooks/use-stocks';
import { FormEngine } from '@/components/form-engine/form-engine';
import { Loader2, Package } from 'lucide-react';

interface StockEditSheetProps {
    stockId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function StockEditSheet({ stockId, open, onOpenChange }: StockEditSheetProps) {
    const { toast } = useToast();
    const { data: stockResponse, isLoading: isLoadingStock, error: stockError } = useStockDetail(
        open ? stockId : null,
    );
    const updateMutation = useUpdateStock();

    const stock = stockResponse?.data;

    const handleSubmit = useCallback(
        async (formData: Record<string, any>) => {
            if (!stockId) return;

            try {
                await updateMutation.mutateAsync({
                    id: stockId,
                    data: formData,
                });

                toast({
                    title: 'Başarılı',
                    description: 'Ürün bilgileri başarıyla güncellendi.',
                });

                onOpenChange(false);
            } catch (error: any) {
                toast({
                    title: 'Hata',
                    description: error.message || 'Güncelleme sırasında bir hata oluştu.',
                    variant: 'destructive',
                });
            }
        },
        [stockId, updateMutation, toast, onOpenChange],
    );

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-3xl overflow-hidden flex flex-col p-0 border-none rounded-l-3xl shadow-2xl">
                <div className="bg-slate-900 text-white p-8 flex-shrink-0 relative overflow-hidden">
                    <div className="relative z-10">
                        <SheetHeader>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-2 bg-primary/20 rounded-xl">
                                    <Package className="w-6 h-6 text-primary" />
                                </div>
                                <SheetTitle className="text-2xl font-black text-white">
                                    {isLoadingStock ? 'Yükleniyor...' : stock?.stockCode || 'Ürün Düzenle'}
                                </SheetTitle>
                                {stock && (
                                    <Badge variant={stock.isActive ? 'default' : 'secondary'} className={stock.isActive ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                                        {stock.isActive ? 'Aktif' : 'Pasif'}
                                    </Badge>
                                )}
                            </div>
                            <SheetDescription className="text-slate-400 font-medium">
                                {stock ? stock.stockName : 'Seçili ürünün detaylarını ve stok durumunu güncelleyin.'}
                            </SheetDescription>
                        </SheetHeader>
                    </div>
                    {/* Design elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
                </div>

                <ScrollArea className="flex-1 px-8 py-8 bg-white">
                    {isLoadingStock ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-slate-500 font-medium animate-pulse">Ürün verileri getiriliyor...</p>
                        </div>
                    ) : stockError ? (
                        <div className="text-center py-24 space-y-4">
                            <p className="text-rose-500 font-bold">Veri Yükleme Hatası</p>
                            <p className="text-slate-500 text-sm">{(stockError as any).message}</p>
                        </div>
                    ) : stock ? (
                        <FormEngine
                            entitySlug="product-card"
                            initialData={stock}
                            onSubmit={handleSubmit}
                            isSubmitting={updateMutation.isPending}
                            onCancel={() => onOpenChange(false)}
                            className="pb-12"
                        />
                    ) : (
                        <div className="text-center py-24">
                            <p className="text-slate-400 italic">Ürün bulunamadı veya ID geçersiz.</p>
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
