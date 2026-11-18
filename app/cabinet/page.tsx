
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
  fileLinks: { name: string; url: string }[];
};

export default function CabinetPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [expandedResults, setExpandedResults] = useState<string[]>([]);
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
          "id, student_id, mission_id, answer, status, score, teacher_feedback, submitted_at, is_public, file_paths"
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

    const fileLinksBySubmission = new Map<string, { name: string; url: string }[]>();
    for (const item of submissions) {
      const paths = (item.file_paths || []) as string[];
      const links: { name: string; url: string }[] = [];
      for (const path of paths) {
        const { data: signed } = await supabase.storage
          .from("student-submissions")
          .createSignedUrl(path, 60 * 60);
        if (signed?.signedUrl) {
          links.push({ name: path.split("/").pop() || "Файл ученика", url: signed.signedUrl });
        }
      }
      fileLinksBySubmission.set(item.id, links);
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
  fileLinks: fileLinksBySubmission.get(item.id) || [],
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
  setSavingId(row.id);
  setTeacherMessage("");

  const { data: updatedRow, error: updateError } = await supabase
    .from("submissions")
    .update({
      teacher_feedback: row.feedbackDraft.trim(),
      status: "approved",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .select("id, teacher_feedback, status")
    .maybeSingle();

  if (updateError || !updatedRow) {
    console.error("Ошибка сохранения комментария:", updateError);
    setTeacherMessage(
      updateError?.message || "Не удалось сохранить комментарий. Проверьте права доступа."
    );
    setSavingId(null);
    return false;
  }

  setTeacherRows((current) =>
    current.map((item) =>
      item.id === row.id
        ? { ...item, status: "approved", teacher_feedback: row.feedbackDraft.trim() }
        : item
    )
  );

  setTeacherMessage("Комментарий сохранён!");
  setSavingId(null);
  return true;
}


async function saveReviewFromPanel(
  id: string,
  feedback: string
) {
  const row = teacherRows.find((item) => item.id === id);

  if (!row) {
    throw new Error("Работа ученика не найдена.");
  }

  const success = await saveReview({
    ...row,
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
  teacherFeedback: row.teacher_feedback,
  submittedAt: row.submitted_at,
  isPublic: row.is_public,
  fileLinks: row.fileLinks,
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

  {/* Приветствие */}
  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#25204f] via-[#34316f] to-[#5368a8] p-7 text-white shadow-xl md:p-10">
    <div className="pointer-events-none absolute right-8 top-5 text-5xl opacity-30">
      ✦
    </div>
    <div className="pointer-events-none absolute bottom-5 right-1/3 text-3xl text-sky-200 opacity-70">
      ✧
    </div>

    <p className="text-xs font-bold tracking-[0.25em] text-amber-300">
      ✦ ЛИЧНОЕ ПРОСТРАНСТВО
    </p>

    <h1 className="mt-4 text-3xl font-bold md:text-4xl">
      Мой читательский мир
    </h1>

    <p className="mt-3 text-lg text-sky-100">
      Добро пожаловать, {profile.full_name}!
    </p>

    <p className="mt-5 max-w-xl text-sm leading-6 text-indigo-100">
      Твоя книжная вселенная ждёт новых открытий. Читай, выполняй миссии и собирай достижения!
    </p>
  </div>

  {/* Мой читательский прогресс */}
  <section className="mt-8 rounded-3xl border border-violet-100 bg-white p-6 shadow-lg md:p-8">

    <p className="text-sm font-bold tracking-widest text-violet-600">
      ✦ МОИ ДОСТИЖЕНИЯ
    </p>

    <h2 className="mt-2 text-2xl font-bold text-[#26334a]">
      Мой читательский прогресс
    </h2>

    <p className="mt-2 text-slate-500">
      Каждый прочитанный рассказ приближает тебя к новым открытиям!
    </p>

    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

      <div className="rounded-2xl bg-sky-50 p-5">
        <span className="text-2xl">📚</span>
        <p className="mt-3 text-sm text-slate-500">Книги проекта</p>
        <p className="mt-1 text-3xl font-bold text-blue-700">
          {completedBooks} / 9
        </p>
      </div>

      <div className="rounded-2xl bg-violet-50 p-5">
        <span className="text-2xl">✍️</span>
        <p className="mt-3 text-sm text-slate-500">Выполнено заданий</p>
        <p className="mt-1 text-3xl font-bold text-violet-700">
          {completedTasks}
        </p>
      </div>

      <div className="rounded-2xl bg-pink-50 p-5">
        <span className="text-2xl">🚀</span>
        <p className="mt-3 text-sm text-slate-500">Отправлено работ</p>
        <p className="mt-1 text-3xl font-bold text-pink-700">
          {submissionCount}
        </p>
      </div>

      <div className="rounded-2xl bg-amber-50 p-5">
        <span className="text-2xl">🏆</span>
        <p className="mt-3 text-sm text-slate-500">Достижения</p>
        <p className="mt-1 text-3xl font-bold text-amber-700">
          {achievements.length}
        </p>
      </div>

    </div>

    <div className="mt-8 rounded-2xl bg-gradient-to-r from-violet-50 to-sky-50 p-5">

      <div className="flex justify-between gap-3">
        <p className="font-bold text-[#26334a]">
          🪐 Мой путь читателя
        </p>
        <p className="font-bold text-violet-700">
          {Math.round((completedBooks / 9) * 100)}%
        </p>
      </div>

      <div className="mt-4 h-4 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400 transition-all"
          style={{
            width: `${Math.min((completedBooks / 9) * 100, 100)}%`,
          }}
        />
      </div>

      <p className="mt-3 text-sm text-slate-500">
        {completedBooks} из 9 книг проекта
      </p>

    </div>

    <div className="mt-8">
      <h3 className="text-lg font-bold text-[#26334a]">
        🏅 Мои награды
      </h3>

      {achievements.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">
          Твои первые награды ещё впереди. Продолжай читать и выполнять миссии!
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-3">
          {achievements.map((achievement) => (
            <span
              key={achievement}
              className="rounded-full border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800"
            >
              ✦ {achievement}
            </span>
          ))}
        </div>
      )}
    </div>

  </section>


<section className="mt-12">
  <div className="text-center md:text-left">
    <p className="text-sm font-bold tracking-widest text-violet-600">
      ✦ МОЯ КОЛЛЕКЦИЯ
    </p>

    <h2 className="mt-2 text-2xl font-bold text-[#26334a]">
      9 читательских значков
    </h2>

    <p className="mt-2 text-slate-500">
      Выполняй задания по каждой книге и собирай свою коллекцию!
    </p>
  </div>

  {(() => {
    const badges = [
      { title: "Первый читатель", emoji: "📖", color: "from-sky-100 to-blue-200" },
      { title: "Книжный детектив", emoji: "🔍", color: "from-emerald-100 to-teal-200" },
      { title: "Мастер слова", emoji: "✍️", color: "from-pink-100 to-rose-200" },
      { title: "Генератор идей", emoji: "💡", color: "from-amber-100 to-orange-200" },
      { title: "Театральный герой", emoji: "🎭", color: "from-indigo-100 to-violet-200" },
      { title: "Знаток литературы", emoji: "🌟", color: "from-yellow-100 to-amber-200" },
      { title: "Исследователь", emoji: "🧭", color: "from-cyan-100 to-sky-200" },
      { title: "Мастер чтения", emoji: "🏆", color: "from-orange-100 to-amber-200" },
      { title: "Легенда орбиты", emoji: "👑", color: "from-purple-100 to-fuchsia-200" },
    ];

    return (
      <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
        {badges.map((badge, index) => {
          const book = books[index];
          const earned = book
            ? earnedBookTitles.has(book.title)
            : false;

          return (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-3xl border p-5 text-center transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
                earned
                  ? "border-violet-200 bg-white shadow-md"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="absolute right-3 top-2 text-2xl text-violet-200">
                {index + 1}
              </div>

              <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${badge.color} text-4xl shadow-inner transition duration-300 group-hover:scale-110 ${
                earned ? "" : "grayscale opacity-50"
              }`}>
                {earned ? badge.emoji : "🔒"}
              </div>

              <p className="mt-4 text-sm font-bold text-[#26334a]">
                {badge.title}
              </p>

              <div className={`mx-auto mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                earned
                  ? "bg-violet-100 text-violet-700"
                  : "bg-slate-200 text-slate-500"
              }`}>
                {earned ? "✓ Получен" : "🔒 Закрыт"}
              </div>
            </div>
          );
        })}
      </div>
    );
  })()}
</section>


        
<section className="mt-12">
  <div className="text-center md:text-left">
    <p className="text-sm font-bold tracking-widest text-violet-600">
      ✦ МОЯ КНИЖНАЯ ВСЕЛЕННАЯ
    </p>

    <h2 className="mt-2 text-2xl font-bold text-[#26334a]">
      Девять книг — девять открытий
    </h2>

    <p className="mt-2 text-slate-500">
      Каждая книга — новая планета твоего литературного путешествия.
    </p>
  </div>

  {books.length === 0 ? (
    <p className="mt-6 rounded-2xl bg-white p-6 text-slate-600">
      Книги пока не загружены. Проверьте доступ к библиотеке.
    </p>
  ) : (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book, index) => {
        const planetColors = [
          "from-blue-200 via-blue-500 to-indigo-950",
          "from-emerald-200 via-teal-500 to-emerald-950",
          "from-pink-200 via-pink-500 to-rose-950",
          "from-amber-200 via-orange-400 to-orange-950",
          "from-sky-200 via-blue-500 to-blue-950",
          "from-purple-200 via-violet-500 to-purple-950",
          "from-teal-200 via-cyan-500 to-teal-950",
          "from-orange-200 via-orange-500 to-orange-950",
          "from-violet-200 via-indigo-500 to-indigo-950",
        ];

        return (
          <button
            key={book.id}
            onClick={() => router.push(`/book/${book.id}`)}
            className="group w-full overflow-hidden rounded-3xl border border-violet-100 bg-white p-5 text-left shadow-md transition duration-300 hover:-translate-y-2 hover:border-violet-300 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest text-violet-600">
                {book.month_name}
              </span>
              <span className="text-sm font-bold text-violet-300">
                {book.month_number} / 9
              </span>
            </div>

            <div className={`relative mx-auto mt-6 flex h-60 w-60 max-w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${planetColors[index % 9]} shadow-[0_0_28px_rgba(139,92,246,0.25)] transition duration-500 group-hover:scale-105`}>
              <div className="absolute inset-3 rounded-full border border-white/30" />
              <div className="absolute right-8 top-8 h-3 w-3 rounded-full bg-white/60 blur-[1px]" />

              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={`Обложка книги ${book.title}`}
                  className="relative z-10 h-[82%] w-[70%] rounded-lg bg-white p-1 object-contain shadow-xl"
                />
              ) : (
                <span className="relative z-10 text-5xl text-white">
                  ✦
                </span>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-bold text-[#26334a] transition group-hover:text-violet-700">
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

              <div className="mt-5 rounded-xl bg-gradient-to-r from-violet-50 to-sky-50 px-4 py-3 text-center text-sm font-semibold text-violet-700">
                Открыть книгу →
              </div>
            </div>
          </button>
        );
      })}
    </div>
  )}
</section>


<section className="mt-12">
  <div>
    <p className="text-sm font-bold tracking-widest text-violet-600">
      ✦ МОИ ДОСТИЖЕНИЯ
    </p>
    <h2 className="mt-2 text-2xl font-bold text-[#26334a]">
      Мои работы и отзывы
    </h2>
    <p className="mt-2 text-slate-500">
      Здесь хранится история твоих читательских открытий.
    </p>
  </div>

  {studentResults.length === 0 ? (
    <div className="mt-6 rounded-3xl border border-violet-100 bg-white p-8 text-center shadow-sm">
      <div className="text-4xl">📚</div>
      <p className="mt-3 font-semibold text-[#26334a]">
        Пока нет отправленных работ
      </p>
      <p className="mt-2 text-sm text-slate-500">
        Выполни первую миссию и здесь появится твой результат!
      </p>
    </div>
  ) : (
    <div className="mt-7 space-y-5">
      {studentResults.map((result) => (
        <article
          key={result.id}
          className="group overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="bg-gradient-to-r from-violet-50 via-white to-sky-50 p-6 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-xs font-bold text-violet-700">
                📖 {result.book_title}
              </span>
              <span className="text-sm font-semibold text-violet-300">
                ✦ Моя работа
              </span>
            </div>

            <h3 className="mt-4 text-xl font-bold text-[#26334a]">
              {result.mission_title}
            </h3>

            <div className="mt-5">
              <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                result.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : result.status === "needs_revision"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-sky-100 text-sky-800"
              }`}>
                {result.status === "approved"
                  ? "✓ Работа просмотрена"
                  : result.status === "needs_revision"
                  ? "↻ Нужна доработка"
                  : "◷ Ожидает проверки"}
              </span>
            </div>
          </div>
          <div className="mt-5">
  <button
    type="button"
    onClick={() =>
      setExpandedResults((prev) =>
        prev.includes(result.id)
          ? prev.filter((id) => id !== result.id)
          : [...prev, result.id]
      )
    }
    className="inline-flex items-center gap-2 rounded-xl bg-violet-100 px-5 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-200"
  >
    {expandedResults.includes(result.id)
      ? "Скрыть мою работу ↑"
      : "Посмотреть мою работу ↓"}
  </button>

  {expandedResults.includes(result.id) && (
    <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/70 p-5">
      <p className="text-xs font-bold tracking-wider text-violet-700">
        МОЯ ОТПРАВЛЕННАЯ РАБОТА
      </p>

      <p className="mt-3 whitespace-pre-wrap leading-7 text-[#34415c]">
        {result.answer || "Текст работы не найден."}
      </p>
    </div>
  )}
</div>

          {result.teacher_feedback && (
            <div className="mx-5 mb-5 mt-2 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-sky-50 p-5 md:mx-7">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                  💬
                </span>
                <p className="text-xs font-bold tracking-wider text-violet-700">
                  ОТЗЫВ УЧИТЕЛЯ
                </p>
              </div>
              <p className="mt-3 leading-7 text-[#34415c]">
                {result.teacher_feedback}
              </p>
            </div>
          )}

        </article>
      ))}
    </div>
  )}
</section>

<section className="relative mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-[#211b50] via-[#34316f] to-[#5268a8] p-8 text-white shadow-xl md:p-10">
  {/* Декоративные звёзды */}
  <div className="pointer-events-none absolute right-8 top-5 text-6xl text-white/20">
    ✦
  </div>
  <div className="pointer-events-none absolute bottom-5 right-1/3 text-4xl text-sky-200/40">
    ✧
  </div>
  <div className="pointer-events-none absolute right-20 top-1/2 h-24 w-24 rounded-full border border-white/10" />

  <div className="relative z-10 max-w-2xl">
    <p className="text-sm font-bold tracking-[0.2em] text-amber-300">
      ✦ ТВОЁ ЧИТАТЕЛЬСКОЕ ПУТЕШЕСТВИЕ
    </p>

    <h2 className="mt-4 text-2xl font-bold leading-tight md:text-3xl">
      Каждая книга — новое открытие!
    </h2>

    <p className="mt-4 leading-7 text-indigo-100">
      Читай, исследуй, выполняй миссии и собирай свою историю достижений.
      Пусть каждая прочитанная книга открывает тебе новую вселенную знаний,
      фантазии и удивительных историй!
    </p>

    <div className="mt-7 flex items-center gap-3">
      <span className="text-3xl">🚀</span>
      <p className="text-sm font-semibold text-amber-200">
        Твоё следующее открытие начинается с новой страницы!
      </p>
    </div>
  </div>
</section>

      </section>
    </main>
  );
}
