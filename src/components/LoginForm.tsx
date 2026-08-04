"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/login/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  return (
    <form action={action} style={{ display: "grid", gap: "var(--space-lg)" }}>
      {state.error && <div className="error-message" role="alert">{state.error}</div>}
      <div className="field"><label htmlFor="email">管理员邮箱</label><input className="input" id="email" name="email" type="email" autoComplete="username" required /></div>
      <div className="field"><label htmlFor="password">密码</label><input className="input" id="password" name="password" type="password" autoComplete="current-password" minLength={12} required /></div>
      <button className="button button--accent" data-state={pending ? "loading" : undefined} disabled={pending} type="submit">{pending ? "正在验证…" : "登录后台"}</button>
    </form>
  );
}
