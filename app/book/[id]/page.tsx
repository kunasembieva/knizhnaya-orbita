
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Book = {
  id: string;
  title: string;
  author: string;
  month_name: string;
  cover_url: string | null;
};

type Mission = {
  id: string;
  title: string;
  description: string;
  role_name: string;
  max_points: number;
};

type Submission = {
  id: string;
  answer: string;
  status: string;
  score: number | null;
  teacher_feedback: string | null;
  submitted_at: string;
  reviewed_at: string | null;
};

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [mission, setMission] = useState<Mission | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadBook() {
      try {
        const { data: authData } = await supabase.auth.getUser();

        if (!authData.user) {
          router.replace("/login");
          return;
        }

        const { data: bookData, error: bookError } = await supabase
          .from("books")
          .select("id, title, author, month_name, cover_url")
          .eq("id", bookId)
          .single();

        if (bookError || !bookData) {
          setMessage("Не удалось найти книгу.");
          return;
        }

        setBook(bookData as Book);

        const { data: missionData, error: missionError } =
          await supabase
            .from("missions")
            .select("id, title, description, role_name, max_points")
            .eq("book_id", bookId)
            .maybeSingle();

        if (missionError) {
          setMessage("Не удалось загрузить задание.");
          return;
        }

        if (missionData) {
          setMission(missionData as Mission);

          // Загружаем последнюю работу этого ученика по заданию
          const { data: submissionData, error: submissionError } =
            await supabase
              .from("submissions")
              .select(
                "id, answer, status, score, teacher_feedback, submitted_at, reviewed_at"
              )
              .eq("student_id", authData.user.id)
              .eq("mission_id", missionData.id)
              .order("submitted_at", { ascending: false })
              .limit(1)
              .maybeSingle();

          if (submissionError) {
            console.error("Ошибка загрузки работы:", submissionError);
          } else if (submissionData) {
            setSubmission(submissionData as Submission);
            setAnswer(submissionData.answer || "");
          }
        }
      } catch (err) {
        console.error(err);
        setMessage("Произошла ошибка при загрузке страницы.");
      } finally {
        setLoading(false);
      }
    }

    loadBook();
  }, [bookId, router]);

  async function submitAnswer() {
    if (!answer.trim() || !mission) {
      setMessage("Сначала напиши свой ответ.");
      return;
    }

    setSending(true);
    setMessage("");

    try {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("submissions")
        .insert({
          student_id: authData.user.id,
          mission_id: mission.id,
          answer: answer.trim(),
          submitted_at: new Date().toISOString(),
        })
        .select(
          "id, answer, status, score, teacher_feedback, submitted_at, reviewed_at"
        )
        .single();

      if (error) {
        console.error(error);
        setMessage(
          "Не удалось отправить работу. Проверьте доступ к таблице submissions."
        );
      } else {
        setSubmission(data as Submission);
        setMessage("Работа успешно отправлена учителю!");
      }
    } catch (err) {
      console.error(err);
      setMessage("Произошла ошибка при отправке работы.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#faf8f3]">
        Загружаем книгу...
      </main>
    );
  }

  if (!book) {
    return (
      <main className="min-h-screen bg-[#faf8f3] p-8">
        {message || "Книга не найдена."}
        <button onClick={() => router.push("/cabinet")}>
          Вернуться в кабинет
        </button>
      </main>
    );
  }

  const isReviewed =
  submission !== null && submission.score !== null;

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#26334a]">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <button
          onClick={() => router.push("/cabinet")}
          className="mb-8 text-sm font-semibold text-slate-600"
        >
          ← Вернуться в библиотеку
        </button>

        <div className="rounded-3xl border border-[#eee3d3] bg-white p-6 md:p-9">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="flex h-64 items-center justify-center rounded-2xl bg-[#fff2cf] p-4 md:w-1/3">
              {book.cover_url && (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="h-full max-w-full object-contain"
                />
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold uppercase tracking-widest text-amber-700">
                {book.month_name}
              </p>

              <h1 className="mt-3 text-3xl font-bold">
                {book.title}
              </h1>

              <p className="mt-3 text-slate-500">
                {book.author}
              </p>

              {mission && (
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#f4f1eb] px-4 py-2 text-sm">
                    {mission.role_name}
                  </span>
                  <span className="rounded-full bg-amber-100 px-4 py-2 text-sm text-amber-900">
                    До {mission.max_points} баллов
                  </span>
                </div>
              )}
            </div>
          </div>

          {mission ? (
            <>
              <div className="mt-9 border-t border-[#eee3d3] pt-7">
                <p className="text-sm font-bold uppercase tracking-widest text-amber-700">
                  ТВОЯ МИССИЯ
                </p>

                <h2 className="mt-3 text-2xl font-bold">
                  {mission.title}
                </h2>

                <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-600">
                  {mission.description}
                </p>
              </div>

              {submission && (
                <div className="mt-8 rounded-2xl border border-[#eee3d3] bg-[#faf8f3] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-bold">
                      Результат проверки
                    </h3>

                    <span
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        isReviewed
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {isReviewed ? "✓ Проверено" : "Ожидает проверки"}
                    </span>
                  </div>

                  {isReviewed && (
                    <>
                      <div className="mt-5">
                        <p className="text-sm text-slate-500">
                          Твоя оценка
                        </p>
                        <p className="mt-1 text-4xl font-bold text-green-700">
                          {submission.score ?? "—"}
                          <span className="text-xl text-slate-500">
                            {" "}/ {mission.max_points}
                          </span>
                        </p>
                      </div>

                      {submission.teacher_feedback && (
                        <div className="mt-5 rounded-xl bg-white p-4">
                          <p className="text-sm font-bold text-amber-700">
                            КОММЕНТАРИЙ УЧИТЕЛЯ
                          </p>
                          <p className="mt-2 leading-7">
                            {submission.teacher_feedback}
                          </p>
                        </div>
                      )}

                      {submission.reviewed_at && (
                        <p className="mt-4 text-xs text-slate-400">
                          Проверено:{" "}
                          {new Date(submission.reviewed_at).toLocaleString(
                            "ru-RU"
                          )}
                        </p>
                      )}
                    </>
                  )}

                  {!isReviewed && (
                    <p className="mt-3 text-sm text-slate-600">
                      Твоя работа отправлена. Учитель скоро её проверит.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-8">
                <label className="font-bold">
                  {submission
                    ? "Твой ответ"
                    : "Место для твоей работы"}
                </label>

                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Напиши здесь свой ответ..."
                  rows={7}
                  className="mt-3 w-full rounded-2xl border border-[#e5ddcf] bg-[#fffdfa] p-4 outline-none focus:border-amber-500"
                />

                <button
                  onClick={submitAnswer}
                  disabled={sending || !answer.trim()}
                  className="mt-5 w-full rounded-full bg-[#26334a] px-6 py-4 font-semibold text-white disabled:opacity-50"
                >
                  {sending
                    ? "Отправляем..."
                    : submission
                    ? "Отправить новую версию работы"
                    : "Отправить работу учителю"}
                </button>

                {message && (
                  <p className="mt-4 text-center text-sm font-medium">
                    {message}
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="mt-8 rounded-2xl bg-amber-50 p-5">
              Для этой книги пока не найдено задание.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
