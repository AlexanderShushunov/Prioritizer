import {SortingCenter} from './SortingCenter';

export function createPrioritizer() {

  let active = false;
  const sortingCenter = new SortingCenter();

  function nextTick() {
    if (active) {
      return;
    }
    setTimeout(tick, 0);
  }

  async function tick() {
    active = true;
    await sortingCenter.runMostPriorityJobs();
    active = false;
    nextTick();
  }

  return function prioritizer<Out, In1, In2, In extends [] | [In1] | [In1, In2]>(
    fn: (...args: In) => Out | Promise<Out>, priority: number
  ): (...args: In) => Promise<Out> {
    return (...args) => {
      const job: () => Promise<Out> = () => new Promise((resolve, reject) => {
        try {
          resolve(fn(...args));
        } catch (e) {
          reject(e);
        }
      });
      const ret = sortingCenter.addJob(job, priority);
      nextTick();
      return ret;
    };
  };
}
