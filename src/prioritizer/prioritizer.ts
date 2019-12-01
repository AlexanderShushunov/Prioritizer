type Job = () => Promise<unknown>

export function createPrioritizer() {

  let active = false;

  const queue: {
    [index: number]: Array<Job>
  } = {};

  function addJobInQueue<Out, In1, In2, In extends [] | [In1] | [In1, In2]>
  (fn: (...args: In) => Out, args: In, priority: number) : Promise<Out> {
    if (queue[priority] === undefined) {
      queue[priority] = [];
    }
    const ret: Promise<Out> = new Promise((resolve, reject) => {
      queue[priority].push(() => {
        try {
          resolve(fn(...args));
        } catch (e) {
          reject(e);
        }
        return ret
      });
    });
    return ret;
  }

  function popMostPriorityJobs(): Array<Job> {
    const priorities: Array<number> = Object.keys(queue) as any;
    if (priorities.length === 0) {
      return [];
    }
    const nextPriority = priorities.sort((a, b) => a - b)[0];
    const ret = queue[nextPriority];
    delete queue[nextPriority];
    return ret;
  }

  function nextTick() {
    if (active) {
      return;
    }
    setTimeout(tick, 0)
  }

  function tick() {
    const jobs = popMostPriorityJobs();
    if (jobs.length === 0) {
      return;
    }
    active = true;
    Promise.all(jobs.map(fn => fn())).then(
      () => {
        active = false;
        nextTick();
      }
    );
  }

  return function prioritizer<Out, In1, In2, In extends [] | [In1] | [In1, In2]>(
    fn: (...args: In) => Out | Promise<Out>, priority: number
  ): (...args: In) => Promise<Out> {
    return (...args) => {
      const res = addJobInQueue(fn, args, priority);
      nextTick();
      return res;
    };
  };
}


