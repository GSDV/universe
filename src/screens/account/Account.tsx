import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

import { useRouter } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';

import UserPosts from '@components/post/UserPosts';

import { COLORS, DEFAULT_PFP, FONT_SIZES, imgUrl } from '@util/global-client';

import { RedactedUserType } from '@util/types';



// ownAccount (assumed false): Is the user viewing his own account
// found (assumed true): Was the account found through anything but the user tapping his own account on nav tab
//      - In other words, was this account screen mounted from the map, viewing a post, through search, ...
//      - "found" only controls whether or not to display a back button (no need to "go back" from the nav tab)
interface AccountProps {
    userPrisma: RedactedUserType
    ownAccount?: boolean
    found?: boolean
}

export default function Account({ userPrisma, ownAccount = false, found = true }: AccountProps) {
    return (
    <>
        <AccountHeader userPrisma={userPrisma} ownAccount={ownAccount} found={found} />
        <View style={{ width: '100%', height: 5, backgroundColor: 'rgb(220, 220, 220)' }} />
        <UserPosts userId={userPrisma.id} />
    </>
    );
}



interface AccountHeader {
    userPrisma: RedactedUserType
    ownAccount: boolean
    found: boolean
}

function AccountHeader({ userPrisma, ownAccount, found }: AccountHeader) {
    const router = useRouter();

    return (
        <View style={styles.header}>
            {found && 
                <TouchableOpacity onPress={router.back}>
                    <Ionicons name='chevron-back' size={25} color={COLORS.primary_1} />
                </TouchableOpacity>
            }

            <View style={{ flex: 1, display: 'flex', flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                <Pfp pfpKey={userPrisma.pfpKey} />
                <View style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Text style={styles.displayName}>{userPrisma.displayName}</Text>
                    <Text style={styles.username}>@{userPrisma.username}</Text>
                </View>
            </View>

            {ownAccount && 
            <>
                <TouchableOpacity onPress={() => router.push(`/post/create`)}>
                    <Ionicons name='add-outline' size={30} color={COLORS.primary_1} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => console.log("View settings")}>
                    <Ionicons name='settings-outline' size={30} color={COLORS.primary_1} />
                </TouchableOpacity>
            </>
            }
        </View>
    );
}



function Pfp({ pfpKey }: { pfpKey: string }) {
    return (
        <>{pfpKey=='' ? 
            <Image style={styles.pfp} source={DEFAULT_PFP} />
        :
            <Image style={styles.pfp} source={{ uri: imgUrl(pfpKey) }} />
        }</>
    );
}



const styles = StyleSheet.create({
    header: {
        position: 'relative',
        paddingHorizontal: 15,
        paddingVertical: 5,
        display: 'flex',
        flexDirection: 'row',
        gap: 15,
        alignItems: 'center'
    },
    pfp: {
        borderRadius: 50,
        width: 50,
        height: 50
    },
    displayName: {
        color: COLORS.black,
        fontSize: FONT_SIZES.m,
        fontWeight: 900
    },
    username: {
        color: COLORS.gray,
        fontSize: FONT_SIZES.m
    }
});