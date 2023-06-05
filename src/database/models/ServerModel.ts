import {getModelForClass, modelOptions, prop, Ref} from '@typegoose/typegoose';
import {ServerHistory} from './ServerHistoryModel';

@modelOptions({schemaOptions: {timestamps: true}})
export class Server {
  @prop({required: true, unique: true})
  public serverId!: string;

  @prop({required: true})
  public serverName!: string;

  @prop({ref: () => ServerHistory})
  public serverHistory!: Ref<ServerHistory>[];

  public createdAt!: Date;
  public updatedAt!: Date;
}

export const ServerModel = getModelForClass(Server);
