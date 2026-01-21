import type { ChecklistItemId } from "./checklistMapping";
import { checklistToDocumentType } from "./checklistMapping";

export type DoneMap = Record<string, boolean>;

export function isChecklistItemDone(
  itemId: ChecklistItemId,
  docTypes: Set<string>,
  doneMap: DoneMap
): boolean {
  const requiredType = checklistToDocumentType[itemId];
  if (requiredType && docTypes.has(requiredType)) return true;
  return !!doneMap?.[itemId];
}

export function isChecklistItemAutoDone(itemId: ChecklistItemId, docTypes: Set<string>): boolean {
  const requiredType = checklistToDocumentType[itemId];
  return !!(requiredType && docTypes.has(requiredType));
}
