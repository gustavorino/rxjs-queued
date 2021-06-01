import { Observable, of, Subject } from 'rxjs';
import { delayWhen, finalize, mergeMapTo } from 'rxjs/operators';

type PendingObservable = Observable<any>;
type PendingSubject = Subject<any>;
type PendingType = PendingSubject | PendingObservable;

export default function createQueue() {
  let pending: PendingType = of(null);

  const getPrevious = () => {
    return pending;
  };

  const finish = (pendingSubject: PendingSubject) => {
    if (pending === pendingSubject) {
      pending = of(null);
    }
    if (pendingSubject.next) {
      pendingSubject.next('onComplete');
      pendingSubject.complete();
    }
  };

  const createPendingSubject = () => {
    pending = new Subject();
    return pending;
  };

  const getSubjects = () => {
    return [getPrevious(), createPendingSubject()];
  };

  return function () {
    return function <T>(source: Observable<T>) {
      // get a previous pending subject or of(null) when it's the first one
      const [prevSubject, currentSubject] = getSubjects();

      return of(null).pipe(
        delayWhen(() => prevSubject),
        mergeMapTo(
          source.pipe(
            finalize(() => {
              finish(currentSubject as PendingSubject);
            })
          )
        )
      );
    };
  };
}
