import { app } from 'electron'
import { join as pathJoin } from 'path'

export default function () {
	return pathJoin(app.getPath('appData'), 'Jahmin/App Data')
}
