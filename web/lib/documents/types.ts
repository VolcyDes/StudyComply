export type DocumentType =
  | "STUDY_PERMIT"
  | "ETA"
  | "ESTA"
  | "VISA"
  | "BIOMETRICS"
  | "MEDICAL_EXAM"
  | "LETTER_OF_ACCEPTANCE"
  | string;

export type UserDocument = {
  id: string;
  title: string;
  type: DocumentType;
  expiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};
