import MapView, { PROVIDER_GOOGLE, Region, Marker } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Text } from 'react-native';
import { INITIAL_MAP_REGION, sleep } from '@util/globals';
import { Post } from '@util/types';
// import { Cluster } from 'react-native-clustering';
// import { Clusterer } from 'react-native-clusterer';


const CACHE_EXPIRATION = 5 * 60 * 1000;
type StringArrayMap = Map<string, string[]>;



interface PostMarker {
    post: Post,
    timestamp: number
}



type CacheMap = {
    [gridId: string] : PostMarker[]
}

interface CacheMapApi {
    get: (key: string) => PostMarker[] | undefined;
    set: (key: string, value: PostMarker[]) => void;
}


export default function Map() {
    const [mapRegion, setMapRegion] = useState<null | Region>(INITIAL_MAP_REGION);
    const [markers, setMarkers] = useState<PostMarker[]>([]); // get a type



    // String is the NW and SE coords of ONE grid, in the form: "NW_lat,NW_lon:SE_lat,SE_lon"
    // const cacheMap = useRef<Map<string, PostMarker[]>>();
    // const cacheMap = Map();
    // const cacheMap: { [key: string]: PostMarker[] } = {};
    // const cacheMap = useRef<Map<string, string[]>>(new Map());
    const cacheMapRef = useRef<CacheMap>({});
    const cacheMap = useMemo<CacheMapApi>(() => ({
        get: (key: string) => cacheMapRef.current[key],
        set: (key: string, value: PostMarker[]) => cacheMapRef.current[key] = value
    }), []);

    // const [cachedMarkers, setCachedMarkers] = useState<any>([]); // Need useState for this?

    const markersToFill = [
        { latitude: 40.1055826, longitude: -88.22841 },
        { latitude: 40.1055846, longitude: -88.22821 },
        { latitude: 40.1065846, longitude: -88.22621 },
        { latitude: 40.1065840, longitude: -88.22620 }
    ];

    const handleChangeRegion = async (newRegion: Region) => {
        // set loading = true
        setMapRegion(newRegion);
        setMarkers([]);

        // const newCachedMarkers = [...cachedMarkers];

        // First, immediately display cached markers
        // const now = (new Date()).getMilliseconds();
        // const newCachedMarkers = [...cachedMarkers].filter(cachedMarker => now-cachedMarker.timestamp < CACHE_EXPIRATION);
        // setCachedMarkers(newCachedMarkers);

        // Fetch cached markers in area
        const res = await fetch(`SERVER`);
        const resJson = await res.json();

        const newDisplayMarkers = [];

        // Grid keys (NW:SE) All these grids are currently viewable by user, so need to populate
        const gridKeys = resJson.grids;
        const markersPerGrid = resJson.markersPerGrid;
        
        gridKeys.forEach((key: string) => {
            const markers = cacheMap.get(key);
            
        });

        const amountOfGrids = gridKeys.length;
        amountOfGrids

        

        // setMarkers(markersToFill);
        // cleanCache()
        // fetch markers from server, which takes from db using prisma. include newRegion data in there
        // setMarkers.
        // set loading = false


        // if user moves again while this process is going, delete process and forget about it
    }


    // Get user location
    return (
        <View style={styles.container}>
            {/* <MapView style={styles.map} setMapRegion={setMapRegion} /> */}

            {/* <MapView
            style={{ flex: 1 }}
            region={mapRegion}
            onRegionChangeComplete={(newRegion: Region) => setMapRegion(newRegion)}
            /> */}
            {/* <MapScreen mapRegion={mapRegion} handleChangeRegion={handleChangeRegion} markers={markers} /> */}
        </View>
    );
}


// interface MapScreenProps {
//     mapRegion: Region | null;
//     setMapRegion: React.Dispatch<React.SetStateAction<Region | null>>;
// }
interface MapScreenProps {
    mapRegion: Region | null;
    handleChangeRegion: (newRegion: Region) => Promise<void>,
    markers: {latitude: number, longitude: number}[]
}
function MapScreen({ mapRegion, handleChangeRegion, markers }: MapScreenProps) {
    if (!mapRegion) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading map...</Text>
            </View>
        );
    }

console.log(markers)
    // add button inside MapView that displays only when user exits UIUC area.
    return (
        <MapView
            style={{ flex: 1 }} 
            region={mapRegion} 
            onRegionChangeComplete={handleChangeRegion} 
            showsUserLocation 
        >

            {markers.map((marker, i) => {
                return <Marker key={i} coordinate={marker} />
            })}

        </MapView>
    );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
