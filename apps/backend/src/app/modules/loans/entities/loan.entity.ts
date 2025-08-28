import { CurrencyType, LoanInterface } from '@loan-system-workspace/interfaces';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Client } from '../../clients/entities/client.entity';

@Entity()
export class Loan implements LoanInterface {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "date", nullable: false })
  purchaseDate: Date;

  @Column({ type: "varchar", length: 3, nullable: false })
  currencyType: CurrencyType;

  @Column({ type: "float", scale: 2, nullable: false })
  purchaseValue: number;

  @Column({ type: "date", nullable: false })
  dueDate: Date;

  @ManyToOne(() => Client, (client) => client.id)
  @JoinColumn({ name: 'client_id' })
  client: Client;

}
