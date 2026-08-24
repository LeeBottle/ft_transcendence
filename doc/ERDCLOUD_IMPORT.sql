-- ERDCloud PostgreSQL Import
-- 현재 backend/prisma/schema.prisma 기준 임시 DDL

CREATE TABLE "User" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "nickname" VARCHAR(50) NOT NULL UNIQUE,
    "avatar" VARCHAR(255),
    "title" VARCHAR(100) DEFAULT '초급 슬라이더',
    "equippedTitle" VARCHAR(100),
    "isTitleSeen" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

CREATE TABLE "Room" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(100) NOT NULL,
    "hostNickname" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255),
    "isPublic" BOOLEAN NOT NULL DEFAULT TRUE,
    "currentPlayers" INTEGER NOT NULL DEFAULT 1,
    "maxPlayers" INTEGER NOT NULL DEFAULT 2,
    "isGameStart" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    "slot1Ready" BOOLEAN NOT NULL DEFAULT FALSE,

    "slot2Open" BOOLEAN NOT NULL DEFAULT TRUE,
    "slot2IsAi" BOOLEAN NOT NULL DEFAULT FALSE,
    "slot2Nick" VARCHAR(50),
    "slot2Ready" BOOLEAN NOT NULL DEFAULT FALSE,

    "slot3Open" BOOLEAN NOT NULL DEFAULT FALSE,
    "slot3IsAi" BOOLEAN NOT NULL DEFAULT FALSE,
    "slot3Nick" VARCHAR(50),
    "slot3Ready" BOOLEAN NOT NULL DEFAULT FALSE,

    "slot4Open" BOOLEAN NOT NULL DEFAULT FALSE,
    "slot4IsAi" BOOLEAN NOT NULL DEFAULT FALSE,
    "slot4Nick" VARCHAR(50),
    "slot4Ready" BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT "Room_player_count_check"
        CHECK ("currentPlayers" >= 0 AND "currentPlayers" <= "maxPlayers"),
    CONSTRAINT "Room_max_players_check"
        CHECK ("maxPlayers" BETWEEN 2 AND 4)
);

-- 아래 테이블은 doc/DATABASE_SCHEMA.md에 정의된 예정 스키마입니다.

CREATE TABLE "Friend" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "friendId" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friend_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "Friend_friend_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "Friend_user_friend_unique" UNIQUE ("userId", "friendId"),
    CONSTRAINT "Friend_not_self_check" CHECK ("userId" <> "friendId"),
    CONSTRAINT "Friend_status_check" CHECK ("status" IN ('PENDING', 'ACCEPTED', 'BLOCKED'))
);

CREATE TABLE "GameHistory" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "gameType" VARCHAR(50) NOT NULL,
    "player1Id" UUID NOT NULL,
    "player2Id" UUID NOT NULL,
    "player1Score" INTEGER NOT NULL,
    "player2Score" INTEGER NOT NULL,
    "winnerId" UUID,
    "playedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameHistory_player1_fkey" FOREIGN KEY ("player1Id") REFERENCES "User"("id"),
    CONSTRAINT "GameHistory_player2_fkey" FOREIGN KEY ("player2Id") REFERENCES "User"("id"),
    CONSTRAINT "GameHistory_winner_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id"),
    CONSTRAINT "GameHistory_type_check" CHECK ("gameType" IN ('TICTACTOE', 'YACHT', 'PONG'))
);

CREATE TABLE "Achievement" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL UNIQUE,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" VARCHAR(255)
);

CREATE TABLE "UserAchievement" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "achievementId" UUID NOT NULL,
    "unlockedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "UserAchievement_achievement_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE,
    CONSTRAINT "UserAchievement_unique" UNIQUE ("userId", "achievementId")
);

CREATE TABLE "ChatMessage" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "senderId" UUID NOT NULL,
    "roomId" VARCHAR(100) NOT NULL,
    "message" TEXT NOT NULL,
    "sentAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_sender_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE
);
