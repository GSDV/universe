import * as Location from 'expo-location';



export const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return (status === 'granted');
}