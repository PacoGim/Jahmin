export default function(data: string) {
	data = data.replace('#', escape('#'))
	data = data.replace('?', escape('?'))
	return data
}
