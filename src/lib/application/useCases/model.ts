import { CliFacade } from '../cli'

export class Model {
	// eslint-disable-next-line no-useless-constructor
	constructor (private readonly service:CliFacade) {}

	public async execute (workspace:string, query:string, output?:string): Promise<void> {
		if (query === undefined) {
			console.error('the query expression argument is required')
			return
		}
		const orm = this.service.orm.create({ workspace })
		try {
			await orm.init()
			const result = await orm.model(query)
			this.service.output.execute(result, output)
		} catch (error) {
			console.error(`error: ${error}`)
		} finally {
			await orm.end()
		}
	}
}
