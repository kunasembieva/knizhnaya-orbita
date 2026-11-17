
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SubmissionReviewPanel from "@/components/teacher/SubmissionReviewPanel";

type Profile = {
  full_name: string;
  role: "student" | "teacher" | "jury";
};

type Book = {
  id: string;
  month_number: number;
  month_name: string;
  title: string;
  author: string;
  description: string | null;
  cover_url: string | null;
};
type StudentResult = {
  id: string;
  mission_id: string;
  answer: string;
  status: string;
  score: number | null;
  teacher_feedback: string | null;
  submitted_at: string;
  mission_title: string;
  book_title: string;
};

type TeacherSubmission = {
  id: string;
  student_id: string;
  mission_id: string;
  answer: string;
  status: string;
  score: number | null;
  teacher_feedback: string | null;
  is_public: boolean;
  submitted_at: string;
  student_name: string;
  mission_title: string;
  book_title: string;
  scoreDraft: string;
  feedbackDraft: string;
};

export default function CabinetPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const completedBooks = new Set(
  studentResults
    .filter((result) => result.status === "approved")
    .map((result) => result.book_title)
).size;
const earnedBookTitles = new Set(
  studentResults
    .filter((result) => result.status === "approved")
    .map((result) => result.book_title)
);

const completedTasks = studentResults.filter(
  (result) => result.status === "approved"
).length;

const totalPoints = studentResults.reduce(
  (sum, result) => sum + (result.score ?? 0),
  0
);

const achievements = [
  completedBooks >= 1 ? "Первое книжное открытие" : null,
  completedTasks >= 5 ? "Мастер читательских миссий" : null,
  completedBooks >= 9 ? "Покоритель книжной орбиты" : null,
].filter(Boolean);
  const [teacherRows, setTeacherRows] = useState<TeacherSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teacherMessage, setTeacherMessage] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadCabinet() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData.user) {
          router.replace("/login");
          return;
        }
        console.log("ID пользователя:", authData.user.id);
        const { data: permissionCheck, error: permissionError } =
  await supabase.rpc("is_teacher_of_student", {
    target_student: "0dd4561d-5168-40a4-b750-ba75a6e83e33",
  });

