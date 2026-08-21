import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Lang = string

/** Languages offered in the picker. Only `en` and `ko` ship full translations;
 *  others fall back to English copy while keeping the selected label. */
export const LANGUAGES: { code: Lang; name: string; native: string }[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'sv', name: 'Swedish', native: 'Svenska' },
  { code: 'uk', name: 'Ukrainian', native: 'Українська' },
]

type Dict = Record<string, string>

const en: Dict = {
  // common
  'common.next': 'Next',
  'common.back': 'Back',
  'common.done': 'Done',
  'common.save': 'Save',
  'common.saved': 'Saved',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.on': 'On',
  'common.off': 'Off',
  'common.verify': 'Verify',
  'common.verified': 'Verified',
  'common.optional': 'optional',

  // auth
  'auth.login.title': 'Welcome back',
  'auth.login.sub': 'Sign in to sync your wardrobe across devices.',
  'auth.login.submit': 'Sign in',
  'auth.login.busy': 'Signing in…',
  'auth.login.noAccount': "Don't have an account?",
  'auth.signup.title': 'Create an account',
  'auth.signup.sub': 'Your outfits, style profile and eco points, saved for good.',
  'auth.signup.submit': 'Sign up',
  'auth.signup.busy': 'Creating…',
  'auth.signup.hasAccount': 'Already have an account?',
  'auth.name': 'Name',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.password.rule': 'At least 8 characters, with letters and numbers.',
  'auth.consent.all': 'Agree to all',
  'auth.consent.terms': 'Terms of Service',
  'auth.consent.privacy': 'Privacy Policy',
  'auth.consent.data': 'Data collection consent',
  'auth.consent.required': 'required',
  'auth.consent.optional': 'optional',
  'auth.error.generic': 'Something went wrong. Please try again.',
  'auth.logout': 'Sign out',
  'auth.checking': 'Loading…',
  'auth.offline.badge': 'Offline',
  'demo.badge': 'Demo',
  'demo.note': 'Demo build — there is no server, so changes stay on this device.',
  'demo.notice': 'This is a live demo running without a server.',
  'demo.hint': 'Sign in with test@test.com / 1234, or create an account — both stay on this device.',
  'demo.browse': 'Just look around',
  'auth.offline.note': 'The server is unreachable, so changes are saved on this device only.',
  'auth.offline.retry': 'Retry',
  'auth.syncError': 'Could not save to the server: {message}',
  'auth.local.notice': 'The server is unreachable. You can continue in local mode on this device.',
  'auth.local.devHint': 'Local account: test@test.com / 1234',
  'auth.local.loginFailed':
    'The server is unreachable, so only accounts saved on this device can sign in.',
  'auth.local.unsupported': 'Offline signup is not available in this browser.',
  'auth.local.duplicate': 'That email is already in use on this device.',
  'auth.offline.browse': 'Browse offline',

  // outfit builder
  'outfit.title': 'Outfit Builder',
  'outfit.loading': 'Loading your wardrobe…',
  'outfit.colorMatch': '{n}% Color Match',
  'ai.error.generic': 'Could not reach the stylist. Please try again.',

  'ai.garment.add': 'Add by photo',
  'ai.garment.title': 'Add from a photo',
  'ai.garment.analyzing': 'Reading the photo…',
  'ai.garment.notFound': "Couldn't find a garment in that photo.",
  'ai.garment.name': 'Name',
  'ai.garment.type': 'Kind',
  'ai.garment.color': 'Color',
  'ai.garment.material': 'Material',
  'ai.garment.style': 'Style',
  'ai.garment.co2': 'CO2 saved',
  'ai.garment.co2Value': '{kg}kg per wear instead of buying new',
  'ai.garment.save': 'Add to my closet',
  'ai.garment.saving': 'Adding…',
  'ai.garment.hint': 'Fix anything that looks wrong before adding.',

  'ai.stylist.title': 'AI stylist',
  'ai.stylist.review': 'Rate this outfit',
  'ai.stylist.suggest': 'Suggest outfits',
  'ai.stylist.working': 'Thinking…',
  'ai.stylist.noSuggestions': 'No combinations to suggest yet.',
  'ai.stylist.slot.top': 'Top',
  'ai.stylist.slot.bottom': 'Bottom',
  'ai.stylist.slot.shoes': 'Shoes',

  "ai.eco.title": "Wear it, don't buy it",
  'ai.eco.sub': 'See whether your closet already covers this look.',
  'ai.eco.check': 'Check my closet',
  'ai.eco.checking': 'Looking…',
  'ai.eco.saved': '{kg}kg CO2 avoided · {n} eco points',

  'outfit.type.top': 'Top',
  'outfit.type.bottom': 'Bottom',
  'outfit.type.shoes': 'Shoes',
  'outfit.current': 'Current Outfit',
  'outfit.bookmark': 'Bookmark outfit',
  'outfit.tops': 'Suggested Tops',
  'outfit.bottoms': 'Suggested Bottoms',
  'outfit.shoes': 'Shoes',
  'outfit.save': 'Save Outfit',
  'outfit.saved': 'Saved ✓',
  'outfit.saving': 'Saving…',
  'outfit.reward': 'Saves {kg} kg CO₂ · earns {n} EP',
  'outfit.empty': 'Register a top and a bottom to start building outfits.',

  // profile
  'profile.title': 'Profile',
  'profile.settings': 'Settings',
  'profile.totalItems': 'Total Items',
  'profile.outfits': 'Outfits Created',
  'profile.co2Saved': 'CO₂ Saved',
  'menu.saved': 'Likes & Saves',
  'menu.chats': 'Chats',
  'menu.styleSurvey': 'Update Style Survey',
  'menu.language': 'Language',
  'menu.notifications': 'Notifications',
  'menu.privacy': 'Privacy & Data',
  'menu.help': 'Help & Support',
  'menu.about': 'About Codimoment',
  'ecoPoints.title': 'Eco Points',
  'ecoPoints.available': '{n} EP available',
  'profile.changePhoto': 'Change photo',
  'profile.editName': 'Edit name',
  'banner.title': 'Edit banner',
  'banner.color': 'Pick a color',
  'banner.photo': 'Use a photo instead',
  'banner.note': 'Choose a color, or use a photo from your files or gallery.',

  // survey
  'survey.title': 'Style Survey',
  'survey.intro': 'We use your answers to personalize your feed. You can update this anytime.',
  'survey.step': 'Step {n} of {m}',
  'survey.skin.title': 'Your skin tone',
  'survey.skin.sub': 'We celebrate every skin tone. This helps us recommend colors that suit you.',
  'survey.style.title': 'Favorite style',
  'survey.style.sub': 'Pick the one that feels most like you.',
  'survey.body.title': 'Body info',
  'survey.body.sub': 'Used only to suggest flattering fits — never shared.',
  'survey.body.height': 'Height (cm)',
  'survey.body.weight': 'Weight (kg)',
  'survey.body.age': 'Age',
  'survey.fit.title': 'Preferred fit',
  'survey.fit.sub': 'How do you like your clothes to sit?',
  'survey.result.title': 'Your style profile',
  'survey.result.sub': 'Our AI summarized your answers into these keywords.',
  'survey.result.note': 'These keywords appear under your name and guide your recommendations.',
  'survey.result.apply': 'Apply to profile',
  'fit.slim.desc': 'Close to the body, sharp silhouette.',
  'fit.regular.desc': 'Classic, balanced everyday fit.',
  'fit.over.desc': 'Relaxed and roomy, on-trend drape.',
  'skin.white': 'White',
  'skin.africanBlack': 'Black — African',
  'skin.britishBlack': 'Black — British',
  'skin.meBlack': 'Black — Middle Eastern',
  'skin.asian': 'Asian',
  'skin.southAsian': 'South Asian',
  'skin.hispanic': 'Hispanic / Latino',
  'skin.indigenous': 'Indigenous',
  'skin.mixed': 'Mixed / Multiracial',
  'skin.na': 'Prefer not to say',

  // language
  'lang.title': 'Language',
  'lang.sub': 'Choose your language. Fashion terms like "Over Fit" and "Casual" stay in English.',
  'lang.search': 'Search languages',
  'lang.noResults': 'No languages found',
  'lang.current': 'Current',
  'lang.fallbackNote': 'Full translation is available in English and 한국어. Other languages are coming soon.',

  // notifications
  'notif.title': 'Notifications',
  'notif.push.title': 'Push notifications',
  'notif.push.sub': 'Allow Codimoment to send push notifications to this phone.',
  'notif.push.q': 'Enable push notifications on this device?',
  'notif.push.onNote': 'Notifications will be delivered to your phone.',
  'notif.push.offNote': "You won't receive any push notifications.",
  'notif.categories': 'Categories',
  'notif.marketing.title': 'Messages & marketing',
  'notif.marketing.sub': 'App messages and promotional offers.',
  'notif.social.title': 'Social updates',
  'notif.social.sub': 'Likes, comments and follows on your outfits.',
  'notif.eco.title': 'Eco & carbon reports',
  'notif.eco.sub': 'Eco Points news and weekly carbon savings check-ins.',
  'notif.disabledNote': 'Turn on push notifications to receive these.',
  'notif.log.title': 'Notification log',
  'notif.log.show': 'Show log',
  'notif.log.hide': 'Hide log',

  // privacy
  'privacy.title': 'Privacy & Data',
  'privacy.appearance.title': 'Appearance',
  'privacy.darkmode': 'Dark mode',
  'privacy.darkmode.sub': 'Dim the interface to reduce eye strain, like YouTube.',
  'privacy.verify.title': 'Identity verification',
  'privacy.verify.sub': 'Verify your email and phone to secure your account.',
  'privacy.email': 'Email',
  'privacy.phone': 'Phone number',
  'privacy.edit.title': 'Edit profile',
  'privacy.edit.sub': 'Customize how you appear across Codimoment.',
  'privacy.photo': 'Profile photo',
  'privacy.banner': 'Banner',
  'privacy.change': 'Change',
  'privacy.name': 'Name',
  'privacy.gender': 'Gender',
  'privacy.bio': 'Bio',
  'privacy.bio.ph': 'Say a little about your style…',
  'gender.female': 'Female',
  'gender.male': 'Male',
  'gender.nonbinary': 'Non-binary',
  'gender.na': 'Prefer not to say',
  'privacy.consent.title': 'Consent & agreements',
  'privacy.consent.sub': 'See exactly what you agreed to, in full detail.',
  'privacy.consent.terms': 'Terms of Service',
  'privacy.consent.privacy': 'Privacy Policy',
  'privacy.consent.data': 'Data collection consent',
  'privacy.consent.signed': 'Agreed on {date}',
  'privacy.consent.view': 'View full document',
  'privacy.address.title': 'Shipping address',
  'privacy.address.address': 'Address',
  'privacy.address.zip': 'Postal code',
  'privacy.history.title': 'Browsing history',
  'privacy.history.sub': 'Items you viewed recently, like a watch history.',
  'privacy.history.clear': 'Clear history',
  'privacy.history.empty': 'Your history is empty.',

  // help
  'help.title': 'Help & Support',
  'help.sub': 'What do you need help with?',
  'help.cat.purchase': "I can't buy an item",
  'help.cat.shipping': 'Shipping questions',
  'help.cat.privacy': 'Privacy questions',
  'help.cat.bug': 'App bug',
  'help.cat.report': 'Report a malicious user',
  'help.cat.other': 'Other',
  'help.advice': 'Try these first',
  'help.stillStuck': 'Still not solved?',
  'help.stillStuck.sub': 'Connect with a support agent in real time.',
  'help.liveChat': 'Start live chat',
  'help.connecting': 'Connecting you to an agent…',
  'help.connected': "You're connected. An agent will reply shortly.",

  // about
  'about.title': 'About Codimoment',
  'about.tagline': 'An AI fashion director for a lighter, longer-lasting wardrobe.',
  'about.mission.title': 'Our mission',
  'about.mission.body':
    'Codimoment helps you rediscover what you already own. Our AI styles outfits from your wardrobe, cuts impulse buys, and measures the CO₂ you save with every reworn look.',
  'about.team.title': 'The team',
  'about.team.sub': 'Built by a small crew who love clothes and hate waste.',
  'about.how.title': "How it's built",
  'about.how.body':
    'Designed in Figma, built with React and Tailwind, and powered by a Claude-based styling model. Carbon figures use published apparel lifecycle data.',
  'about.contact.title': 'Business inquiries',
  'about.company.title': 'Company information',
  'about.company.name': 'Business name',
  'about.company.rep': 'Representative',
  'about.company.reg': 'Business reg. no.',
  'about.company.address': 'Address',
  'about.legal.title': 'Legal & compliance',
  'about.legal.body':
    'Codimoment complies with the GDPR and applicable e-commerce and consumer-protection laws. Personal data is processed under our Privacy Policy; agreements are retained per statutory retention periods.',
  'about.version': 'Version',
}

