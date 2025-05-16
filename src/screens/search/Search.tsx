import { useState } from 'react';

import {
    TextInput,
    View,
    Text,
    Keyboard,
    StyleSheet,
    TouchableOpacity,
    Pressable
} from 'react-native';

import { useRouter } from 'expo-router';

import { Ionicons, Feather } from '@expo/vector-icons';

import UserSearch from './category/UserSearch';
import UniSearch from './category/UniSearch';
import PostSearch from './category/PostSearch';

import { COLORS, FONT_SIZES } from '@util/global-client';



type SearchType = 'USERS' | 'SCHOOLS' | 'POSTS';

interface SearchProps {
    type: SearchType;
    tag: string;
}

export default function Search({ type, tag }: SearchProps) {
    const router = useRouter();

    const [input, setInput] = useState<string>('');
    const [query, setQuery] = useState<string>('');

    const onSubmit = () => setQuery(input.trim());

    return (
        <Pressable style={{ flex: 1, backgroundColor: COLORS.white }} onPress={Keyboard.dismiss}>
            <View style={{ width: '100%', alignItems: 'center', paddingHorizontal: 5, flexDirection: 'row', gap: 5 }}>
            
            <TouchableOpacity style={{ paddingHorizontal: 5 }} onPress={router.back}>
                <Ionicons name='chevron-back' size={30} color={COLORS.primary} />
            </TouchableOpacity>

                <View style={styles.searchContainer}>
                    <Ionicons name='search' size={20} color={COLORS.gray} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder='Search...'
                        value={input}
                        onChangeText={setInput}
                        placeholderTextColor={COLORS.gray}
                        autoCapitalize='none'
                        autoCorrect={false}
                        returnKeyType='search'
                        onSubmitEditing={onSubmit}
                    />
                    {input.trim() && 
                        <TouchableOpacity onPress={onSubmit}>
                            <Feather name='send' size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                    }
                </View>
            </View>

            {(query === '') ? 
                <View style={{ flex: 1, backgroundColor: COLORS.light_gray, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: COLORS.black, fontSize: FONT_SIZES.s }}>{tag}</Text>
                </View>
            :
                <DecideSearch type={type} query={query} />
            }
        </Pressable>
    );
}



function DecideSearch({ type, query }: { type: SearchType, query: string }) {
    if (type === 'USERS') return <UserSearch query={query} />;
    if (type === 'SCHOOLS') return <UniSearch query={query} />;
    return <PostSearch query={query} />;
}



const styles = StyleSheet.create({
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.light_gray,
        marginVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        height: 40,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        height: '100%'
    }
});