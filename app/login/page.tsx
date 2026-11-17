
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) {
        throw new Error("Неверный логин или пароль.");
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", data.user.id)
          .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        throw new Error("Профиль пользователя не найден.");
      }

      if (!["student", "teacher", "jury"].includes(profile.role)) {
        await supabase.auth.signOut();
        throw new Error("Неизвестная роль пользователя.");
      }

      router.push("/cabinet");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Произошла ошибка входа."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) throw error;

      setMessage(
        "Если аккаунт с этой почтой существует, письмо для восстановления отправлено. Проверьте входящие и папку «Спам»."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось отправить письмо."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white border border-[#eee3d5] p-8 shadow-sm">
        <a href="/" className="text-sm text-slate-500">
          ← На главную
        </a>

        <div className="text-center mt-8 mb-8">
          <div className="text-4xl mb-4">✦</div>
          <h1 className="text-3xl font-bold text-[#26334a]">
            КНИЖНАЯ ОРБИТА
          </h1>
          <p className="mt-3 text-slate-500">
            {resetMode
              ? "Восстановление пароля"
              : "Войди в своё читательское пространство"}
          </p>
        </div>

        <form
          onSubmit={resetMode ? handleReset : handleLogin}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-semibold mb-2">
              Электронная почта
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите свою электронную почту"
              className="w-full rounded-xl border border-[#e9e3d8] px-4 py-3 outline-none focus:border-[#26334a]"
            />
          </div>

          {!resetMode && (
            <div>
              <label className="block text-sm font-semibold mb-2">
                Пароль
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full rounded-xl border border-[#e9e3d8] px-4 py-3 outline-none focus:border-[#26334a]"
              />
              <button
                type="button"
                onClick={() => {
                  setResetMode(true);
                  setError("");
                  setMessage("");
                }}
                className="mt-3 text-sm text-blue-700 hover:underline"
              >
                Забыли пароль?
              </button>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {message && (
            <p className="text-sm text-green-700">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#26334a] text-white py-4 font-semibold hover:bg-[#354765] disabled:opacity-60"
          >
            {loading
              ? "Подождите..."
              : resetMode
              ? "Отправить письмо"
              : "Войти в кабинет"}
          </button>

          {resetMode && (
            <button
              type="button"
              onClick={() => {
                setResetMode(false);
                setError("");
                setMessage("");
              }}
              className="w-full text-sm text-slate-600 hover:underline"
            >
              Вернуться ко входу
            </button>
          )}
        </form>

        <p className="text-center text-xs text-slate-400 mt-8">
          9 месяцев — 9 книг — 9 открытий
        </p>
      </div>
    </main>
  );
}
