// Catálogo de cursos e suas disciplinas, exibidos no Portal do Aluno
// conforme o curso vinculado à matrícula de cada estudante.

export const COURSE_OPTIONS = [
  "Desenvolvimento de Sistemas",
  "Marketing",
  "Formação Regular",
];

export const COURSE_SUBJECTS = {
  "Desenvolvimento de Sistemas": [
    "Lógica de Programação",
    "Programação Web (Front-end)",
    "Programação Orientada a Objetos",
    "Banco de Dados",
    "Projeto Integrador",
    "Redes e Sistemas Operacionais",
  ],
  Marketing: [
    "Marketing Digital",
    "Branding e Identidade Visual",
    "Comunicação e Publicidade",
    "Gestão de Redes Sociais",
    "Pesquisa de Mercado",
    "Vendas e Atendimento",
  ],
  "Formação Regular": [
    "Língua Portuguesa",
    "Matemática",
    "Ciências da Natureza",
    "Ciências Humanas",
    "Linguagens e Códigos",
    "Educação Física e Arte",
  ],
};

export function subjectsForCourse(course) {
  return COURSE_SUBJECTS[course] || [];
}