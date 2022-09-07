import sparkMd5 from 'spark-md5'

export default function (arrayBuffer: ArrayBuffer) {
	return sparkMd5.ArrayBuffer.hash(arrayBuffer)
}
