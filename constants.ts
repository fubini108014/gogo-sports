import { Activity, Club, RegistrationMode, ActivityStatus, Level, User, Post, PostType, Notification, NotificationType } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Chen',
  avatar: 'https://picsum.photos/id/64/200/200',
  isClubAdmin: true,
  registeredActivityIds: ['a1', 'a8'],
  joinedClubIds: ['c1', 'c2'], // Joined Badminton and Hiking clubs
  managedClubIds: ['c1'], // Admin of Badminton club
};

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: NotificationType.ACTIVITY,
    title: '活動行前提醒',
    content: '您報名的「週二晚間歡樂羽球」將於明日 19:00 開始，請準時出席。',
    time: '1小時前',
    isRead: false,
    linkId: 'a1'
  },
  {
    id: 'n2',
    type: NotificationType.INTERACTION,
    title: '新的留言',
    content: 'Sarah Wu 回覆了您的貼文：「這張照片拍得真好！」',
    time: '3小時前',
    isRead: false,
    linkId: 'p3'
  },
  {
    id: 'n3',
    type: NotificationType.SYSTEM,
    title: '系統公告',
    content: 'GoGo Sports 平台將於本週日凌晨 02:00 進行系統維護，預計暫停服務 2 小時。',
    time: '1天前',
    isRead: true,
  },
  {
    id: 'n4',
    type: NotificationType.INVITE,
    title: '社團邀請',
    content: '「台北夜跑團」邀請您加入社團。',
    time: '2天前',
    isRead: true,
    linkId: 'c5'
  },
  {
    id: 'n5',
    type: NotificationType.ACTIVITY,
    title: '候補成功通知',
    content: '恭喜！您已成功候補上「陽明山東西大縱走」，請盡快確認報名資訊。',
    time: '3天前',
    isRead: true,
    linkId: 'a4'
  }
];

