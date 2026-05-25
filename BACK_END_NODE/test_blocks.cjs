const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const res = await prisma.$queryRaw`
    SELECT block_code_id, COUNT(*) as cnt 
    FROM api_plantation_bygov 
    WHERE dict_code_id IN ('0803', '03') 
    GROUP BY block_code_id
  `;
  console.log('bygov:', res);
  
  const resNgo = await prisma.$queryRaw`
    SELECT block_code_id, COUNT(*) as cnt 
    FROM api_plantation_byngo 
    WHERE dict_code_id IN ('0803', '03') 
    GROUP BY block_code_id
  `;
  console.log('byngo:', resNgo);

  const resPvt = await prisma.$queryRaw`
    SELECT block_code_id, COUNT(*) as cnt 
    FROM api_plantation_bypvt 
    WHERE dict_code_id IN ('0803', '03') 
    GROUP BY block_code_id
  `;
  console.log('bypvt:', resPvt);
}

test().catch(console.error).finally(()=>prisma.$disconnect());
