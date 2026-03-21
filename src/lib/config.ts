// ─── Design tokens ───────────────────────────────────────────
export const C = {
  bg:        '#0D1117',
  surface:   '#161B22',
  card:      '#1C2333',
  border:    '#2A3444',
  text:      '#E6EDF3',
  muted:     '#8B949E',
  dim:       '#484F58',
  accent:    '#00E5C7',
  accentDim: 'rgba(0,229,199,0.12)',
  accentGlow:'rgba(0,229,199,0.25)',
  orange:    '#FFA657',
  orangeDim: 'rgba(255,166,87,0.12)',
  ok:        '#3FB950',
  okDim:     'rgba(63,185,80,0.12)',
  pink:      '#FF6B9D',
  pinkDim:   'rgba(255,107,157,0.12)',
  userBub:   '#1A3A5C',
}

// ─── Nav tabs ─────────────────────────────────────────────────
export const TABS = [
  { id:'stylist',  label:'Стилист', icon:'✦' },
  { id:'catalog',  label:'Каталог', icon:'◫' },
  { id:'cart',     label:'Корзина', icon:'◉' },
  { id:'profile',  label:'Профиль', icon:'◎' },
]

// ─── Demo products ────────────────────────────────────────────
export const DEMO_PRODUCTS = [
  // ── ЖЕНСКОЕ ──────────────────────────────────────────────────
  {
    id:'w1', seller_id:'demo', brand:'N&R Collection', gender:'women',
    name:'Платье миди в цветочный принт', description:'Лёгкое летнее платье из вискозы. Запахной силуэт, поясок в комплекте.',
    price:5900, images:['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop'],
    sizes:['XS','S','M','L'], category:'Платья', in_stock:true, canNegotiate:true,
  },
  {
    id:'w2', seller_id:'demo', brand:'N&R Collection', gender:'women',
    name:'Джинсы mom fit высокая посадка', description:'Плотный деним 12oz, классический синий. Завышенная талия.',
    price:6800, images:['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop'],
    sizes:['25','26','27','28','29','30'], category:'Джинсы', in_stock:true, canNegotiate:false,
  },
  {
    id:'w3', seller_id:'demo', brand:'N&R Collection', gender:'women',
    name:'Блузка шёлковая молочная', description:'100% шёлк. Свободный крой, V-вырез, длинный рукав.',
    price:7200, images:['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop'],
    sizes:['XS','S','M','L','XL'], category:'Блузки', in_stock:true, canNegotiate:true,
  },
  {
    id:'w4', seller_id:'demo', brand:'N&R Collection', gender:'women',
    name:'Кардиган оверсайз мериносовая шерсть', description:'100% меринос, натуральный бежевый. Объёмный силуэт.',
    price:8500, images:['https://images.unsplash.com/photo-1604006852748-903fccbc4019?w=400&h=500&fit=crop'],
    sizes:['S','M','L'], category:'Трикотаж', in_stock:true, canNegotiate:true,
  },
  {
    id:'w5', seller_id:'demo', brand:'N&R Collection', gender:'women',
    name:'Юбка миди плиссе чёрная', description:'Элегантная плиссированная юбка. Эластичный пояс.',
    price:4200, images:['https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=500&fit=crop'],
    sizes:['XS','S','M','L'], category:'Юбки', in_stock:true, canNegotiate:false,
  },
  {
    id:'w6', seller_id:'demo', brand:'N&R Collection', gender:'women',
    name:'Футболка базовая хлопок белая', description:'Плотный хлопок 220г. Прямой крой, круглый вырез.',
    price:1800, images:['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop'],
    sizes:['XS','S','M','L','XL'], category:'Футболки', in_stock:true, canNegotiate:false,
  },
  {
    id:'w7', seller_id:'demo', brand:'N&R Collection', gender:'women',
    name:'Пальто прямого кроя кемел', description:'Шерсть 70%, полиэстер 30%. Классический бежевый.',
    price:18900, images:['https://images.unsplash.com/photo-1548624313-0396dc957a61?w=400&h=500&fit=crop'],
    sizes:['XS','S','M','L'], category:'Верхняя одежда', in_stock:true, canNegotiate:true,
  },
  {
    id:'w8', seller_id:'demo', brand:'N&R Collection', gender:'women',
    name:'Кроссовки белые кожаные', description:'Натуральная кожа, подошва EVA. Универсальный базовый вариант.',
    price:9500, images:['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop'],
    sizes:['36','37','38','39','40'], category:'Обувь', in_stock:true, canNegotiate:false,
  },
  {
    id:'w9', seller_id:'demo', brand:'N&R Collection', gender:'women',
    name:'Сумка тоут кожаная чёрная', description:'Натуральная кожа. Вместительная, на молнии.',
    price:12500, images:['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop'],
    sizes:['One size'], category:'Аксессуары', in_stock:true, canNegotiate:true,
  },
  // ── МУЖСКОЕ ──────────────────────────────────────────────────
  {
    id:'m1', seller_id:'demo', brand:'N&R Collection', gender:'men',
    name:'Рубашка льняная оверсайз белая', description:'Лён 100%. Свободный крой, нагрудный карман.',
    price:5600, images:['https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=400&h=500&fit=crop'],
    sizes:['S','M','L','XL','XXL'], category:'Рубашки', in_stock:true, canNegotiate:true,
  },
  {
    id:'m2', seller_id:'demo', brand:'N&R Collection', gender:'men',
    name:'Джинсы прямого кроя тёмно-синие', description:'Плотный деним 14oz. Прямой силуэт, средняя посадка.',
    price:7200, images:['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop'],
    sizes:['29','30','31','32','33','34'], category:'Джинсы', in_stock:true, canNegotiate:false,
  },
  {
    id:'m3', seller_id:'demo', brand:'N&R Collection', gender:'men',
    name:'Футболка базовая хлопок чёрная', description:'Хлопок 240г. Плотная, классический крой.',
    price:2200, images:['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=500&fit=crop'],
    sizes:['S','M','L','XL','XXL'], category:'Футболки', in_stock:true, canNegotiate:false,
  },
  {
    id:'m4', seller_id:'demo', brand:'N&R Collection', gender:'men',
    name:'Кардиган шерстяной серый меланж', description:'Шерсть 80%, акрил 20%. Классический V-вырез.',
    price:7800, images:['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop'],
    sizes:['S','M','L','XL'], category:'Трикотаж', in_stock:true, canNegotiate:true,
  },
  {
    id:'m5', seller_id:'demo', brand:'N&R Collection', gender:'men',
    name:'Брюки чинос бежевые', description:'Хлопок 98%, эластан 2%. Slim fit, средняя посадка.',
    price:5900, images:['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop'],
    sizes:['28','30','32','34','36'], category:'Брюки', in_stock:true, canNegotiate:false,
  },
  {
    id:'m6', seller_id:'demo', brand:'N&R Collection', gender:'men',
    name:'Куртка бомбер оливковая', description:'Нейлон, подкладка из флиса. Резинки на манжетах и поясе.',
    price:11900, images:['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop'],
    sizes:['S','M','L','XL'], category:'Верхняя одежда', in_stock:true, canNegotiate:true,
  },
  {
    id:'m7', seller_id:'demo', brand:'N&R Collection', gender:'men',
    name:'Кеды белые холщовые', description:'Хлопок, резиновая подошва. Классика casual.',
    price:4500, images:['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=500&fit=crop'],
    sizes:['40','41','42','43','44','45'], category:'Обувь', in_stock:true, canNegotiate:false,
  },
  {
    id:'m8', seller_id:'demo', brand:'N&R Collection', gender:'men',
    name:'Ботинки кожаные коричневые', description:'Натуральная кожа, подошва Vibram. Chelsea style.',
    price:14500, images:['https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=400&h=500&fit=crop'],
    sizes:['40','41','42','43','44'], category:'Обувь', in_stock:true, canNegotiate:true,
  },
]

export const DEMO_BRAND = {
  id: 'demo',
  name: 'N&R Collection',
  description: 'Независимый российский бренд одежды. Минимализм, качественные ткани, честные цены. Работаем с 2019 года.',
  founded: '2019',
  location: 'Москва',
  productsCount: 18,
  logo: 'N&R',
}
