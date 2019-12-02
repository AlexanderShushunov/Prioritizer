import {createPrioritizer} from './prioritizer';

describe('Prioritizer', () => {
  test('', (done) => {
    const prioritizer = createPrioritizer();
    const invokeSequence: number[] = [];
    const funcWithLowPriority = prioritizer(() => invokeSequence.push(1), 10);
    const funcWithHiPriority = prioritizer(() => invokeSequence.push(2), 1);
    funcWithLowPriority();
    funcWithHiPriority();
    setTimeout(() => {
        expect(invokeSequence).toEqual([2, 1]);
        done();
      }, 0
    );
  });
});