const ko: Dict = {
  // common
  'common.next': '다음',
  'common.back': '뒤로',
  'common.done': '완료',
  'common.save': '저장',
  'common.saved': '저장됨',
  'common.yes': '예',
  'common.no': '아니오',
  'common.on': '켜짐',
  'common.off': '꺼짐',
  'common.verify': '인증',
  'common.verified': '인증됨',
  'common.optional': '선택',

  // auth
  'auth.login.title': '다시 오셨네요',
  'auth.login.sub': '로그인하면 옷장이 기기 간에 동기화돼요.',
  'auth.login.submit': '로그인',
  'auth.login.busy': '로그인 중…',
  'auth.login.noAccount': '아직 계정이 없으신가요?',
  'auth.signup.title': '계정 만들기',
  'auth.signup.sub': '코디와 스타일 프로필, 에코 포인트를 안전하게 보관해요.',
  'auth.signup.submit': '회원가입',
  'auth.signup.busy': '가입 중…',
  'auth.signup.hasAccount': '이미 계정이 있으신가요?',
  'auth.name': '이름',
  'auth.email': '이메일',
  'auth.password': '비밀번호',
  'auth.password.rule': '영문과 숫자를 포함해 8자 이상 입력해 주세요.',
  'auth.consent.all': '전체 동의',
  'auth.consent.terms': '이용약관',
  'auth.consent.privacy': '개인정보 처리방침',
  'auth.consent.data': '데이터 수집 동의',
  'auth.consent.required': '필수',
  'auth.consent.optional': '선택',
  'auth.error.generic': '문제가 발생했어요. 다시 시도해 주세요.',
  'auth.logout': '로그아웃',
  'auth.checking': '불러오는 중…',
  'auth.offline.badge': '오프라인',
  'demo.badge': '데모',
  'demo.note': '데모 버전이라 서버가 없어요. 변경사항은 이 기기에만 저장돼요.',
  'demo.notice': '서버 없이 도는 데모 버전이에요.',
  'demo.hint': 'test@test.com / 1234 로 로그인하거나 새로 가입해 보세요. 모두 이 기기에만 저장돼요.',
  'demo.browse': '그냥 둘러보기',
  'auth.offline.note': '서버에 연결할 수 없어 변경사항이 이 기기에만 저장돼요.',
  'auth.offline.retry': '다시 연결',
  'auth.syncError': '서버에 저장하지 못했어요: {message}',
  'auth.local.notice': '서버에 연결할 수 없어요. 이 기기에 저장된 계정으로 계속할 수 있어요.',
  'auth.local.devHint': '로컬 계정: test@test.com / 1234',
  'auth.local.loginFailed': '서버에 연결할 수 없어, 이 기기에 저장된 계정으로만 로그인할 수 있어요.',
  'auth.local.unsupported': '이 브라우저에서는 오프라인 가입을 사용할 수 없어요.',
  'auth.local.duplicate': '이 기기에서 이미 사용 중인 이메일이에요.',
  'auth.offline.browse': '둘러보기',

  // outfit builder
  'outfit.title': '코디 만들기',
  'outfit.loading': '옷장을 불러오는 중…',
  'outfit.colorMatch': '색 매칭 {n}%',
  'ai.error.generic': '스타일리스트를 부르지 못했어요. 다시 시도해 주세요.',

  'ai.garment.add': '사진으로 등록',
  'ai.garment.title': '사진으로 옷 등록',
  'ai.garment.analyzing': '사진을 읽는 중…',
  'ai.garment.notFound': '사진에서 옷을 찾지 못했어요.',
  'ai.garment.name': '이름',
  'ai.garment.type': '종류',
  'ai.garment.color': '색상',
  'ai.garment.material': '소재',
  'ai.garment.style': '스타일',
  'ai.garment.co2': '절감 CO2',
  'ai.garment.co2Value': '새로 사지 않고 입으면 {kg}kg',
  'ai.garment.save': '옷장에 등록',
  'ai.garment.saving': '등록 중…',
  'ai.garment.hint': '틀린 곳이 있으면 고친 뒤 등록해 주세요.',

  'ai.stylist.title': 'AI 스타일리스트',
  'ai.stylist.review': '이 코디 평가',
  'ai.stylist.suggest': '조합 추천',
  'ai.stylist.working': '생각하는 중…',
  'ai.stylist.noSuggestions': '아직 추천할 조합이 없어요.',
  'ai.stylist.slot.top': '상의',
  'ai.stylist.slot.bottom': '하의',
  'ai.stylist.slot.shoes': '신발',

  'ai.eco.title': '사지 말고 입기',
  'ai.eco.sub': '지금 옷장으로 이 룩을 낼 수 있는지 확인해 보세요.',
  'ai.eco.check': '내 옷장 확인',
  'ai.eco.checking': '찾는 중…',
  'ai.eco.saved': 'CO2 {kg}kg 절감 · 에코 포인트 {n}',

  'outfit.type.top': '상의',
  'outfit.type.bottom': '하의',
  'outfit.type.shoes': '신발',
  'outfit.current': '현재 코디',
  'outfit.bookmark': '코디 북마크',
  'outfit.tops': '추천 상의',
  'outfit.bottoms': '추천 하의',
  'outfit.shoes': '신발',
  'outfit.save': '코디 저장',
  'outfit.saved': '저장됨 ✓',
  'outfit.saving': '저장 중…',
  'outfit.reward': 'CO₂ {kg}kg 절감 · {n} EP 적립',
  'outfit.empty': '상의와 하의를 등록하면 코디를 만들 수 있어요.',

  // profile
  'profile.title': '프로필',
  'profile.settings': '설정',
  'profile.totalItems': '전체 아이템',
  'profile.outfits': '만든 코디',
  'profile.co2Saved': 'CO₂ 절감',
  'menu.saved': '보관함',
  'menu.chats': '채팅',
  'menu.styleSurvey': '스타일 설문 수정',
  'menu.language': '언어',
  'menu.notifications': '알림',
  'menu.privacy': '개인정보 및 데이터',
  'menu.help': '도움말 및 지원',
  'menu.about': '코디모먼트 소개',
  'ecoPoints.title': '에코 포인트',
  'ecoPoints.available': '{n} EP 사용 가능',
  'profile.changePhoto': '사진 변경',
  'profile.editName': '이름 편집',
  'banner.title': '배너 편집',
  'banner.color': '색상 선택',
  'banner.photo': '사진으로 변경',
  'banner.note': '색상을 고르거나, 파일이나 갤러리의 사진으로 변경할 수 있어요.',

  // survey
  'survey.title': '스타일 설문',
  'survey.intro': '답변은 맞춤 추천에 사용돼요. 언제든지 다시 바꿀 수 있어요.',
  'survey.step': '{m}단계 중 {n}단계',
  'survey.skin.title': '피부 톤',
  'survey.skin.sub': '모든 피부 톤을 존중해요. 어울리는 컬러를 추천하는 데 사용돼요.',
  'survey.style.title': '좋아하는 스타일',
  'survey.style.sub': '가장 나다운 스타일 하나를 골라주세요.',
  'survey.body.title': '신체 정보',
  'survey.body.sub': '잘 어울리는 핏을 추천하는 데에만 사용되며, 외부에 공유되지 않아요.',
  'survey.body.height': '키 (cm)',
  'survey.body.weight': '몸무게 (kg)',
  'survey.body.age': '나이',
  'survey.fit.title': '선호하는 핏',
  'survey.fit.sub': '옷이 몸에 어떻게 떨어지는 걸 좋아하세요?',
  'survey.result.title': '당신의 스타일 프로필',
  'survey.result.sub': 'AI가 답변을 이 키워드로 정리했어요.',
  'survey.result.note': '이 키워드는 이름 아래에 표시되고 추천에 반영돼요.',
  'survey.result.apply': '프로필에 적용',
  'fit.slim.desc': '몸에 붙는 샤프한 실루엣.',
  'fit.regular.desc': '균형 잡힌 클래식 데일리 핏.',
  'fit.over.desc': '여유 있고 넉넉한 트렌디한 드레이프.',
  'skin.white': '백인',
  'skin.africanBlack': '흑인 — 아프리카계',
  'skin.britishBlack': '흑인 — 영국계',
  'skin.meBlack': '흑인 — 중동계',
  'skin.asian': '아시아인',
  'skin.southAsian': '남아시아인',
  'skin.hispanic': '히스패닉 · 라티노',
  'skin.indigenous': '원주민',
  'skin.mixed': '혼혈 · 다인종',
  'skin.na': '응답하지 않음',

  // language
  'lang.title': '언어',
  'lang.sub': '언어를 선택하세요. "Over Fit", "Casual" 같은 패션 용어는 영어로 유지돼요.',
  'lang.search': '언어 검색',
  'lang.noResults': '검색 결과가 없어요',
  'lang.current': '현재',
  'lang.fallbackNote': '전체 번역은 English와 한국어로 제공돼요. 다른 언어는 곧 지원될 예정이에요.',

  // notifications
  'notif.title': '알림',
  'notif.push.title': '푸시 알림',
  'notif.push.sub': '코디모먼트가 이 기기로 푸시 알림을 보내도록 허용해요.',
  'notif.push.q': '이 기기에서 푸시 알림을 받으시겠어요?',
  'notif.push.onNote': '알림이 스마트폰으로 발송돼요.',
  'notif.push.offNote': '푸시 알림을 받지 않아요.',
  'notif.categories': '알림 종류',
  'notif.marketing.title': '메시지 · 마케팅',
  'notif.marketing.sub': '앱 메시지와 프로모션 소식.',
  'notif.social.title': '소셜 업데이트',
  'notif.social.sub': '내 코디의 좋아요 · 댓글 · 팔로우 소식.',
  'notif.eco.title': '에코 · 탄소 리포트',
  'notif.eco.sub': '에코 포인트 소식과 주간 탄소 절감 점검 알림.',
  'notif.disabledNote': '이 알림을 받으려면 푸시 알림을 켜주세요.',
  'notif.log.title': '알림 로그',
  'notif.log.show': '로그 보기',
  'notif.log.hide': '로그 숨기기',

  // privacy
  'privacy.title': '개인정보 및 데이터',
  'privacy.appearance.title': '화면 모드',
  'privacy.darkmode': '다크 모드',
  'privacy.darkmode.sub': '유튜브처럼 어두운 화면으로 눈의 피로를 줄여요.',
  'privacy.verify.title': '본인 인증',
  'privacy.verify.sub': '이메일과 전화번호를 인증해 계정을 안전하게 보호하세요.',
  'privacy.email': '이메일',
  'privacy.phone': '전화번호',
  'privacy.edit.title': '프로필 편집',
  'privacy.edit.sub': '코디모먼트에서 보이는 내 모습을 꾸며보세요.',
  'privacy.photo': '프로필 사진',
  'privacy.banner': '배너',
  'privacy.change': '변경',
  'privacy.name': '이름',
  'privacy.gender': '성별',
  'privacy.bio': '자기소개',
  'privacy.bio.ph': '나의 스타일을 소개해 주세요…',
  'gender.female': '여성',
  'gender.male': '남성',
  'gender.nonbinary': '논바이너리',
  'gender.na': '응답하지 않음',
  'privacy.consent.title': '동의 및 약관',
  'privacy.consent.sub': '동의한 내용을 전문으로 상세히 확인할 수 있어요.',
  'privacy.consent.terms': '서비스 이용약관',
  'privacy.consent.privacy': '개인정보 처리방침',
  'privacy.consent.data': '개인정보 수집·이용 동의',
  'privacy.consent.signed': '{date} 동의함',
  'privacy.consent.view': '전문 보기',
  'privacy.address.title': '배송지',
  'privacy.address.address': '주소',
  'privacy.address.zip': '우편번호',
  'privacy.history.title': '열람 기록',
  'privacy.history.sub': '최근에 본 아이템을 시청 기록처럼 다시 볼 수 있어요.',
  'privacy.history.clear': '기록 지우기',
  'privacy.history.empty': '열람 기록이 없어요.',

  // help
  'help.title': '도움말 및 지원',
  'help.sub': '어떤 도움이 필요하세요?',
  'help.cat.purchase': '옷 구매가 안돼요',
  'help.cat.shipping': '배송 관련 질문',
  'help.cat.privacy': '개인정보 관련 질문',
  'help.cat.bug': '애플리케이션 버그',
  'help.cat.report': '악성 사용자 신고',
  'help.cat.other': '기타',
  'help.advice': '먼저 이렇게 해보세요',
  'help.stillStuck': '그래도 해결되지 않나요?',
  'help.stillStuck.sub': '상담원과 실시간으로 연결해 드릴게요.',
  'help.liveChat': '실시간 상담 연결',
  'help.connecting': '상담원에게 연결 중이에요…',
  'help.connected': '연결되었어요. 상담원이 곧 답변해 드릴게요.',

  // about
  'about.title': '코디모먼트 소개',
  'about.tagline': '더 가볍고 오래 입는 옷장을 위한 AI 패션 디렉터.',
  'about.mission.title': '우리의 미션',
  'about.mission.body':
    '코디모먼트는 이미 가진 옷을 다시 발견하도록 도와요. AI가 내 옷장으로 코디를 제안해 충동구매를 줄이고, 다시 입을 때마다 절감한 CO₂를 측정해요.',
  'about.team.title': '팀 소개',
  'about.team.sub': '옷을 사랑하고 낭비를 싫어하는 작은 팀이 만들었어요.',
  'about.how.title': '제작 과정',
  'about.how.body':
    'Figma로 디자인하고 React와 Tailwind로 개발했으며, Claude 기반 스타일링 모델로 구동돼요. 탄소 수치는 공개된 의류 전과정 데이터를 사용해요.',
  'about.contact.title': '비즈니스 문의',
  'about.company.title': '사업자 정보',
  'about.company.name': '상호',
  'about.company.rep': '대표자',
  'about.company.reg': '사업자등록번호',
  'about.company.address': '주소',
  'about.legal.title': '법적 준수',
  'about.legal.body':
    '코디모먼트는 GDPR 및 관련 전자상거래·소비자보호 법령을 준수해요. 개인정보는 개인정보 처리방침에 따라 처리되며, 동의 내역은 법정 보존기간 동안 보관돼요.',
  'about.version': '버전',
}

const translations: Record<string, Dict> = { en, ko }

interface I18nValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nValue | null>(null)
const STORAGE_KEY = 'codimoment.lang'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) ?? 'en'
    }
    return 'en'
  })

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {
      // ignore storage errors
    }
  }

  const value = useMemo<I18nValue>(() => {
    const table = translations[lang] ?? en
    const t = (key: string, vars?: Record<string, string | number>) => {
      let str = table[key] ?? en[key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replaceAll(`{${k}}`, String(v))
        }
      }
      return str
    }
    return { lang, setLang, t }
  }, [lang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
