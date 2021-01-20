import mongoose from 'mongoose';

const dbHost = 'cluster0.qmjx0.mongodb.net';
const dbUser = 'NatName';
const dbPassword = 'TaskToDo11';
const dbName = 'magicQuiver';

export async function initMongoClient() {
  const connectionUrl: string = `mongodb+srv://${dbUser}:${dbPassword}@${dbHost}/${dbName}?retryWrites=true&w=majority`;

  try {
    mongoose.connect(connectionUrl, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.log('error database', error);
  }
  console.log('connect to database');
}
