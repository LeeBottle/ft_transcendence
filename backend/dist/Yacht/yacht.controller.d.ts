import { YachtService } from './yacht.service';
export declare class YachtController {
    private readonly yachtService;
    constructor(yachtService: YachtService);
    createRoom(body: {
        title: string;
        hostNickname: string;
        password?: string | null;
        isPublic: boolean;
        maxPlayers: number;
    }): Promise<{
        id: string;
        title: string;
        hostNickname: string;
        password: string | null;
        isPublic: boolean;
        currentPlayers: number;
        maxPlayers: number;
        isGameStart: boolean;
        createdAt: Date;
    }>;
    getRooms(): Promise<{
        id: string;
        title: string;
        hostNickname: string;
        password: string | null;
        isPublic: boolean;
        currentPlayers: number;
        maxPlayers: number;
        isGameStart: boolean;
        createdAt: Date;
    }[]>;
}
