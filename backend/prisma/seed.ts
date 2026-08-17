import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  const testUser = {
    id: 'test-user-id-001',
    email: 'test@test.com',
    password: hashedPassword,
    nickname: '테스터1',
    title: '초급 슬라이더',
    isTitleSeen: true,
  };

  await prisma.user.upsert({
    where: { email: testUser.email },
    update: { password: testUser.password },
    create: testUser,
  });

  console.log('✅ 테스트용 계정 생성 완료! (이메일: test@test.com / 비밀번호: 123456)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
