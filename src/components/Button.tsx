import { ReactNode } from 'react';

import { Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native'

import { COLORS, FONT_SIZES } from '@util/global-client';



interface ButtonProps {
    children: ReactNode;
    onPress: () => void;
    disabled?: boolean;
    containerStyle?: ViewStyle;
    textStyle?: TextStyle;
}

export default function Button({ children, onPress, disabled, textStyle, containerStyle }: ButtonProps) {
    const disabledStyle = (disabled) ? {backgroundColor: '#9bacb0'} : {};

    return (
        <TouchableOpacity onPress={disabled ? ()=>{} : onPress} disabled={disabled} style={containerStyle}>
            <Text style={[styles.text, disabledStyle, textStyle]}>
                {children}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    text: {
        width: '100%',
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignSelf: 'flex-start',
        borderRadius: 10,
        backgroundColor: COLORS.primary,
        fontSize: FONT_SIZES.l,
        color: COLORS.white,
        overflow: 'hidden',
        textAlign: 'center'
    }
});