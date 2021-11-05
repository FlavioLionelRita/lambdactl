/* eslint-disable no-mixed-spaces-and-tabs */
import { CommandModule, Argv, Arguments } from 'yargs'
import { Orm, Helper } from 'lambdaorm'
import path from 'path'

export class ExportCommand implements CommandModule {
	command = 'export';
	describe = 'Export data from a database';

	builder (args: Argv) {
		return args
			.option('w', {
				alias: 'workspace',
				describe: 'project path.'
			})
			.option('n', {
				alias: 'name',
				describe: 'Name of database'
			})
			.option('t', {
				alias: 'target',
				describe: 'Destination file with export data.'
			})
	}

	async handler (args: Arguments) {
		const workspace = path.resolve(process.cwd(), args.workspace as string || '.')
		const database = args.name as string
		const target = path.resolve(process.cwd(), args.target as string || '.')
		const orm = new Orm(workspace)

		try {
			const config = await orm.lib.getConfig(workspace)
			await orm.init(config)
			const db = orm.lib.getDatabase(database, config)
			const exportFile = path.join(target, db.name + '-export.json')
			const dataExport = orm.database.export(db.name)
			const data = await dataExport.execute()
			await Helper.writeFile(exportFile, JSON.stringify(data))
		} catch (error) {
			console.error(`error: ${error}`)
		} finally {
			await orm.end()
		}
	}
}