console.log("Проверка прав учителя:", permissionCheck);
console.log("Ошибка проверки:", permissionError);
console.log("Email пользователя:", authData.user.email);

        const user = authData.user;

        const { data: profileData, error: profileError } =
          await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", user.id)
            .single();

        if (profileError || !profileData) {
          setError("Не удалось загрузить профиль.");
          return;
        }

        setProfile(profileData as Profile);

        // КАБИНЕТ УЧЕНИКА
        if (profileData.role === "student") {
          const { data: booksData, error: booksError } =
            await supabase
              .from("books")
              .select(
                "id, month_number, month_name, title, author, description, cover_url"
              )
              .order("month_number", { ascending: true });

          if (booksError) {
            console.error("Ошибка загрузки книг:", booksError);
          } else {
            setBooks((booksData || []) as Book[]);
          }

          
const { data: submissionsData, error: submissionsError } =
  await supabase
    .from("submissions")
    .select(
      "id, mission_id, answer, status, score, teacher_feedback, submitted_at"
    )
    .eq("student_id", user.id)
    .order("submitted_at", { ascending: false });

if (submissionsError) {
  console.error("Ошибка загрузки работ:", submissionsError);
} else {
  setSubmissionCount(submissionsData?.length || 0);

  const missionIds = [
    ...new Set((submissionsData || []).map((item) => item.mission_id)),
  ];

  if (missionIds.length > 0) {
    const { data: missionsData, error: missionsError } =
      await supabase
        .from("missions")
        .select("id, title, book_id")
        .in("id", missionIds);

    if (missionsError) {
      console.error("Ошибка загрузки заданий:", missionsError);
    }

    const bookIds = [
      ...new Set((missionsData || []).map((item) => item.book_id)),
    ];

    let booksForResults: { id: string; title: string }[] = [];

    if (bookIds.length > 0) {
      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select("id, title")
        .in("id", bookIds);

      if (booksError) {
        console.error("Ошибка загрузки книг:", booksError);
      } else {
        booksForResults = booksData || [];
      }
    }

    const results: StudentResult[] = (submissionsData || []).map((item) => {
      const mission = (missionsData || []).find(
        (m) => m.id === item.mission_id
      );

      const book = booksForResults.find(
        (b) => b.id === mission?.book_id
      );

      return {
        id: item.id,
        mission_id: item.mission_id,
        answer: item.answer || "",
        status: item.status || "pending",
        score: item.score,
        teacher_feedback: item.teacher_feedback,
        submitted_at: item.submitted_at,
        mission_title: mission?.title || "Задание",
        book_title: book?.title || "Книга",
      };
    });

    setStudentResults(results);
  } else {
    setStudentResults([]);
  }
}

        }

        // КАБИНЕТ УЧИТЕЛЯ
        if (profileData.role === "teacher") {
          await loadTeacherSubmissions();
        }
      } catch (err) {
        console.error(err);
        setError("Произошла ошибка при загрузке кабинета.");
      } finally {
        setLoading(false);
      }
    }

    loadCabinet();
  }, [router]);

  async function loadTeacherSubmissions() {
    setTeacherMessage("");

    const { data: submissions, error: submissionsError } =
      await supabase
        .from("submissions")
        .select(
          "id, student_id, mission_id, answer, status, score, teacher_feedback, submitted_at, is_public"
        )
        .order("submitted_at", { ascending: false });

    if (submissionsError) {
      console.error("Ошибка загрузки работ:", submissionsError);
      setTeacherMessage(
        "Не удалось загрузить работы. Проверьте политики доступа RLS для учителя."
      );
      return;
    }

    if (!submissions || submissions.length === 0) {
      setTeacherRows([]);
      return;
    }

    const studentIds = [
      ...new Set(submissions.map((item) => item.student_id)),
    ];

    const missionIds = [
      ...new Set(submissions.map((item) => item.mission_id)),
    ];

    const { data: profilesData, error: profilesError } =
      await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", studentIds);

    if (profilesError) {
      console.error("Ошибка загрузки учеников:", profilesError);
    }

    const { data: missionsData, error: missionsError } =
      await supabase
        .from("missions")
        .select("id, title, book_id")
        .in("id", missionIds);

    if (missionsError) {
      console.error("Ошибка загрузки заданий:", missionsError);
    }

    const bookIds = [
      ...new Set(
        (missionsData || [])
          .map((mission) => mission.book_id)
          .filter(Boolean)
      ),
    ];

    let booksData: { id: string; title: string }[] = [];

    if (bookIds.length > 0) {
      const { data, error: booksError } = await supabase
        .from("books")
        .select("id, title")
        .in("id", bookIds);

      if (booksError) {
        console.error("Ошибка загрузки названий книг:", booksError);
      } else {
        booksData = data || [];
      }
    }

    const result: TeacherSubmission[] = submissions.map((item) => {
      const student = (profilesData || []).find(
        (p) => p.id === item.student_id
      );

      const mission = (missionsData || []).find(
        (m) => m.id === item.mission_id
      );

      const book = booksData.find(
        (b) => b.id === mission?.book_id
      );

      return {
  id: item.id,
  student_id: item.student_id,
  mission_id: item.mission_id,
  answer: item.answer || "",
  status: item.status || "pending",
  score: item.score,
  teacher_feedback: item.teacher_feedback,
  is_public: item.is_public,
  submitted_at: item.submitted_at,
  student_name: student?.full_name || "Ученик",
  mission_title: mission?.title || "Читательская миссия",
  book_title: book?.title || "Книга",
  scoreDraft:
    item.score === null ? "" : String(item.score),
  feedbackDraft: item.teacher_feedback || "",
};
    });

    setTeacherRows(result);
  }

  function updateDraft(
    id: string,
    field: "scoreDraft" | "feedbackDraft",
    value: string
  ) {
    setTeacherRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  }
async function togglePublication(row: TeacherSubmission) {

  const newValue = !row.is_public;

  const { data, error } = await supabase
    .from("submissions")
    .update({ is_public: newValue })
    .eq("id", row.id)
    .select("id, is_public")
    .maybeSingle();

  if (error || !data) {
    console.error("Ошибка публикации:", error);
    setTeacherMessage("Не удалось изменить публикацию.");
    return;
  }

  setTeacherRows((current) =>
    current.map((item) =>
      item.id === row.id
        ? { ...item, is_public: data.is_public }
        : item
    )
  );

  setTeacherMessage(
    data.is_public
      ? "Работа опубликована!"
      : "Публикация работы отменена."
  );
}
  
