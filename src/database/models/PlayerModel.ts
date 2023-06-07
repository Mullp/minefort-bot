import {getModelForClass, modelOptions, prop, Ref} from '@typegoose/typegoose';
import {ServerHistory} from './ServerHistoryModel';

@modelOptions({
  schemaOptions: {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  },
})
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

  @prop({
    ref: 'ServerHistory',
    foreignField: 'players',
    localField: '_id',
  })
  public history!: Ref<ServerHistory>[];

  public createdAt!: Date;
  public updatedAt!: Date;
}

export const PlayerModel = getModelForClass(Player);
