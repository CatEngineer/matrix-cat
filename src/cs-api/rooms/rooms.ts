/* eslint-disable */
import { Entity, Manager } from "@internal/index.js";
import { EventManager, RoomMemberManager } from "@api/index.js";
import type { SyncData } from "@api/api.js";

/** @internal */
export type RoomConstructData = {
    id: string;
}

export class Room extends Entity<RoomManager> {
    public readonly events: EventManager;

    public readonly members: RoomMemberManager;

    private readonly data: RoomConstructData;

    /** @internal */
    constructor(manager: RoomManager, data: RoomConstructData) {
        super(manager, data.id);
        this.events = new EventManager(this, `${this.id}-events`);
        this.members = new RoomMemberManager(this, `${this.id}-members`);
        this.data = data;
    }

    public toJSON() {
        return this.data;
    }
}

export class RoomManager extends Manager<string, Room> {
    public async getRoom(id: string): Promise<Room> {
        return new Room(this, { id });
    }

    public async handleSync(data: SyncData): Promise<void> {
        await this.handleJoins(data);
        await this.handleKicks(data);
        await this.handleInvites(data);
        await this.handleKnocks(data);
    }

    public fromJSON(data: string): Room {
        const from = JSON.parse(data);
        return new Room(this, from)
    }

    private async handleJoins(data: SyncData): Promise<void> {
        this.each(data.rooms?.join, (room) => {
            this.each(room.state?.events, (state) => {
            });
        });
    }

    private async handleKicks(data: SyncData): Promise<void> {
        this.each(data.rooms?.leave, (room) => {
            this.each(room.state?.events, state => {
            })
        });
    }

    private async handleInvites(data: SyncData): Promise<void> {
        this.each(data.rooms?.invite, (room) => {
        });
    }

    private async handleKnocks(data: SyncData): Promise<void> {
        this.each(data.rooms?.knock, (room) => {
        });
    }

    private each<T>(record: T[] | undefined, callback: (value: T) => void): void;
    private each<T>(record: Record<string, T> | undefined, callback: (value: T) => void): void;
    private each<T>(record: Record<string, T> | T[] | undefined, callback: (value: T) => void): void {
        if (!record) return;
        if (Array.isArray(record)) {
            for (const value of record) callback(value);
            return;
        }

        const keys = Object.keys(record);
        for (const key of keys) {
            const value = record[key];
            if (value) callback(value);
        }
    }
}