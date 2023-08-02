import { getCommentsOnMostRecentPosts } from "./shared_benchmark";
jest.setTimeout(5 * 60 * 1000);


let runSet = Array.from(Array(12).keys());
//runSet = Array(25).fill(null);

test('independent read concurrent first', async () => {
    console.log("independent concurrent start");
    const start = performance.now();

    await getCommentsOnMostRecentPosts();
  
    const end = performance.now();
    const elapsed = end - start;
    expect(elapsed).toBeLessThan(24 * 1000);
    console.log("independent concurrent elapsed %d", elapsed);
}, 60 * 1000);

test.concurrent.each(runSet) ('read concurrent', async (runIndex) => {
    console.log("runIndex %d start", runIndex);
    const start = performance.now();

    await getCommentsOnMostRecentPosts();
  
    const end = performance.now();
    const elapsed = end - start;
    expect(elapsed).toBeLessThan(24 * 1000);
    console.log("runIndex %d elapsed %d", runIndex, elapsed);
}, 60 * 1000);

test('independent read concurrent last', async () => {
    console.log("independent concurrent start");
    const start = performance.now();

    await getCommentsOnMostRecentPosts();
  
    const end = performance.now();
    const elapsed = end - start;
    expect(elapsed).toBeLessThan(24 * 1000);
    console.log("independent concurrent elapsed %d", elapsed);
}, 60 * 1000);
