
import { ActionSheetIOS, Alert as AlertPopUp } from 'react-native';

import { useRouter } from 'expo-router';

import { useOperation } from '@components/providers/OperationProvider';

import { Ionicons } from '@expo/vector-icons';

import { MAX_REPORT_LENGTH } from '@util/global';
import { COLORS } from '@util/global-client';

import { fetchWithAuth } from '@util/fetch';



interface PostActionsMenuProps {
    postId: string;
    ownPost?: boolean;
}

export default function PostActionsMenu({ postId, ownPost }: PostActionsMenuProps) {
    const router = useRouter();
    const operationContext = useOperation();

    const deletePost = async () => {
        // Async call
        fetchWithAuth(`post/${postId}`, 'DELETE');
        operationContext.emitOperation({ name: 'DELETE', postId: postId });
        router.back();
    }

    const handleReport = async (reportText: string | undefined) => {
        AlertPopUp.alert('Post Reported', 'Your report has been sent.', [{ text: 'OK', onPress: () => {} }]);
        if (!reportText || reportText.length > MAX_REPORT_LENGTH) return;
        // Async call
        const body = JSON.stringify({ reportText });
        fetchWithAuth(`post/${postId}/report`, 'POST', body);
    }


    const ownOptions = () => {
        ActionSheetIOS.showActionSheetWithOptions(
            { options: ['Cancel', 'Delete'], cancelButtonIndex: 0, destructiveButtonIndex: 1 },
            async (buttonIndex) => {
                if (buttonIndex == 0) { } 
                else if (buttonIndex == 1) {
                    AlertPopUp.alert('Delete post?', 'This cannot be undone.', [
                        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
                        { text: 'Delete', onPress: deletePost, style: 'destructive' },
                    ]);
                }
            }
        );
    }

    const otherOptions = () => {
        ActionSheetIOS.showActionSheetWithOptions(
            { options: ['Cancel', 'Report'], cancelButtonIndex: 0, destructiveButtonIndex: 1 },
            (buttonIndex) => {
                if (buttonIndex == 0) { } 
                else if (buttonIndex == 1) {
                    AlertPopUp.prompt('Report Post', 'Please describe why you are reporting this post:', [
                        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
                        { text: 'Send', onPress: handleReport }
                    ], 'plain-text');
                }
            }
        );
    }

    const onEllipsisPres = ownPost ? ownOptions : otherOptions;


    return (
        <Ionicons 
            onPress={onEllipsisPres}
            name='ellipsis-horizontal'
            size={25}
            color={COLORS.black}
            style={{ borderRadius: 10, overflow: 'hidden' }}
        />
    );
}