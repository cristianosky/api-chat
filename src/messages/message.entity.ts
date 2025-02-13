import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sender: string;

  @Column()
  receiver: string;

  @Column()
  text: string;

  @Column()
  timestamp: string;
}
