// An example with a simulate data fetch delay.
// Try the page with SSR..

const dataTest = async () => {
  const delay = time => new Promise(res => setTimeout(() => res(), time));
  await delay(2000);
  return { string: 'dataTestReturned' };
};

export default dataTest;
