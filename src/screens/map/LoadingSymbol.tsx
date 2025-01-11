import { View, ActivityIndicator } from 'react-native';

import { COLORS } from '@util/global-client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



export default function LoadingSymbol() {
    const insets = useSafeAreaInsets();
    return <ActivityIndicator style={{ position: 'absolute', top: insets.top+5, right: 5 }} size='large' color={COLORS.primary} />;
}