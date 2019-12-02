import {Job} from './Job';

type JobRunner = () => Promise<void>

export class SortingCenter {
  private shelve: {
    [index: number]: Array<JobRunner>
  } = {};

  addJob<T>(job: Job<T>, priority: number): Promise<T> {
    if (this.shelve[priority] === undefined) {
      this.shelve[priority] = [];
    }
    return new Promise((resolve, reject) => {
        this.shelve[priority].push(
          () => job().then(resolve).catch(reject)
        );
      }
    );
  }

  async runMostPriorityJobs() {
    await Promise.all(this.popMostPriorityJobs().map(fn => fn()));
  }

  private popMostPriorityJobs(): Array<JobRunner> {
    const priorities: Array<number> = Object.keys(this.shelve) as any;
    if (priorities.length === 0) {
      return [];
    }
    const nextPriority = priorities.sort((a, b) => a - b)[0];
    const ret = this.shelve[nextPriority];
    delete this.shelve[nextPriority];
    return ret;
  }
}
