import React from 'react';

import { Tabs } from 'expo-router';

import { TabBarIcon } from '@components/navigation/TabBarIcon';

import { COLORS } from '@util/global-client';



type IconName = React.ComponentProps<typeof TabBarIcon>['name'];

interface TabType {
    fileName: string;
    title: string;
    iconFocused: IconName;
    iconUnfocused: IconName;
}



export default function TabLayout() {
    const tabs: TabType[] = [
        { fileName: 'map', title: 'Explore', iconFocused: 'map', iconUnfocused: 'map-outline' },
        { fileName: 'feed', title: 'Feed', iconFocused: 'chatbubbles', iconUnfocused: 'chatbubbles-outline' },
        { fileName: 'search', title: 'Search', iconFocused: 'search', iconUnfocused: 'search-outline' },
        { fileName: 'account', title: 'You', iconFocused: 'person', iconUnfocused: 'person-outline' }
    ];

    return (
        <Tabs 
            initialRouteName='account' 
            screenOptions={{ tabBarActiveTintColor: COLORS.tint, headerShown: false, tabBarStyle: { backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: COLORS.light_gray } }}
            sceneContainerStyle={{ backgroundColor: COLORS.background }}
        >
            {tabs.map((tab, i) => (
                <Tabs.Screen key={i} name={tab.fileName} options={{ title: tab.title, tabBarIcon: ({ color, focused }) => (
                    <TabBarIcon name={ focused ? tab.iconFocused : tab.iconUnfocused } color={color} />
                ) }} />
            ))}
        </Tabs>
    );
}