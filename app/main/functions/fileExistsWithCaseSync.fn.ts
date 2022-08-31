import * as path from 'path'
import * as fs from 'fs'

export default function fileExistsWithCaseSync(filepath:string):boolean{
  let dir = path.dirname(filepath)

  if (dir === path.dirname(dir)) {
    return true
  }

  let filenames = fs.readdirSync(dir)

  if (filenames.indexOf(path.basename(filepath)) === -1) {
    return false
  }

  return fileExistsWithCaseSync(dir)
}