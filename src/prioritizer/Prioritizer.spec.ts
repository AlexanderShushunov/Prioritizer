import {Prioritizer} from './prioritizer';

describe('Prioritizer', () => {
  test('', (done) => {
    const prioritizer = new Prioritizer();
    const invokeSequence: number[] = [];
    const funcWithLowPriority = prioritizer.defer(() => invokeSequence.push(1), 10);
    const funcWithHiPriority = prioritizer.defer(() => invokeSequence.push(2), 1);
    funcWithLowPriority();
    funcWithHiPriority();
    setTimeout(() => {
        expect(invokeSequence).toEqual([2, 1]);
        done();
      }, 0
    );
  });
});
