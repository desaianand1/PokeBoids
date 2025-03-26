/**
 * Creates a debounced version of a function that delays invoking the function
 * until after `wait` milliseconds have elapsed since the last time it was invoked.
 * 
 * @param fn The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  wait: number = 150  // Increased default delay to reduce update frequency
): (...args: Args) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), wait);
  };
}
