
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const books = [
  {
    month: "СЕНТЯБРЬ",
    title: "Он живой и светится",
    author: "Виктор Драгунский",
    cover: "https://globusbooks.cdn.bibliopolis.com/pictures/341.jpg?auto=webp&v=1572233936",
    role: "Я — читатель",
    product: "Паспорт книги",
    task: "Познакомься с героями рассказа. Определи главную мысль произведения и выбери любимый эпизод.",
    questions: ["Кто главные герои рассказа?", "Почему Дениске понравился светлячок?", "Какой эпизод запомнился тебе больше всего?"],
    symbol: "✦",
    color: "bg-amber-100",
  },
  {
    month: "ОКТЯБРЬ",
    title: "Живая шляпа",
    author: "Николай Носов",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1699846206i/55891672.jpg", 
    role: "Я — детектив",
    product: "Карточка улик",
    task: "Расследуй загадку живой шляпы. Найди в тексте доказательства и объясни, что происходило на самом деле.",
    questions: ["Почему ребята испугались шляпы?", "Какие улики помогли раскрыть тайну?", "Как ты понял, что произошло?"],
    symbol: "⌕",
    color: "bg-blue-100",
  },
  {
    month: "НОЯБРЬ",
    title: "Конь с розовой гривой",
    author: "Виктор Астафьев",
    cover: "https://content.img-gorod.ru/pim/products/images/3c/10/0199ebac-888f-7a9a-873c-cfc2a9963c10.jpg", 
    role: "Я — исследователь героя",
    product: "Карта характера героя",
    task: "Исследуй поступки главного героя. Определи его ошибку, переживания и урок, который он получил.",
    questions: ["Почему герой совершил плохой поступок?", "Что он чувствовал после обмана?", "Чему учит нас эта история?"],
    symbol: "❋",
    color: "bg-rose-100",
  },
  {
    month: "ДЕКАБРЬ",
    title: "Тайное становится явным",
    author: "Виктор Драгунский",
    cover: "https://catalog-cdn.detmir.st/media/WlWRbiyccQ8uZ1lj9AidtDQhnppYM_CWE4oA9a6Qqts%3D.jpeg",
    role: "Я — журналист",
    product: "Мини-интервью",
    task: "Подготовь интервью с Дениской. Узнай, почему важно говорить правду и отвечать за свои поступки.",
    questions: ["Почему Дениска решил обмануть маму?", "Что помогло раскрыть правду?", "Как бы ты поступил на его месте?"],
    symbol: "✉",
    color: "bg-orange-100",
  },
  {
    month: "ЯНВАРЬ",
    title: "Чудесный доктор",
    author: "Александр Куприн",
    cover: "https://goods-photos.static1-sima-land.com/items/4698263/0/1600.jpg?v=1626250277",
    role: "Я — литературный критик",
    product: "Читательский отзыв",
    task: "Напиши отзыв о произведении. Объясни, почему поступок доктора можно назвать чудом.",
    questions: ["В какой ситуации оказалась семья Мерцаловых?", "Как доктор помог семье?", "Почему доброта может изменить жизнь человека?"],
    symbol: "✧",
    color: "bg-violet-100",
  },
  {
    month: "ФЕВРАЛЬ",
    title: "Тёплый хлеб",
    author: "Константин Паустовский",
    cover: "https://content.img-gorod.ru/pim/products/images/09/2a/018fadf8-4f23-76ca-8c0d-d3973d2f092a.jpg",
    role: "Я — художник",
    product: "Комикс из 3–5 кадров",
    task: "Создай комикс по рассказу. Покажи важные события и изменения в поведении Фильки.",
    questions: ["Почему Филька обидел коня?", "Как его поступок повлиял на окружающих?", "Как герой исправил свою ошибку?"],
    symbol: "❀",
    color: "bg-emerald-100",
  },
  {
    month: "МАРТ",
    title: "Фантазёры",
    author: "Николай Носов",
    cover: "https://cdn.azbooka.ru/cv/w1100/e20929a1-d3f2-48b1-b00d-db097c928c83.jpg",
    role: "Я — эксперт",
    product: "Таблица сравнения",
    task: "Сравни Мишу и Стасика. Разберись, чем фантазия отличается от обмана.",
    questions: ["О чём фантазировали мальчики?", "Чем фантазия отличается от лжи?", "Можно ли считать фантазию полезной?"],
    symbol: "☼",
    color: "bg-yellow-100",
  },
  {
    month: "АПРЕЛЬ",
    title: "Маленький принц",
    author: "Антуан де Сент-Экзюпери",
    cover: "https://happyuniverse.co.uk/wp-content/uploads/2015/09/malenkii-prints-600x800.jpg",
    role: "Я советую книгу",
    product: "Реклама книги",
    task: "Подготовь рекомендацию книги для одноклассников. Расскажи, чему учит произведение и почему его стоит прочитать.",
    questions: ["Кого встретил Маленький принц?", "Почему для него была важна роза?", "Как ты понимаешь мысль о дружбе и ответственности?"],
    symbol: "★",
    color: "bg-sky-100",
  },
  {
    month: "МАЙ",
    title: "Неизвестный цветок",
    author: "Андрей Платонов",
    cover: "https://catalog-cdn.detmir.st/media/8I8OXQNPWJO2bkdHp6nol95tLnaK0EwjlMV3BmSm4d0%3D.jpeg",
    role: "Я — автор своего открытия",
    product: "Итоговое читательское портфолио",
    task: "Представь своё главное открытие за год. Расскажи, чему тебя научили прочитанные произведения.",
    questions: ["С какими трудностями столкнулся цветок?", "Что помогло ему вырасти?", "Какое главное открытие ты сделал за год?"],
    symbol: "❁",
    color: "bg-pink-100",
  },
];

