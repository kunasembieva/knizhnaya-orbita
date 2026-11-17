
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

if (!url || !secret) {
  throw new Error("Не найдены переменные Supabase в .env.local");
}

const supabase = createClient(url, secret, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

async function main() {
  const { data: roster, error } = await supabase
    .from("student_roster")
    .select("id, full_name, username, linked_profile_id")
    .order("username");

  if (error) throw error;

  const { data: authData, error: authError } =
    await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

  if (authError) throw authError;

  const credentials = [];

  for (const student of roster) {
    if (student.linked_profile_id) {
      console.log("Уже связан:", student.username);
      continue;
    }

    const email = `${student.username}@students.knizhnaya-orbita.test`;
    const password = randomBytes(18).toString("base64url") + "K7!";

    let user = authData.users.find((u) => u.email === email);

    if (user) {
      const { data, error } =
        await supabase.auth.admin.updateUserById(user.id, {
          password,
          user_metadata: {
            username: student.username,
            full_name: student.full_name,
            role: "student",
          },
        });

      if (error) throw error;
      user = data.user;
    } else {
      const { data, error } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            username: student.username,
            full_name: student.full_name,
            role: "student",
          },
        });

      if (error) throw error;
      user = data.user;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: student.full_name,
        role: "student",
      });

    if (profileError) throw profileError;

    const { data: updated, error: updateError } = await supabase
      .from("student_roster")
      .update({ linked_profile_id: user.id })
      .eq("id", student.id)
      .is("linked_profile_id", null)
      .select("id");

    if (updateError) throw updateError;
    if (!updated?.length) {
      throw new Error(`Не удалось связать ученика ${student.username}`);
    }

    credentials.push({
      name: student.full_name,
      username: student.username,
      password,
    });

    console.log("Создан кабинет:", student.username);
  }

  console.log("\nДАННЫЕ ДЛЯ ВХОДА УЧЕНИКОВ:");
  console.table(credentials);
}

main().catch((error) => {
  console.error("ОШИБКА:", error.message);
  process.exitCode = 1;
});