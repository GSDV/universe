import React, { useState } from 'react';

import { View, Text, FlatList, RefreshControl } from 'react-native';

import { COLORS, FONT_SIZES, TAB_BAR_HEIGHT } from '@util/global-client';



interface ListItem {
    id: string;
}

interface ListProps<T extends ListItem> {
    items: T[];
    cursor: string;
    moreAvailable: boolean;
    fetchAndUpdate: (cursor: string, oldItems: T[]) => Promise<void>;
    renderItem: (item: T) => React.ReactElement;
    allowRefresh?: boolean;
    noResultsText: string;
}

export default function List<T extends ListItem>({ 
    items,
    cursor,
    moreAvailable,
    fetchAndUpdate,
    renderItem,
    allowRefresh = true,
    noResultsText
}: ListProps<T>) {
    const [refreshing, setRefreshing] = useState<boolean>(false);

    // Used every time the user swipes up (refreshes an account) to see newer items.
    // Completely reset the items array.
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAndUpdate('', []);
        setRefreshing(false);
    }

    // Used every time the user reaches end of list to see older items.
    const onEndReached = async () => {
        setRefreshing(true);
        await fetchAndUpdate(cursor, items);
        setRefreshing(false);
    }

    return (
        <FlatList
            keyExtractor={(item, idx) => `${idx}--${item.id}`}
            data={items}
            renderItem={({ item }) => renderItem(item)}

            style={{ flex: 1, backgroundColor: COLORS.light_gray }}
            contentContainerStyle={{ flexGrow: 1, gap: 2, paddingBottom: TAB_BAR_HEIGHT }}

            refreshControl={allowRefresh ?
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                    />
                :
                    <></>
            }

            ListEmptyComponent={
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: COLORS.black, fontSize: FONT_SIZES.s }}>{noResultsText}</Text>
                </View>
            }

            onEndReached={moreAvailable ? onEndReached : null}
            onEndReachedThreshold={0.5}
        />
    );
}