async function saveReview(
  row: TeacherSubmission
): Promise<boolean> {
  const score = Number(row.scoreDraft);

  if (
    row.scoreDraft.trim() === "" ||
    !Number.isInteger(score) ||
    score < 0 ||
    score > 10
  ) {
    setTeacherMessage("Укажите целое число от 0 до 10 баллов.");
    return false;
  }

  setSavingId(row.id);
  setTeacherMessage("");

  const { data: updatedRow, error: updateError } = await supabase
    .from("submissions")
    .update({
      score,
      teacher_feedback: row.feedbackDraft.trim(),
      status: "approved",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .select("id, score, teacher_feedback, status")
    .maybeSingle();

  if (updateError) {
    console.error("Ошибка сохранения проверки:", updateError);
    setTeacherMessage("Ошибка сохранения: " + updateError.message);
    setSavingId(null);
    return false;
  }

  if (!updatedRow) {
    console.error("Запись не обновлена. ID:", row.id);
    setTeacherMessage(
      "Запись не обновлена. Проверьте права доступа UPDATE."
    );
    setSavingId(null);
    return false;
  }

  setTeacherRows((current) =>
    current.map((item) =>
      item.id === row.id
        ? {
            ...item,
            score,
            status: "approved",
            teacher_feedback: row.feedbackDraft.trim(),
          }
        : item
    )
  );

  setTeacherMessage("Проверка успешно сохранена!");
  setSavingId(null);

  return true;
}


async function saveReviewFromPanel(
  id: string,
  score: number,
  feedback: string
) {
  const row = teacherRows.find((item) => item.id === id);

  if (!row) {
    throw new Error("Работа ученика не найдена.");
  }

  const success = await saveReview({
    ...row,
    scoreDraft: String(score),
    feedbackDraft: feedback,
  });

  if (!success) {
    throw new Error("Не удалось сохранить проверку.");
  }
}

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#faf8f3] text-[#26334a]">
        Загружаем ваш читательский мир...
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#faf8f3] text-[#26334a]">
        <p className="text-red-600">{error || "Профиль не найден."}</p>
        <button
          onClick={handleLogout}
          className="rounded-full bg-[#26334a] px-6 py-3 text-white"
        >
          Выйти
        </button>
      </main>
    );
  }

  // ОБЩАЯ ШАПКА
  const Header = () => (
    <header className="border-b border-[#eee3d3] bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="/" className="text-xl font-bold tracking-wide">
          ✦ КНИЖНАЯ ОРБИТА
        </a>
        <button
          onClick={handleLogout}
          className="rounded-full bg-[#26334a] px-6 py-3 text-white"
        >
          Выйти
        </button>
      </div>
    </header>
  );

  // КАБИНЕТ УЧИТЕЛЯ
  if (profile.role === "teacher") {
    const pendingCount = teacherRows.filter(
      (row) => row.status !== "approved"
    ).length;

    const approvedCount = teacherRows.filter(
      (row) => row.status === "approved"
    ).length;
    const reviewItems = teacherRows.map((row) => ({
  id: row.id,
  studentName: row.student_name,
  missionTitle: row.mission_title,
  bookTitle: row.book_title,
  answer: row.answer,
  status: row.status,
  score: row.score,
  teacherFeedback: row.teacher_feedback,
  submittedAt: row.submitted_at,
  isPublic: row.is_public,
}));
    
    return (
      <main className="min-h-screen bg-[#faf8f3] text-[#26334a]">
        <Header />

        <section className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-sm font-bold tracking-widest text-amber-700">
            ПУЛЬТ НАСТАВНИКА
          </p>

          <h1 className="mt-3 text-3xl font-bold md:text-4xl">
            Кабинет учителя
          </h1>

          <p className="mt-3 text-slate-600">
            Добро пожаловать, {profile.full_name}!
          </p>

          
<SubmissionReviewPanel
  items={reviewItems}
  onSave={saveReviewFromPanel}
  onRefresh={loadTeacherSubmissions}
onTogglePublication={async (id) => {
  const row = teacherRows.find((item) => item.id === id);

  if (!row) {
    throw new Error("Работа не найдена.");
  }
  await togglePublication(row);
}}
/>
</section>
      </main>
    );
  }

  // КАБИНЕТ ЖЮРИ
  if (profile.role === "jury") {
    return (
      <main className="min-h-screen bg-[#faf8f3] text-[#26334a]">
        <Header />
        <section className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-sm font-bold tracking-widest text-amber-700">
            ЭКСПЕРТНАЯ ПЛОЩАДКА
          </p>
          <h1 className="mt-3 text-3xl font-bold">
            Кабинет жюри
          </h1>
          <p className="mt-3 text-slate-600">
            Добро пожаловать, {profile.full_name}!
          </p>
          <div className="mt-8 rounded-2xl border border-[#eee3d3] bg-white p-6">
            Экспертная площадка будет доступна после настройки доступа жюри.
          </div>
        </section>
      </main>
    );
  }

  // КАБИНЕТ УЧЕНИКА
  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#26334a]">
      <Header />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm font-bold tracking-widest text-amber-700">
          ЛИЧНОЕ ПРОСТРАНСТВО
        </p>

        <h1 className="mt-3 text-3xl font-bold md:text-4xl">
          Мой читательский мир
          <p className="mt-3 text-slate-600">
  Добро пожаловать, {profile.full_name}!

