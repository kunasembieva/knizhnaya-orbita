"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Book = {
  id: string;
  title: string;
  author: string;
  month_name: string;
  cover_url: string | null;
  online_read_url: string | null;
};

type Mission = {
  id: string;
  title: string;
  description: string;
  role_name: string;
};

type Submission = {
  id: string;
  answer: string;
  status: string;
  teacher_feedback: string | null;
  submitted_at: string;
  file_paths: string[];
};

const ACCEPTED_FILES =
  "image/jpeg,image/png,image/webp,image/heic,video/mp4,video/quicktime,video/webm,application/pdf,.doc,.docx";

export default function BookPageClient({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [mission, setMission] = useState<Mission | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [answer, setAnswer] = useState("");
  const [files, setFiles] = useState<File[]>([]);
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
          .select("id, title, author, month_name, cover_url, online_read_url")
          .eq("id", bookId)
          .single();

        if (bookError || !bookData) {
          setMessage("Не удалось найти книгу.");
          return;
        }
        setBook(bookData as Book);

        const { data: missionData, error: missionError } = await supabase
          .from("missions")
          .select("id, title, description, role_name")
          .eq("book_id", bookId)
          .maybeSingle();

        if (missionError) {
          setMessage("Не удалось загрузить задание.");
          return;
        }

        if (missionData) {
          setMission(missionData as Mission);
          const { data: submissionData, error: submissionError } = await supabase
            .from("submissions")
            .select("id, answer, status, teacher_feedback, submitted_at, file_paths")
            .eq("student_id", authData.user.id)
            .eq("mission_id", missionData.id)
            .order("submitted_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (submissionError) {
            console.error("Ошибка загрузки работы:", submissionError);
          } else if (submissionData) {
            setSubmission({
              ...(submissionData as Submission),
              file_paths: submissionData.file_paths || [],
            });
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
    if ((!answer.trim() && files.length === 0) || !mission) {
      setMessage("Напиши ответ или прикрепи файл.");
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

      const uploadedPaths: string[] = [];
      for (const file of files) {
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`Файл «${file.name}» больше 50 МБ.`);
        }
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${authData.user.id}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("student-submissions")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;
        uploadedPaths.push(path);
      }

      const { data, error } = await supabase
        .from("submissions")
        .insert({
          student_id: authData.user.id,
          mission_id: mission.id,
          answer: answer.trim(),
          file_paths: uploadedPaths,
          submitted_at: new Date().toISOString(),
        })
        .select("id, answer, status, teacher_feedback, submitted_at, file_paths")
        .single();

      if (error) throw error;

      setSubmission({
        ...(data as Submission),
        file_paths: data.file_paths || [],
      });
      setFiles([]);
      setMessage("Работа успешно отправлена!");
    
} catch (err) {
  console.error(err);

  const errorCode = (err as { code?: string })?.code;

  if (errorCode === "23505") {
    setMessage("Ты уже отправил эту работу. Повторная отправка невозможна.");
  } else {
    setMessage(
      err instanceof Error
        ? `Не удалось отправить работу: ${err.message}`
        : "Произошла ошибка при отправке работы."
    );
  }
} finally {
  setSending(false);
}
}


  if (loading) {
    return <main className="min-h-screen flex items-center justify-center bg-[#faf8f3]">Загружаем книгу...</main>;
  }

  if (!book) {
    return (
      <main className="min-h-screen bg-[#faf8f3] p-8">
        {message || "Книга не найдена."}
        <button onClick={() => router.push("/cabinet")}>Вернуться в кабинет</button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#26334a]">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <button onClick={() => router.push("/cabinet")} className="mb-8 text-sm font-semibold text-slate-600">
          ← Вернуться в библиотеку
        </button>

        <div className="rounded-3xl border border-[#eee3d3] bg-white p-6 md:p-9">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="flex h-64 items-center justify-center rounded-2xl bg-[#fff2cf] p-4 md:w-1/3">
              {book.cover_url && <img src={book.cover_url} alt={book.title} className="h-full max-w-full object-contain" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold uppercase tracking-widest text-amber-700">{book.month_name}</p>
              <h1 className="mt-3 text-3xl font-bold">{book.title}</h1>
              <p className="mt-3 text-slate-500">{book.author}</p>
              {mission && (
                <div className="mt-6">
                  <span className="rounded-full bg-[#f4f1eb] px-4 py-2 text-sm">{mission.role_name}</span>
                </div>
              )}
              <div className="mt-6">
                {book.online_read_url ? (
                  <a
                    href={book.online_read_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-full bg-[#26334a] px-6 py-3 font-semibold text-white hover:bg-[#354663]"
                  >
                    📖 Читать онлайн
                  </a>
                ) : (
                  <p className="text-sm text-slate-500">Материал для чтения скоро появится.</p>
                )}
              </div>
            </div>
          </div>

          {mission ? (
            <>
              <div className="mt-9 border-t border-[#eee3d3] pt-7">
                <p className="text-sm font-bold uppercase tracking-widest text-amber-700">ТВОЯ МИССИЯ</p>
                <h2 className="mt-3 text-2xl font-bold">{mission.title}</h2>
                <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-600">{mission.description}</p>
              </div>

              {submission && (
                <div className="mt-8 rounded-2xl border border-[#eee3d3] bg-[#faf8f3] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-bold">Моя отправленная работа</h3>
                    <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
                      {submission.status === "approved" ? "Работа просмотрена" : "Работа отправлена"}
                    </span>
                  </div>
                  {submission.teacher_feedback && (
                    <div className="mt-5 rounded-xl bg-white p-4">
                      <p className="text-sm font-bold text-amber-700">КОММЕНТАРИЙ УЧИТЕЛЯ</p>
                      <p className="mt-2 leading-7">{submission.teacher_feedback}</p>
                    </div>
                  )}
                </div>
              )}

              {!submission ? (
  <div className="mt-8">
    <label className="font-bold">Место для твоей работы</label>

    <textarea
      value={answer}
      onChange={(e) => setAnswer(e.target.value)}
      placeholder="Напиши здесь свой ответ..."
      rows={7}
      className="mt-3 w-full rounded-2xl border border-[#e5ddcf] bg-[#fffdfa] p-4 outline-none focus:border-amber-500"
    />

    <div className="mt-5 rounded-2xl border border-dashed border-[#d8cbb8] bg-[#fffdfa] p-5">
      <label className="block font-semibold">
        📎 Прикрепить фото, видео или документ
      </label>
      <p className="mt-1 text-sm text-slate-500">
        JPG, PNG, WEBP, MP4, MOV, PDF, DOC, DOCX. До 50 МБ на файл.
      </p>
      <input
        type="file"
        multiple
        accept={ACCEPTED_FILES}
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
        className="mt-4 block w-full text-sm"
      />

      {files.length > 0 && (
        <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>

    <button
      onClick={submitAnswer}
      disabled={sending || (!answer.trim() && files.length === 0)}
      className="mt-5 w-full rounded-full bg-[#26334a] px-6 py-4 font-semibold text-white disabled:opacity-50"
    >
      {sending ? "Отправляем..." : "Отправить работу"}
    </button>

    {message && (
      <p className="mt-4 text-center text-sm font-medium">{message}</p>
    )}
  </div>
) : (
  <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
    <p className="font-bold text-green-800">
      Работа уже отправлена!
    </p>
    <p className="mt-2 text-sm text-green-700">
      Повторная отправка этого задания недоступна.
    </p>
  </div>
)}
            </>
          ) : (
            <p className="mt-8 rounded-2xl bg-amber-50 p-5">Для этой книги пока не найдено задание.</p>
          )}
        </div>
      </div>
    </main>
  );
}
