import { Fragment, ReactNode } from 'react';

import { View, ActivityIndicator } from 'react-native';

import { COLORS } from '@util/global-client';



export function Loading({ size = 'large' }: { size?: 'large' | 'small' }) {
    return <ActivityIndicator size={size} color={COLORS.primary} />;
}



export function CheckIfLoading({ loading, children }: { loading: boolean, children: ReactNode }) {
    return (
        <Fragment>{loading ?
            <View style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Loading />
            </View>
        :
            <Fragment>{children}</Fragment>
        }</Fragment>
    );
}