<section className="mt-8 rounded-3xl border border-[#eee3d3] bg-white p-6 md:p-8">
  <p className="text-sm font-bold tracking-widest text-amber-700">
    МОИ ДОСТИЖЕНИЯ
  </p>

  <h2 className="mt-2 text-2xl font-bold">
    Мой читательский прогресс
  </h2>

  <p className="mt-2 text-slate-500">
    Каждый прочитанный рассказ приближает тебя к новым открытиям!
  </p>

  <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <div className="rounded-2xl bg-[#faf8f3] p-5">
      <p className="text-sm text-slate-500">Книги проекта</p>
      <p className="mt-2 text-3xl font-bold">
        {completedBooks} / 9
      </p>
    </div>

    <div className="rounded-2xl bg-[#faf8f3] p-5">
      <p className="text-sm text-slate-500">Выполнено заданий</p>
      <p className="mt-2 text-3xl font-bold">
        {completedTasks}
      </p>
    </div>

    <div className="rounded-2xl bg-[#faf8f3] p-5">
      <p className="text-sm text-slate-500">Набрано баллов</p>
      <p className="mt-2 text-3xl font-bold">
        {totalPoints}
      </p>
    </div>

    <div className="rounded-2xl bg-[#faf8f3] p-5">
      <p className="text-sm text-slate-500">Достижения</p>
      <p className="mt-2 text-3xl font-bold">
        {achievements.length}
      </p>
    </div>
  </div>

  <div className="mt-8">
    <div className="flex justify-between gap-3">
      <p className="font-bold">Мой путь читателя</p>
      <p className="text-sm font-semibold text-amber-700">
        {Math.round((completedBooks / 9) * 100)}%
      </p>
    </div>

    <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#eee9df]">
      <div
        className="h-full rounded-full bg-[#d5a64b] transition-all"
        style={{
          width: `${Math.min((completedBooks / 9) * 100, 100)}%`,
        }}
      />
    </div>

    <p className="mt-2 text-sm text-slate-500">
      {completedBooks} из 9 книг проекта
    </p>
  </div>
  <div className="mt-8">
    <h3 className="text-lg font-bold">Мои награды</h3>

    {achievements.length === 0 ? (
      <p className="mt-3 text-sm text-slate-500">
        Твои первые награды ещё впереди. Продолжай читать и выполнять миссии!
      </p>
    ) : (
      <div className="mt-4 flex flex-wrap gap-3">
        {achievements.map((achievement) => (
          <span
            key={achievement}
            className="rounded-full bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800"
          >
            ✦ {achievement}
          </span>
        ))}
      </div>
    )}
  </div>
