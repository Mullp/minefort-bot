import {getModelForClass, modelOptions, prop, Ref} from '@typegoose/typegoose';
import {Server} from './ServerModel';

@modelOptions({schemaOptions: {timestamps: true}})
export class MinefortUser {
  @prop({required: true, unique: true})
  public minefortId!: string;

  @prop({lowercase: true})
  public email?: string;

  @prop()
  public sessionToken?: string;

  @prop()
  public twoFactor?: boolean;

  @prop({ref: () => Server})
  public servers!: Ref<Server>[];

  public createdAt!: Date;
  public updatedAt!: Date;
}

export const MinefortUserModel = getModelForClass(MinefortUser);
