import axios from 'axios';
import { URL } from 'url';
import Axiosinterceptors from '../AxiosInterceptors';

const {
  APP_EVENTBRITE_PRIVATE_TOKEN
} = process.env;

class Eventbrite {
  constructor(logger = null) {
    this._token = APP_EVENTBRITE_PRIVATE_TOKEN;

    const instanceConfig = {
      baseURL: 'https://www.eventbriteapi.com/v3',
      timeout: 10000,
    };

    if (this._token) {
      instanceConfig.headers = {
        Authorization: `Bearer ${this._token}`,
      };
    }

    this._instance = axios.create(instanceConfig);

    if (logger) {
      Axiosinterceptors(this._instance, logger, 'eventbrite');
    }
  }

  _genRandomString = (length) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      let randomPos = Math.floor(Math.random() * charset.length);
      randomString += charset.substring(randomPos, randomPos + 1);
    }
    return randomString;
  };

  createAccessCode = async (organizationId, eventId) => {
    const discountData = {
      type: 'access',
      code: this._genRandomString(20),
      event_id: eventId,
      quantity_available: 1,
    };

    const response = await this._instance
      .post(`/organizations/${organizationId}/discounts/`, {
        discount: discountData,
      });

    return {
      code: response.data.code,
      id: response.data.id,
    }
  };

  checkAccessCodeStatus = async (accessCodeId) => {
    const response = await this._instance
      .get(`/discounts/${accessCodeId}`);
    const { data } = response;

    return Boolean(data.quantity_sold);
  };

  callApiUrl = async (url) => {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    return response.data;
  };

  getEventUrl = (eventId, accessCode = null, affiliate = null) => {
    const url = new URL(`https://www.eventbrite.com/e/${eventId}`);
    if (accessCode) {
      url.searchParams.append('discount', accessCode);
    }
    if (affiliate) {
      url.searchParams.append('aff', affiliate);
    }
    return url.toString();
  }
}

export default Eventbrite;
