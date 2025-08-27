import { Inject, Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { DATA_SOURCE } from '../../database/datasource.provider';
import { DataSource } from 'typeorm';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientsService {

  @Inject(DATA_SOURCE) private readonly dataSource: DataSource

  create(createClientDto: CreateClientDto) {
    return 'This action adds a new client';
  }

  findAll() {
    return this.dataSource.manager.find(Client)
  }

  findOne(id: number) {
    return `This action returns a #${id} client`;
  }

  update(id: number, updateClientDto: UpdateClientDto) {
    return `This action updates a #${id} client`;
  }

  remove(id: number) {
    return `This action removes a #${id} client`;
  }
}
