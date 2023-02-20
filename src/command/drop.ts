/* eslint-disable no-mixed-spaces-and-tabs */
import { CommandModule, Argv, Arguments } from 'yargs'
import { Orm } from 'lambdaorm'
import path from 'path'
import dotenv from 'dotenv'

export class DropCommand implements CommandModule {
	command = 'drop'
	describe = 'Removes all database objects but not the database.'

	builder (args: Argv) {
		return args
			.option('w', {
				alias: 'workspace',
				type: 'string',
				describe: 'project path'
			})
			.option('s', {
				alias: 'stage',
				type: 'string',
				describe: 'Name of stage'
			})
			.option('e', {
				alias: 'envfile',
				type: 'string',
				describe: 'Read in a file of environment variables'
			})
			.option('o', {
				alias: 'output',
				type: 'string',
				describe: 'Generates the queries but does not apply'
			})
			.option('f', {
				alias: 'force',
				describe: 'If there is an error in a statement, continue executing the next statements'
			})
	}

	async handler (args: Arguments) {
		const workspace = path.resolve(process.cwd(), args.workspace as string || '.')
		const stageName = args.stage as string
		const output = args.output as string
		const force = args.force !== undefined
		const envfile = args.envfile as string

		if (envfile) {
			const fullPath = path.resolve(process.cwd(), envfile)
			dotenv.config({ path: fullPath, override: true })
		}
		const orm = new Orm(workspace)

		try {
			const schema = await orm.schema.get(workspace)
			await orm.init(schema)
			const stage = orm.schema.stage.get(stageName)

			if (output) {
				const sentences = await orm.stage.clean({ stage: stage.name }).sentence()
				console.log(sentences)
			} else {
				const result = await orm.stage.clean({ stage: stage.name, tryAllCan: force }).execute()
				console.log(JSON.stringify(result, null, 2))
			}
		} catch (error) {
			console.error(`error: ${error}`)
		} finally {
			await orm.end()
		}
	}
}
