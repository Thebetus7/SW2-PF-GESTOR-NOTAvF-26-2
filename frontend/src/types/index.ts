/**
 * Modelos TypeScript del dominio para el Frontend.
 */

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  studentIdCode?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  description?: string;
  teacherId: string;
}

export interface ClassroomParallel {
  id: string;
  subjectId: string;
  groupCode: string;
  period: string;
  studentCount?: number;
}

export interface Student {
  id: string;
  studentIdCode: string;
  fullName: string;
  email: string;
}

export type ExamComponentType = 'OPEN' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';

export interface ExamComponent {
  id: string;
  type: ExamComponentType;
  prompt: string;
  optionsOrRubric: {
    options?: string[];
    correctAnswer?: string | boolean;
    context?: string;
    toleranceKeywords?: string[];
    gradingScale?: string;
  };
  maxScore: number;
  order: number;
}

export interface Exam {
  id: string;
  parallelId: string;
  title: string;
  applicationDate: string;
  totalScore: number;
  components: ExamComponent[];
  hasQrCode: boolean;
}

export interface EvaluationPage {
  id: string;
  page_number: number;
  image?: string;
  image_url?: string;
  qr_data?: string;
}

export interface GradeDetail {
  id: string;
  component: string;
  order?: number;
  component_prompt: string;
  component_type?: string;
  max_score: number;
  ai_score: number;
  final_score: number;
  transcribed_answer: string;
  ai_feedback: string;
  is_overridden: boolean;
  teacher_comment?: string;
}

export interface StudentEvaluation {
  id: string;
  exam: string;
  parallel?: string;
  student?: string;
  student_name: string;
  student_identifier: string;
  status: 'BORRADOR' | 'PROCESANDO_IA' | 'EN_REVISION' | 'REVISION_DOCENTE' | 'CALIFICADO' | 'PUBLICADO';
  ai_total_score: number;
  final_score: number;
  is_score_overridden: boolean;
  teacher_notes?: string;
  is_published: boolean;
  published_at?: string;
  pages_count?: number;
  pages?: EvaluationPage[];
  grades?: GradeDetail[];
  created_at?: string;
  updated_at?: string;
}

