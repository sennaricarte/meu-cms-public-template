import { c as createComponent } from './astro-component_2VF1it0G.mjs';
import 'piccolore';
import { be as renderHead, U as renderTemplate, a5 as addAttribute } from './sequence_Cm0YKoB9.mjs';
import 'clsx';
import { A as ADMIN_SESSION_COOKIE, a as adminEnvConfigured, i as isValidAdminSession, t as timingSafeStringEq, g as getAdminSessionTokenValue, b as getAdminCredentials } from './admin-session_CqodbBXM.mjs';

const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Login;
  const COOKIE_MAX_AGE = 60 * 60 * 8;
  const session = Astro2.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (adminEnvConfigured() && isValidAdminSession(session)) {
    return Astro2.redirect("/admin/dashboard");
  }
  let error = "";
  if (Astro2.request.method === "POST") {
    const form = await Astro2.request.formData();
    const username = form.get("username")?.toString() ?? "";
    const password = form.get("password")?.toString() ?? "";
    const creds = getAdminCredentials();
    if (!adminEnvConfigured() || !creds) {
      error = "Defina ADMIN_USER e ADMIN_PASS no arquivo .env.";
    } else if (timingSafeStringEq(username.trim(), creds.user) && timingSafeStringEq(password.trim(), creds.pass)) {
      const token = getAdminSessionTokenValue();
      if (token) {
        Astro2.cookies.set(ADMIN_SESSION_COOKIE, token, {
          httpOnly: true,
          path: "/",
          maxAge: COOKIE_MAX_AGE,
          sameSite: "strict",
          secure: true
        });
        return Astro2.redirect("/admin/dashboard");
      }
      error = "Falha ao criar sessão. Verifique SESSION_SECRET ou ADMIN_PASS.";
    } else {
      error = "Utilizador ou senha incorretos.";
    }
  }
  return renderTemplate`<html lang="pt-br" data-astro-cid-rf56lckb> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Admin — Login</title><link rel="icon" href="/favicon.ico">${renderHead()}</head> <body data-astro-cid-rf56lckb> <main class="card" data-astro-cid-rf56lckb> <h1 data-astro-cid-rf56lckb>Admin</h1> <p class="subtitle" data-astro-cid-rf56lckb>Acesso restrito ao painel.</p> ${!adminEnvConfigured() && renderTemplate`<div class="warning" role="alert" data-astro-cid-rf56lckb> <strong data-astro-cid-rf56lckb>Atenção:</strong> defina <code data-astro-cid-rf56lckb>ADMIN_USER</code> e <code data-astro-cid-rf56lckb>ADMIN_PASS</code> no <code data-astro-cid-rf56lckb>.env</code>.
</div>`} <form method="POST" autocomplete="username" data-astro-cid-rf56lckb> <div class="field" data-astro-cid-rf56lckb> <label for="username" data-astro-cid-rf56lckb>Utilizador</label> <input id="username" name="username" type="text" autocomplete="username" required autofocus data-astro-cid-rf56lckb> </div> <div class="field" data-astro-cid-rf56lckb> <label for="password" data-astro-cid-rf56lckb>Senha</label> <input id="password" name="password" type="password" autocomplete="current-password" placeholder="••••••••" required${addAttribute(error ? "login-error" : void 0, "aria-describedby")} data-astro-cid-rf56lckb> </div> ${error && renderTemplate`<div id="login-error" class="error" role="alert" data-astro-cid-rf56lckb>${error}</div>`} <button type="submit" data-astro-cid-rf56lckb>Entrar</button> </form> </main> </body></html>`;
}, "C:/blogonauta/src/pages/admin/login.astro", void 0);
const $$file = "C:/blogonauta/src/pages/admin/login.astro";
const $$url = "/admin/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Login,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
