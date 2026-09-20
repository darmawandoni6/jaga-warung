import { ActivityIndicator, Text, View } from 'react-native';

export interface LoadingScreenProps {
  message?: string;
  className?: string;
}

export function LoadingScreen({ message, className = '' }: LoadingScreenProps) {
  return (
    <View className={`flex-1 items-center justify-center gap-3 ${className}`}>
      <ActivityIndicator size="large" color="#10B981" />
      {message ? <Text className="text-sm text-slate-400">{message}</Text> : null}
    </View>
  );
}
