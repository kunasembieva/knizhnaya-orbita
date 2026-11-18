-- Книжная орбита: обновление программы и подготовка файловых вложений.
-- Скрипт не удаляет ученические работы, аккаунты или старые оценки.

ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS online_read_url text;

ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS file_paths jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Сентябрь
UPDATE public.books
SET title = 'Ворона и Лисица', author = 'И. А. Крылов',
    description = 'Басня о лести, доверчивости и умении отличать искренние слова от лукавых.'
WHERE month_name = 'Сентябрь';
UPDATE public.missions m
SET title = 'Моя читательская миссия', role_name = 'Я — читатель',
    description = E'1. Выбери героя, который тебе понравился.\n2. Какой совет ты бы дал Вороне?\n3. Выбери подходящую пословицу или придумай свою:\n• На всякого льстеца найдётся слушатель.\n• Не верь словам, верь делам.\n• Слово не воробей: вылетит — не поймаешь.'
FROM public.books b WHERE m.book_id = b.id AND b.month_name = 'Сентябрь';

-- Октябрь
UPDATE public.books
SET title = 'Белогрудка', author = 'В. П. Астафьев',
    description = 'Рассказ о природе, ответственности человека и последствиях жестокого поступка.'
WHERE month_name = 'Октябрь';
UPDATE public.missions m
SET title = 'Моя детективная миссия', role_name = 'Я — детектив',
    description = E'1. Собери улики. Выбери 3 события, которые помогли понять, почему Белогрудка стала мстить.\n2. Вердикт детектива. Кто должен нести ответственность? Объясни своё решение.'
FROM public.books b WHERE m.book_id = b.id AND b.month_name = 'Октябрь';

-- Ноябрь
UPDATE public.books
SET title = 'Времена года', author = 'Ф. И. Тютчев',
    description = 'Стихотворения «Есть в осени первоначальной…» и «Чародейкою Зимою…».'
WHERE month_name = 'Ноябрь';
UPDATE public.missions m
SET title = 'Экспертное заключение', role_name = 'Я — эксперт',
    description = E'1. Сравни стихотворения по критериям: картина природы, настроение, слова-художники. Заполни таблицу для осени и зимы.\n2. Выпиши из каждого стихотворения один эпитет и одно сравнение.\n3. Напиши экспертный вывод: чем отличаются картины осени и зимы? (2–3 предложения).'
FROM public.books b WHERE m.book_id = b.id AND b.month_name = 'Ноябрь';

-- Декабрь
UPDATE public.books
SET title = 'Алиса в стране чудес', author = 'Л. Кэрролл',
    description = 'Удивительное путешествие Алисы в необычный мир, полный загадок и неожиданных встреч.'
WHERE month_name = 'Декабрь';
UPDATE public.missions m
SET title = 'Интервью с Алисой', role_name = 'Я — журналист',
    description = E'Возьми интервью у Алисы. Составь 2 тонких и 2 толстых вопроса, которые тебе хотелось бы задать героине после прочтения книги.'
FROM public.books b WHERE m.book_id = b.id AND b.month_name = 'Декабрь';

-- Январь
UPDATE public.books
SET title = 'Сто лет тому вперёд', author = 'Кир Булычёв',
    description = 'Фантастическая история о путешествии во времени, дружбе и поступках героев.'
WHERE month_name = 'Январь';
UPDATE public.missions m
SET title = 'Досье героя', role_name = 'Я — исследователь героя',
    description = E'Исследуй героя произведения:\n• Опиши его характер.\n• Найди поступок, который раскрывает его личность.\n• Сделай вывод о герое.'
FROM public.books b WHERE m.book_id = b.id AND b.month_name = 'Январь';

-- Февраль
UPDATE public.books
SET title = 'Три счастья', author = 'М. Макатаев',
    description = 'Стихотворение о счастье, жизненных ценностях и личном понимании самого важного.'
WHERE month_name = 'Февраль';
UPDATE public.missions m
SET title = 'Эссе «Что такое счастье?»', role_name = 'Я — литературный критик',
    description = 'Напиши небольшое эссе по теме стихотворения «Три счастья». Поделись своими впечатлениями и объясни, что для тебя означает счастье.'
FROM public.books b WHERE m.book_id = b.id AND b.month_name = 'Февраль';

-- Март
UPDATE public.books
SET title = 'Ер-Тостик', author = 'Казахская народная сказка',
    description = 'Народная сказка о приключениях Ер-Тостика, смелости, испытаниях и верности.'
WHERE month_name = 'Март';
UPDATE public.missions m
SET title = 'Комикс «Приключения Ер-Тостика»', role_name = 'Я — художник',
    description = 'Создай комикс из 3–5 кадров. Изобрази ключевые события сказки и добавь короткие реплики героев.'
FROM public.books b WHERE m.book_id = b.id AND b.month_name = 'Март';

-- Апрель
UPDATE public.books
SET title = 'Удивительный волшебник из страны Оз', author = 'Л. Ф. Баум',
    description = 'Сказочная история о путешествии Дороти и её друзей в волшебной стране Оз.'
WHERE month_name = 'Апрель';
UPDATE public.missions m
SET title = 'Рекламная карточка книги', role_name = 'Я — рекламный агент',
    description = E'1. Создай рекламу книги для одноклассников с рекомендацией прочитать её.\n2. Создай рекламу с помощью искусственного интеллекта.'
FROM public.books b WHERE m.book_id = b.id AND b.month_name = 'Апрель';

-- Май
UPDATE public.books
SET title = 'Телефон', author = 'Н. Носов',
    description = 'Юмористический рассказ о друзьях, телефонных разговорах и забавных ситуациях.'
WHERE month_name = 'Май';
UPDATE public.missions m
SET title = 'Карта наблюдений', role_name = 'Я — наблюдатель',
    description = E'Найди в произведении 5 интересных деталей:\n• поступки героев;\n• необычные события;\n• важные мелочи, которые помогают понять рассказ.'
FROM public.books b WHERE m.book_id = b.id AND b.month_name = 'Май';

-- Приватное хранилище ученических работ.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-submissions',
  'student-submissions',
  false,
  52428800,
  ARRAY[
    'image/jpeg','image/png','image/webp','image/heic',
    'video/mp4','video/quicktime','video/webm',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Ученик загружает файл только в собственную папку: <auth.uid()>/<filename>.
DROP POLICY IF EXISTS "Students upload own submission files" ON storage.objects;
CREATE POLICY "Students upload own submission files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'student-submissions'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Students read own submission files" ON storage.objects;
CREATE POLICY "Students read own submission files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'student-submissions'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Учитель, назначенный ученику, может просматривать его вложения.
DROP POLICY IF EXISTS "Assigned teachers read student submission files" ON storage.objects;
CREATE POLICY "Assigned teachers read student submission files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'student-submissions'
  AND CASE
    WHEN (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN public.is_teacher_of_student(((storage.foldername(name))[1])::uuid)
    ELSE false
  END
);
