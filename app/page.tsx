
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const books = [
  { month: "СЕНТЯБРЬ", title: "Ворона и Лисица", author: "И. А. Крылов", cover: "", role: "Я — читатель", product: "Моя читательская миссия", task: "1. Выбери героя, который тебе понравился.\n2. Какой совет ты бы дал Вороне?\n3. Выбери подходящую пословицу или придумай свою:\n• На всякого льстеца найдётся слушатель.\n• Не верь словам, верь делам.\n• Слово не воробей: вылетит — не поймаешь.", questions: [], symbol: "✦", color: "bg-amber-100" },
  { month: "ОКТЯБРЬ", title: "Белогрудка", author: "В. П. Астафьев", cover: "", role: "Я — детектив", product: "Моя детективная миссия", task: "1. Собери улики. Выбери 3 события, которые помогли понять, почему Белогрудка стала мстить.\n2. Вердикт детектива. Кто должен нести ответственность? Объясни своё решение.", questions: [], symbol: "⌕", color: "bg-blue-100" },
  { month: "НОЯБРЬ", title: "Времена года", author: "Ф. И. Тютчев", cover: "", role: "Я — эксперт", product: "Экспертное заключение", task: "Стихотворения «Есть в осени первоначальной…» и «Чародейкою Зимою…».\n1. Сравни стихотворения по критериям: картина природы, настроение, слова-художники. Заполни таблицу для осени и зимы.\n2. Выпиши из каждого стихотворения один эпитет и одно сравнение.\n3. Напиши экспертный вывод: чем отличаются картины осени и зимы? (2–3 предложения).", questions: [], symbol: "❋", color: "bg-rose-100" },
  { month: "ДЕКАБРЬ", title: "Алиса в стране чудес", author: "Л. Кэрролл", cover: "", role: "Я — журналист", product: "Интервью с Алисой", task: "Возьми интервью у Алисы. Составь 2 тонких и 2 толстых вопроса, которые тебе хотелось бы задать героине после прочтения книги.", questions: [], symbol: "✉", color: "bg-orange-100" },
  { month: "ЯНВАРЬ", title: "Сто лет тому вперёд", author: "К. Булычёв", cover: "", role: "Я — исследователь героя", product: "Досье героя", task: "Исследуй героя произведения:\n• Опиши его характер.\n• Найди поступок, который раскрывает его личность.\n• Сделай вывод о герое.", questions: [], symbol: "✧", color: "bg-violet-100" },
  { month: "ФЕВРАЛЬ", title: "Три счастья", author: "М. Макатаев", cover: "", role: "Я — литературный критик", product: "Эссе «Что такое счастье?»", task: "Напиши небольшое эссе по теме стихотворения «Три счастья». Поделись своими впечатлениями и объясни, что для тебя означает счастье.", questions: [], symbol: "❀", color: "bg-emerald-100" },
  { month: "МАРТ", title: "Ер-Тостик", author: "Казахская народная сказка", cover: "", role: "Я — художник", product: "Комикс «Приключения Ер-Тостика»", task: "Создай комикс из 3–5 кадров. Изобрази ключевые события сказки и добавь короткие реплики героев.", questions: [], symbol: "☼", color: "bg-yellow-100" },
  { month: "АПРЕЛЬ", title: "Удивительный волшебник из страны Оз", author: "Л. Ф. Баум", cover: "", role: "Я — рекламный агент", product: "Рекламная карточка книги", task: "1. Создай рекламу книги для одноклассников с рекомендацией прочитать её.\n2. Создай рекламу с помощью искусственного интеллекта.", questions: [], symbol: "★", color: "bg-sky-100" },
  { month: "МАЙ", title: "Телефон", author: "Н. Носов", cover: "", role: "Я — наблюдатель", product: "Карта наблюдений", task: "Найди в произведении 5 интересных деталей:\n• поступки героев;\n• необычные события;\n• важные мелочи, которые помогают понять рассказ.", questions: [], symbol: "❁", color: "bg-pink-100" },
];

export default function Home() {
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const book = selectedBook === null ? null : books[selectedBook];
    const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});
