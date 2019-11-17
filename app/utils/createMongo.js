import mongoose from 'mongoose';
import Logger from '../lib/Logger';

const {
  APP_MONGO_DB_URL,
  APP_MONGO_USERNAME,
  APP_MONGO_PASSWORD,
  APP_MONGO_REPLICA_SET,
} = process.env;

const logger = new Logger({ name: 'mongo' });

const createMongo = (database) => {
  // eslint-disable-next-line
  const connectionString = APP_MONGO_DB_URL;
  const connectionOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    dbName: database,
    autoReconnect: true,
    useUnifiedTopology: true,
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  };
  const hasUsername = Boolean(APP_MONGO_USERNAME && APP_MONGO_USERNAME.length > 0);
  const hasPassword = Boolean(APP_MONGO_PASSWORD && APP_MONGO_PASSWORD.length > 0);
  if (hasUsername && hasPassword) {
    connectionOptions.user = APP_MONGO_USERNAME;
    connectionOptions.pass = APP_MONGO_PASSWORD;
  }

  const hasReplicaSet = Boolean(APP_MONGO_REPLICA_SET && APP_MONGO_REPLICA_SET.length > 0);
  if (hasReplicaSet) {
    connectionOptions.replicaSet = APP_MONGO_REPLICA_SET;
  }

  const connection = mongoose.createConnection(connectionString, connectionOptions);

  connection.on('error', (err) => {
    if (err.message && err.message.match(/failed to connect to server .* on first connect/)) {
      logger.error('mongo.connection.fail', {
        timestamp: new Date(),
        error: String(err),
      });

      setTimeout(() => {
        logger.log('mongo.connection.retry', { retry: true });
        // Retry connection and avoid unhandled rejections with a catch statement.
        connection.openUri(connectionString, connectionOptions).catch(() => {});
      }, 20 * 1000);
    } else {
      // a different error happened, log it.
      logger.error('mongo.error', {
        timestamp: new Date(),
        error: String(err),
      });
    }
  });

  // mongoose.set('debug', (coll, method, query, doc, options) => {
  //   logger.log('mongo.query', {
  //     coll, method, query, doc, options,
  //   });
  // });

  return connection;
};

export default createMongo;
