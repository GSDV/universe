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

import { Ionicons, Feather } from '@expo/vector-icons';

import PostsAndUsers from './PostsAndUsers';

import { COLORS, FONT_SIZES } from '@util/global-client';



export default function Search() {
    const [input, setInput] = useState<string>('');
    const [query, setQuery] = useState<string>('');

    const onSubmit = () => setQuery(input.trim());

    return (
        <Pressable style={{ flex: 1, backgroundColor: COLORS.white }} onPress={Keyboard.dismiss}>
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

            {(query === '') ? 
                <View style={{ flex: 1, backgroundColor: COLORS.light_gray, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: COLORS.black, fontSize: FONT_SIZES.s }}>search posts and accounts</Text>
                </View>
            :
                <PostsAndUsers query={query} />
            }
        </Pressable>
    );
}



const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.light_gray,
        marginHorizontal: 16,
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