export default function parseDuration(duration: number) {
  if (duration >= 60 * 60) {
    return new Date(duration * 1000).toISOString().substr(11, 8)
  } else {
    return new Date(duration * 1000).toISOString().substr(14, 5)
  }
}