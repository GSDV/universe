import { ActivityIndicator } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '@util/global-client';



export default function LoadingSymbol() {
    const insets = useSafeAreaInsets();
    return (
        <ActivityIndicator
            style={{ position: 'absolute', top: insets.top+5, right: 5 }}
            size='large'
            color={COLORS.primary}
        />
    );
}