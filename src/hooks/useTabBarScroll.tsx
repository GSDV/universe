import { useCallback, useRef } from 'react';

import { NativeSyntheticEvent, NativeScrollEvent, Animated } from 'react-native';

import { tabBarAnimation } from '@/app/(tabs)/_layout';



const THRESHOLD = 12;

export const replyButtonAnimation = new Animated.Value(0);

export const setTabBarVisible = (visible: boolean) => {
    Animated.spring(tabBarAnimation, {
        toValue: visible ? 0 : 1,
        useNativeDriver: true,
        tension: 100,
        friction: 12
    }).start();

    Animated.spring(replyButtonAnimation, {
        toValue: visible ? 0 : 1,
        useNativeDriver: false,
        tension: 100,
        friction: 12
    }).start();
};

export function useTabBarScroll() {
    const lastOffset = useRef(0);
    const isAnimating = useRef(false);

    const handleTabBarScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentOffset = event.nativeEvent.contentOffset.y;
        
        if (currentOffset <= 0) {
            setTabBarVisible(true);
            lastOffset.current = currentOffset;
            return;
        }

        const difference = currentOffset - lastOffset.current;

        if (Math.abs(difference) > THRESHOLD && !isAnimating.current) {
            isAnimating.current = true;
            const scrollingUp = difference < 0;
            setTabBarVisible(scrollingUp);
            setTimeout(() => {
                isAnimating.current = false;
            }, 100);
        }

        lastOffset.current = currentOffset;
    }, []);

    return { handleTabBarScroll };
}
