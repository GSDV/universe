import { ActionSheetIOS } from 'react-native';



interface Option {
    label: string;
    action: ()=>void
}

export const showActionSheet = (options: Option[], destructiveIdxs: number[] = []) => {
    const actions = options.map(o => o.action);
    ActionSheetIOS.showActionSheetWithOptions(
        {
            options: ['Cancel', ...options.map(o => o.label)], 
            cancelButtonIndex: 0, 
            destructiveButtonIndex: destructiveIdxs.map(i=>i+1)
        },
        async (buttonIndex) => {
            actions[buttonIndex-1]();
        }
    );
}