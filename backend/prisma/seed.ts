import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 建立測試使用者
  const passwordHash = await bcrypt.hash('password123', 12)

  const alex = await prisma.user.upsert({
    where: { email: 'alex@example.com' },
    update: {},
    create: {
      name: 'Alex Chen',
      email: 'alex@example.com',
      passwordHash,
      avatar: 'https://picsum.photos/id/64/200/200',
      bio: '羽球愛好者，每週固定開團',
    },
  })

  const sarah = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: {
      name: 'Sarah Wu',
      email: 'sarah@example.com',
      passwordHash,
      avatar: 'https://picsum.photos/id/65/200/200',
    },
  })

  // 建立社團
  const club1 = await prisma.club.upsert({
    where: { id: 'c1' },
    update: {},
    create: {
      id: 'c1',
      name: '台北羽球狂熱團',
      logo: 'https://picsum.photos/id/10/200/200',
      rating: 4.8,
      description: '每週二四固定開團，歡迎新手老手一起流汗！',
      tags: ['羽球', '室內', '競技'],
      city: '台北市',
    },
  })

  const club2 = await prisma.club.upsert({
    where: { id: 'c2' },
    update: {},
    create: {
      id: 'c2',
      name: '山野行者 Hiking Club',
      logo: 'https://picsum.photos/id/12/200/200',
      rating: 4.9,
      description: '探索台灣百岳與古道，安全第一，樂趣第二。',
      tags: ['登山', '戶外', '風景'],
      city: '台北市',
    },
  })

  // 設定管理員與成員
  await prisma.clubAdmin.upsert({
    where: { userId_clubId: { userId: alex.id, clubId: club1.id } },
    update: {},
    create: { userId: alex.id, clubId: club1.id },
  })
  await prisma.clubMember.upsert({
    where: { userId_clubId: { userId: alex.id, clubId: club1.id } },
    update: {},
    create: { userId: alex.id, clubId: club1.id },
  })
  await prisma.clubMember.upsert({
    where: { userId_clubId: { userId: sarah.id, clubId: club1.id } },
    update: {},
    create: { userId: sarah.id, clubId: club1.id },
  })

  // 建立活動
  const activity1 = await prisma.activity.upsert({
    where: { id: 'a1' },
    update: {},
    create: {
      id: 'a1',
      clubId: club1.id,
      title: '週二晚間歡樂羽球 (含教練指導)',
      date: new Date('2026-03-10'),
      time: '19:00 - 21:00',
      location: '台北市大同運動中心',
      city: '台北市',
      price: 250,
      mode: 'LIMITED',
      status: 'OPEN',
      maxParticipants: 16,
      currentInternalCount: 4,
      currentAppCount: 8,
      level: 'INTERMEDIATE',
      image: 'https://picsum.photos/id/192/600/400',
      description: '本週二固定團練，會有專業教練陪打指導一小時。使用 RSL 3 號球。',
      tags: ['羽球', '教練', '冷氣'],
      lat: 25.0634,
      lng: 121.5196,
    },
  })

  // 報名記錄
  await prisma.registration.upsert({
    where: { userId_activityId: { userId: alex.id, activityId: activity1.id } },
    update: {},
    create: { userId: alex.id, activityId: activity1.id, status: 'CONFIRMED' },
  })

  // 貼文
  await prisma.post.upsert({
    where: { id: 'p1' },
    update: {},
    create: {
      id: 'p1',
      clubId: club1.id,
      authorId: alex.id,
      type: 'ANNOUNCEMENT',
      content: '各位球友注意，下週二的場地因體育館整修暫停一次，請大家不要白跑一趟喔！',
      images: [],
      likes: 24,
      comments: 5,
    },
  })

  // 通知
  await prisma.notification.create({
    data: {
      userId: alex.id,
      type: 'ACTIVITY',
      title: '活動行前提醒',
      content: '您報名的「週二晚間歡樂羽球」將於明日 19:00 開始，請準時出席。',
      isRead: false,
      linkId: activity1.id,
      linkType: 'activity',
    },
  })

  console.log('Seed completed!')
  console.log(`Test account: alex@example.com / password123`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
