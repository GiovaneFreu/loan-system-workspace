import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ClientInterface } from '@loan-system-workspace/interfaces';

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
}
