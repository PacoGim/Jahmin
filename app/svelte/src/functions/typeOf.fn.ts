export default function (obj: any):string {
	return {}.toString.call(obj).split(' ')[1].slice(0, -1)
}
