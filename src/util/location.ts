import { Alert, Linking, Platform } from 'react-native';

import * as Location from 'expo-location';


export const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert(
            "Permission Required",
            "This app needs access to location for posts. Would you like to enable it?",
            [
                {
                    text: "Not Now",
                    style: "cancel",
                    onPress: () => {}
                },
                {
                    text: "Open Settings",
                    onPress: async () => {
                        await Location.requestForegroundPermissionsAsync();
                        if (Platform.OS === 'ios') Linking.openSettings();
                    }
                }
            ]
        );
        return { granted: false, location: null };
    }

    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    return { granted: true, location };
}