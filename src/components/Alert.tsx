import { Text, View, StyleSheet } from 'react-native';

import { FONT_SIZES } from '@util/global-client';



export interface AlertType {
    cStatus: number;
    msg: string;
}

export function Alert({ alert }: { alert: AlertType }) {
    const status = parseInt(alert.cStatus.toString()[0]);
    const textStyle = (status==2) ? styles.success: styles.error;

    return (
        <View style={styles.container}>
            <Text style={textStyle}>{alert.msg}</Text>
        </View>
    );
}



interface CheckIfAlertType {
    alert: AlertType | null | undefined;
    children: React.ReactNode;
}

export function CheckIfAlert({ alert, children }: CheckIfAlertType) {
    if (alert!=undefined && alert!=null && alert.cStatus/100!=2) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Alert alert={alert} />
        </View>
    );
    return children;
}



const styles = StyleSheet.create({
    container: {
        padding: 5,
        alignSelf: 'center',
        maxWidth: 300,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    error: {
        color: '#ff7070',
        textAlign: 'center',
        fontSize: FONT_SIZES.m
    },
    success: {
        color: '#82e682',
        textAlign: 'center',
        fontSize: FONT_SIZES.m
    }
});