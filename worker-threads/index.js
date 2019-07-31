
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const THREAD_COUNT = +process.argv[2] || 2;
const MAX_VALUE = 1000000;
let startTime = null;
let endTime = null;

let primeNumbers = [];

function calculatePrimeNumbers(start, end) {
  for (let i = start; i < end; i++) {
    const jEnd = Math.trunc(Math.sqrt(end));

    for (let j = 2; j < jEnd; j++) {
      if (i !== j && i%j === 0) break;
      j === jEnd - 1 && primeNumbers.push(i)
    }
  }
}

if (isMainThread) {
  const workers = [];
  const numbersOnThread = Math.ceil((MAX_VALUE - 2) / THREAD_COUNT);
  startTime = Date.now();

  for (let i = 0; i < THREAD_COUNT; i++) {
    workers.push(new Worker(__filename, {
      workerData: { start: i * numbersOnThread + 2, end: (i + 1) * numbersOnThread + 2 }
    }));
  }

  for (let worker of workers) {
    worker.on('exit', () => {
      workers.splice(workers.indexOf(worker), 1);

      if (workers.length === 0) {
        endTime = Date.now();
        console.log('Prime numbers:')
        console.log(primeNumbers.join(', '));
        console.log(`Calculation time: ${endTime - startTime}ms`)
      }
    })
    worker.on('message', (msg) => {
      primeNumbers = primeNumbers.concat(msg);
    });
  }
} else {
  calculatePrimeNumbers(workerData.start, workerData.end);
  parentPort.postMessage(primeNumbers);
}
