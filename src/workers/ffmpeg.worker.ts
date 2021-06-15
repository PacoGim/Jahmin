import { parentPort } from 'worker_threads'
import { exec } from 'child_process'
import path from 'path'

let ffmpegPath = path.join(process.cwd(), '/electron-app/binaries/ffmpeg')

parentPort?.on('message', (message)=>{
  console.log(message)
  console.log(3,new Date().toTimeString())
  console.time()
  exec(
    // `"${ffmpegPath}" -i "${filePath}" -y -map_metadata 0:s:a:0 -codec copy ${ffmpegMetatagString} "${templFileName}" && mv "${templFileName}" "${filePath}"`,
    `ls`,
    (error, stdout, stderr) => {
      console.log('error: ',error)
      console.log('stdout: ',stdout)
      console.log('stderr: ',stderr)
    }
  ).on('close', () => {
    console.timeEnd()
    console.log(4,new Date().toTimeString())
    parentPort?.postMessage('Done')
    // resolve('Done')
  })
})