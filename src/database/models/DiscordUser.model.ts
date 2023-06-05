import {prop, getModelForClass, Ref, modelOptions} from '@typegoose/typegoose';
import {MinefortUser} from './MinefortUser.model';

@modelOptions({schemaOptions: {timestamps: true}})
export class DiscordUser {
  @prop({required: true, unique: true})
  public discordId!: string;

  @prop({ref: () => MinefortUser, required: true})
  public minefortUser!: Ref<MinefortUser>;

  public createdAt!: Date;
  public updatedAt!: Date;
}

export const DiscordUserModel = getModelForClass(DiscordUser);
