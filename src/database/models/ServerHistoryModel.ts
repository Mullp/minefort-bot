import {getModelForClass, modelOptions, prop, Ref} from '@typegoose/typegoose';
import {Player} from './PlayerModel';

@modelOptions({schemaOptions: {timestamps: true}})
export class ServerHistory {
  @prop({ref: () => Player, required: true})
  public players!: Ref<Player>[];

  public createdAt!: Date;
  public updatedAt!: Date;
}

export const ServerHistoryModel = getModelForClass(ServerHistory);
