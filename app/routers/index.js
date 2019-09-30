import Logger from '../lib/Logger';
import testRouter from './testRouter';
import graphQLRouter from './graphQLRouter';
import notFoundRouter from './notFoundRouter';
import restRouter from './restRouter';

const {
  APP_GRAPHQL_DISABLE,
  APP_REST_DISABLE,
} = process.env;

const logger = new Logger({ name: 'system.router' });

export default (app) => {
  // Robots.txt
  app.get('/robots.txt', (req, res) => res.status(200)
    .set('Content-Type', 'text/plain;charset=UTF-8')
    .send(Buffer.from('User-agent: *\nDisallow: /')));

  // Test Route
  app.use('/test', testRouter);

  // GraphQL
  if (APP_GRAPHQL_DISABLE !== 'true') {
    app.use('/gql', graphQLRouter);
    logger.info('graphql', 'GraphQL Router Enabled');
  }

  if (APP_REST_DISABLE !== 'true') {
    app.use('/rest', restRouter);
    logger.info('rest', 'REST Router Enabled');
  }

  // 404 Not Found
  app.use(notFoundRouter);

  // On Error
  app.use((err, req, res) => res.status(500).json({
    code: err.code || null,
    message: err.message || null,
  }));
};