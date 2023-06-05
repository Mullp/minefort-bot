import mongoose from 'mongoose';

export const connectToMongo = async () => {
  await mongoose
    .connect(process.env.DATABASE_URL || '', {
      autoIndex: true,
      dbName: process.env.DATABASE_NAME || '',
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error(err));
};
