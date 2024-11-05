export const measurePerformance = (functionName, callback) => {
  const start = performance.now();
  const result = callback();
  const end = performance.now();
  console.log(`${functionName} took ${end - start} milliseconds.`);
  return result;
};