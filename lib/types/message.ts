/**
 * Legacy vendor types from advanced-imessage-kit SDK.
 * 
 * ⚠️ NOTE: This file contains `any` types that come directly from the vendor SDK.
 * These are intentionally preserved to match the SDK's type definitions.
 * The `any` types are used for:
 * - attributedBody: Complex SDK-internal structure not exposed in public types
 * - messageSummaryInfo: Opaque SDK metadata
 * - payloadData: Variable SDK payload format
 * 
 * These vendor types should not be modified. Wrap them with stricter types
 * in your application code if needed (see src/lib/types/).
 */
import type { Attachment, AttachmentResponse } from "./attachment";
import type { Chat, ChatResponse } from "./chat";
import type { Handle, HandleResponse } from "./handle";

export interface SendMessageOptions {
    chatGuid: string;
    message: string;
    tempGuid?: string;
    subject?: string;
    effectId?: string;
    selectedMessageGuid?: string;
    partIndex?: number;
}

export interface MessageData {
    guid: string;
    text?: string;
    subject?: string;
    dateCreated: number;
    dateRead?: number;
    dateDelivered?: number;
    isFromMe: boolean;
    handle?: Handle;
    chats?: Chat[];
    attachments?: Attachment[];
}

export interface Message {
    guid: string;
    text: string;
    service?: string;
    handle?: Handle | null;
    chats?: Chat[];
    attachments?: Attachment[];
    subject: string;
    error: number;
    dateCreated: number;
    dateRead: number | null;
    dateDelivered: number | null;
    isFromMe: boolean;
    isDelivered?: boolean;
    isArchived: boolean;
    isAudioMessage?: boolean;
    datePlayed?: number | null;
    itemType: number;
    groupTitle: string | null;
    groupActionType: number;
    dateEdited?: number | null;
}

export type MessageResponse = {
    originalROWID: number;
    tempGuid?: string;
    guid: string;
    text: string;
    attributedBody?: any[];
    messageSummaryInfo?: NodeJS.Dict<any>[];
    handle?: HandleResponse | null;
    handleId: number;
    otherHandle: number;
    chats?: ChatResponse[];
    attachments?: AttachmentResponse[];
    subject: string;
    country?: string;
    error: number;
    dateCreated: number;
    dateRead: number | null;
    dateDelivered: number | null;
    isFromMe: boolean;
    isDelayed?: boolean;
    isDelivered?: boolean;
    isAutoReply?: boolean;
    isSystemMessage?: boolean;
    isServiceMessage?: boolean;
    isForward?: boolean;
    isArchived: boolean;
    hasDdResults?: boolean;
    cacheRoomnames?: string | null;
    isAudioMessage?: boolean;
    datePlayed?: number | null;
    itemType: number;
    groupTitle: string | null;
    groupActionType: number;
    isExpired?: boolean;
    balloonBundleId: string | null;
    associatedMessageGuid: string | null;
    associatedMessageType: string | null;
    expressiveSendStyleId: string | null;
    timeExpressiveSendPlayed?: number | null;
    replyToGuid?: string | null;
    isCorrupt?: boolean;
    isSpam?: boolean;
    threadOriginatorGuid?: string | null;
    threadOriginatorPart?: string | null;
    dateRetracted?: number | null;
    dateEdited?: number | null;
    partCount?: number | null;
    payloadData?: NodeJS.Dict<any>[];
    hasPayloadData?: boolean;
    isPoll?: boolean;
    wasDeliveredQuietly?: boolean;
    didNotifyRecipient?: boolean;
    shareStatus?: number | null;
    shareDirection?: number | null;
};
