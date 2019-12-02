import {SortingCenter} from './SortingCenter';
import {makeJob} from './makeJob';

export class Prioritizer {

  private active = false;
  private sortingCenter = new SortingCenter();

  nextTick() {
    setTimeout(() => {
      if (this.active) {
        return
      }
      this.tick()
    }, 0);
  }

  private tick = async () => {
    this.active = true;
    await this.sortingCenter.runMostPriorityJobs();
    this.active = false;
    this.nextTick();
  };

  defer<Out, In extends Array<any>>(
    fn: (...args: In) => Out | Promise<Out>, priority: number
  ): (...args: In) => Promise<Out> {
    return (...args) => {
      const withFixArgs = () => fn(...args);
      const ret = this.sortingCenter.addJob(
        makeJob(withFixArgs),
        priority
      );
      this.nextTick();
      return ret;
    };
  };
}
