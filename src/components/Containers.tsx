import { View } from 'react-native';



export function CenterLayout({ children }: { children: React.ReactNode }) {
    return (
        <View style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {children}
        </View>
    );
}