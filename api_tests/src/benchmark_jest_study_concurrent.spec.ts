import { getCommentsOnMostRecentPosts } from "./shared_benchmark";
jest.setTimeout(1 * 60 * 1000);


/*
test.concurrent.each([
    [1, 1, 2],
    [1, 2, 3],
    [2, 1, 3],
  ])('.add(%i, %i)', async (a, b, expected) => {
    console.log("%d %d = %d", a,b,expected);
    expect(a + b).toBe(expected);
  });
*/

/*
runtime differences of Jest are important
   https://github.com/jestjs/jest/issues/12068
Pay attention to the total run time for suite, should be 3.0 second.
*/
import { setTimeout } from 'timers/promises';

test.concurrent.each([1, 2, 3, 4, 5, 6, 7, 8])('concurrency test 3 seconds', async () => {
        await setTimeout(3000);
        expect(true).toBe(true);
    },
);
