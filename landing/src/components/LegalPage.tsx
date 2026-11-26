import Link from 'next/link';

type Section = { title: string; body: string };

export function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: Section[] }) {
  return <main className="min-h-screen bg-[#FDFBF7] text-[#2C1810]">
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-20">
      <Link href="/" className="font-semibold text-[#8B5E3C] hover:underline">← Volver a la landing</Link>
      <p className="mt-12 text-sm font-semibold uppercase tracking-widest text-[#8B5E3C]">EduGradeIA · Prototipo académico</p>
      <h1 className="mt-3 font-headline text-4xl font-bold sm:text-5xl">{title}</h1>
      <p className="mt-4 text-sm text-[#6B5B52]">Última actualización: noviembre de 2026</p>
      <p className="mt-8 leading-relaxed text-[#6B5B52]">{intro}</p>
      <div className="mt-10 space-y-8">{sections.map((section) => <section key={section.title} className="space-y-2"><h2 className="font-headline text-2xl font-bold">{section.title}</h2><p className="whitespace-pre-line leading-relaxed text-[#6B5B52]">{section.body}</p></section>)}</div>
      <div className="mt-12 border-t border-[#E8DCC8] pt-6 text-sm text-[#6B5B52]">Contacto: <a className="text-[#8B5E3C] underline" href="mailto:oficina@edugrade.com">oficina@edugrade.com</a> · <Link href="/terminos" className="hover:underline">Términos y condiciones</Link> · <Link href="/privacidad" className="hover:underline">Política de privacidad</Link></div>
    </div>
  </main>;
}
