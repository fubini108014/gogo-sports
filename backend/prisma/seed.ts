import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with high-quality images...')

  // 1. 建立測試使用者
  const passwordHash = await bcrypt.hash('password123', 12)

  const alex = await prisma.user.upsert({
    where: { email: 'alex@example.com' },
    update: {},
    create: {
      name: 'Alex Chen',
      email: 'alex@example.com',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      bio: '羽球愛好者，每週固定開團。目標是打遍台北各大運動中心！',
    },
  })

  const sarah = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: {
      name: 'Sarah Wu',
      email: 'sarah@example.com',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
      bio: '喜歡瑜伽與網球。週末不爬山就在球場上。',
    },
  })

  const kevin = await prisma.user.upsert({
    where: { email: 'kevin@example.com' },
    update: {},
    create: {
      name: 'Kevin Wang',
      email: 'kevin@example.com',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      bio: '馬拉松跑者，夜跑團領跑。',
    },
  })

  // 2. 建立社團
  const club1 = await prisma.club.upsert({
    where: { id: 'c1' },
    update: {},
    create: {
      id: 'c1',
      name: '台北羽球狂熱團',
      logo: 'https://images.unsplash.com/photo-1626224580194-860c3d317e9f?w=400&h=400&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=1200&h=400&fit=crop',
      rating: 4.8,
      description: '每週二四固定開團，歡迎新手老手一起流汗！我們注重球友間的互動與球技成長。',
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
      logo: 'https://images.unsplash.com/photo-1527010159945-c407bed5f267?w=400&h=400&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=400&fit=crop',
      rating: 4.9,
      description: '探索台灣百岳與古道，安全第一，樂趣第二。適合喜歡大自然的你。',
      tags: ['登山', '戶外', '風景'],
      city: '台北市',
    },
  })

  const club3 = await prisma.club.upsert({
    where: { id: 'c3' },
    update: {},
    create: {
      id: 'c3',
      name: '台中週末網球社',
      logo: 'https://images.unsplash.com/photo-1595435064212-3626378d44b9?w=400&h=400&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1554068865-24bccd4e3d77?w=1200&h=400&fit=crop',
      rating: 4.7,
      description: '台中的網球愛好者聚集地，週末早晨一起揮拍！',
      tags: ['網球', '週末', '社交'],
      city: '台中市',
    },
  })

  const club4 = await prisma.club.upsert({
    where: { id: 'c4' },
    update: {},
    create: {
      id: 'c4',
      name: '台北夜跑小隊 Night Run',
      logo: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=400&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=1200&h=400&fit=crop',
      rating: 4.5,
      description: '下班後的舒壓運動，沿著河濱一起跑。',
      tags: ['跑步', '夜跑', '舒壓'],
      city: '台北市',
    },
  })

  // 3. 設定管理員與成員
  const users = [alex, sarah, kevin]
  const clubs = [club1, club2, club3, club4]

  for (const club of clubs) {
    await prisma.clubAdmin.upsert({
      where: { userId_clubId: { userId: alex.id, clubId: club.id } },
      update: {},
      create: { userId: alex.id, clubId: club.id },
    })
    for (const user of users) {
      await prisma.clubMember.upsert({
        where: { userId_clubId: { userId: user.id, clubId: club.id } },
        update: {},
        create: { userId: user.id, clubId: club.id },
      })
    }
  }

  // 4. 建立活動
  const activity1 = await prisma.activity.upsert({
    where: { id: 'a1' },
    update: {},
    create: {
      id: 'a1',
      hostId: alex.id,
      clubId: club1.id,
      title: '週二晚間歡樂羽球 (含教練指導)',
      primarySport: 'BADMINTON',
      date: new Date('2026-03-10'),
      time: '19:00 - 21:00',
      location: '台北市大同運動中心',
      city: '台北市',
      price: 250,
      mode: 'LIMITED',
      status: 'OPEN',
      maxParticipants: 16,
      currentAppCount: 8,
      level: 'INTERMEDIATE',
      image: 'https://images.unsplash.com/photo-1626224580194-860c3d317e9f?w=800&h=500&fit=crop',
      description: '本週二固定團練，會有專業教練陪打指導一小時。使用 RSL 3 號球。',
      tags: ['羽球', '教練', '冷氣'],
      lat: 25.0634,
      lng: 121.5196,
    },
  })

  await prisma.activity.upsert({
    where: { id: 'a_past_1' },
    update: {},
    create: {
      id: 'a_past_1',
      hostId: alex.id,
      clubId: club1.id,
      title: '3月羽球月賽 - 挑戰組',
      primarySport: 'BADMINTON',
      date: new Date('2026-03-25'),
      time: '14:00 - 18:00',
      location: '中正運動中心',
      city: '台北市',
      price: 500,
      mode: 'LIMITED',
      status: 'ENDED',
      maxParticipants: 32,
      currentAppCount: 32,
      level: 'ADVANCED',
      image: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800&h=500&fit=crop',
      description: '3月份的月賽，積分排名賽。',
      tags: ['比賽', '羽球', '專業'],
    },
  })

  await prisma.activity.upsert({
    where: { id: 'a_now_1' },
    update: {},
    create: {
      id: 'a_now_1',
      hostId: sarah.id,
      clubId: club2.id,
      title: '清明連假：陽明山縱走',
      primarySport: 'HIKING',
      date: new Date('2026-04-04'),
      time: '08:00 - 16:00',
      location: '陽明山國家公園',
      city: '台北市',
      price: 0,
      mode: 'OPEN',
      status: 'ENDED',
      level: 'INTERMEDIATE',
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=500&fit=crop',
      description: '清明連假的第一天，一起去陽明山走走。',
      tags: ['登山', '縱走', '風景'],
    },
  })

  await prisma.activity.upsert({
    where: { id: 'a_full_1' },
    update: {},
    create: {
      id: 'a_full_1',
      hostId: alex.id,
      clubId: club1.id,
      title: '週二晚間歡樂羽球 (已額滿)',
      primarySport: 'BADMINTON',
      date: new Date('2026-04-07'),
      time: '19:00 - 21:00',
      location: '台北市大同運動中心',
      city: '台北市',
      price: 250,
      mode: 'LIMITED',
      status: 'FULL',
      maxParticipants: 16,
      currentAppCount: 16,
      level: 'INTERMEDIATE',
      image: 'https://images.unsplash.com/photo-1626224580194-860c3d317e9f?w=800&h=500&fit=crop',
      description: '本週固定團，報名已滿，歡迎關注下週。',
      tags: ['羽球', '歡樂團'],
    },
  })

  const activity_new_1 = await prisma.activity.upsert({
    where: { id: 'a_open_1' },
    update: {},
    create: {
      id: 'a_open_1',
      hostId: sarah.id,
      clubId: club3.id,
      title: '週末網球新手交流賽',
      primarySport: 'TENNIS',
      date: new Date('2026-04-11'),
      time: '09:00 - 12:00',
      location: '台中市網球場',
      city: '台中市',
      price: 300,
      mode: 'LIMITED',
      status: 'OPEN',
      maxParticipants: 12,
      currentAppCount: 4,
      level: 'BEGINNER',
      image: 'https://images.unsplash.com/photo-1554068865-24bccd4e3d77?w=800&h=500&fit=crop',
      description: '歡迎新手一起來切磋球技，有指導助教。',
      tags: ['網球', '新手', '台中'],
    },
  })

  await prisma.activity.upsert({
    where: { id: 'a_open_2' },
    update: {},
    create: {
      id: 'a_open_2',
      hostId: kevin.id,
      clubId: club4.id,
      title: '河濱 5K 夜跑',
      primarySport: 'RUNNING',
      date: new Date('2026-04-08'),
      time: '20:00 - 21:30',
      location: '大佳河濱公園',
      city: '台北市',
      price: 0,
      mode: 'OPEN',
      status: 'OPEN',
      level: 'BEGINNER',
      image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=500&fit=crop',
      description: '輕鬆跑 5 公里，跑完可以一起吃宵夜。',
      tags: ['夜跑', '健康', '台北'],
    },
  })

  await prisma.activity.upsert({
    where: { id: 'a_far_1' },
    update: {},
    create: {
      id: 'a_far_1',
      hostId: sarah.id,
      clubId: club2.id,
      title: '嘉明湖三日遊 (天使的眼淚)',
      primarySport: 'HIKING',
      date: new Date('2026-05-15'),
      time: '06:00',
      location: '嘉明湖國家步道',
      city: '台東縣',
      price: 8500,
      mode: 'LIMITED',
      status: 'OPEN',
      maxParticipants: 8,
      currentAppCount: 2,
      level: 'PRO',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop',
      description: '此行程為進階路線，需有百岳經驗與良好體能。',
      tags: ['登山', '嘉明湖', '進階'],
    },
  })

  // 5. 報名記錄（status: CONFIRMED → APPROVED，補上 contactMethod/realName）
  await prisma.registration.upsert({
    where: { userId_activityId: { userId: alex.id, activityId: activity1.id } },
    update: {},
    create: {
      userId: alex.id,
      activityId: activity1.id,
      status: 'APPROVED',
      contactMethod: 'Line: alex_chen',
      realName: 'Alex Chen',
    },
  })

  await prisma.registration.upsert({
    where: { userId_activityId: { userId: alex.id, activityId: activity_new_1.id } },
    update: {},
    create: {
      userId: alex.id,
      activityId: activity_new_1.id,
      status: 'APPROVED',
      contactMethod: 'Line: alex_chen',
      realName: 'Alex Chen',
    },
  })

  // 6. 貼文
  await prisma.post.upsert({
    where: { id: 'p1' },
    update: {},
    create: {
      id: 'p1',
      clubId: club1.id,
      authorId: alex.id,
      type: 'ANNOUNCEMENT',
      content: '各位球友注意，下週二的場地因體育館整修暫停一次，請大家不要白跑一趟喔！',
      images: ['https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?w=800&h=400&fit=crop'],
      likes: 24,
      comments: 5,
    },
  })

  await prisma.post.upsert({
    where: { id: 'p2' },
    update: {},
    create: {
      id: 'p2',
      clubId: club3.id,
      authorId: sarah.id,
      type: 'SHARE',
      content: '今天在台中練習網球，天氣超好！這裡的場地非常平整，強力推薦。',
      images: ['https://images.unsplash.com/photo-1595435064212-3626378d44b9?w=800&h=800&fit=crop'],
      likes: 12,
      comments: 2,
    },
  })

  await prisma.post.upsert({
    where: { id: 'p3' },
    update: {},
    create: {
      id: 'p3',
      clubId: club4.id,
      authorId: kevin.id,
      type: 'SHARE',
      content: '夜跑大佳河濱公園，風很涼，流汗的感覺真棒！',
      images: ['https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=800&h=800&fit=crop'],
      likes: 38,
      comments: 6,
    },
  })

  // 7. 通知
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
  console.log('Test account: alex@example.com / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
