
import { Alert as AlertPopUp } from 'react-native';

import { useRouter } from 'expo-router';

import { usePostStore } from '@hooks/PostStore';
import { useAccountPost } from '@providers/AccountPostProvider';

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

    const accountPostContext = useAccountPost();

    const redactPost = usePostStore((state) => state.redactPost);

    const handlePinChange = async () => {
        const body = JSON.stringify({ postId: post.id, pin: !post.pinned });
        fetchWithAuth(`post/pin`, 'PUT', body);
        accountPostContext.emitOperation({ name: 'PIN', selectedPostId: post.id, morePostsAvailable });
    }

    const handleDelete = () => {
        AlertPopUp.alert('Delete post?', 'This cannot be undone.', [
            { text: 'Cancel', onPress: () => {}, style: 'cancel' },
            { text: 'Delete', onPress: async () => {
                redactPost(post.id);
                accountPostContext.emitOperation({ name: 'DELETE', postId: post.id });
                await fetchWithAuth(`post/${post.id}`, 'DELETE');
                router.back();
            }, style: 'destructive' },
        ]);
    }

    const handleReport = () => {
        AlertPopUp.prompt('Report Post', 'Please describe why you are reporting this post:', [
            { text: 'Cancel', onPress: () => {}, style: 'cancel' },
            { text: 'Send', onPress: async (reportText: string | undefined) => {
                if (!reportText || reportText.length > MAX_REPORT_LENGTH) {
                    AlertPopUp.alert(`Report not sent.`, `Please keep reports under ${MAX_REPORT_LENGTH}.`, [{ text: 'OK', onPress: () => {} }]);
                    return;
                }
                const body = JSON.stringify({ reportText });
                await fetchWithAuth(`post/${post.id}/report`, 'POST', body);
                AlertPopUp.alert('Post Reported', 'Your report has been sent.', [{ text: 'OK', onPress: () => {} }]);
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