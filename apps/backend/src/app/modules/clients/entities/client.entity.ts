import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ClientInterface, LoanInterface } from '@loan-system-workspace/interfaces';
import { Loan } from '../../loans/entities/loan.entity';

@Entity()
export class Client implements ClientInterface {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 200, nullable: false })
  name: string;

  @Column({ type: "date", nullable: false })
  birthDate: Date;

  @Column({ type: "varchar", length: 14, nullable: false })
  cpf_cnpj: string;

  @Column({ type: "float", scale: 2, nullable: false })
  monthlyIncome: number;

  @OneToMany(() => Loan, (loan) => loan.client)
  loans: LoanInterface[];

}
