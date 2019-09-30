import axios from 'axios';
import moment from 'moment';
import Axiosinterceptors from '../AxiosInterceptors';

const {
  APP_TYPEFORM_TOKEN,
} = process.env;

class Typeform {
  constructor(logger = null) {
    this._token = APP_TYPEFORM_TOKEN;

    const instanceConfig = {
      baseURL: 'https://api.typeform.com',
      timeout: 10000,
    };

    if (this._token) {
      instanceConfig.headers = {
        Authorization: `Bearer ${this._token}`,
      };
    }

    this._instance = axios.create(instanceConfig);

    if (logger) {
      Axiosinterceptors(this._instance, logger, 'typeform');
    }
  }

  /**
   *
   * @param formId
   * @param {Object} options Options
   * @param {Number} [options.pageSize=25] Page Size
   * @param {Date} [options.since] Responses Since Date
   * @param {Date} [options.until] Responses Until Date
   * @param {String} [options.after] Responses submitted after the specified token
   * @param {String} [options.before] Responses submitted before the specified token
   * @param {Array<String>} [options.includedResponseIds] Included Response IDs
   * @param {Boolean} [options.completed=true] Submitted Responses only?
   * @param {String} [options.query] Query
   * @returns {Promise<Object>} Responses
   */
  getResponses = async (formId, options) => {
    const defaults = {
      pageSize: 25,
      completed: true,
    };

    const params = {
      ...defaults,
      ...options,
    };

    const { data: responses } = await this._instance.get(`/forms/${formId}/responses`, {
      params: {
        page_size: params.pageSize,
        since: params.since ? moment(params.since).toISOString() : undefined,
        until: params.until ? moment(params.until).toISOString() : undefined,
        after: params.after,
        before: params.before,
        included_response_ids: params.includedResponseIds ?
          params.includedResponseIds.join(',') : undefined,
        completed: params.completed,
        query: params.query,
      },
    });

    return responses;
  };
}

export default Typeform;