</section>
</p>
        </h1>

        <p className="mt-3 text-slate-600">
          Добро пожаловать, {profile.full_name}!
        </p>

        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#eee3d3] bg-white p-6">
            <p className="text-sm text-slate-500">Книги в путешествии</p>
            <p className="mt-2 text-4xl font-bold">{books.length} / 9</p>
          </div>

          <div className="rounded-2xl border border-[#eee3d3] bg-white p-6">
            <p className="text-sm text-slate-500">Отправлено работ</p>
            <p className="mt-2 text-4xl font-bold">
              {submissionCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#eee3d3] bg-white p-6">
            <p className="text-sm text-slate-500">Учебный год</p>
            <p className="mt-2 text-3xl font-bold">2026–2027</p>
          </div>
        </div>

<section className="mt-12">
  <p className="text-sm font-bold tracking-widest text-amber-700">
    МОЯ КОЛЛЕКЦИЯ
  </p>

  <h2 className="mt-2 text-2xl font-bold">
    9 читательских значков
  </h2>

  <p className="mt-2 text-slate-500">
    Выполняй задания по каждой книге и собирай свою коллекцию!
  </p>

  {(() => {
    const badges = [
      { title: "Первый читатель", emoji: "📖" },
      { title: "Книжный детектив", emoji: "🔍" },
      { title: "Мастер слова", emoji: "✍️" },
      { title: "Генератор идей", emoji: "💡" },
      { title: "Театральный герой", emoji: "🎭" },
      { title: "Знаток литературы", emoji: "🌟" },
      { title: "Исследователь", emoji: "🧭" },
      { title: "Мастер чтения", emoji: "🏆" },
      { title: "Легенда орбиты", emoji: "👑" },
    ];

    return (
      <div className="mt-6 grid grid-cols-3 gap-3 md:grid-cols-5 lg:grid-cols-9">
        {badges.map((badge, index) => {
          const book = books[index];
          const earned = book
            ? earnedBookTitles.has(book.title)
            : false;

          return (
            <div
              key={index}
              className={`rounded-2xl border p-3 text-center ${
                earned
                  ? "border-amber-300 bg-amber-50"
                  : "border-[#eee3d3] bg-white opacity-50"
              }`}
            >
              <div className="text-3xl">
                {earned ? badge.emoji : "🔒"}
              </div>

              <p className="mt-2 text-xs font-bold">
                {String(index + 1).padStart(2, "0")}
              </p>

              <p className="mt-1 text-xs font-semibold">
                {badge.title}
              </p>

              <p className="mt-2 text-[10px] text-slate-500">
                {earned ? "Получен" : "Закрыт"}
              </p>
            </div>
          );
        })}
      </div>
    );
  })()}
</section>

        <section className="mt-12">
          <p className="text-sm font-bold tracking-widest text-amber-700">
            ТВОЯ БИБЛИОТЕКА
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            Девять книг — девять открытий
          </h2>

          {books.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-white p-6 text-slate-600">
              Книги пока не загружены. Проверьте доступ к библиотеке.
            </p>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <button
                  key={book.id}
                  onClick={() => router.push(`/book/${book.id}`)}
                  className="w-full overflow-hidden rounded-2xl border border-[#eee3d3] bg-white text-left transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-64 items-center justify-center bg-[#fff2cf] p-5">
                    {book.cover_url ? (
                      <img
                        src={book.cover_url}
                        alt={`Обложка книги ${book.title}`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-5xl">✦</span>
                    )}
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-bold tracking-widest text-amber-700">
                      {book.month_name} ·{" "}
                      {String(book.month_number).padStart(2, "0")} / 09
                    </p>

                    <h3 className="mt-3 text-lg font-bold">
                      {book.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      {book.author}
                    </p>

                    {book.description && (
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {book.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>


<section className="mt-12">
  <p className="text-sm font-bold tracking-widest text-amber-700">
    МОИ ДОСТИЖЕНИЯ
  </p>

  <h2 className="mt-2 text-2xl font-bold">
    Мои результаты
  </h2>

  {studentResults.length === 0 ? (
    <div className="mt-6 rounded-2xl bg-white p-6 text-slate-500">
      Пока нет отправленных работ.
    </div>
  ) : (
    <div className="mt-6 space-y-5">
      {studentResults.map((result) => (
        <article
          key={result.id}
          className="rounded-2xl border border-[#eee3d3] bg-white p-6"
        >
          <p className="text-sm font-bold text-amber-700">
            {result.book_title}
          </p>

          <h3 className="mt-2 text-lg font-bold">
            {result.mission_title}
          </h3>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#faf8f3] px-4 py-2 text-sm">
              {result.score === null
                ? "Баллы пока не выставлены"
                : `Оценка: ${result.score} / 10`}
            </span>

            <span className={`rounded-full px-4 py-2 text-sm font-semibold ${
              result.status === "approved"
                ? "bg-green-100 text-green-800"
                : result.status === "needs_revision"
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-100 text-slate-600"
            }`}>
              {result.status === "approved"
                ? "Проверено"
                : result.status === "needs_revision"
                ? "Нужна доработка"
                : "Ожидает проверки"}
            </span>
          </div>

          {result.teacher_feedback && (
            <div className="mt-5 rounded-xl bg-[#faf8f3] p-5">
              <p className="text-xs font-bold text-slate-500">
                КОММЕНТАРИЙ УЧИТЕЛЯ
              </p>
              <p className="mt-2 leading-7">
                {result.teacher_feedback}
              </p>
            </div>
          )}

          <p className="mt-4 text-xs text-slate-400">
            Отправлено:{" "}
            {new Date(result.submitted_at).toLocaleString("ru-RU")}
          </p>
        </article>
      ))}
    </div>
  )}
</section>

        <section className="mt-12 rounded-3xl bg-[#26334a] p-8 text-white">
          <p className="text-sm font-bold tracking-widest text-amber-300">
            ТВОЁ ЧИТАТЕЛЬСКОЕ ПУТЕШЕСТВИЕ
          </p>
          <h2 className="mt-3 text-2xl font-bold">
            Каждая книга — новое открытие!
          </h2>
          <p className="mt-3 leading-7 text-slate-200">
            Читай, исследуй, выполняй миссии и собирай свою историю достижений.
          </p>
        </section>
      </section>
    </main>
  );
}
