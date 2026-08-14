import { PrismaService } from '../prisma/prisma.service';
export declare class YachtService {
    private prisma;
    constructor(prisma: PrismaService);
    createRoom(data: {
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
