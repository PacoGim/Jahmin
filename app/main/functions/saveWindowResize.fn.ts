import { BoundsType } from '../../types/config.type'
import { saveConfig } from '../services/config.service'

export default function (bounds: BoundsType) {
	saveConfig({
		bounds: {
			x: bounds.x,
			y: bounds.y,
			width: bounds.width,
			height: bounds.height
		}
	})
}
