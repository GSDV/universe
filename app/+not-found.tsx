import { View, Text } from 'react-native';

import { useRouter } from 'expo-router';

import Button from '@components/Button';



export default function NotFoundScreen() {
    const router = useRouter();

    const navigateToRoot = () => router.navigate('/');

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 }}>
            <Text>Page Not Found</Text>
            <Button onPress={navigateToRoot}>Go Back</Button>
        </View>
    );
}