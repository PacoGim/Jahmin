export default function (inputString: string) {
	return inputString.split('/').slice(0, -1).join('/')
}
