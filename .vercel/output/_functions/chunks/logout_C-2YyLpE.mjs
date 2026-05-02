import { c as createComponent } from './astro-component_2VF1it0G.mjs';
import 'piccolore';
import './sequence_Cm0YKoB9.mjs';
import 'clsx';
import { A as ADMIN_SESSION_COOKIE } from './admin-session_CqodbBXM.mjs';

const $$Logout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Logout;
  Astro2.cookies.delete(ADMIN_SESSION_COOKIE, { path: "/" });
  return Astro2.redirect("/admin/login");
}, "C:/blogonauta/src/pages/admin/logout.astro", void 0);

const $$file = "C:/blogonauta/src/pages/admin/logout.astro";
const $$url = "/admin/logout";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Logout,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
