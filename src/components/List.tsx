import React, { useState, useCallback, memo } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
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

function List<T extends ListItem>({ 
    items,
    cursor,
    moreAvailable,
    fetchAndUpdate,
    renderItem,
    allowRefresh = true,
    noResultsText
}: ListProps<T>) {
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

    // Used every time the user swipes up (refreshes an account) to see newer items.
    // Completely reset the items array.
    const onRefresh = useCallback(async () => {
        if (refreshing) return;
        setRefreshing(true);
        await fetchAndUpdate('', []);
        setRefreshing(false);
    }, [fetchAndUpdate, refreshing]);

    // Used every time the user reaches end of list to see older items.
    const onEndReached = useCallback(async () => {
        if (refreshing || isLoadingMore || !moreAvailable) return;
        setIsLoadingMore(true);
        await fetchAndUpdate(cursor, items);
        setIsLoadingMore(false);
    }, [cursor, fetchAndUpdate, isLoadingMore, items, moreAvailable, refreshing]);

    const keyExtractor = useCallback((item: T) => item.id, []);

    const renderItemWrapper = useCallback(({ item }: { item: T }) => {
        return renderItem(item);
    }, [renderItem]);

    const ListEmptyComponent = useCallback(() => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: COLORS.black, fontSize: FONT_SIZES.s }}>{noResultsText}</Text>
        </View>
    ), [noResultsText]);

    const ListFooterComponent = useCallback(() => (
        moreAvailable && isLoadingMore ? (
            <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                <ActivityIndicator size='small' color={COLORS.primary} />
            </View>
        ) : null
    ), [moreAvailable, isLoadingMore]);

    return (
        <FlatList
            keyExtractor={keyExtractor}
            data={items}
            renderItem={renderItemWrapper}

            style={{ flex: 1, backgroundColor: COLORS.light_gray }}
            contentContainerStyle={{ 
                flexGrow: items.length === 0 ? 1 : undefined, 
                gap: 2, 
                paddingBottom: TAB_BAR_HEIGHT + 10 
            }}

            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            updateCellsBatchingPeriod={50}
            windowSize={7}
            initialNumToRender={5}

            refreshControl={allowRefresh ?
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                    />
                :
                    undefined
            }

            ListEmptyComponent={ListEmptyComponent}
            ListFooterComponent={ListFooterComponent}

            onEndReached={moreAvailable ? onEndReached : undefined}
            onEndReachedThreshold={0.2}

            maintainVisibleContentPosition={{
                minIndexForVisible: 0,
                autoscrollToTopThreshold: 10,
            }}
        />
    );
}



export default memo(List) as typeof List;