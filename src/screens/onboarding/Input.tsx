import { View, Text, TextInput } from 'react-native';

import { COLORS, FONT_SIZES } from '@util/global-client';



export default function Input({ placeholder, value, onChange, title, subtitle, isSecure }: { placeholder: string, value: string, onChange: (input: string)=>void, title: string, subtitle?: string, isSecure?: boolean }) {
    return (
        <View style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <Text style={{fontSize: FONT_SIZES.m}}>{title}</Text>
            <TextInput
                style={{ padding: 7, paddingHorizontal: 10, borderRadius: 5, width: '100%', backgroundColor: 'white', fontSize: FONT_SIZES.m }}
                placeholder={placeholder}
                value={value}
                onChangeText={onChange}
                secureTextEntry={isSecure}
            />
            {subtitle && <Text style={{color: COLORS.gray, fontSize: FONT_SIZES.s}}>{subtitle}</Text>}
        </View>
    );
}