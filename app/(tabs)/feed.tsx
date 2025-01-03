import { StyleSheet } from 'react-native';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';



export default function Index() {
    // This is for when we implement followers and followed.
    // const [loading, setLoading] = useState<boolean>(false);
    // const getStoredUser = async () => {
    //     await fetchStoredUser();
    // }

    const fetchFeedPosts = async () => {
        const res = await fetch('SERVER');
        const resJson = await res.json();
        if (resJson.cStatus == 200) console.log("add to usetstae");//;
    }
    useEffect(() => {
        
    })

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        </View>
    );
}