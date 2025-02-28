import { View, StyleSheet } from 'react-native';

import Svg, { RadialGradient, Defs, Rect, Stop } from 'react-native-svg';



export default function PostMarker() {
    return (
        <View style={styles.container}>
            <Svg style={styles.marker}>
                <Defs>
                    <RadialGradient
                        id='gradient'
                        cx='50%'
                        cy='50%'
                        rx='50%'
                        ry='50%'
                        fx='50%'
                        fy='50%'
                        gradientUnits='userSpaceOnUse'
                    >
                        {/* Fully opaque for half of the circle */}
                        <Stop offset='50%' stopColor='#ff6666' stopOpacity='1' />
                        {/* Fully transparent at the edges */}
                        <Stop offset='100%' stopColor='#ff6666' stopOpacity='0' />
                    </RadialGradient>
                </Defs>
                <Rect
                    x='0'
                    y='0'
                    width='100%'
                    height='100%'
                    fill='url(#gradient)'
                    rx='50%'
                />
            </Svg>
        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        position: 'relative',
        width: 55,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 55
    },
    marker: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 20,
    }
});