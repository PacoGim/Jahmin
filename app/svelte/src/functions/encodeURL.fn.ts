import { pathToFileURL } from 'url'

export default function toFileUrl(filePath: string): string {
	return pathToFileURL(filePath).href
}
