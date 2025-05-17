// Custom types for use in both frontend and backend
// File must be the same between the two, but each repo needs its own verison of it

import { z } from 'zod';
import { MAX_POST_MEDIA, MAX_POST_CONTENT_LENGTH, MIN_POST_CONTENT_LENGTH } from './global';



export interface UserType extends RedactedUserType {
    email: string;
    password: string;
    salt: string;
}



export interface RedactedUserWithFollow extends RedactedUserType {
    isFollowed: boolean;
}

// isBlocking: Logged in user is blocking this account
// isBlockedBy: Logged in user is blocked by this account
export interface RedactedUserWithFollowAndBlock extends RedactedUserWithFollow {
    isBlocking: boolean;
    isBlockedBy: boolean;
}



export interface RedactedUserType {
    id: string;
    username: string;
    displayName: string;
    pfpKey: string;
    bio: string;
    university?: UniversityWithoutUsers;
    followerCount: number;
    followingCount: number;
    verified: boolean;
}



export interface UniversityWithoutUsers {
    id: string;
    domain: string;
    name: string;
    color: string;
}



export interface PostType {
    createdAt: string;
    id: string;
    author: RedactedUserType;
    content: string;
    media: string[];
    lat: number | null;
    lng: number | null;
    pinned: boolean;
    likeCount: number;
    replyToId: string | null;
    replyCount: number;
    isLiked: boolean;
    deleted: boolean;
}

export const createPostSchema = z.object({
    content: z.string().trim().min(MIN_POST_CONTENT_LENGTH, `Content must be longer than ${MIN_POST_CONTENT_LENGTH-1} characters.`).max(MAX_POST_CONTENT_LENGTH, `Content must be shorter than ${MAX_POST_CONTENT_LENGTH+1} characters.`),
    media: z.array(z.string()).min(0, `Something went wrong.`).max(MAX_POST_MEDIA, `A max of ${MAX_POST_MEDIA} media is allowed.`),
    hasLocation: z.boolean(),
    lat: z.number().min(-90, `Invalid latitude.`).max(90, `Invalid latitude.`).optional(),
    lng: z.number().min(-180, `Invalid longitude.`).max(180, `Invalid longitude.`).optional()
});
export type PostDataInput = z.infer<typeof createPostSchema>;