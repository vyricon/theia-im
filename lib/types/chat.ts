/**
 * Legacy vendor types from advanced-imessage-kit SDK.
 * 
 * ⚠️ NOTE: This file contains `any` types that come directly from the vendor SDK.
 * The `properties` field uses `any` because it contains opaque SDK-internal data
 * with no publicly documented structure.
 * 
 * These vendor types should not be modified. Wrap them with stricter types
 * in your application code if needed (see src/lib/types/).
 */
import type { Handle, HandleResponse } from "./handle";
import type { MessageResponse } from "./message";

export interface Chat {
    guid: string;
    chatIdentifier: string;
    displayName?: string;
    participants?: Handle[];
    style?: number;
}

export type ChatResponse = {
    originalROWID: number;
    guid: string;
    participants?: HandleResponse[];
    messages?: MessageResponse[];
    lastMessage?: MessageResponse;
    properties?: NodeJS.Dict<any>[] | null;
    style: number;
    chatIdentifier: string;
    isArchived: boolean;
    isFiltered?: boolean;
    displayName: string;
    groupId?: string;
    lastAddressedHandle?: string | null;
};
