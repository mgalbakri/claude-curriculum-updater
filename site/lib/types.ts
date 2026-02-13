export interface Week {
  number: number;
  title: string;
  subtitle: string;
  objective: string;
  phase: number;
  phaseName: string;
  topics: string[];
  activities: string[];
  deliverable: string;
  skills: string;
  content: string; // raw markdown for everything after the core fields
}

export interface Appendix {
  letter: string;
  title: string;
  content: string; // raw markdown
}

export interface Phase {
  number: number;
  name: string;
  weekRange: string;
  weeks: Week[];
}

export interface CurriculumData {
  title: string;
  edition: string;
  duration: string;
  goal: string;
  phases: Phase[];
  appendices: Appendix[];
}
