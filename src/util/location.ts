import { Alert as AlertPopUp } from 'react-native';

import * as Location from 'expo-location';



export const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        AlertPopUp.alert(
            "Permission Required",
            "To use the map, this app needs access to your location.",
            [
                {
                    text: "Ok",
                    style: "cancel",
                    onPress: () => {}
                }
            ]
        );
        return { granted: false, location: null };
    }

    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    return { granted: true, location };
}