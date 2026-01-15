import { NamingPattern } from '@/types';

export function generateFileName(pattern: NamingPattern, index: number): string {
  let fileName = pattern.pattern;
  
  // Replace {SKU} with actual SKU
  fileName = fileName.replace(/{SKU}/g, pattern.sku || 'PRODUCT');
  
  // Replace {INDEX} with letter index (A, B, C, etc.)
  const letterIndex = String.fromCharCode(65 + (index % 26)); // A-Z
  fileName = fileName.replace(/{INDEX}/g, letterIndex);
  
  // Replace {NUMBER} with numeric index
  fileName = fileName.replace(/{NUMBER}/g, String(index + 1));
  
  // Replace {PADDED_NUMBER} with zero-padded number (001, 002, etc.)
  const paddedNumber = String(index + 1).padStart(3, '0');
  fileName = fileName.replace(/{PADDED_NUMBER}/g, paddedNumber);
  
  return fileName;
}

export function validatePattern(pattern: string): { valid: boolean; error?: string } {
  if (!pattern || pattern.trim().length === 0) {
    return { valid: false, error: 'Pattern cannot be empty' };
  }
  
  // Check for invalid characters for file names
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(pattern)) {
    return { valid: false, error: 'Pattern contains invalid characters for file names' };
  }
  
  return { valid: true };
}

export function previewNames(pattern: NamingPattern, count: number): string[] {
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    names.push(generateFileName(pattern, i));
  }
  return names;
}
