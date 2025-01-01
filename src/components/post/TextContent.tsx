import { useState } from 'react';

import { Linking, StyleProp, Text, TextStyle, StyleSheet, NativeSyntheticEvent, TextLayoutEventData, TouchableOpacity } from 'react-native';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { PostType } from '@util/types';



const URL_REGEX = /(https:\/\/|http:\/\/)?((\w)+\.)+(com|org|net|edu|gov|mil|io|co|ai|app|dev|tech|info|biz|me|tv|uk)((\/)((\w|\/)+|(\w|\/|\.\w))*)?(\?\w(\w+|\&|\=|\#)+)?/gi;

const MAX_PREVIEW_LINES = 5;



interface TextContentProps {
    post: PostType
    style?: StyleProp<TextStyle>;
    truncate?: boolean;
}

export default function TextContent({ post, style, truncate = true }: TextContentProps) {
    if (post.deleted) return <Text style={[styles.redactedText, style]}>This post has been deleted</Text>;

    const content = post.content;

    const [isTruncated, setIsTruncated] = useState<boolean>(truncate);
    const numLines = (truncate && isTruncated) ? MAX_PREVIEW_LINES : 0;

    const segments = [];
    let lastIndex = 0;

    let match;
    while ((match = URL_REGEX.exec(content)) !== null) {
        if (match.index > lastIndex) segments.push({ type: 'text', content: content.slice(lastIndex, match.index) });
        segments.push({ type: 'link', content: match[0] });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) segments.push({ type: 'text', content: content.slice(lastIndex) });


    const handleLinkPress = async (url: string) => {
        try {
            const lowerCaseUrl = url.toLowerCase();
            const fullUrl = lowerCaseUrl.startsWith('http') ? lowerCaseUrl : `https://${lowerCaseUrl}`;
            const supported = await Linking.canOpenURL(url);
            if (supported) await Linking.openURL(fullUrl);
        } catch (error) {}
    }

    const handleTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
        if (!truncate) return;
        const renderedContent = e.nativeEvent.lines.map(line => line.text).join('');
        setIsTruncated(renderedContent !== content);
    }

    return (
        <>
            <Text
                style={[styles.defaultText, style]}  
                numberOfLines={numLines}
                onTextLayout={handleTextLayout} 
                ellipsizeMode='clip' 
                
            >
                {segments.map((segment, index) => (
                    (segment.type === 'link') ?
                        <Text
                            key={index}
                            style={{ color: COLORS.primary_1 }}
                            onPress={() => handleLinkPress(segment.content)}
                        >
                            {segment.content}
                        </Text>
                    :
                        <Text key={index}>{segment.content}</Text>
                ))}
            </Text>
            {isTruncated && (
                <TouchableOpacity onPress={() => setIsTruncated(false)}>
                    <Text style={styles.ellipsis}>{`...`}</Text>
                </TouchableOpacity>
            )}
        </>
    );
}



const styles = StyleSheet.create({
    defaultText: {
        paddingRight: 10,
        color: COLORS.black,
        fontSize: FONT_SIZES.m,
        overflow: 'hidden'
    },
    redactedText: {
        paddingRight: 10,
        color: COLORS.secondary_1,
        fontSize: FONT_SIZES.m,
        fontWeight: 700
    },
    ellipsis: {
        width: 30,
        fontSize: FONT_SIZES.l,
        color: COLORS.primary_1
    }
});