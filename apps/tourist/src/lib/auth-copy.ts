import type { SupportedLanguage } from '@smartguide/shared';
const words={
  login:['Log in','Войти','Kirish','Entrar','ログイン','로그인'],
  register:['Create account','Регистрация','Roʻyxatdan oʻtish','Crear cuenta','アカウント作成','회원가입'],
  title:['Make this journey yours.','Пусть эта поездка станет твоей.','Bu safar sizniki boʻlsin.','Haz tuyo este viaje.','あなただけの旅に。','나만의 여행으로 만들어 보세요.'],
  loginTitle:['Welcome back.','С возвращением.','Yana xush kelibsiz.','Qué bueno verte de nuevo.','おかえりなさい。','다시 만나 반가워요.'],
  hint:['Your preferences are ready. Create an account or log in to continue.','Пожелания уже собраны. Создай аккаунт или войди, чтобы продолжить.','Istaklaringiz tayyor. Davom etish uchun hisob yarating yoki kiring.','Tus preferencias están listas. Crea una cuenta o entra.','好みを保存しました。アカウントを作成するかログインしてください。','취향을 모았어요. 계정을 만들거나 로그인해 주세요.'],
  name:['Your name','Твоё имя','Ismingiz','Tu nombre','お名前','이름'],
  username:['Login or email','Логин или email','Login yoki email','Usuario o email','ユーザー名・メール','아이디 또는 이메일'],
  password:['Password','Пароль','Parol','Contraseña','パスワード','비밀번호'],
  confirm:['Repeat password','Повтори пароль','Parolni takrorlang','Repetir contraseña','パスワードを再入力','비밀번호 확인'],
  passwordHint:['At least 8 characters','Не менее 8 символов','Kamida 8 belgi','Al menos 8 caracteres','8文字以上','8자 이상'],
  mismatch:['The passwords do not match.','Пароли не совпадают.','Parollar mos emas.','Las contraseñas no coinciden.','パスワードが一致しません。','비밀번호가 일치하지 않아요.'],
  exists:['This login is already taken. Log in or choose another.','Этот логин уже занят. Войди или выбери другой.','Bu login band. Kiring yoki boshqasini tanlang.','Ese usuario ya existe. Entra o elige otro.','このユーザー名は使用されています。','이미 사용 중인 아이디예요.'],
  invalid:['Incorrect login or password.','Неверный логин или пароль.','Login yoki parol notoʻgʻri.','Usuario o contraseña incorrectos.','ユーザー名またはパスワードが違います。','아이디 또는 비밀번호가 올바르지 않아요.'],
  error:['Could not connect. Your travel preferences are still here.','Не удалось подключиться. Пожелания для поездки сохранены.','Ulanib boʻlmadi. Safar istaklaringiz saqlangan.','No se pudo conectar. Tus preferencias siguen guardadas.','接続できませんでした。旅の好みは残っています。','연결하지 못했어요. 여행 취향은 유지됩니다.'],
  limit:['Too many attempts. Try again later.','Слишком много попыток. Попробуй позже.','Urinishlar koʻp. Keyinroq sinang.','Demasiados intentos. Prueba más tarde.','試行回数が多すぎます。少し待ってください。','시도 횟수가 많아요. 잠시 후 다시 시도하세요.'],
  guest:['Continue as a guest','Продолжить как гость','Mehmon sifatida davom etish','Continuar como invitado','ゲストで続ける','게스트로 계속'],
  logout:['Log out','Выйти из аккаунта','Hisobdan chiqish','Salir','ログアウト','로그아웃'],
  account:['Your account','Твой аккаунт','Hisobingiz','Tu cuenta','アカウント','내 계정'],
  show:['Show password','Показать пароль','Parolni koʻrsatish','Mostrar contraseña','パスワードを表示','비밀번호 보기'],
  hide:['Hide password','Скрыть пароль','Parolni yashirish','Ocultar contraseña','パスワードを隠す','비밀번호 숨기기'],
  confirmTrip:['Confirm preferences','Подтвердить пожелания','Istaklarni tasdiqlash','Confirmar preferencias','好みを確認','취향 확인'],
  devicePlan:['Your plan is kept on this device.','План поездки хранится на этом устройстве.','Safar rejasi shu qurilmada saqlanadi.','El plan se guarda en este dispositivo.','旅程はこの端末に保存されます。','여행 계획은 이 기기에 저장됩니다.'],
} as const;
const indexes:Record<SupportedLanguage,number>={en:0,ru:1,uz:2,es:3,ja:4,ko:5};
export const authCopy=(language:SupportedLanguage)=>(key:keyof typeof words)=>words[key][indexes[language]];
