import React, { useEffect, useState } from 'react';
import { Observable, of, Subject } from 'rxjs';
import {
  delay,
  delayWhen,
  finalize,
  map,
  mergeMapTo,
  tap
} from 'rxjs/operators';
import createQueue from '../createQueue';

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
