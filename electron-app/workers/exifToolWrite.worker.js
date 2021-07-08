"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const exiftool_vendored_1 = require("exiftool-vendored");
const exiftool = new exiftool_vendored_1.ExifTool({ taskTimeoutMillis: 5000 });
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on('message', (data) => {
    // exiftool.read(filePath).then((metadata: any) => {
    // 	parentPort?.postMessage({ filePath, metadata })
    // })
    console.log(1);
    // exiftool
    // 	.write(data.filePath, data.newTags, ['-overwrite_original'])
    // 	.then(() => {
    // 		console.log(2)
    // 		parentPort?.postMessage({ filePath: data.filePath, status: 'Good' })
    // 	})
    // 	.catch((err) => {
    // 		console.log(3)
    // 		parentPort?.postMessage({ filePath: data.filePath, status: 'Bad' })
    // 	})
});
