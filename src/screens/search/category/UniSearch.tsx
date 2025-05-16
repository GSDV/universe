import React, { useEffect, useState, useCallback, memo } from 'react';

import { Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useRouter } from 'expo-router';

import { CheckIfLoading } from '@components/Loading';
import List from '@components/List';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { fetchWithAuth } from '@util/fetch';
import { getUniqueString } from '@util/unique';

import { UniversityWithoutUsers } from '@util/types';



export default function UniSearch({ query }: { query: string }) {
    const [loading, setLoading] = useState<boolean>(true);

    const [universities, setUniversities] = useState<UniversityWithoutUsers[]>([]);
    const [universitiesCursor, setUniversitiesCursor] = useState<string>('');
    const [moreUniversitiesAvailable, setMoreUniversitiesAvailable] = useState<boolean>(false);

    const fetchAndUpdateUniversities = useCallback(async (cursor: string, oldUnis: UniversityWithoutUsers[]) => {
        const params = new URLSearchParams({ query, cursor });
        const resJson = await fetchWithAuth(`search/uni?${params.toString()}`, 'GET');
        if (resJson.cStatus == 200) {
            setUniversitiesCursor(resJson.nextCursor);
            setUniversities([...oldUnis, ...resJson.universities]);
            setMoreUniversitiesAvailable(resJson.moreAvailable);
        }
    }, [query]);

    const renderUni = useCallback((uni: UniversityWithoutUsers) => {
        return <MemoizedFeedUni uni={uni} />;
    }, []);

    const intialFetch = useCallback(async () => {
        setLoading(true);
        await fetchAndUpdateUniversities('', []);
        setLoading(false);
    }, [fetchAndUpdateUniversities]);

    useEffect(() => {
        intialFetch();
    }, [query, intialFetch]);

    return (
        <CheckIfLoading loading={loading}>
            <List<UniversityWithoutUsers> 
                items={universities} 
                cursor={universitiesCursor} 
                moreAvailable={moreUniversitiesAvailable} 
                fetchAndUpdate={fetchAndUpdateUniversities} 
                renderItem={renderUni}
                allowRefresh={false}
                noResultsText='no campuses found'
            />
        </CheckIfLoading>
    );
}


const MemoizedFeedUni = memo(FeedUni);

function FeedUni({ uni }: { uni : UniversityWithoutUsers }) {
    const router = useRouter();

    const onPress = useCallback(() => {
        router.push({
            pathname: '/uni/[uniId]/view',
            params: {
                uniId: uni.id,
                viewId: getUniqueString(uni.id)
            }
        });
    }, [router, uni.id]);

    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <Text style={[styles.uniText, { color: uni.color }]}>{uni.name}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        paddingVertical: 5,
        width: '100%',
        flexDirection: 'row',
        backgroundColor: COLORS.background
    },
    uniText: {
        paddingVertical: 10,
        flex: 1,
        fontSize: FONT_SIZES.l,
        textAlign: 'center'
    }
});