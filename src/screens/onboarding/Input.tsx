import { View, Text, TextInput, StyleSheet } from 'react-native';

import { COLORS, FONT_SIZES } from '@util/global-client';



interface InputProps {
    placeholder: string;
    subtitle?: string;
    value: string;
    onChange: (input: string)=>void;
    isSecure?: boolean;
}

export default function Input({ placeholder, subtitle, value, onChange, isSecure }: InputProps) {
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                value={value}
                onChangeText={onChange}
                secureTextEntry={isSecure}
            />
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: 5
    },
    title: {
        color: COLORS.black,
        fontSize: FONT_SIZES.m
    },
    input: {
        paddingVertical: 5,
        borderRadius: 5,
        width: '100%',
        backgroundColor: 'white',
        fontSize: FONT_SIZES.m,
        borderColor: COLORS.black,
        borderWidth: 1,
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderLeftWidth: 0
    },
    subtitle: {
        color: COLORS.gray,
        fontSize: FONT_SIZES.s
    }
})