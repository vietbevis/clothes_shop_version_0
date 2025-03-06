import { AppDataSource } from '@/config/database'
import { Attribute } from '@/model/Attribute'
import { Repository } from 'typeorm'
import { Injectable } from '@/decorators/inject'

@Injectable()
export class AttributeRepository extends Repository<Attribute> {
  constructor() {
    super(Attribute, AppDataSource.manager)
  }
}
