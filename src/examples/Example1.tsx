import React, { useEffect, useState } from 'react';
import { Observable, of, Subject } from 'rxjs';
import { delay, delayWhen, finalize, mergeMapTo } from 'rxjs/operators';

type PendingObservable = Observable<any>;
type PendingSubject = Subject<any>;
type PendingType = PendingSubject | PendingObservable;

function createQueue() {
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

export default function Example1() {
  const [state, setState] = useState(0);
  return (
    <div>
      <div>
        <div className="bg-black bg-opacity-5 rounded-md text-opacity-50 text-black inline-block p-4">
          of('done').pipe(delay(1000), myQueue())
        </div>
      </div>
      <button
        className="bg-maroon text-white p-2 mt-4 mb-4"
        onClick={() => {
          setState(state + 1);
        }}
      >
        Add more
      </button>

      <div className="">
        {Array(state)
          .fill(0)
          .map((v, i) => {
            return <Request key={i} />;
          })}
      </div>
    </div>
  );
}

const myQueue = createQueue();

function getData() {
  return of('done').pipe(delay(1000), myQueue());
}

function Request() {
  const [state, setState] = useState<any>(null);

  const className = !state
    ? 'p-2 my-2 bg-black bg-opacity-10'
    : 'p-2 my-2 bg-tangerine text-black';
  useEffect(() => {
    getData()
      .toPromise()
      .then((v) => {
        setState(v);
      });
  }, []);

  return (
    <div className={className}>
      State: <b>{state || 'waiting'}</b>
    </div>
  );
}
