"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const dummyUsers = [
        { id: '1', nickname: 'a', email: 'a@test.com', password: 'dummy_password' },
        { id: '2', nickname: 'b', email: 'b@test.com', password: 'dummy_password' },
        { id: '3', nickname: 'c', email: 'c@test.com', password: 'dummy_password' },
        { id: '4', nickname: 'd', email: 'd@test.com', password: 'dummy_password' },
    ];
    for (const user of dummyUsers) {
        await prisma.user.upsert({
            where: { id: user.id },
            update: { nickname: user.nickname },
            create: user,
        });
    }
    console.log('✅ 테스트용 유저 데이터(1:a, 2:b, 3:c, 4:d)가 생성되었습니다.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map