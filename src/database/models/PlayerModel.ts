import {getModelForClass, modelOptions, prop} from '@typegoose/typegoose';

@modelOptions({schemaOptions: {timestamps: true}})
export class Player {
  @prop({
    required: true,
    unique: true,
    lowercase: true,
    match:
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
  })
  public uuid!: string;

  @prop()
  public name?: string;

  public createdAt!: Date;
  public updatedAt!: Date;
}

export const PlayerModel = getModelForClass(Player);
