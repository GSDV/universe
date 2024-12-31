
import { Alert as AlertPopUp } from 'react-native';

import { useRouter } from 'expo-router';

import { useOperation } from '@components/providers/OperationProvider';

import { Ionicons } from '@expo/vector-icons';

import { MAX_REPORT_LENGTH } from '@util/global';
import { COLORS } from '@util/global-client';

import { fetchWithAuth } from '@util/fetch';
import { showActionSheet } from '@util/action';

import { PostType } from '@util/types';



interface PostActionsMenuProps {
    post: PostType;
    ownPost?: boolean;
    morePostsAvailable?: boolean;
}

export default function PostActionsMenu({ post, ownPost, morePostsAvailable = true }: PostActionsMenuProps) {
    const router = useRouter();
    const operationContext = useOperation();

    const handlePinChange = async () => {
        const body = JSON.stringify({ postId: post.id, pin: !post.pinned });
        fetchWithAuth(`post/pin`, 'PUT', body);
        operationContext.emitOperation({ name: 'PIN', selectedPostId: post.id, morePostsAvailable })
    }

    const handleDelete = () => {
        AlertPopUp.alert('Delete post?', 'This cannot be undone.', [
            { text: 'Cancel', onPress: () => {}, style: 'cancel' },
            { text: 'Delete', onPress: async () => {
                // Async call
                fetchWithAuth(`post/${post.id}`, 'DELETE');
                operationContext.emitOperation({ name: 'DELETE', postId: post.id });
                router.back();
            }, style: 'destructive' },
        ]);
    }

    const handleReport = () => {
        AlertPopUp.prompt('Report Post', 'Please describe why you are reporting this post:', [
            { text: 'Cancel', onPress: () => {}, style: 'cancel' },
            { text: 'Send', onPress: (reportText: string | undefined) => {
                AlertPopUp.alert('Post Reported', 'Your report has been sent.', [{ text: 'OK', onPress: () => {} }]);
                if (!reportText || reportText.length > MAX_REPORT_LENGTH) return;
                // Async call
                const body = JSON.stringify({ reportText });
                fetchWithAuth(`post/${post.id}/report`, 'POST', body);
            } }
        ], 'plain-text');
    }


    const ownOptions = () => {
        const options = [{ label: 'Delete', action: handleDelete }];
        if (post.replyToId !== '') {
            const label = (post.pinned) ? 'Unpin' : 'Pin';
            options.push({ label, action: handlePinChange });
        }
        showActionSheet(options, [0]);
    }

    const otherOptions = () => {
        const options = [{ label: 'Report', action: handleReport }];
        showActionSheet(options, [0]);
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