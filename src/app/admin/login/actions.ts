"use server";

import { createAdminSession, verifyPassword } from "@/lib/auth";
import { redirect } from "next/navigation";

export interface LoginState { error?: string }

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const hash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedEmail || !hash) return { error: "服务器尚未配置管理员账号。" };
  const passwordOk = await verifyPassword(password, hash);
  if (email !== expectedEmail || !passwordOk) {
    await new Promise((resolve) => setTimeout(resolve, 650));
    return { error: "邮箱或密码不正确。" };
  }
  await createAdminSession(email);
  redirect("/admin");
}
