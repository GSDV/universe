import { StyleSheet, Animated } from 'react-native';

import { Tabs, usePathname } from 'expo-router';

import { TabBarIcon } from '@components/navigation/TabBarIcon';

import { COLORS } from '@util/global-client';



// Create a shared Animated.Value for tab bar hiding.
export const tabBarAnimation = new Animated.Value(0);



type IconName = React.ComponentProps<typeof TabBarIcon>['name'];



interface TabType {
    fileName: string;
    iconFocused: IconName;
    iconUnfocused: IconName;
}



export default function TabLayout() {
    const pathname = usePathname();
    const isPostOrProfile = pathname.includes('/post/') || pathname.includes('/profile/');

    // Reset tab bar position when returning to main screens.
    if (!isPostOrProfile) {
        tabBarAnimation.setValue(0);
    }

    const tabs: TabType[] = [
        { fileName: '(map)', iconFocused: 'map', iconUnfocused: 'map-outline' },
        { fileName: '(feed)', iconFocused: 'chatbubbles', iconUnfocused: 'chatbubbles-outline' },
        { fileName: '(search)', iconFocused: 'search', iconUnfocused: 'search-outline' },
        { fileName: '(account)', iconFocused: 'person', iconUnfocused: 'person-outline' }
    ];

    // Hide tab bar downward when user scrolls down in post thread or profile view.
    const animatedTranslateY = tabBarAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 100]
    });

    return (
        <Tabs 
            initialRouteName='(account)' 
            screenOptions={{
                tabBarActiveTintColor: COLORS.tint,
                headerShown: false,
                sceneStyle: { backgroundColor: COLORS.background },
                tabBarShowLabel: false,
                tabBarStyle: [
                    styles.tabBar,
                    { transform: [{ translateY: animatedTranslateY }] }
                ]
            }}
        >
            {tabs.map((tab, i) => (
                <Tabs.Screen 
                    key={i}
                    name={tab.fileName}
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <TabBarIcon 
                                name={focused ? tab.iconFocused : tab.iconUnfocused}
                                color={color}
                            />
                        )
                    }} 
                />
            ))}
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 0,
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: COLORS.light_gray
    }
});
