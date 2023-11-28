import { Repository, IOrm } from 'lambdaorm'
import { Product, QryProduct } from './model'
export class ProductRepository extends Repository<Product, QryProduct> {
	constructor (stage?: string, orm?:IOrm) {
		super('Products', stage, orm)
	}
	// Add your code here
}
