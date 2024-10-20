import { Text, View, StyleSheet } from 'react-native';



export interface AlertType {
    cStatus: number,
    msg: string
}

export interface AlertVariation {
    cStatus: number,
    jsx: React.ReactNode
}

interface AlertComponentType {
    alert: AlertType,
    variations?: AlertVariation[]
}

export function Alert({ alert, variations }: AlertComponentType) {
    const status = parseInt(alert.cStatus.toString()[0]);
    const alertStyle = (status==2) ? successAlert: errorAlert;

    if (variations==undefined) return (
        <View style={alertStyle}>
            <Text style={{ textAlign: 'center' }}>{alert.msg}</Text>
        </View>
    );

    const variation = variations.find(alertVar => (alertVar.cStatus===alert.cStatus));
    return (
        <View style={alertStyle}>
            {variation ? 
                <>{variation.jsx}</>
            :
                <p>{alert.msg}</p>
            }
        </View>
    );
}



interface CheckIfAlertType {
    alert: AlertType|null,
    variations?: AlertVariation[],
    content: React.ReactNode
}
export function CheckIfAlert({ alert, variations, content }: CheckIfAlertType) {
    if (alert!=null && alert.cStatus/100!=2) return <Alert alert={alert} variations={variations} />;
    return <>{content}</>;
}



const styles = StyleSheet.create({
    msg: {
        padding: 10,
        alignSelf: 'center',
        maxWidth: 300,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    error: {
        borderWidth: 3,
        borderStyle: 'solid',
        borderColor: '#c44d4d',
        backgroundColor: '#ff9c9c'
    },
    success: {
        borderWidth: 3,
        borderStyle: 'solid',
        borderColor: '#3ca93b',
        backgroundColor: '#82e682'
    }
});

const successAlert = [styles.msg, styles.success];
const errorAlert = [styles.msg, styles.error];