export default function Home() {
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const book = selectedBook === null ? null : books[selectedBook];
    const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadCovers() {
      const { data, error } = await supabase
        .from("books")
        .select("title, cover_url");

      if (error) {
        console.error("Ошибка загрузки обложек:", error);
        return;
      }

      if (data) {
        const covers: Record<string, string> = {};

        data.forEach((item) => {
          if (item.title && item.cover_url) {
            covers[item.title] = item.cover_url;
          }
        });

        setCoverUrls(covers);
      }
    }

    loadCovers();
  }, []);

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#26334a]">
      
<header className="relative z-50 border-b border-[#e9e3d8] bg-white">
  <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">

    <a href="#" className="text-sm font-bold tracking-wide text-[#26334a] md:text-xl">
      ✦ КНИЖНАЯ ОРБИТА
    </a>

    <nav className="hidden items-center gap-5 text-sm md:flex">
      <a href="#books">Библиотека</a>
      <a href="#about">О проекте</a>
      <a href="#passport">Паспорт проекта</a>
      <a href="#journey">9 этапов</a>
      <a href="#roles">Миссии</a>
      <a href="#team">Команда</a>
      <a href="#achievements">Достижения</a>
    </nav>

    <div className="flex items-center gap-2">
      <a
        href="/login"
        className="rounded-full bg-[#26334a] px-3 py-2.5 text-xs text-white md:px-6 md:py-3 md:text-sm"
      >
        Войти в проект
      </a>

      <button
        type="button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e9e3d8] text-xl text-[#26334a] md:hidden"
        aria-label="Открыть меню"
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? "×" : "☰"}
      </button>
    </div>

    {mobileMenuOpen && (
      <nav className="w-full border-t border-[#e9e3d8] pt-4 md:hidden">
        <div className="flex flex-col gap-1 text-sm font-medium text-[#26334a]">
          {[
            ["Библиотека", "#books"],
            ["О проекте", "#about"],
            ["Паспорт проекта", "#passport"],
            ["9 этапов", "#journey"],
            ["Миссии", "#roles"],
            ["Команда", "#team"],
            ["Достижения", "#achievements"],
         ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-3 hover:bg-[#f5f1e9]"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>
    )}
  </div>
</header>

<section className="px-5 py-14 md:px-6 md:py-24">
  <div className="mx-auto max-w-7xl">
    <p className="mb-5 text-xs font-bold tracking-[0.2em] text-amber-700 sm:text-sm md:mb-6 md:tracking-[0.25em]">
      ЧИТАТЕЛЬСКОЕ ПУТЕШЕСТВИЕ · 2026–2027
    </p>

    <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl md:text-7xl">
      Открой свою
      <br />
      <span className="text-amber-700">книжную вселенную</span>
    </h1>

    <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:mt-7 md:text-lg md:leading-8">
      Девять месяцев — девять книг — девять открытий.
      Читай, исследуй, создавай и собирай свою историю достижений.
    </p>

    <div className="mt-7 flex flex-wrap gap-3 md:mt-9 md:gap-4">
      <a
        href="#books"
        className="rounded-full bg-[#26334a] px-6 py-3.5 text-sm font-semibold text-white shadow-lg md:px-8 md:py-4 md:text-base"
      >
        Начать путешествие →
      </a>

      <a
        href="/about"
        className="rounded-full border border-[#d9d1c4] bg-white px-6 py-3.5 text-sm font-semibold text-[#26334a] md:px-8 md:py-4 md:text-base"
      >
        О проекте
      </a>
    </div>

    <div className="mt-12 grid max-w-2xl grid-cols-3 gap-3 border-t border-[#ded7cb] pt-6 md:mt-16 md:gap-5 md:pt-7">
      <div>
        <p className="text-2xl font-bold md:text-3xl">9</p>
        <p className="mt-1 text-xs text-slate-500 md:text-sm">Книг</p>
      </div>

      <div>
        <p className="text-2xl font-bold md:text-3xl">9</p>
        <p className="mt-1 text-xs text-slate-500 md:text-sm">Месяцев</p>
      </div>

      <div>
        <p className="text-2xl font-bold md:text-3xl">9</p>
        <p className="mt-1 text-xs text-slate-500 md:text-sm">Открытий</p>
      </div>
    </div>
  </div>
</section>

      <section className="mx-auto max-w-7xl px-5 py-5 md:px-6 md:py-10">
        <div className="rounded-3xl bg-[#26334a] p-8 text-white md:p-12">
          <p className="text-sm font-bold tracking-widest text-amber-300">НАША МИССИЯ</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold md:text-4xl">
            Каждая книга — новая планета. Каждое открытие — твоя история.
          </h2>
          <p className="mt-5 max-w-2xl leading-7 text-slate-300">
            Здесь читатели становятся исследователями, детективами,
            журналистами и художниками. Чтение превращается в настоящее приключение.
          </p>
        </div>
      </section>

      <section id="books" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <p className="text-sm font-bold tracking-widest text-amber-700">ТВОЙ МАРШРУТ</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">Орбита чтения</h2>
          <p className="mt-3 text-slate-500">Девять месяцев — девять книг — девять открытий.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((item, index) => (
            <button
              key={item.month}
              onClick={() => setSelectedBook(index)}
className="group rounded-3xl border border-[#ebe5da] bg-white p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl active:scale-[0.98] sm:p-6"            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest text-slate-400">{item.month}</span>
                <span className="text-sm text-slate-400">{String(index + 1).padStart(2)} / 9</span>
              </div>
<div className="mt-4 flex h-44 items-center justify-center overflow-hidden rounded-2xl bg-[#f5f1e9] sm:mt-6 sm:h-56">  <img
    src={coverUrls[item.title] || item.cover}
    alt={`Обложка книги ${item.title}`}
    className="h-full w-full object-contain"
  />
</div>

              <h3 className="mt-6 text-xl font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{item.author}</p>
              <div className="mt-6 border-t border-[#eee9e1] pt-4">
                <span className="rounded-full bg-[#f5f1e9] px-4 py-2 text-xs font-semibold text-[#76634b]">
                  {item.role}
                </span>
              </div>
              <div className="mt-4 rounded-xl bg-[#f5f1e9] p-3">
  <p className="text-xs text-slate-500">
    Твой творческий продукт
  </p>
  <p className="mt-1 text-sm font-semibold text-[#26334a]">
    {item.product}
  </p>
</div>
              <p className="mt-5 text-sm font-semibold text-amber-700 group-hover:underline">
                Открыть книгу →
              </p>
            </button>
          ))}
        </div>
      </section>

      <section id="roles" className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-3xl border border-[#e9e3d8] bg-white p-8 md:p-12">
          <p className="text-sm font-bold tracking-widest text-amber-700">ТВОИ ВОЗМОЖНОСТИ</p>
          <h2 className="mt-3 text-3xl font-bold">Не просто читай — создавай!</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div><span className="text-3xl">📖</span><h3 className="mt-3 font-bold">Читай</h3><p className="mt-2 text-sm text-slate-500">Открывай новые произведения и знакомься с героями.</p></div>
            <div><span className="text-3xl">🔎</span><h3 className="mt-3 font-bold">Исследуй</h3><p className="mt-2 text-sm text-slate-500">Выполняй литературные миссии и находи доказательства.</p></div>
            <div><span className="text-3xl">🏆</span><h3 className="mt-3 font-bold">Достигай</h3><p className="mt-2 text-sm text-slate-500">Собирай достижения и пополняй читательское портфолио.</p></div>
          </div>
        </div>
      </section>

<section id="journey" className="bg-[#f5f1e9] px-6 py-16">
  <div className="mx-auto max-w-6xl">
    <div className="text-center">
      <p className="text-sm font-bold tracking-widest text-amber-700">
        9 МЕСЯЦЕВ · 9 КНИГ · 9 ОТКРЫТИЙ
      </p>
      <h2 className="mt-3 text-3xl font-bold text-[#26334a]">
        Как устроено литературное путешествие?
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-slate-600">
        Каждый месяц участник открывает новую литературную планету,
        примеряет на себя новую роль и создаёт творческую работу.
      </p>
    </div>

    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[
        {
          month: "СЕНТЯБРЬ",
          number: "1",
          role: "Я — читатель",
          book: "«Он живой и светится»",
          product: "Паспорт книги",
        },
        {
          month: "ОКТЯБРЬ",
          number: "2",
          role: "Я — детектив",
          book: "«Живая шляпа»",
          product: "Карточка улик",
        },
        {
          month: "НОЯБРЬ",
          number: "3",
          role: "Я — исследователь героя",
          book: "«Конь с розовой гривой»",
          product: "Карта характера героя",
        },
        {
          month: "ДЕКАБРЬ",
          number: "4",
          role: "Я — журналист",
          book: "«Тайное становится явным»",
          product: "Мини-интервью",
        },
        {
          month: "ЯНВАРЬ",
          number: "5",
          role: "Я — литературный критик",
          book: "«Чудесный доктор»",
          product: "Читательский отзыв",
        },
        {
          month: "ФЕВРАЛЬ",
          number: "6",
          role: "Я — художник",
          book: "«Тёплый хлеб»",
          product: "Комикс из 3–5 кадров",
        },
        {
          month: "МАРТ",
          number: "7",
          role: "Я — эксперт",
          book: "«Фантазёры»",
          product: "Таблица сравнения",
        },
        {
          month: "АПРЕЛЬ",
          number: "8",
          role: "Я советую книгу",
          book: "«Маленький принц»",
          product: "Реклама книги",
        },
        {
          month: "МАЙ",
          number: "9",
          role: "Я — автор своего открытия",
          book: "«Неизвестный цветок»",
          product: "Итоговое читательское портфолио",
        },
      ].map((item) => (
        <div
          key={item.number}
          className="rounded-3xl border border-[#e8dfd1] bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold tracking-wider text-amber-700">
              {item.month}
            </span>
            <span className="text-3xl font-bold text-[#e8dfd1]">
              {item.number}
            </span>
          </div>
          <h3 className="mt-5 text-lg font-bold text-[#26334a]">
            {item.role}
          </h3>
          <p className="mt-3 text-sm text-slate-600">{item.book}</p>
          <div className="mt-5 rounded-xl bg-[#f5f1e9] p-3">
            <p className="text-xs text-slate-500">Творческий продукт</p>
            <p className="mt-1 text-sm font-semibold text-[#26334a]">
              {item.product}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

<section id="passport" className="bg-white px-6 py-16">
  <div className="mx-auto max-w-6xl">
    <div className="text-center">
      <p className="text-sm font-bold tracking-widest text-amber-700">
        О ПРОЕКТЕ
      </p>
      <h2 className="mt-3 text-3xl font-bold text-[#26334a]">
        Паспорт проекта
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-slate-500">
        «КНИЖНАЯ ОРБИТА» — это девятимесячное литературное путешествие,
        в котором ученик становится активным читателем, исследователем
        и создателем собственного читательского продукта.
      </p>
    </div>

    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl bg-[#f5f1e9] p-6">
        <p className="text-sm text-slate-500">Целевая аудитория</p>
        <h3 className="mt-2 text-xl font-bold text-[#26334a]">6 класс</h3>
      </div>

      <div className="rounded-2xl bg-[#f5f1e9] p-6">
        <p className="text-sm text-slate-500">Продолжительность</p>
        <h3 className="mt-2 text-xl font-bold text-[#26334a]">9 месяцев</h3>
      </div>

      <div className="rounded-2xl bg-[#f5f1e9] p-6">
        <p className="text-sm text-slate-500">Формат</p>
        <h3 className="mt-2 text-xl font-bold text-[#26334a]">Онлайн-проект</h3>
      </div>

      <div className="rounded-2xl bg-[#f5f1e9] p-6">
        <p className="text-sm text-slate-500">Итоговый продукт</p>
        <h3 className="mt-2 text-xl font-bold text-[#26334a]">
          Читательское портфолио
        </h3>
      </div>
    </div>

    <div className="mt-8 rounded-3xl bg-[#26334a] p-8 text-white">
      <h3 className="text-xl font-bold">Главная цель проекта</h3>
      <p className="mt-3 leading-7 text-slate-200">
        Развитие читательской грамотности, интереса к литературе,
        самостоятельности и творческих способностей учащихся
        через выполнение девяти тематических читательских миссий.
      </p>
    </div>
  </div>
</section>

<section id="team" className="bg-white px-6 py-16">
  <div className="mx-auto max-w-5xl">
    <div className="text-center">
      <p className="text-sm font-bold tracking-widest text-amber-700">
        СОЗДАТЕЛИ И УЧАСТНИКИ
      </p>
      <h2 className="mt-3 text-3xl font-bold text-[#26334a]">
        Команда проекта
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-slate-500">
        За каждым литературным открытием стоит команда,
        объединённая любовью к чтению, знаниям и творчеству.
      </p>
    </div>

    <div className="mt-10 grid gap-6 md:grid-cols-2">
      <div className="rounded-3xl bg-[#f5f1e9] p-8">
        <div className="text-4xl">👩‍🏫</div>
        <p className="mt-5 text-xs font-bold tracking-widest text-amber-700">
          АВТОР И РУКОВОДИТЕЛЬ ПРОЕКТА
        </p>
        <h3 className="mt-3 text-2xl font-bold text-[#26334a]">
          Сембиева Құндыз Қуанышкерейқызы
        </h3>
        <p className="mt-3 leading-6 text-slate-600">
          Учитель русского языка и литературы
        </p>
      </div>

      <div className="rounded-3xl bg-[#26334a] p-8 text-white">
        <div className="text-4xl">🎓</div>
        <p className="mt-5 text-xs font-bold tracking-widest text-amber-300">
          УЧАСТНИКИ ПРОЕКТА
        </p>
        <h3 className="mt-3 text-2xl font-bold">
          Учащиеся 6 класса
        </h3>
        <p className="mt-3 leading-6 text-slate-200">
          Юные читатели, исследователи, журналисты, художники
          и создатели собственных литературных открытий.
        </p>
      </div>
    </div>

    <div className="mt-8 text-center">
      <p className="text-sm font-medium text-slate-500">
        Аккистауская средняя школа
      </p>
      <p className="mt-2 text-xs tracking-wider text-slate-400">
        2026–2027 УЧЕБНЫЙ ГОД
      </p>
    </div>
  </div>
</section>

<section id="achievements" className="bg-[#f5f1e9] px-6 py-16">
  <div className="mx-auto max-w-6xl">
    <div className="text-center">
      <p className="text-sm font-bold tracking-widest text-amber-700">
        НАШИ ОТКРЫТИЯ
      </p>
      <h2 className="mt-3 text-3xl font-bold text-[#26334a]">
        Достижения проекта
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-slate-600">
        Каждая прочитанная книга становится шагом к новым знаниям,
        творчеству и самостоятельным открытиям.
      </p>
    </div>

    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-3xl bg-white p-7 text-center shadow-sm">
        <div className="text-4xl">📚</div>
        <h3 className="mt-4 text-xl font-bold text-[#26334a]">9 книг</h3>
        <p className="mt-2 text-sm text-slate-500">
          Путешествие по произведениям русской и зарубежной литературы
        </p>
      </div>

      <div className="rounded-3xl bg-white p-7 text-center shadow-sm">
        <div className="text-4xl">🌟</div>
        <h3 className="mt-4 text-xl font-bold text-[#26334a]">9 открытий</h3>
        <p className="mt-2 text-sm text-slate-500">
          Девять творческих ролей и читательских миссий
        </p>
      </div>

      <div className="rounded-3xl bg-white p-7 text-center shadow-sm">
        <div className="text-4xl">🏆</div>
        <h3 className="mt-4 text-xl font-bold text-[#26334a]">
          Личное портфолио
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Работы, баллы и достижения каждого участника
        </p>
      </div>
    </div>

    <div className="mt-8 text-center">
      <a
        href="/results"
        className="inline-block rounded-full bg-[#26334a] px-8 py-4 font-semibold text-white"
      >
        Посмотреть работы участников →
      </a>
    </div>
  </div>
</section>

      <section id="login" className="px-6 py-16 text-center">
        <div className="mt-8 flex flex-wrap justify-center gap-4">
  <a
    href="/login"
    className="rounded-full bg-[#26334a] px-8 py-4 font-semibold text-white"
  >
    Войти в проект →
  </a>

  <a
    href="/results"
    className="rounded-full border border-[#d9d1c4] bg-white px-8 py-4 font-semibold"
  >
    Результаты участников
  </a>
</div>
        <p className="mt-8 inline-block rounded-full bg-amber-100 px-6 py-3 text-sm font-semibold text-amber-900">
          ✦ 9 месяцев — 9 книг — 9 открытий
        </p>
      </section>

<footer className="border-t border-[#e9e3d8] bg-[#26334a] px-6 py-10 text-white">
  <div className="mx-auto max-w-7xl">
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h2 className="text-2xl font-bold tracking-wide">
          ✦ КНИЖНАЯ ОРБИТА
        </h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
          Девять месяцев — девять книг — девять открытий.
          Читай. Исследуй. Создавай свою историю.
        </p>
      </div>

      <div>
        <p className="text-sm font-bold text-amber-300">
          АВТОР И РУКОВОДИТЕЛЬ ПРОЕКТА
        </p>
        <p className="mt-3 font-semibold">
          Сембиева Құндыз Қуанышкерейқызы
        </p>
        <p className="mt-2 text-sm text-slate-300">
          Учитель русского языка и литературы
        </p>
        <p className="mt-2 text-sm text-slate-300">
          Аккистауская средняя школа
        </p>
      </div>
    </div>

    <div className="mt-8 border-t border-white/20 pt-6 text-center">
      <p className="text-xs text-slate-300">
        2026–2027 учебный год
      </p>
      <p className="mt-2 text-xs text-slate-400">
        © 2026 КНИЖНАЯ ОРБИТА · Читай. Исследуй. Открывай.
      </p>
    </div>
  </div>
</footer>


      {book && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#172033]/60 p-4"
          onClick={() => setSelectedBook(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={book.title}
            className="my-auto w-full max-w-2xl rounded-3xl bg-[#faf8f3] p-7 shadow-2xl md:p-10"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest text-amber-700">{book.month} · МИССИЯ МЕСЯЦА</span>
              <button onClick={() => setSelectedBook(null)} className="rounded-full bg-white px-4 py-2 text-xl" aria-label="Закрыть">×</button>
            </div>
 
<div className="mt-6 flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-white">
  <img
    src={coverUrls[book.title] || book.cover}
    alt={`Обложка книги ${book.title}`}
    className="h-full w-full object-contain"
  />
</div>

            <h2 className="mt-7 text-3xl font-bold">{book.title}</h2>
            <p className="mt-2 text-slate-500">{book.author}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold">{book.role}</span>
              <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900">Продукт: {book.product}</span>
            </div>
            <h3 className="mt-8 text-lg font-bold">Твоя миссия</h3>
            <p className="mt-3 leading-7 text-slate-600">{book.task}</p>
            <h3 className="mt-7 text-lg font-bold">Вопросы для размышления</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 leading-7 text-slate-600">
              {book.questions.map((question) => <li key={question}>{question}</li>)}
            </ol>
            <div className="mt-8 rounded-2xl border border-[#e9e3d8] bg-white p-5">
              <p className="font-semibold">Место для твоей работы</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Выбери свою миссию, выполни творческое задание и отправь работу учителю. Получай баллы, открывай достижения и пополняй личное читательское портфолио!
              </p>
            </div>
            <button
              onClick={() => setSelectedBook(null)}
              className="mt-7 w-full rounded-full bg-[#26334a] px-6 py-4 font-semibold text-white hover:bg-[#3b4d68]"
            >
              Вернуться в библиотеку
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
