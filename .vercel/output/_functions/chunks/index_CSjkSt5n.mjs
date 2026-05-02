import { c as createComponent } from './astro-component_2VF1it0G.mjs';
import 'piccolore';
import './sequence_Cm0YKoB9.mjs';
import 'clsx';

const prerender = false;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  return Astro2.redirect("/admin/dashboard", 302);
}, "C:/blogonauta/src/pages/admin/index.astro", void 0);

const $$file = "C:/blogonauta/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	prerender,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
