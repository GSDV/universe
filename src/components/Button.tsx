import { Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native'

import { COLORS, FONT_SIZES } from '@util/globals';



interface ButtonProps {
    children: React.ReactNode;
    onPress: () => void;
    disabled?: boolean;
    containerStyle?: ViewStyle;
    textStyle?: TextStyle;
}



export default function Button({ children, onPress, disabled, textStyle, containerStyle }: ButtonProps) {
    const disabledStyle = (disabled) ? {backgroundColor: '#9bacb0'} : {};

    return (
        <TouchableOpacity onPress={disabled ? ()=>{} : onPress} style={containerStyle}>
            <Text style={[styles.text, disabledStyle, textStyle]}>
                {children}
            </Text>
        </TouchableOpacity>
    );
}



const styles = StyleSheet.create({
    text: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignSelf: 'flex-start',
        borderRadius: 10,
        backgroundColor: COLORS.secondary_1,
        fontSize: FONT_SIZES.m,
        color: COLORS.white,
        overflow: 'hidden'
    }
});