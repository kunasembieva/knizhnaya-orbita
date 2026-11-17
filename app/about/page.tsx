
export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#26334a]">
      <header className="border-b border-[#e9e3d8] bg-white px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <a href="/" className="text-lg font-bold">
            ✦ КНИЖНАЯ ОРБИТА
          </a>
          <a href="/" className="text-sm font-semibold text-amber-700">
            ← На главную
          </a>
        </div>
      </header>

      <section className="bg-[#26334a] px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-bold tracking-widest text-amber-300">
            АВТОРСКИЙ ОБРАЗОВАТЕЛЬНЫЙ ПРОЕКТ · 2026–2027
          </p>
          <h1 className="mt-5 text-4xl font-bold md:text-6xl">
            О проекте
            <span className="block text-amber-300">«КНИЖНАЯ ОРБИТА»</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
            Девять месяцев — девять книг — девять открытий.
            Литературное путешествие, в котором ученик становится
            читателем, исследователем и создателем собственного
            творческого продукта.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-10 px-6 py-14">

        <section>
          <h2 className="text-2xl font-bold">Концепция проекта</h2>
          <p className="mt-4 leading-8 text-slate-600">
            «КНИЖНАЯ ОРБИТА» — это цифровой литературно-образовательный
            проект для учащихся 6 класса с казахским языком обучения.
            В течение девяти месяцев школьники знакомятся с
            литературными произведениями, выполняют тематические
            читательские миссии и создают собственные творческие работы.
          </p>
          <p className="mt-4 leading-8 text-slate-600">
            Каждый месяц участник получает новую роль: читателя,
            детектива, исследователя, журналиста, критика, художника
            и других создателей литературных открытий.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-bold">Актуальность проекта</h2>
          <p className="mt-4 leading-8 text-slate-600">
            Проект направлен на развитие интереса к чтению и
            читательской самостоятельности. Использование цифровой
            среды позволяет объединить чтение, творческую деятельность,
            обратную связь учителя и индивидуальное отслеживание
            достижений учащихся.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Цель проекта</h2>
          <p className="mt-4 leading-8 text-slate-600">
            Развитие читательской грамотности, речевых и творческих
            способностей учащихся посредством организации
            девятимесячного литературного путешествия с использованием
            цифровой образовательной платформы.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Задачи проекта</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              "Формировать устойчивый интерес к чтению художественной литературы.",
              "Развивать навыки понимания, анализа и интерпретации текстов.",
              "Совершенствовать устную и письменную речь учащихся.",
              "Развивать критическое и творческое мышление.",
              "Формировать навыки самостоятельной работы и самооценки.",
              "Использовать цифровые инструменты для создания читательского портфолио."
            ].map((item, index) => (
              <div key={index} className="rounded-2xl bg-white p-5 shadow-sm">
                <span className="font-bold text-amber-700">
                  0{index + 1}
                </span>
                <p className="mt-2 leading-7 text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-[#f0e9dc] p-7">
          <h2 className="text-2xl font-bold">Целевая аудитория</h2>
          <p className="mt-4 leading-8 text-slate-600">
            Учащиеся 6 класса с казахским языком обучения.
            Продолжительность реализации — 9 месяцев
            (сентябрь 2026 года — май 2027 года).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Методическая основа</h2>
          <p className="mt-4 leading-8 text-slate-600">
            В проекте используются читательские, исследовательские,
            творческие и коммуникативные задания. Ученик не только
            знакомится с содержанием произведения, но и применяет
            полученные знания при создании собственного продукта.
          </p>
          <p className="mt-4 leading-8 text-slate-600">
            Предусмотрены индивидуальная работа, выполнение
            тематических миссий, проверка учителем, оценивание
            и обратная связь.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Ожидаемые результаты</h2>
          <div className="mt-5 space-y-3">
            {[
              "Повышение интереса учащихся к чтению.",
              "Развитие навыков анализа литературных произведений.",
              "Совершенствование устной и письменной речи.",
              "Создание девяти тематических творческих продуктов.",
              "Формирование индивидуального читательского портфолио.",
              "Развитие самостоятельности и цифровой грамотности."
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-xl bg-white p-4">
                <span className="text-amber-700">✦</span>
                <p className="leading-6 text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-[#26334a] p-8 text-white">
          <p className="text-sm font-bold tracking-widest text-amber-300">
            ИТОГОВЫЙ ПРОДУКТ
          </p>
          <h2 className="mt-4 text-3xl font-bold">
            Личное читательское портфолио
          </h2>
          <p className="mt-4 leading-8 text-slate-200">
            Собрание творческих работ, результатов, баллов и достижений
            ученика за время литературного путешествия.
          </p>
        </section>

        <section className="border-t border-[#e9e3d8] pt-8">
          <p className="text-sm text-slate-500">
            Автор и руководитель проекта
          </p>
          <h2 className="mt-2 text-xl font-bold">
            Сембиева Құндыз Қуанышкерейқызы
          </h2>
          <p className="mt-2 text-slate-600">
            Учитель русского языка и литературы
          </p>
          <p className="mt-1 text-slate-600">
            Аккистауская средняя школа
          </p>
          <p className="mt-3 text-sm text-slate-500">
            2026–2027 учебный год
          </p>
        </section>
      </div>

      <footer className="bg-[#26334a] px-6 py-7 text-center text-sm text-slate-300">
        © 2026 КНИЖНАЯ ОРБИТА · Читай. Исследуй. Открывай.
      </footer>
    </main>
  );
}
