import axios from 'axios';
import Axiosinterceptors from '../AxiosInterceptors';

class FacebookUser {
  constructor(accessToken = null, refreshToken = null, logger = null) {
    this._accessToken = accessToken;

    const instanceConfig = {
      baseURL: 'https://graph.facebook.com/v4.0',
      timeout: 10000,
    };

    if (this._accessToken) {
      instanceConfig.headers = {
        Authorization: `Bearer ${this._accessToken}`,
      };
    }

    this._instance = axios.create(instanceConfig);

    if (logger) {
      Axiosinterceptors(this._instance, logger, 'facebook.graph');
    }
  }

  getProfile = async () => {
    const profile = await this._instance.get('/me', {
      params: {
        fields: 'id,name,email,first_name,last_name'
      },
    });
    return {
      id: profile.data.id,
      name: profile.data.name,
      email: profile.data.email,
      firstName: profile.data.first_name,
      lastName: profile.data.last_name,
    };
  };
}

export default FacebookUser;
