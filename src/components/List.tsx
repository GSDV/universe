import { useState } from 'react';

import { View, Text, FlatList, RefreshControl } from 'react-native';

import { COLORS, FONT_SIZES } from '@util/global-client';



interface ListItem {
    id: string;
}

interface ListProps<T extends ListItem> {
    items: T[];
    cursor: Date;
    moreAvailable: boolean;
    fetchAndUpdate: (cursor: Date, oldItems: T[]) => Promise<void>;
    renderItem: (item: T) => React.ReactElement;
}

export default function List<T extends ListItem>({ items, cursor, moreAvailable, fetchAndUpdate, renderItem }: ListProps<T>) {
    const [refreshing, setRefreshing] = useState<boolean>(false);

    // Used every time the user swipes up (refreshes an account) to see newer items.
    // Completely reset the items array.
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAndUpdate(new Date(), []);
        setRefreshing(false);
    }

    // Used every time the user reaches end of list to see older items.
    const onEndReached = async () => {
        setRefreshing(true);
        await fetchAndUpdate(cursor, items);
        setRefreshing(false);
    }

    return (
        <>
            {items.length == 0 ?
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: COLORS.black, fontSize: FONT_SIZES.s }}>nothing found</Text>
                </View>
            :
                <FlatList
                    keyExtractor={(item, idx) => `${idx}--${item.id}`} 
                    data={items} 
                    renderItem={({ item }) => renderItem(item)} 

                    style={{ flex: 1, backgroundColor: COLORS.dark_gray }} 
                    contentContainerStyle={{ gap: 2 }} 
                    showsVerticalScrollIndicator={false} 

                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing} 
                            onRefresh={onRefresh} 
                            tintColor={COLORS.primary_1}
                        />
                    } 

                    onEndReached={moreAvailable ? onEndReached : null} 
                    onEndReachedThreshold={0.5}
                />
            }
        </>
    );
}