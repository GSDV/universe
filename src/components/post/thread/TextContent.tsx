import { Linking, StyleProp, Text, TextStyle, StyleSheet } from 'react-native';

import { COLORS, FONT_SIZES } from '@util/global-client';



export default function TextContent({ content, style }: { content: string, style?: StyleProp<TextStyle>}) {
    const urlRegex = /(https:\/\/|http:\/\/)?((\w)+\.)+(com|org|net|edu|gov|mil|io|co|ai|app|dev|tech|info|biz|me|tv|uk)((\/)((\w|\/)+|(\w|\/|\.\w))*)?(\?\w(\w+|\&|\=|\#)+)?/gi;

    const segments = [];
    let lastIndex = 0;

    let match;
    while ((match = urlRegex.exec(content)) !== null) {
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

    return (
        <Text style={[defaultStyles.text, style]}>
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
    );
}



const defaultStyles = StyleSheet.create({
    text: {
        color: COLORS.black,
        fontSize: FONT_SIZES.m
    }
});