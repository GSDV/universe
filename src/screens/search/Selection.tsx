import { ComponentProps } from 'react';

import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

import { useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONT_SIZES } from '@util/global-client';



type RouterPath = Parameters<ReturnType<typeof useRouter>['push']>[0];
type IconName = ComponentProps<typeof Ionicons>['name'];



interface Item {
    title: string;
    icon: IconName;
    pathname: RouterPath;
}

const items: Item[] = [
    { title: 'Students', icon: 'person', pathname: '/(tabs)/(search)/category/people' },
    { title: 'Campuses', icon: 'home', pathname: '/(tabs)/(search)/category/campuses' },
    { title: 'Posts', icon: 'chatbox', pathname: '/(tabs)/(search)/category/posts' }
];

export default function Selection() {
    return (
        <View style={styles.container}>
            <Text style={{ textAlign: 'center', fontSize: FONT_SIZES.xxl, color: COLORS.primary }}>Search across UniVerse</Text>
            {items.map((item, i) => <ItemView key={`${i}-${item.pathname}`} item={item} index={i} />)}
        </View>
    );
}



interface ItemProps {
    item: Item;
    index: number;
}

function ItemView({ item, index }: ItemProps) {
    const router = useRouter();
    const onPress = () => router.push(item.pathname);

    return (
        <TouchableOpacity style={itemStyles.container} onPress={onPress}>
            {index === 11 ?
            <>
                <Text style={itemStyles.title}>{item.title}</Text>
                <Ionicons name={item.icon} style={itemStyles.icon} />
            </>
            :
            <>
                <Ionicons name={item.icon} style={itemStyles.icon} />
                <Text style={itemStyles.title}>{item.title}</Text>
            </>
            }
        </TouchableOpacity>
    );
}



const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        paddingTop: 20,
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 25
    }
});


const itemStyles = StyleSheet.create({
    container: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        width: '70%',
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        gap: 10,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontSize: FONT_SIZES.xl,
        color: COLORS.white
    },
    icon: {
        fontSize: FONT_SIZES.xl,
        color: COLORS.white
    }
});