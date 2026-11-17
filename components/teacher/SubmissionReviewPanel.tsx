
"use client";

import { useMemo, useState } from "react";

export type ReviewItem = {
  id: string;
  studentName: string;
  missionTitle: string;
  bookTitle?: string;
  answer?: string | null;
  filePath?: string | null;
  status?: string | null;
  score?: number | null;
  teacherFeedback?: string | null;
  submittedAt?: string | null;
  isPublic?: boolean;
};

type Props = {
  items: ReviewItem[];
  onSave: (
    id: string,
    score: number,
    feedback: string
  ) => Promise<void>;
  onRefresh?: () => void;
  onTogglePublication?: (id: string) => Promise<void>;
};

export default function SubmissionReviewPanel({
  items,
  onSave,
  onRefresh,
  onTogglePublication,
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] =
    useState<ReviewItem | null>(null);

  const [score, setScore] = useState("10");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isReviewed = (item: ReviewItem) =>
  item.status === "approved";

  const pendingCount = items.filter(
    item => !isReviewed(item)
  ).length;

  const reviewedCount = items.length - pendingCount;

  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        const query = search.toLowerCase();

        const matchesSearch =
          item.studentName.toLowerCase().includes(query) ||
          item.missionTitle.toLowerCase().includes(query) ||
          (item.bookTitle || "").toLowerCase().includes(query);

        const matchesFilter =
          filter === "all" ||
          (filter === "pending" && !isReviewed(item)) ||
          (filter === "reviewed" && isReviewed(item));

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (isReviewed(a) !== isReviewed(b)) {
          return isReviewed(a) ? 1 : -1;
        }

        return (
          new Date(b.submittedAt || 0).getTime() -
          new Date(a.submittedAt || 0).getTime()
        );
      });
  }, [items, search, filter]);

  function openReview(item: ReviewItem) {
    setSelected(item);
    setScore(String(item.score ?? 10));
    setFeedback(item.teacherFeedback ?? "");
    setError("");
  }

  async function saveReview() {
    if (!selected) return;

    const numericScore = Number(score);

    if (
      !Number.isInteger(numericScore) ||
      numericScore < 0 ||
      numericScore > 10
    ) {
      setError("Введите целое число от 0 до 10.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave(selected.id, numericScore, feedback);

      setSelected(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось сохранить проверку."
      );
    } finally {
      setSaving(false);
    }
  }

  const formatDate = (date?: string | null) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("ru-RU");
  };

  return (
    <section className="space-y-5 text-[#26334a]">

      {/* СЧЁТЧИКИ */}

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-[#eee3d3] bg-white p-4">
          <p className="text-sm text-slate-500">
            Всего работ
          </p>
          <p className="mt-1 text-3xl font-bold">
            {items.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#eee3d3] bg-white p-4">
          <p className="text-sm text-slate-500">
            Ожидают проверки
          </p>
          <p className="mt-1 text-3xl font-bold text-orange-600">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[#eee3d3] bg-white p-4">
          <p className="text-sm text-slate-500">
            Проверено
          </p>
          <p className="mt-1 text-3xl font-bold text-green-600">
            {reviewedCount}
          </p>
        </div>
      </div>

      {/* ЗАГОЛОВОК */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-700">
            Работы учеников
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            Проверка читательских миссий
          </h2>
        </div>

        <button
          onClick={onRefresh}
          className="rounded-full border border-[#eee3d3] bg-white px-5 py-2 text-sm hover:bg-[#f8f5ef]"
        >
          Обновить список
        </button>
      </div>

      {/* ПОИСК И ФИЛЬТРЫ */}

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск ученика или книги..."
          className="min-w-[220px] flex-1 rounded-xl border border-[#eee3d3] bg-white px-4 py-3 outline-none focus:border-[#26334a]"
        />

        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="rounded-xl border border-[#eee3d3] bg-white px-4 py-3"
        >
          <option value="all">Все работы</option>
          <option value="pending">Ожидают проверки</option>
          <option value="reviewed">Проверено</option>
        </select>
      </div>

      {/* КОМПАКТНЫЙ СПИСОК */}

      <div className="overflow-hidden rounded-2xl border border-[#eee3d3] bg-white">

        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Работы не найдены.
          </div>
        ) : (
          filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => openReview(item)}
              className="flex w-full items-center gap-3 border-b border-[#f0ebe3] px-4 py-4 text-left transition hover:bg-[#faf8f3] last:border-b-0 sm:px-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4eee4] font-semibold">
                {item.studentName.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {item.studentName}
                </p>

                <p className="truncate text-sm text-slate-500">
                  {item.missionTitle}
                  {item.bookTitle
                    ? ` · ${item.bookTitle}`
                    : ""}
                </p>
              </div>

              <div className="hidden text-right text-xs text-slate-400 sm:block">
                {formatDate(item.submittedAt)}
              </div>

              {isReviewed(item) ? (
                <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  Проверено
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                  Ожидает
                </span>
              )}

              <span className="shrink-0 text-slate-400">
                →
              </span>
            </button>
          ))
        )}
      </div>

      {/* ЗАТЕМНЕНИЕ */}

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/30"
          onClick={() => setSelected(null)}
        >
          {/* ПРАВАЯ ПАНЕЛЬ */}

          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Проверка работы ученика"
            onClick={e => e.stopPropagation()}
            className="absolute right-0 top-0 flex h-full w-full max-w-[620px] flex-col overflow-hidden bg-[#faf8f3] shadow-2xl"
          >

            {/* ШАПКА */}

            <div className="flex items-center justify-between border-b border-[#eee3d3] bg-white px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-700">
                  Проверка работы
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  {selected.studentName}
                </h3>
              </div>

              <button
                onClick={() => setSelected(null)}
                aria-label="Закрыть"
                className="rounded-full p-2 text-2xl hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            {/* СОДЕРЖИМОЕ */}

            <div className="flex-1 space-y-5 overflow-y-auto p-6">

              <div>
                <p className="text-sm text-slate-500">
                  Книга
                </p>
                <p className="font-semibold">
                  {selected.bookTitle || "—"}
                </p>

                <p className="mt-3 text-sm text-slate-500">
                  Миссия
                </p>
                <p className="font-semibold">
                  {selected.missionTitle}
                </p>

                <p className="mt-3 text-sm text-slate-500">
                  Дата отправки
                </p>
                <p className="font-medium">
                  {formatDate(selected.submittedAt)}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Ответ ученика
                </p>

                <div className="whitespace-pre-wrap break-words text-sm leading-7">
                  {selected.answer || "Текстовый ответ отсутствует."}
                </div>

                {selected.filePath && (
                  <p className="mt-4 text-sm text-slate-500">
                    Прикреплённый файл: {selected.filePath}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold">
                  Баллы (0–10)
                </label>

                <input
                  type="number"
                  min="0"
                  max="10"
                  step="1"
                  value={score}
                  onChange={e => setScore(e.target.value)}
                  className="w-full rounded-xl border border-[#eee3d3] bg-white px-4 py-3 outline-none focus:border-[#26334a]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold">
                  Комментарий учителя
                </label>

                <textarea
                  rows={5}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Напишите комментарий ученику..."
                  className="w-full resize-y rounded-xl border border-[#eee3d3] bg-white px-4 py-3 outline-none focus:border-[#26334a]"
                />
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}
            </div>

{onTogglePublication && (
  <button
    onClick={async () => {
      try {
        await onTogglePublication(selected.id);

        setSelected((current) =>
          current
            ? { ...current, isPublic: !current.isPublic }
            : null
        );
      } catch {
        setError("Не удалось изменить публикацию.");
      }
    }}
    className="w-full rounded-full border border-[#eee3d3] bg-white px-5 py-3 text-sm font-semibold"
  >
    {selected.isPublic
      ? "Снять с публикации"
      : "Опубликовать работу"}
  </button>
)}

            {/* КНОПКИ */}

            <div className="border-t border-[#eee3d3] bg-white p-5">
              <button
                onClick={saveReview}
                disabled={saving}
                className="w-full rounded-full bg-[#26334a] px-5 py-4 font-semibold text-white transition hover:bg-[#354663] disabled:opacity-50"
              >
                {saving
                  ? "Сохранение..."
                  : "Сохранить проверку"}
              </button>

              <button
                onClick={() => setSelected(null)}
                className="mt-3 w-full rounded-full border border-[#eee3d3] px-5 py-3 text-sm hover:bg-[#faf8f3]"
              >
                Вернуться к списку
              </button>
            </div>

          </aside>
        </div>
      )}
    </section>
  );
}
