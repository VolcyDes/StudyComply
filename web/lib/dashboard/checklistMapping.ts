import type { DocumentType } from "../documents/types";

export type ChecklistItemId =
  | "study_permit"
  | "eta"
  | "esta"
  | "visa"
  | "biometrics"
  | "medical_exam"
  | "letter_of_acceptance";

export const checklistToDocumentType: Record<ChecklistItemId, DocumentType> = {
  study_permit: "STUDY_PERMIT",
  eta: "ETA",
  esta: "ESTA",
  visa: "VISA",
  biometrics: "BIOMETRICS",
  medical_exam: "MEDICAL_EXAM",
  letter_of_acceptance: "LETTER_OF_ACCEPTANCE",
};
