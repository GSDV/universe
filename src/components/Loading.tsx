import { View, ActivityIndicator } from 'react-native';

import { COLORS } from '@util/global-client';



export function Loading({ size = 'large' }: { size?: 'large' | 'small' }) {
    return <ActivityIndicator size={size} color={COLORS.primary_1} />;
}



export function CheckIfLoading({ loading, children }: { loading: boolean, children: React.ReactNode }) {
    return (
        <>{loading ?
            <View style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Loading />
            </View>
        :
            <>{children}</>
        }</>
    );
}