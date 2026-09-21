import { useState } from 'react';

import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Check, Edit3, Store } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/store/useAppStore';

export function StoreProfileCard() {
  const storeProfile = useAppStore(s => s.storeProfile);
  const updateStoreProfile = useAppStore(s => s.updateStoreProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(storeProfile.name);
  const [phone, setPhone] = useState(storeProfile.phone);
  const [address, setAddress] = useState(storeProfile.address);
  const [receiptFooter, setReceiptFooter] = useState(storeProfile.receiptFooter);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Peringatan', 'Nama warung tidak boleh kosong.');
      return;
    }

    updateStoreProfile({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      receiptFooter: receiptFooter.trim(),
    });

    setIsEditing(false);
    Alert.alert('Sukses', 'Informasi warung berhasil diperbarui!');
  };

  const handleCancel = () => {
    setName(storeProfile.name);
    setPhone(storeProfile.phone);
    setAddress(storeProfile.address);
    setReceiptFooter(storeProfile.receiptFooter);
    setIsEditing(false);
  };

  return (
    <Card className="border border-slate-100 bg-white p-4">
      {/* Header */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-7 w-7 items-center justify-center rounded-full bg-emerald-50">
            <Store size={15} color="#059669" />
          </View>
          <Text className="text-sm font-bold text-slate-800">Profil Warung</Text>
        </View>

        {!isEditing && (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            className="flex-row items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 active:bg-slate-200"
          >
            <Edit3 size={13} color="#475569" />
            <Text className="text-xs font-semibold text-slate-600">Ubah</Text>
          </TouchableOpacity>
        )}
      </View>

      {isEditing ? (
        <View className="space-y-3">
          <View>
            <Text className="mb-1 text-xs font-medium text-slate-600">Nama Warung</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Contoh: Warung Berkah"
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
            />
          </View>

          <View>
            <Text className="mb-1 text-xs font-medium text-slate-600">Nomor Kontak / WhatsApp</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="0812..."
              keyboardType="phone-pad"
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
            />
          </View>

          <View>
            <Text className="mb-1 text-xs font-medium text-slate-600">Alamat</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Alamat toko..."
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
            />
          </View>

          <View>
            <Text className="mb-1 text-xs font-medium text-slate-600">Catatan Kaki Struk</Text>
            <TextInput
              value={receiptFooter}
              onChangeText={setReceiptFooter}
              placeholder="Pesan di bagian bawah struk..."
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
            />
          </View>

          <View className="flex-row gap-2 pt-2">
            <Button variant="secondary" label="Batal" onPress={handleCancel} className="flex-1" size="sm" />
            <Button
              variant="primary"
              label="Simpan"
              icon={<Check size={16} color="#FFFFFF" />}
              onPress={handleSave}
              className="flex-1"
              size="sm"
            />
          </View>
        </View>
      ) : (
        <View className="space-y-2">
          <View>
            <Text className="text-[11px] text-slate-400">Nama Usaha</Text>
            <Text className="text-sm font-semibold text-slate-800">{storeProfile.name}</Text>
          </View>
          <View>
            <Text className="text-[11px] text-slate-400">Kontak</Text>
            <Text className="text-xs text-slate-700">{storeProfile.phone || '-'}</Text>
          </View>
          <View>
            <Text className="text-[11px] text-slate-400">Alamat</Text>
            <Text className="text-xs text-slate-700">{storeProfile.address || '-'}</Text>
          </View>
          {storeProfile.receiptFooter ? (
            <View>
              <Text className="text-[11px] text-slate-400">Pesan Struk</Text>
              <Text className="text-xs italic text-slate-600">&ldquo;{storeProfile.receiptFooter}&rdquo;</Text>
            </View>
          ) : null}
        </View>
      )}
    </Card>
  );
}
