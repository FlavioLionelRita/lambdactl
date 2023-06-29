/* eslint-disable no-mixed-spaces-and-tabs */
import { CommandModule, Argv, Arguments } from 'yargs'
import { build } from '../builders/usesCases'
import path from 'path'

export class BuildCommand implements CommandModule {
	command = 'build'
	describe = 'build model, repositories'

	builder (args: Argv) {
		return args
			.option('w', {
				alias: 'workspace',
				type: 'string',
				describe: 'project path.'
			}).option('l', {
				alias: 'language',
				describe: 'develop language'
			}).option('m', {
				alias: 'model',
				describe: 'build model'
			}).option('r', {
				alias: 'repositories',
				describe: 'build repositories'
			}).option('a', {
				alias: 'all',
				describe: 'build all'
			})
	}

	async handler (args: Arguments) {
		const workspace = path.resolve(process.cwd(), args.workspace as string || '.')
		const language = args.language as string || 'node'
		const model = args.model !== undefined
		const repositories = args.repositories !== undefined
		const all = args.all !== undefined

		const options:string[] = []
		if (model || all) {
			options.push('model')
		}
		if (repositories || all) {
			options.push('repositories')
		}

		try {
			await build.execute(workspace, language, options)
		} catch (error) {
			console.error(`error: ${error}`)
		}
	}
}
