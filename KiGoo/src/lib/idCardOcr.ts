import { Platform } from 'react-native';

export type IdCardExtract = {
  studentId: string | null;
  university: string | null;
  department: string | null;
};

const STUDENT_ID_PATTERN = /\b([A-Z]{0,3}\d{2,4}[-.\s]?\d{1,2}[-.\s]?\d{2,4}[-.\s]?\d{2,6}|[A-Z0-9]{6,})\b/;

function findUniversityMatch(lines: string[], universities: string[]): string | null {
  for (const line of lines) {
    const normalized = line.toLowerCase();
    const match = universities.find((u) => normalized.includes(u.toLowerCase()));
    if (match) return match;
  }
  return null;
}

function findDepartmentLine(lines: string[], departments: string[]): string | null {
  for (const line of lines) {
    const normalized = line.toLowerCase().replace(/^department of\s*/i, '').trim();
    const match = departments.find(
      (d) => normalized.includes(d.toLowerCase()) || d.toLowerCase().includes(normalized)
    );
    if (match) return match;
  }
  return null;
}

function findStudentId(lines: string[]): string | null {
  for (const line of lines) {
    if (!/id/i.test(line)) continue;
    const match = line.match(STUDENT_ID_PATTERN);
    if (match) return match[1];
  }
  for (const line of lines) {
    const match = line.match(STUDENT_ID_PATTERN);
    if (match && match[1].length >= 6) return match[1];
  }
  return null;
}

/**
 * Runs on-device OCR (ML Kit) on a local image and heuristically extracts
 * student ID / university / department. Returns all-null on web or when the
 * native module isn't linked (Expo Go) — callers must treat this as best-effort.
 */
export async function extractIdCardFields(
  localImageUri: string,
  universities: string[],
  departments: string[]
): Promise<IdCardExtract> {
  const empty: IdCardExtract = { studentId: null, university: null, department: null };
  if (Platform.OS === 'web') return empty;

  let TextRecognition: typeof import('@react-native-ml-kit/text-recognition').default;
  try {
    TextRecognition = require('@react-native-ml-kit/text-recognition').default;
    if (!TextRecognition) return empty;
  } catch {
    return empty;
  }

  try {
    const result = await TextRecognition.recognize(localImageUri);
    const lines = result.blocks.flatMap((b) => b.lines.map((l) => l.text.trim())).filter(Boolean);

    return {
      studentId: findStudentId(lines),
      university: findUniversityMatch(lines, universities),
      department: findDepartmentLine(lines, departments),
    };
  } catch {
    return empty;
  }
}
