import bodyParser from 'body-parser';
import corsMiddleware from './corsMiddleware';
import logMiddleware from './logMiddleware';
import requestIdMiddleware from './requestIdMiddleware';
import authMiddleware from './authMiddleware';
import dbMiddleware from './dbMiddleware';
import typeformMiddleware from './typeformMiddleware';
import eventbriteMiddleware from './eventbriteMiddleware';
import Validation from '../Validation/Validation';

/**
 * Express Middleware Centralization
 * @param {Object} options Middleware Options
 * @param {Boolean} [options.jsonParser=false] Enable JSON Body Parser
 * @param {Boolean} [options.urlEncodedParser=false] Enable Body Parser
 * @param {Object|Boolean} [options.cookieParser=false] Enable Cookie Parser
 * @param {Boolean} [options.requestIdGenerator=false] Enable Request ID Generator
 * @param {Boolean|Object} [options.logging=false] Enable Logging
 * @param {String|null} [options.logging.name=null] Logging Options
 * @param {Boolean} [options.cors=false] Enable CORS
 * @param {Boolean} [options.auth=false] Enable Authentication
 * @param {Boolean} [options.db=false] Enable Database Usage
 * @param {Boolean} [options.typeform=false] Enable Typeform API
 * @param {Boolean} [options.eventbrite=false] Enable Eventbrite API
 * @returns {Array<Object>}
 */
export default (options = {}) => {
  const defaults = {
    jsonParser: false,
    urlEncodedParser: false,
    requestIdGenerator: false,
    logging: false,
    cors: false,
    auth: false,
    db: false,
    typeform: false,
    eventbrite: false,
  };

  options = { ...defaults, ...options };

  const middleware = [];

  // CORS Middleware
  if (options.cors) middleware.push(corsMiddleware());

  // JSON Body Parser
  if (options.jsonParser) middleware.push(bodyParser.json());

  // URL Encoded Body Parser
  if (options.urlEncodedParser) middleware.push(bodyParser.urlencoded({ extended: true }));

  // Request ID Generator
  if (options.requestIdGenerator) middleware.push(requestIdMiddleware());

  // Logging Middleware Instance
  if (options.logging) {
    if (Validation.isString(options.logging)) {
      middleware.push(logMiddleware(options.logging));
    } else if (Validation.isObject(options.logging)) {
      middleware.push(logMiddleware(options.logging.name, options.logging.options));
    } else {
      middleware.push(logMiddleware());
    }
  }

  // DB Middleware
  if (options.db) middleware.push(dbMiddleware());

  // Auth Middleware
  if (options.auth) middleware.push(authMiddleware());

  // Typeform API
  if (options.typeform) middleware.push(typeformMiddleware());

  // Eventbrite API
  if (options.eventbrite) middleware.push(eventbriteMiddleware());

  return middleware;
};