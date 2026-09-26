import { useEffect, useRef, useState } from 'react';

import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { type BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useSQLiteContext } from 'expo-sqlite';
import {
  ArrowLeft,
  Barcode,
  Camera,
  CheckCircle2,
  Flashlight,
  FlashlightOff,
  PackageCheck,
  ShoppingBag,
  X,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PriceText } from '@/components/ui/PriceText';
import { QuantityControl } from '@/components/ui/QuantityControl';
import { getAllProducts, getProductByBarcode } from '@/db/repositories/productRepository';
import { useCartStore } from '@/store/useCartStore';
import type { Product } from '@/types/product';
import { formatRupiah } from '@/utils/currency';
import { getProductAlias } from '@/utils/product';
import { getStockStatus } from '@/utils/stock';

export interface BarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  mode?: 'pos' | 'capture';
  onScanned?: (code: string) => void;
}

export function BarcodeScannerModal({ visible, onClose, mode = 'pos', onScanned }: BarcodeScannerModalProps) {
  const isCapture = mode === 'capture';
  const db = useSQLiteContext();
  const [permission, requestPermission] = useCameraPermissions();
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [lastAdded, setLastAdded] = useState<{ name: string; quantity: number; total: number } | null>(null);
  const [posProducts, setPosProducts] = useState<Product[]>([]);

  const lastScannedTimeRef = useRef<number>(0);
  const addItem = useCartStore(s => s.addItem);

  useEffect(() => {
    if (!visible || isCapture) return;
    getAllProducts(db)
      .then(setPosProducts)
      .catch(() => setPosProducts([]));
  }, [visible, isCapture, db]);

  if (!visible) return null;

  const handleClose = () => {
    setBarcodeInput('');
    setSelectedProduct(null);
    setQuantity(1);
    setLastAdded(null);
    setIsTorchOn(false);
    onClose();
  };

  const handleSelectProduct = (product: Product) => {
    const stockStatus = getStockStatus(product.stock, product.min_stock);
    if (stockStatus === 'empty') {
      Alert.alert('Stok Habis', `Produk "${product.name}" saat ini sedang habis.`);
      return;
    }
    setSelectedProduct(product);
    setQuantity(1);
    setLastAdded(null);
  };

  const handleFoundInDb = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    const found = await getProductByBarcode(db, trimmed);
    if (!found) {
      Alert.alert('Barcode Tidak Ditemukan', `Tidak ada produk dengan barcode "${trimmed}".`);
      return;
    }
    handleSelectProduct(found);
  };

  const handleManualSubmit = () => {
    const trimmed = barcodeInput.trim();
    if (isCapture) {
      if (!trimmed) return;
      onScanned?.(trimmed);
      handleClose();
      return;
    }
    handleFoundInDb(trimmed);
  };

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    const now = Date.now();
    if (selectedProduct || now - lastScannedTimeRef.current < 1500) return;
    lastScannedTimeRef.current = now;

    const code = result.data;
    if (!code) return;

    if (isCapture) {
      onScanned?.(code);
      handleClose();
      return;
    }
    handleFoundInDb(code);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    addItem(selectedProduct, quantity);
    setLastAdded({ name: selectedProduct.name, quantity, total: selectedProduct.sell_price * quantity });
    setSelectedProduct(null);
    setQuantity(1);
    setBarcodeInput('');
  };

  const hasFoundProduct = selectedProduct !== null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: '#0F172A' }}>
        <View className="flex-1 bg-slate-900">
          {/* Top Navigation Bar */}
          <View className="flex-row items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3">
            <Pressable
              onPress={handleClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Kembali"
              className="h-10 w-10 items-center justify-center rounded-full bg-slate-800 active:bg-slate-700"
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </Pressable>

            <View className="items-center">
              <Text className="text-base font-bold text-white">
                {isCapture ? 'Scan Barcode Produk' : 'Scan Barcode Kasir'}
              </Text>
              <Text className="text-[11px] text-slate-400">
                {isCapture ? 'Pindai barcode untuk mengisi field produk' : 'Arahkan kamera ke barcode produk'}
              </Text>
            </View>

            {activeTab === 'camera' && permission?.granted ? (
              <Pressable
                onPress={() => setIsTorchOn(prev => !prev)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Senter"
                className={`h-10 w-10 items-center justify-center rounded-full ${
                  isTorchOn ? 'bg-amber-400' : 'bg-slate-800 active:bg-slate-700'
                }`}
              >
                {isTorchOn ? <Flashlight size={18} color="#0F172A" /> : <FlashlightOff size={18} color="#FFFFFF" />}
              </Pressable>
            ) : (
              <Pressable
                onPress={handleClose}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Tutup"
                className="h-10 w-10 items-center justify-center rounded-full bg-slate-800 active:bg-slate-700"
              >
                <X size={18} color="#94A3B8" />
              </Pressable>
            )}
          </View>

          {/* Mode Switcher Tabs */}
          <View className="bg-slate-900 px-4 py-2.5">
            <View className="flex-row rounded-xl bg-slate-800 p-1">
              <Pressable
                onPress={() => setActiveTab('camera')}
                className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2.5 active:opacity-80 ${
                  activeTab === 'camera' ? 'bg-emerald-500' : 'bg-transparent'
                }`}
              >
                <Camera size={16} color={activeTab === 'camera' ? '#FFFFFF' : '#94A3B8'} />
                <Text className={`text-xs font-bold ${activeTab === 'camera' ? 'text-white' : 'text-slate-400'}`}>
                  Kamera Scan
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setActiveTab('manual')}
                className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2.5 active:opacity-80 ${
                  activeTab === 'manual' ? 'bg-emerald-500' : 'bg-transparent'
                }`}
              >
                <Barcode size={16} color={activeTab === 'manual' ? '#FFFFFF' : '#94A3B8'} />
                <Text className={`text-xs font-bold ${activeTab === 'manual' ? 'text-white' : 'text-slate-400'}`}>
                  Ketik / Daftar Cepat
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Main Content Area */}
          <View className="flex-1 bg-slate-950">
            {activeTab === 'camera' ? (
              /* CAMERA SCAN VIEW */
              <View className="flex-1 items-center justify-center">
                {permission?.granted ? (
                  <View className="relative h-full w-full">
                    <CameraView
                      facing="back"
                      enableTorch={isTorchOn}
                      barcodeScannerSettings={{
                        barcodeTypes: ['ean13', 'ean8', 'code128', 'code39', 'upc_a', 'upc_e', 'qr'],
                      }}
                      onBarcodeScanned={handleBarcodeScanned}
                      style={{ width: '100%', height: '100%' }}
                    />
                    <View className="pointer-events-none absolute inset-0 items-center justify-center">
                      <View className="h-44 w-72 rounded-3xl border-2 border-emerald-400/90 bg-transparent shadow-lg shadow-emerald-500/30" />
                      <View className="mt-4 rounded-full bg-slate-900/80 px-4 py-1.5">
                        <Text className="text-center text-xs font-semibold text-white">
                          Posisikan barcode di dalam kotak hijau
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View className="mx-6 items-center rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
                    <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                      <Camera size={32} color="#10B981" />
                    </View>
                    <Text className="text-center text-base font-bold text-white">Izin Akses Kamera Diperlukan</Text>
                    <Text className="mt-2 text-center text-xs leading-5 text-slate-400">
                      Aktifkan akses kamera untuk memindai barcode produk secara instan dan otomatis.
                    </Text>
                    <Button
                      variant="primary"
                      label="Izinkan Akses Kamera"
                      onPress={requestPermission}
                      size="md"
                      className="mt-6 px-6"
                    />
                  </View>
                )}
              </View>
            ) : (
              /* MANUAL INPUT & LIST VIEW */
              <View className="flex-1 bg-slate-900 p-4">
                {/* Barcode Input */}
                <View className="mb-4">
                  <Text className="mb-1.5 text-xs font-semibold text-slate-300">Nomor Barcode Produk</Text>
                  <View className="flex-row items-center gap-2">
                    <View className="flex-1 flex-row items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-3">
                      <Barcode size={18} color="#94A3B8" />
                      <TextInput
                        value={barcodeInput}
                        onChangeText={setBarcodeInput}
                        placeholder="Ketik atau scan barcode..."
                        placeholderTextColor="#64748B"
                        keyboardType="default"
                        autoFocus={activeTab === 'manual'}
                        className="flex-1 p-0 text-sm font-semibold text-white"
                        onSubmitEditing={handleManualSubmit}
                      />
                      {barcodeInput.length > 0 && (
                        <Pressable onPress={() => setBarcodeInput('')} hitSlop={8}>
                          <X size={16} color="#94A3B8" />
                        </Pressable>
                      )}
                    </View>
                    <Pressable
                      onPress={handleManualSubmit}
                      disabled={!barcodeInput.trim()}
                      className={`rounded-xl px-5 py-3 ${
                        barcodeInput.trim() ? 'bg-emerald-500' : 'bg-slate-800 opacity-50'
                      }`}
                    >
                      <Text className="text-sm font-bold text-white">{isCapture ? 'Gunakan' : 'Cari'}</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Quick list (POS only) */}
                {!isCapture && (
                  <>
                    <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Daftar Produk (Barcode Tersedia)
                    </Text>
                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                      <View className="gap-2.5 pb-6">
                        {posProducts
                          .filter(p => p.barcode)
                          .map(product => {
                            const stockStatus = getStockStatus(product.stock, product.min_stock);
                            const isOutOfStock = stockStatus === 'empty';
                            return (
                              <Pressable
                                key={product.barcode}
                                onPress={() => handleSelectProduct(product)}
                                disabled={isOutOfStock}
                                className={`flex-row items-center justify-between rounded-xl border border-slate-800 bg-slate-800/80 p-3 active:bg-slate-700 ${
                                  isOutOfStock ? 'opacity-50' : ''
                                }`}
                              >
                                <View className="flex-1 flex-row items-center gap-3 pr-2">
                                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                                    <Text className="text-xs font-bold text-emerald-400">
                                      {getProductAlias(product.name)}
                                    </Text>
                                  </View>
                                  <View className="flex-1">
                                    <Text className="text-sm font-semibold text-white" numberOfLines={1}>
                                      {product.name}
                                    </Text>
                                    <Text className="text-xs text-slate-400">
                                      {product.type ?? 'Umum'} • Barcode: {product.barcode}
                                    </Text>
                                  </View>
                                </View>
                                <View className="items-end gap-1">
                                  <PriceText amount={product.sell_price} size="sm" color="success" bold />
                                  <View className="flex-row items-center gap-1 rounded-md bg-emerald-500 px-2 py-0.5">
                                    <PackageCheck size={11} color="#FFFFFF" />
                                    <Text className="text-[10px] font-bold text-white">Pilih & Qty</Text>
                                  </View>
                                </View>
                              </Pressable>
                            );
                          })}
                      </View>
                    </ScrollView>
                  </>
                )}
              </View>
            )}
          </View>

          {/* Success banner (POS only) */}
          {!isCapture && lastAdded && !selectedProduct && (
            <View className="border-t border-emerald-500/30 bg-emerald-950/80 px-4 py-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-2">
                  <View className="flex-row items-center gap-1.5">
                    <CheckCircle2 size={16} color="#34D399" />
                    <Text className="text-xs font-bold text-emerald-300">Berhasil Masuk Keranjang!</Text>
                  </View>
                  <Text className="mt-0.5 text-xs font-semibold text-white" numberOfLines={1}>
                    {lastAdded.quantity}x {lastAdded.name}
                  </Text>
                  <Text className="text-[11px] font-medium text-emerald-400">
                    Total: {formatRupiah(lastAdded.total)}
                  </Text>
                </View>
                <Badge variant="success" label={`+${lastAdded.quantity} Qty`} />
              </View>
            </View>
          )}

          {/* PRODUCT FOUND BOTTOM PANEL (POS only) */}
          {!isCapture && selectedProduct && (
            <View className="border-t border-slate-800 bg-white p-4 shadow-2xl">
              <View className="mb-2.5 flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">Produk Ditemukan</Text>
                <Pressable
                  onPress={() => setSelectedProduct(null)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Scan ulang"
                >
                  <Text className="text-xs font-bold text-red-500">Scan Ulang / Ganti</Text>
                </Pressable>
              </View>

              <Card className="border-emerald-200 bg-emerald-50/50 p-3.5">
                <View className="flex-row items-center gap-3">
                  {selectedProduct.image ? (
                    <Image
                      source={{ uri: selectedProduct.image }}
                      className="h-14 w-14 rounded-xl bg-slate-100"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="h-14 w-14 items-center justify-center rounded-xl bg-emerald-100">
                      <Text className="text-lg font-bold text-emerald-800">
                        {getProductAlias(selectedProduct.name)}
                      </Text>
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="text-base font-bold text-slate-900" numberOfLines={1}>
                      {selectedProduct.name}
                    </Text>
                    <Text className="text-xs font-medium text-emerald-700">
                      {selectedProduct.type ?? 'Umum'} • Barcode: {selectedProduct.barcode}
                    </Text>
                    <View className="mt-1 flex-row items-center justify-between">
                      <PriceText amount={selectedProduct.sell_price} size="md" color="default" bold />
                      <Badge
                        label={`Stok: ${selectedProduct.stock}`}
                        variant={selectedProduct.stock <= selectedProduct.min_stock ? 'warning' : 'neutral'}
                        size="sm"
                      />
                    </View>
                  </View>
                </View>

                <View className="mt-3.5 rounded-xl border border-slate-100 bg-white p-3">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-xs font-bold text-slate-700">Jumlah Pesanan (Qty)</Text>
                      <Text className="text-[11px] text-slate-400">Atur kuantitas barang</Text>
                    </View>
                    <QuantityControl
                      quantity={quantity}
                      min={1}
                      max={selectedProduct.stock}
                      onIncrement={() => setQuantity(q => Math.min(selectedProduct.stock, q + 1))}
                      onDecrement={() => setQuantity(q => Math.max(1, q - 1))}
                    />
                  </View>
                  <View className="mt-3 flex-row items-center justify-between border-t border-slate-100 pt-2.5">
                    <Text className="text-xs font-semibold text-slate-500">Subtotal</Text>
                    <PriceText amount={selectedProduct.sell_price * quantity} size="lg" color="success" bold />
                  </View>
                </View>

                <Button
                  variant="primary"
                  icon={<ShoppingBag size={18} color="#FFFFFF" />}
                  label={`Tambah (${quantity} Barang) • ${formatRupiah(selectedProduct.sell_price * quantity)}`}
                  onPress={handleAddToCart}
                  fullWidth
                  size="md"
                  className="mt-3"
                />
              </Card>
            </View>
          )}

          {/* Bottom Bar */}
          {!hasFoundProduct && (
            <View className="border-t border-slate-800 bg-slate-900 px-4 py-3">
              <Button variant="secondary" label="Tutup Pemindai" onPress={handleClose} fullWidth size="md" />
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
