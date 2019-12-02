import {Job} from './Job';

export function makeJob<T>(fn: () => T | Promise<T>): Job<T> {
  return () => new Promise((resolve, reject) => {
    try {
      resolve(fn());
    } catch (e) {
      reject(e);
    }
  });
}