const [readUrls, setReadUrls] = useState<Record<string, string>>({});
  
useEffect(() => {
  async function loadCovers() {
    const { data, error } = await supabase
      .from("books")
      .select("title, cover_url, online_read_url");
console.log("Данные таблицы books:", data);
console.log("Ошибка Supabase:", error);
    if (error) {
      console.error("Ошибка загрузки книг:", error);
      return;
    }

    if (data) {
      const covers: Record<string, string> = {};
      const reads: Record<string, string> = {};

      data.forEach((item) => {
        if (item.title && item.cover_url) {
          covers[item.title] = item.cover_url;
        }

        if (item.title && item.online_read_url) {
          reads[item.title] = item.online_read_url;
        }
      });

      setCoverUrls(covers);
      console.log("Обложки из Supabase:", covers);
console.log("PDF из Supabase:", reads);
      setReadUrls(reads);
    }
  }

  loadCovers();
}, []);
;

  async function openMission(title: string) {
    const { data, error } = await supabase
      .from("books")
      .select("id")
      .eq("title", title)
      .maybeSingle();
    if (error || !data?.id) {
      alert("Не удалось открыть книгу. Попробуй войти в кабинет и открыть её из библиотеки.");
      return;
    }
    window.location.href = `/book/${data.id}`;
  }

  return (
<main className="min-h-screen bg-[#f7f5ff] text-[#26334a]">
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


<section className="relative isolate overflow-hidden bg-[#101a35] px-5 py-16 text-white md:px-8 md:py-24">
  <div className="pointer-events-none absolute inset-0 -z-10">
    <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
    <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
    </div>
  <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
    <div>

      <p className="mb-5 text-xs font-bold tracking-[0.25em] text-amber-300 md:text-sm">
        КОСМИЧЕСКОЕ ЧИТАТЕЛЬСКОЕ ПУТЕШЕСТВИЕ · 2026–2027
      </p>

      <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl md:text-7xl">
        Открой свою
        <br />
        <span className="text-amber-300">книжную вселенную</span>
      </h1>

      <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 md:text-lg">
        Девять месяцев — девять книг — девять открытий.
        Читай, исследуй, создавай и собирай свою историю достижений.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a href="#books" className="rounded-full bg-amber-300 px-7 py-4 font-semibold text-[#17233f] shadow-lg transition hover:bg-amber-200">
          Начать путешествие →
        </a>
        <a href="/about" className="rounded-full border border-white/30 px-7 py-4 font-semibold text-white transition hover:bg-white/10">
          О проекте
        </a>
      </div>

      <div className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/20 pt-6">
        <div><p className="text-3xl font-bold">9</p><p className="mt-1 text-sm text-slate-300">Книг</p></div>
        <div><p className="text-3xl font-bold">9</p><p className="mt-1 text-sm text-slate-300">Месяцев</p></div>
        <div><p className="text-3xl font-bold">9</p><p className="mt-1 text-sm text-slate-300">Открытий</p></div>
      </div>
    </div>

    <div className="relative mx-auto flex aspect-square w-full max-w-[460px] items-center justify-center">
      <div className="absolute h-[88%] w-[88%] rounded-full border border-white/15" />
      <div className="absolute h-[66%] w-[66%] rounded-full border border-dashed border-sky-200/30" />
      <div className="absolute h-[43%] w-[43%] rounded-full border border-white/20" />

      <div className="absolute h-5 w-5 rounded-full bg-amber-200 shadow-[0_0_30px_8px_rgba(251,191,36,0.5)]" />
      <div className="absolute left-[12%] top-[28%] h-12 w-12 rounded-full bg-gradient-to-br from-sky-200 to-blue-700 shadow-[0_0_25px_rgba(96,165,250,0.5)]" />
      <div className="absolute right-[13%] top-[22%] h-16 w-16 rounded-full bg-gradient-to-br from-orange-200 via-orange-500 to-red-800 shadow-[0_0_30px_rgba(249,115,22,0.4)]" />
      <div className="absolute bottom-[14%] left-[24%] h-20 w-20 rounded-full bg-gradient-to-br from-violet-200 via-violet-500 to-indigo-900 shadow-[0_0_30px_rgba(139,92,246,0.5)]" />
      <div className="absolute bottom-[24%] right-[18%] h-10 w-10 rounded-full bg-gradient-to-br from-emerald-200 to-teal-700" />

      <div className="absolute right-[8%] top-[49%] text-3xl text-amber-200">✦</div>
      <div className="absolute left-[17%] bottom-[24%] text-2xl text-white">✧</div>
      <div className="absolute left-[43%] top-[8%] text-xl text-sky-200">✦</div>
      <div className="absolute bottom-[9%] right-[38%] text-lg text-amber-200">✧</div>

      <div className="absolute bottom-[3%] rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-semibold tracking-widest text-sky-100 backdrop-blur">
        ТВОЯ КНИЖНАЯ ГАЛАКТИКА
      </div>
    </div>
  </div>
</section>


<section id="books" className="mx-auto max-w-7xl px-5 py-5 md:px-6 md:py-10">        
<div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-[#101a35] via-[#202c50] to-[#392c68] p-8 text-white shadow-xl md:p-12">
  <div className="pointer-events-none absolute inset-0 -z-10">
    <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />
    <div className="absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-sky-400/15 blur-3xl" />
  </div>

  <span className="absolute right-10 top-8 text-3xl text-amber-200">✦</span>
  <span className="absolute right-1/4 top-1/2 text-xl text-sky-200">✧</span>
  <span className="absolute bottom-8 right-12 text-2xl text-violet-200">✦</span>

  <div className="relative max-w-3xl">
    <p className="text-sm font-bold tracking-widest text-amber-300">
      ✦ НАША МИССИЯ
    </p>
    <h2 className="mt-4 text-2xl font-bold leading-tight md:text-4xl">
      Каждая книга — новая планета. Каждое открытие — твоя история.
    </h2>
    <p className="mt-5 max-w-2xl leading-7 text-slate-300">
      Здесь читатели становятся исследователями, детективами, журналистами и художниками. Чтение превращается в настоящее приключение.
    </p>
    <p className="mt-6 text-xs font-semibold tracking-[0.2em] text-sky-200">
    </p>
  </div>
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
<div className="mt-4 planet-frame flex h-44 items-center justify-center overflow-hidden rounded-2xl bg-[#f5f1e9] sm:mt-6 sm:h-56">
  <img
    src={coverUrls[item.title] || item.cover || undefined}
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


<section id="journey" className="relative overflow-hidden bg-gradient-to-br from-[#f1edff] via-[#f5f4ff] to-[#eaf4ff] px-6 py-16">
  <div className="pointer-events-none absolute inset-0 opacity-50"
    style={{
      backgroundImage: "radial-gradient(circle, #a78bfa 1px, transparent 1.5px)",
      backgroundSize: "75px 75px"
    }}
  />

  <div className="relative mx-auto max-w-6xl">
    <div className="text-center">
      <p className="text-sm font-bold tracking-widest text-violet-600">
        ✦ 9 МЕСЯЦЕВ · 9 КНИГ · 9 ОТКРЫТИЙ ✦
      </p>
      <h2 className="mt-3 text-3xl font-bold text-[#26334a]">
        Как устроено литературное путешествие?
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-slate-600">
        Каждый месяц участник открывает новую литературную планету,
        примеряет на себя новую роль и создаёт творческую работу.
      </p>
    </div>

    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[
        { month: "СЕНТЯБРЬ", number: "1", role: "Я — читатель", icon: "📖", color: "from-sky-100 to-blue-200", book: "«Ворона и Лисица»", product: "Моя читательская миссия" },
        { month: "ОКТЯБРЬ", number: "2", role: "Я — детектив", icon: "🔎", color: "from-emerald-100 to-teal-200", book: "«Белогрудка»", product: "Моя детективная миссия" },
        { month: "НОЯБРЬ", number: "3", role: "Я — эксперт", icon: "🔬", color: "from-pink-100 to-rose-200", book: "Стихотворения Ф. И. Тютчева", product: "Экспертное заключение" },
        { month: "ДЕКАБРЬ", number: "4", role: "Я — журналист", icon: "🎙️", color: "from-amber-100 to-orange-200", book: "«Алиса в стране чудес»", product: "Интервью с Алисой" },
        { month: "ЯНВАРЬ", number: "5", role: "Я — исследователь героя", icon: "🧭", color: "from-blue-100 to-indigo-200", book: "«Сто лет тому вперёд»", product: "Досье героя" },
        { month: "ФЕВРАЛЬ", number: "6", role: "Я — литературный критик", icon: "✒️", color: "from-purple-100 to-violet-200", book: "«Три счастья»", product: "Эссе «Что такое счастье?»" },
        { month: "МАРТ", number: "7", role: "Я — художник", icon: "🎨", color: "from-teal-100 to-cyan-200", book: "«Ер-Тостик»", product: "Комикс «Приключения Ер-Тостика»" },
        { month: "АПРЕЛЬ", number: "8", role: "Я — рекламный агент", icon: "📣", color: "from-orange-100 to-amber-200", book: "«Удивительный волшебник из страны Оз»", product: "Рекламная карточка книги" },
        { month: "МАЙ", number: "9", role: "Я — наблюдатель", icon: "🔭", color: "from-violet-100 to-indigo-200", book: "«Телефон»", product: "Карта наблюдений" },
      ].map((item) => (
        <div
          key={item.number}
          className="group rounded-3xl border border-white/80 bg-white/85 p-6 shadow-md backdrop-blur-sm transition duration-300 hover:-translate-y-2 hover:border-violet-200 hover:shadow-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xl">🪐</span>
            <span className="text-sm font-bold tracking-wider text-violet-600">
              {item.month}
            </span>
            <span className="text-3xl font-bold text-violet-200">
{item.number}             </span>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-3xl shadow-sm transition duration-300 group-hover:scale-110`}>
              {item.icon}
            </div>
            <h3 className="text-lg font-bold text-[#26334a]">
              {item.role}
            </h3>
          </div>

          <p className="mt-5 min-h-10 text-sm leading-relaxed text-slate-600">
            {item.book}
          </p>

          <div className="mt-4 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-sky-50 p-4">
            <p className="text-xs font-medium text-violet-500">
              ТВОЙ ТВОРЧЕСКИЙ ПРОДУКТ
            </p>
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
src={coverUrls[book.title] || book.cover || undefined}    alt={`Обложка книги ${book.title}`}
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
            <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">{book.task}</p>
            {book.questions.length > 0 ? (
              <ol className="mt-3 list-decimal space-y-2 pl-5 leading-7 text-slate-600">
                {book.questions.map((question) => <li key={question}>{question}</li>)}
              </ol>
            ) : null}
            <div className="mt-8 rounded-2xl border border-[#e9e3d8] bg-white p-5">
              <p className="font-semibold">Место для твоей работы</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Выбери свою миссию, выполни творческое задание и отправь работу учителю. Получай читательские достижения и пополняй личное портфолио!
              </p>
            </div>
            {readUrls[book.title] ? (
              <a
                href={readUrls[book.title]}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 block w-full rounded-full border border-[#d9d1c4] bg-white px-6 py-3 text-center font-semibold text-[#26334a] hover:bg-[#f5f1e9]"
              >
                Читать онлайн →
              </a>
            ) : (
              <p className="mt-7 rounded-2xl border border-[#e9e3d8] bg-white p-4 text-center text-sm text-slate-500">
                Материал для чтения пока не добавлен.
              </p>
            )}
            <button
              onClick={() => openMission(book.title)}
              className="mt-3 w-full rounded-full bg-[#26334a] px-6 py-4 font-semibold text-white hover:bg-[#3b4d68]"
            >
            </button>
            <button
              onClick={() => setSelectedBook(null)}
              className="mt-3 w-full rounded-full border border-[#e9e3d8] bg-white px-6 py-3 font-semibold text-[#26334a]"
            >
              Вернуться в библиотеку
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
