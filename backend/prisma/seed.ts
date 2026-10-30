import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 운영(Production) 및 평가 모드: 테스트 더미 계정 자동 생성을 비활성화합니다.
  console.log('✅ [Seed] 초기 데이터베이스가 깨끗한 상태로 준비되었습니다.');
}

main()
  .catch((e) => {
    console.error('❌ [Seed 실패]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
