import fs from 'fs'
import path from 'path'
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10)
import beautify from 'json-beautify'
import { TagType } from '../types/tag.type'

// Max size of knots in bytes.
const maxKnotSize = 250000

// Root of the DB location.
const dbRootPath = path.join(__dirname, '../database')

// Index if the found files, this index is the key for the app to work. All the app works with that.
export let index: TagType[] = []

// Adds data to the DB.
export async function addData(collectionName: string, data: TagType) {
	// Searches for the file in DB to not have duplicate entries.
	let foundFile = readData(collectionName, data['SourceFile'])

	// If the file doesn't exist.
	if (foundFile === undefined) {
		const collectionPath = path.join(dbRootPath, collectionName)

		// Give back an available knot path (String) with enough space.
		const knot = getKnot(collectionPath)
		const knotPath = path.join(collectionPath, knot)

		// Parses the data from the knot to JSON.
		let knotData = JSON.parse(fs.readFileSync(knotPath, { encoding: 'utf-8' }))

		// Adds to actual knot ID for easier delete/update operation.
		data = Object.assign(data, { Knot: knot.replace('.knot.json', '') })

		// Adds the new data to the array.
		knotData.push(data)

		// And saves it as a knot file.
		fs.writeFileSync(knotPath, beautify(knotData, null, 2, 0))

		// If file found and the LastModified field saved in knot doesn't match the current file,
		// it means that the file exists but has been modified since last update.
	} else if (foundFile?.['LastModified'] !== data['LastModified']) {
		// Adds to the new data the found file in knot data like the current ID and Knot ID.
		// The added ID and Knot ID will be used for update/delete operations afterwards.
		Object.assign(data, { Knot: foundFile['Knot'], ID: foundFile['ID'] })
		updateData(collectionName, data)
	}
}

// Updates data by first deleting from DB and then adding the new data to the DB.
function updateData(collectionName: string, data: TagType) {
	deleteData(collectionName, data)
	addData(collectionName, data)
}

// Deletes given file from the DB
function deleteData(collectionName: string, data: TagType) {
	// Gives knot path.
	let knotPath = path.join(dbRootPath, collectionName, `${data['Knot']}.knot.json`)

	// Gets and parses the knot data from the collection name (knot path).
	let fileData: TagType[] = JSON.parse(fs.readFileSync(knotPath, { encoding: 'utf-8' }))

	// Filters out from files and index the given data.
	fileData = fileData.filter((i) => i['ID'] !== data['ID'])
	index = index.filter((i) => i['ID'] !== data['ID'])

	// Writes back the new data.
	fs.writeFileSync(knotPath, beautify(fileData, null, 2, 0))
}

// Read Data
export function readData(collectionName: string, id: string) {
	// If no data found, creates a new index.
	if (index.length === 0) {
		createFilesIndex(collectionName)
	}

	let foundFile = index.find((file) => file['SourceFile'] === id || file['ID'] === id)

	return foundFile
}

function getKnot(collectionPath: string) {
	const knots = fs.readdirSync(collectionPath).filter((file: string) => file.includes('.knot.json'))

	if (knots.length === 0) {
		return createKnot(collectionPath)
	} else {
		let foundKnot = knots.find((knot: string) => {
			return fs.statSync(path.join(collectionPath, knot)).size < maxKnotSize
		})

		if (foundKnot) {
			return foundKnot
		} else {
			return createKnot(collectionPath)
		}
	}
}

function createKnot(collectionPath: string) {
	const idString = `${nanoid()}.knot.json`

	fs.writeFileSync(path.join(collectionPath, idString), JSON.stringify([]))
	return idString
}

// Creates an Array of files to be consumed by anything.
export function createFilesIndex(collectionName: string) {
	return new Promise((resolve, reject) => {
		// Files found array.
		let files: TagType[] = []

		const collectionPath = path.join(dbRootPath, collectionName)

		if (!fs.existsSync(collectionPath)) {
			fs.mkdirSync(collectionPath)
		}

		const knots = fs.readdirSync(collectionPath).filter((file: string) => file.includes('.knot.json'))

		knots.forEach((knot) => {
			let fileRaw = fs.readFileSync(path.join(collectionPath, knot), { encoding: 'utf-8' })

			try {
				files = files.concat(JSON.parse(fileRaw))
			} catch (error) {}
		})

		index = files
		console.log('------------------ Files Amount:', index.length, '------------------')
		resolve(files)
	})
}