export const MOCK_CLUBS: Club[] = [
  {
    id: 'c1',
    name: '台北羽球狂熱團',
    logo: 'https://picsum.photos/id/10/200/200',
    rating: 4.8,
    membersCount: 1205,
    description: '每週二四固定開團，歡迎新手老手一起流汗！',
    tags: ['羽球', '室內', '競技'],
  },
  {
    id: 'c2',
    name: '山野行者 Hiking Club',
    logo: 'https://picsum.photos/id/12/200/200',
    rating: 4.9,
    membersCount: 3400,
    description: '探索台灣百岳與古道，安全第一，樂趣第二。',
    tags: ['登山', '戶外', '風景'],
  },
  {
    id: 'c3',
    name: '海人水上俱樂部',
    logo: 'https://picsum.photos/id/433/200/200',
    rating: 4.7,
    membersCount: 850,
    description: '專注於 SUP、衝浪與自由潛水，享受海洋的擁抱。',
    tags: ['SUP', '水上', '夏天'],
  },
  {
    id: 'c4',
    name: '鐵拳格鬥學院',
    logo: 'https://picsum.photos/id/158/200/200',
    rating: 5.0,
    membersCount: 420,
    description: '拳擊、泰拳教學與實戰切磋，釋放壓力的好去處。',
    tags: ['拳擊', '格鬥', '健身'],
  }
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    clubId: 'c1',
    title: '週二晚間歡樂羽球 (含教練指導)',
    date: '2023-11-14',
    time: '19:00 - 21:00',
    location: '台北市大同運動中心',
    price: 250,
    mode: RegistrationMode.LIMITED,
    status: ActivityStatus.OPEN,
    maxParticipants: 16,
    currentInternalCount: 4, // 4 people reserved via Line
    currentAppCount: 8,
    level: Level.INTERMEDIATE,
    image: 'https://picsum.photos/id/192/600/400',
    description: '本週二固定團練，會有專業教練陪打指導一小時。使用 RSL 3 號球。',
    tags: ['羽球', '教練', '冷氣'],
    lat: 25.0634, lng: 121.5196,
  },
  {
    id: 'a2',
    clubId: 'c2',
    title: '合歡北峰+西峰單攻 (百岳挑戰)',
    date: '2023-11-18',
    time: '04:00 集合',
    location: '南投縣仁愛鄉',
    price: 1200,
    mode: RegistrationMode.OPEN,
    status: ActivityStatus.OPEN,
    currentAppCount: 42,
    groups: ['攻頂挑戰組', '北峰休閒組', '攝影耍廢組'],
    level: Level.ADVANCED,
    image: 'https://picsum.photos/id/1018/600/400',
    description: '挑戰七上八下的西峰，需具備一定體能。費用包含保險與嚮導費，交通自理或申請共乘。',
    tags: ['百岳', '登山', '高強度'],
    lat: 23.9747, lng: 121.2053,
  },
  {
    id: 'a3',
    clubId: 'c1',
    title: '週四新手友善羽球局',
    date: '2023-11-16',
    time: '20:00 - 22:00',
    location: '台北市信義區信義國中體育館',
    price: 200,
    mode: RegistrationMode.LIMITED,
    status: ActivityStatus.FULL, // Full
    maxParticipants: 12,
    currentInternalCount: 6,
    currentAppCount: 6,
    level: Level.BEGINNER,
    image: 'https://picsum.photos/id/158/600/400',
    description: '專為新手開設，亦歡迎中手陪打。',
    tags: ['羽球', '新手', '交友'],
    lat: 25.0336, lng: 121.5636,
  },
  {
    id: 'a4',
    clubId: 'c2',
    title: '陽明山東西大縱走 (十連峰)',
    date: '2023-11-25',
    time: '06:00 集合',
    location: '台北市士林區風櫃嘴登山口',
    price: 300,
    mode: RegistrationMode.OPEN,
    status: ActivityStatus.OPEN,
    currentAppCount: 85,
    groups: ['全程組(10峰)', '半程組(5峰)'],
    level: Level.INTERMEDIATE,
    image: 'https://picsum.photos/id/1036/600/400',
    description: '台北郊山之王，練腳力的好地方。',
    tags: ['縱走', '健行', '風景'],
    lat: 25.1086, lng: 121.5619,
  },
  {
    id: 'a5',
    clubId: 'c1',
    title: '週末 3v3 籃球鬥牛賽',
    date: '2023-11-19',
    time: '14:00',
    location: '台北市新生高架橋下籃球場',
    price: 100,
    mode: RegistrationMode.LIMITED,
    status: ActivityStatus.OPEN,
    maxParticipants: 24,
    currentInternalCount: 0,
    currentAppCount: 12,
    level: Level.INTERMEDIATE,
    image: 'https://picsum.photos/id/829/600/400',
    description: '以球會友，自行組隊或現場分隊。',
    tags: ['籃球', '室外', '熱血'],
    lat: 25.0432, lng: 121.5320,
  },
  {
    id: 'a6',
    clubId: 'c3',
    title: '龍洞 SUP 日出團',
    date: '2023-11-26',
    time: '04:30 集合',
    location: '新北市貢寮區龍洞',
    price: 1500,
    mode: RegistrationMode.OPEN,
    status: ActivityStatus.OPEN,
    currentAppCount: 18,
    groups: ['日出團', '上午團'],
    level: Level.BEGINNER,
    image: 'https://picsum.photos/id/445/600/400',
    description: '在平靜的海面上欣賞絕美日出，教練隨行拍攝美照。',
    tags: ['SUP', '水上活動', '風景'],
    lat: 25.0031, lng: 121.9249,
  },
  {
    id: 'a7',
    clubId: 'c4',
    title: '週五格鬥體能特訓',
    date: '2023-11-17',
    time: '19:30 - 21:00',
    location: '台北市鐵拳格鬥學院 (信義館)',
    price: 400,
    mode: RegistrationMode.LIMITED,
    status: ActivityStatus.OPEN,
    maxParticipants: 12,
    currentInternalCount: 2,
    currentAppCount: 6,
    level: Level.ADVANCED,
    image: 'https://picsum.photos/id/342/600/400',
    description: '結合拳擊與高強度間歇運動，燃燒脂肪無極限。',
    tags: ['拳擊', '格鬥競技', '高強度'],
    lat: 25.0380, lng: 121.5700,
  },
  {
    id: 'a8',
    clubId: 'c1',
    title: '晨間喚醒瑜珈',
    date: '2023-11-20',
    time: '07:00 - 08:00',
    location: '台北市大安森林公園',
    price: 150,
    mode: RegistrationMode.OPEN,
    status: ActivityStatus.OPEN,
    currentAppCount: 15,
    level: Level.BEGINNER,
    image: 'https://picsum.photos/id/338/600/400',
    description: '在草地上呼吸新鮮空氣，伸展肢體，迎接美好的一天。',
    tags: ['瑜珈', '身心靈', '戶外'],
    lat: 25.0295, lng: 121.5344,
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    clubId: 'c1',
    author: { id: 'u1', name: 'Alex Chen', avatar: 'https://picsum.photos/id/64/200/200', isAdmin: true },
    type: PostType.ANNOUNCEMENT,
    content: '各位球友注意，下週二的場地因體育館整修暫停一次，請大家不要白跑一趟喔！我們將在週四加開一場補償大家。',
    createdAt: '2023-11-10T10:00:00Z',
    likes: 24,
    comments: 5
  },
  {
    id: 'p2',
    clubId: 'c1',
    author: { id: 'u2', name: 'Sarah Wu', avatar: 'https://picsum.photos/id/65/200/200', isAdmin: false },
    type: PostType.SHARE,
    content: '昨天晚上的比賽太精彩了！謝謝教練的指導，覺得反手拍有進步，下次再來挑戰 💪',
    images: ['https://picsum.photos/id/101/400/300', 'https://picsum.photos/id/102/400/300'],
    createdAt: '2023-11-09T22:30:00Z',
    likes: 45,
    comments: 12
  },
  {
    id: 'p3',
    clubId: 'c1',
    author: { id: 'u1', name: 'Alex Chen', avatar: 'https://picsum.photos/id/64/200/200', isAdmin: true },
    type: PostType.PHOTO,
    content: '週末團練大合照！大家笑容都很燦爛 😁 歡迎新朋友加入我們這個大家庭！',
    images: ['https://picsum.photos/id/103/800/600'],
    createdAt: '2023-11-05T09:00:00Z',
    likes: 67,
    comments: 8
  },
   {
    id: 'p4',
    clubId: 'c2',
    author: { id: 'u3', name: 'David Lee', avatar: 'https://picsum.photos/id/68/200/200', isAdmin: true },
    type: PostType.ANNOUNCEMENT,
    content: '【重要】合歡北峰活動行前說明會將於明晚 20:00 線上舉行，請有報名的夥伴務必參加，我們會講解裝備檢查與天氣預報。連結將發送至 Line 群組。',
    createdAt: '2023-11-15T12:00:00Z',
    likes: 30,
    comments: 15
  }
];

