import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/sequilize';

class TransferEvent extends Model {
  public id!: number; // Assuming there's an ID field
  public from!: string;
  public to!: string;
  public value!: string;
  public tokenAddress!: string;
  public blockNumber!: number;
  public timestamp!: Date;
  public transactionHash!: string;
}

TransferEvent.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    from: {
      type: DataTypes.STRING,
    },
    to: {
      type: DataTypes.STRING,
    },
    value: {
      type: DataTypes.STRING,
    },
    tokenAddress: {
      type: DataTypes.STRING,
    },
    blockNumber: {
      type: DataTypes.INTEGER,
    },
    timestamp: {
      type: DataTypes.DATE,
    },
    transactionHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'TransferEvent',
    tableName: 'transfer_events',
  }
);

export default TransferEvent;
