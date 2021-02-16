export function escapeString(data: string) {

  data = data.replace('#', escape('#'))

	return data
}
