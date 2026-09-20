import { Pressable, TextInput, View } from 'react-native';

import { Search, X } from 'lucide-react-native';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Cari...', onClear, className = '' }: SearchBarProps) {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChangeText('');
    }
  };

  return (
    <View className={`flex-row items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 ${className}`}>
      <Search size={18} color="#94A3B8" />
      <TextInput
        className="flex-1 p-0 text-sm text-slate-900"
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <Pressable onPress={handleClear} hitSlop={8}>
          <X size={16} color="#94A3B8" />
        </Pressable>
      ) : null}
    </View>
  );
}
