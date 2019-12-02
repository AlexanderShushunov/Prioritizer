import {SortingCenter} from './SortingCenter';
import {makeJob} from './makeJob';

type Tick = () => unknown
type Ticker = (fn: Tick) => unknown;

export class Prioritizer {

  private active = false;
  private readonly sortingCenter = new SortingCenter();
  private readonly ticker: Ticker;

  constructor(ticker: Ticker = fn => setTimeout(fn, 0)) {
    this.ticker = ticker;
  }

  nextTick() {
    this.ticker(() => {
      if (this.active) {
        return;
      }
      this.tick();
    })
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
