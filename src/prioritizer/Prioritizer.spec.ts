import {Prioritizer} from './prioritizer';

let prioritizer: Prioritizer;
let invokeSequence: Array<number>;

const makeFn = (num: number) => () => {
  invokeSequence.push(num);
  return num;
};

beforeEach(() => {
  prioritizer = new Prioritizer();
  invokeSequence = [];
});

describe('Prioritizer', () => {
  it('should invoke function according to priority', async () => {
    const funcWithLowPriority = prioritizer.defer(makeFn(1), 10);
    const funcWithHiPriority = prioritizer.defer(makeFn(2), 1);
    const latestPromise = funcWithLowPriority();
    funcWithHiPriority();
    await latestPromise;
    expect(invokeSequence).toEqual([2, 1]);
  });

  it('should make deferred function (normal flow)', async () => {
    const deferredFnRes = await prioritizer.defer(makeFn(1), 10)();
    expect(deferredFnRes).toEqual(1);
  });

  it('should make deferred function (exception flow)', async () => {
    const deferredFnPromise = prioritizer.defer(() => {
      throw 42;
    }, 10)();
    try {
      await deferredFnPromise;
    } catch (err) {
      expect(err).toEqual(42);
    }
  });

  it('should invoke defer least priority', async () => {
    const latestPromise = prioritizer.defer(makeFn(1), 10)();
    prioritizer.defer(() => {
      invokeSequence.push(2);
      prioritizer.defer(makeFn(3), 1)();
    }, 1)();
    await latestPromise;
    expect(invokeSequence).toEqual([2, 3, 1]);
  });

  it('should not change function signature', async () => {
    const fn: (arg1: string, arg2: number, arg3: boolean) => void = jest.fn();
    await prioritizer.defer(fn, 10)('1', 2, true);
    expect(fn).toBeCalledWith('1', 2, true);
  });

  it('should use specified ticker', async () => {
    let outerResolve = () => {
    };
    const fn = jest.fn();
    const prioritizer = new Prioritizer(fn => {
      new Promise(resolve => outerResolve = resolve).then(fn);
    });
    const fnResultPromise = prioritizer.defer(fn, 10)();
    expect(fn).not.toHaveBeenCalled();
    // await fnResultPromise; it freeze the test
    outerResolve();
    await fnResultPromise;
    expect(fn).toHaveBeenCalled();
  });
});
