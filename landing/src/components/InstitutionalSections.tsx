import { Check, HeartHandshake, Lightbulb } from 'lucide-react';

export function InstitutionalSections() {
  return (
    <section id="quienes-somos" className="scroll-mt-24 bg-[#F5ECE0] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#8B5E3C]">Nuestro propósito</p>
          <h2 className="font-headline text-4xl font-bold text-[#2C1810]">Quiénes somos</h2>
          <p className="leading-relaxed text-[#6B5B52]">EduGradeIA es un prototipo universitario que apoya la gestión de evaluaciones académicas. Reúne herramientas para organizar cursos y exámenes, apoyar la revisión de pruebas escritas y facilitar la consulta de resultados. Nuestro enfoque pone en el centro la labor docente, el aprendizaje y el uso responsable de la tecnología.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-[#E8DCC8] bg-white p-8 shadow-sm space-y-4">
            <HeartHandshake className="h-8 w-8 text-[#8B5E3C]" aria-hidden="true" />
            <h3 className="font-headline text-2xl font-bold">Misión</h3>
            <p className="leading-relaxed text-[#6B5B52]">En EduGradeIA, nuestra misión es contribuir a una evaluación académica más clara, organizada y accesible para docentes e instituciones educativas. Facilitamos la gestión de cursos y exámenes, y apoyamos la revisión de pruebas escritas para que los docentes puedan dedicar más tiempo al acompañamiento del aprendizaje.</p>
            <p className="leading-relaxed text-[#6B5B52]">Trabajamos para que los estudiantes puedan consultar sus resultados y recibir información comprensible sobre su desempeño. Promovemos un uso responsable de la tecnología, el cuidado de la información académica y la supervisión docente en las decisiones de evaluación.</p>
          </article>
          <article className="rounded-3xl border border-[#E8DCC8] bg-white p-8 shadow-sm space-y-4">
            <Lightbulb className="h-8 w-8 text-[#8B5E3C]" aria-hidden="true" />
            <h3 className="font-headline text-2xl font-bold">Visión</h3>
            <p className="leading-relaxed text-[#6B5B52]">Aspiramos a que EduGradeIA sea una plataforma reconocida por ayudar a las instituciones educativas a mejorar la gestión de sus evaluaciones y el seguimiento del aprendizaje.</p>
            <p className="leading-relaxed text-[#6B5B52]">Queremos contribuir a una educación en la que docentes y estudiantes cuenten con procesos de evaluación más ágiles, transparentes y organizados. Buscamos que EduGradeIA evolucione junto con las necesidades de las comunidades educativas, manteniendo como prioridad la confianza, la responsabilidad y el valor de la labor docente.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

const plans = [
  { name: 'Básico', price: '3', description: 'Para un docente', features: ['1 docente', 'Hasta 50 estudiantes', 'Hasta 3 materias', 'Gestión de exámenes y resultados', 'Consulta de resultados para estudiantes', 'Hasta 50 evaluaciones con IA al mes', 'Contacto por correo electrónico'] },
  { name: 'Institucional', price: '5', description: 'Para equipos docentes pequeños', features: ['Hasta 5 docentes', 'Hasta 200 estudiantes', 'Hasta 10 materias', 'Gestión de exámenes y resultados', 'Consulta de resultados para estudiantes', 'Hasta 200 evaluaciones con IA al mes', 'Contacto por correo y WhatsApp'] },
];

export function PricingSection() {
  return (
    <section id="planes" className="scroll-mt-24 bg-[#FDFBF7] py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center space-y-4"><p className="text-sm font-semibold uppercase tracking-widest text-[#8B5E3C]">Opciones de demostración</p><h2 className="font-headline text-4xl font-bold">Planes para cada necesidad</h2><p className="text-[#6B5B52]">Conoce las opciones de EduGradeIA para organizar y acompañar tus evaluaciones académicas.</p></div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {plans.map((plan) => <article key={plan.name} className="flex flex-col rounded-3xl border border-[#E8DCC8] bg-white p-8 shadow-sm">
            <h3 className="font-headline text-2xl font-bold">{plan.name}</h3><p className="mt-2 text-[#6B5B52]">{plan.description}</p>
            <p className="mt-6"><span className="font-headline text-5xl font-bold text-[#8B5E3C]">${plan.price}</span> <span className="text-[#6B5B52]">USD / mes</span></p>
            <ul className="my-8 flex-1 space-y-3 text-sm text-[#4D3C32]">{plan.features.map((feature) => <li key={feature} className="flex gap-3"><Check className="h-5 w-5 shrink-0 text-[#8B5E3C]" aria-hidden="true" />{feature}</li>)}</ul>
            <a href="#contacto" className="rounded-xl bg-[#8B5E3C] px-5 py-3 text-center font-semibold text-white hover:bg-[#724A2D]">Solicitar información</a>
          </article>)}
        </div>
        <p className="mt-6 text-center text-sm text-[#6B5B52]">Precios y condiciones referenciales para fines de demostración académica. Este prototipo no realiza cobros ni procesa pagos.</p>
      </div>
    </section>
  );
}
