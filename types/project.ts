export type ProjectService =
  | "Direction"
  | "Editing"
  | "Sound Design"
  | "Color Grading"
  | "3D";

export type Project = {
  title: string;
  slug: string;

  category: string;
  year: number;

  services: ProjectService[];

  description: string;

  hasMedia: boolean;
  offset: boolean;
};