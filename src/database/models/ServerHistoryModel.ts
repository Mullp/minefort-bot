import {getModelForClass, modelOptions, prop, Ref} from '@typegoose/typegoose';
import {Player} from './PlayerModel';
import {Server} from './ServerModel';
import {Types} from 'mongoose';

@modelOptions({
  schemaOptions: {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  },
})
export class ServerHistory {
  @prop({required: true, ref: 'Server'})
  public server!: Ref<Server>;

  @prop({required: true, ref: () => Player})
  public players!: Ref<Player>[];

  public createdAt!: Date;
  public updatedAt!: Date;
}

export const ServerHistoryModel = getModelForClass(ServerHistory);
