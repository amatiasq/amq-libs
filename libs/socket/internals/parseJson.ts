export function parseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn('Invalid JSON:', text);
    throw error;
  }
}
