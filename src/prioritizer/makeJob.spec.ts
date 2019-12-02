import {makeJob} from './makeJob';

describe('makeJob', () => {
  it('should make job by sync function', async () => {
    const syncJob = jest.fn();
    await makeJob(syncJob)();
    expect(syncJob).toBeCalledTimes(1);
  });
  it('should make job by async function', async () => {
    const innerJobFn = jest.fn();
    const asyncJob = () => Promise.resolve().then(innerJobFn);
    await makeJob(asyncJob)();
    expect(innerJobFn).toBeCalledTimes(1);
  });
  it('should return sync function result', async () => {
    const syncJob = jest.fn().mockReturnValue(42);
    const result = await makeJob(syncJob)();
    expect(result).toBe(42);
  });
  it('should return async function result', async () => {
    const innerJobFn = jest.fn().mockReturnValue(42);
    const asyncJob = () => Promise.resolve().then(innerJobFn);
    const result = await makeJob(asyncJob)();
    expect(result).toBe(42);
  });
  it('should not mask sync exception', async () => {
    const syncJob = () => {
      throw 42;
    };
    await makeJob(syncJob)()
      .catch(err => expect(err).toBe(42));
  });
  it('should not mask async exception', async () => {
    const asyncJob = () => Promise.reject(42);
    await makeJob(asyncJob)()
      .catch(err => expect(err).toBe(42));
  });
});
