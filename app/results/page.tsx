
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type PublicSubmission = {
  student_name: string;
  book_title: string;
  mission_title: string;
  answer: string;
  teacher_feedback: string | null;
  status: string;
  submitted_at: string;
};

export default function PublicResultsPage() {
  const [results, setResults] = useState<PublicSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadResults() {
      const { data, error } = await supabase.rpc(
        "get_public_submissions"
      );

      if (error) {
        console.error(error);
        setError("Не удалось загрузить результаты.");
      } else {
        setResults(data || []);
      }

      setLoading(false);
    }

    loadResults();
  }, []);

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#26334a]">
      <header className="border-b border-[#eee3d3] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <a href="/" className="text-xl font-bold">
            ✦ КНИЖНАЯ ОРБИТА
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm font-bold tracking-widest text-amber-700">
          НАШИ ДОСТИЖЕНИЯ
        </p>

        <h1 className="mt-3 text-3xl font-bold md:text-4xl">
          Результаты участников
        </h1>

        <p className="mt-3 text-slate-600">
          Читательские открытия, выполненные задания и отзывы учителей.
        </p>

        {loading ? (
          <p className="mt-10">Загружаем результаты...</p>
        ) : error ? (
          <p className="mt-10 text-red-600">{error}</p>
        ) : results.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white p-8 text-center">
            Пока нет опубликованных работ.
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {results.map((item, index) => (
              <article
                key={`${item.student_name}-${item.mission_title}-${index}`}
                className="rounded-2xl border border-[#eee3d3] bg-white p-6"
              >
                <p className="font-bold text-amber-700">
                  {item.book_title}
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  {item.mission_title}
                </h2>

                <p className="mt-3 text-slate-600">
                  Участник: {item.student_name}
                </p>

                <div className="mt-5 rounded-xl bg-[#faf8f3] p-5">
                  <p className="text-xs font-bold text-slate-500">
                    РАБОТА УЧЕНИКА
                  </p>
                  <p className="mt-3 whitespace-pre-wrap leading-7">
                    {item.answer}
                  </p>
                </div>

                <div className="mt-5">
                  <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
                    Работа просмотрена
                  </span>
                </div>

                {item.teacher_feedback && (
                  <div className="mt-5 rounded-xl border border-[#eee3d3] p-5">
                    <p className="text-xs font-bold text-slate-500">
                      КОММЕНТАРИЙ УЧИТЕЛЯ
                    </p>
                    <p className="mt-2">
                      {item.teacher_feedback}
                    </p>
                  </div>
                )}

            
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
