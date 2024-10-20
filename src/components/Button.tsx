import { Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native'

import { COLORS, FONT_SIZES } from '@util/globals';



interface ButtonProps {
    children: React.ReactNode;
    onPress: () => void;
    color?: string;
    containerStyle?: ViewStyle;
}



export default function Button({ children, onPress, color, containerStyle }: ButtonProps) {
    return (
        <TouchableOpacity onPress={onPress} style={containerStyle}>
            <Text style={styles.text}>
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