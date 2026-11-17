
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Пароль должен содержать не менее 8 символов.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setMessage("Пароль успешно изменён. Теперь можно войти.");

      await supabase.auth.signOut();
      setTimeout(() => router.replace("/login"), 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось изменить пароль. Запросите новое письмо."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white border border-[#eee3d5] p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">✦</div>
          <h1 className="text-3xl font-bold text-[#26334a]">
            Новый пароль
          </h1>
          <p className="mt-3 text-slate-500">
            Создайте новый пароль для своего кабинета
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Новый пароль
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Не менее 8 символов"
              className="w-full rounded-xl border border-[#e9e3d8] px-4 py-3 outline-none focus:border-[#26334a]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Повторите пароль
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите новый пароль"
              className="w-full rounded-xl border border-[#e9e3d8] px-4 py-3 outline-none focus:border-[#26334a]"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#26334a] text-white py-4 font-semibold disabled:opacity-60"
          >
            {loading ? "Сохраняем..." : "Сохранить новый пароль"}
          </button>
        </form>
      </div>
    </main>
  );
}
