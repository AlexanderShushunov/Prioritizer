import {SortingCenter} from './SortingCenter';

let jobsInvokeSequence: Array<any>;

beforeEach(() => {
  jobsInvokeSequence = [];
});

const makeJob = (num: number) => () => Promise.resolve().then(() => {
  jobsInvokeSequence.push(num);
  return num;
});

const job1 = makeJob(1);
const job2 = makeJob(2);
const job3 = makeJob(3);
const badJob = () =>  Promise.resolve().then(() => {
  jobsInvokeSequence.push('err');
  return Promise.reject('err');
});

describe('SortingCenter', () => {
  it('should run most priority job', async () => {
    const sortingCenter = new SortingCenter();
    sortingCenter.addJob(job1, 4);
    sortingCenter.addJob(job2, 4);
    sortingCenter.addJob(job3, 1);
    await sortingCenter.runMostPriorityJobs();
    expect(jobsInvokeSequence).toEqual([3]);
  });
  it('should run all jobs with the same priority', async () => {
    const sortingCenter = new SortingCenter();
    sortingCenter.addJob(job1, 5);
    sortingCenter.addJob(job2, 0);
    sortingCenter.addJob(job3, 0);
    await sortingCenter.runMostPriorityJobs();
    expect(jobsInvokeSequence).toEqual([2, 3]);
  });
  it('should remove jobs after popping', async () => {
    const sortingCenter = new SortingCenter();
    sortingCenter.addJob(job1, 5);
    sortingCenter.addJob(job2, 5);
    sortingCenter.addJob(job3, 0);
    await sortingCenter.runMostPriorityJobs();
    jobsInvokeSequence = [];
    await sortingCenter.runMostPriorityJobs();
    expect(jobsInvokeSequence).toEqual([1, 2]);
  });
  describe('should do nothing if there are no jobs', () => {
    const sortingCenter = new SortingCenter();
    it('init state', async () => {
      await sortingCenter.runMostPriorityJobs();
      expect(jobsInvokeSequence).toEqual([]);
    });
    it('all jobs are popped', async () => {
      sortingCenter.addJob(job1, 1);
      sortingCenter.addJob(job2, 20);
      sortingCenter.addJob(job3, 20);
      await sortingCenter.runMostPriorityJobs();
      await sortingCenter.runMostPriorityJobs();
      jobsInvokeSequence = [];
      await sortingCenter.runMostPriorityJobs();
      expect(jobsInvokeSequence).toEqual([]);
    });
  });
  it('should correct refill slot with the priority', async () => {
    const sortingCenter = new SortingCenter();
    sortingCenter.addJob(job1, 0);
    sortingCenter.addJob(job2, 5);
    await sortingCenter.runMostPriorityJobs();
    jobsInvokeSequence = [];
    sortingCenter.addJob(job3, 0);
    await sortingCenter.runMostPriorityJobs();
    expect(jobsInvokeSequence).toEqual([3]);
  });
  it('should return deferred job', async () => {
    let firstJobResult = undefined;
    let secondJobResult = undefined;
    const sortingCenter = new SortingCenter();
    sortingCenter.addJob(job1, 1).then(result => firstJobResult = result);
    sortingCenter.addJob(job2, 20).then(result => secondJobResult = result);
    expect(firstJobResult).toBeUndefined();
    await sortingCenter.runMostPriorityJobs();
    expect(firstJobResult).toBe(1);
    expect(secondJobResult).toBeUndefined();
    await sortingCenter.runMostPriorityJobs();
    expect(secondJobResult).toBe(2);
  });
  it('should not crash on rejected job', async () => {
    const sortingCenter = new SortingCenter();
    sortingCenter.addJob(job1, 0);
    // to remove warning
    sortingCenter.addJob(badJob, 0).catch(() => {});
    sortingCenter.addJob(job3, 0);
    await sortingCenter.runMostPriorityJobs();
    expect(jobsInvokeSequence).toEqual([1, 'err', 3]);
  });

  it('should not mask exception rezult', async () => {
    let badJobError = undefined;
    const sortingCenter = new SortingCenter();
    sortingCenter.addJob(badJob, 0).catch(err => badJobError = err);
    sortingCenter.addJob(job3, 0);
    await sortingCenter.runMostPriorityJobs();
    expect(badJobError).toEqual('err');
  });
});