export interface SportCategory {
  name: string;
  items: string[];
}

export const SPORTS_HIERARCHY: SportCategory[] = [
  { name: '所有運動', items: [] },
  { name: '球類運動', items: ['羽球', '籃球', '排球', '網球', '桌球', '棒球', '足球', '高爾夫', '匹克球', '橄欖球', '保齡球'] },
  { name: '戶外探索', items: ['登山', '路跑', '單車', '露營', '攀岩', '滑板', '健行', '溯溪', '滑雪'] },
  { name: '水上活動', items: ['游泳', '衝浪', '潛水', 'SUP', '泛舟', '自由潛水', '滑水', '獨木舟'] },
  { name: '格鬥競技', items: ['拳擊', '柔道', '泰拳', '巴西柔術', '空手道', '跆拳道', '劍道', '角力'] },
  { name: '身心靈', items: ['瑜珈', '皮拉提斯', '冥想', '空中瑜珈', '太極'] },
  { name: '健身塑形', items: ['重訓', '有氧', 'CrossFit', 'TRX', '街頭健身', 'Zumba', '壺鈴'] },
  { name: '舞蹈律動', items: ['街舞', 'K-POP', '國標舞', '芭蕾', '爵士舞', 'Swing'] },
  { name: '極限運動', items: ['跑酷', 'BMX', '滑板', '直排輪'] },
  { name: '休閒娛樂', items: ['飛鏢', '撞球', '射箭'] },
];

export const TAIWAN_CITIES = [
  '全台灣',
  '台北市', '新北市', '基隆市', '桃園市', '新竹市', '新竹縣', '苗栗縣',
  '台中市', '彰化縣', '南投縣', '雲林縣', '嘉義市', '嘉義縣',
  '台南市', '高雄市', '屏東縣',
  '宜蘭縣', '花蓮縣', '台東縣',
  '澎湖縣', '金門縣', '連江縣'
];