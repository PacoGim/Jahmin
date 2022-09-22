export const videoFormats = ['mp4', 'webm']
export const animatedFormats = ['apng', 'avif', 'webp', 'gif']
export const vectorFormats = ['svg']
export const imageFormats = ['png', 'jpg', 'jpeg']
export const validFormats = [...videoFormats, ...animatedFormats, ...vectorFormats, ...imageFormats]
export const validNames = ['cover', 'folder', 'front', 'art', 'album']
export const allowedFiles = validNames.map(name => validFormats.map(ext => `${name}.${ext}`)).flat()
