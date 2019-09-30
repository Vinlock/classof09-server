import { Schema, model, SchemaTypes } from 'mongoose';
import db from '../db';

const FacebookAuthSchema = new Schema({
  accessToken: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
  id: {
    type: String,
    unique: true,
  },
});

const TypeformSchema = new Schema({
  responseId: {
    type: String,
    default: null,
  },
});

const EventbriteSchema = new Schema({
  accessCode: {
    type: String,
    default: null,
  },
  accessCodeId: {
    type: String,
    default: null,
  },
  purchased: {
    type: Boolean,
    default: false,
  },
  orderId: {
    type: String,
    default: null,
  },
});

const UserSchema = new Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  password: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  facebook: {
    type: FacebookAuthSchema,
    default: {},
  },
  typeform: {
    type: TypeformSchema,
    default: {},
  },
  eventbrite: {
    type: EventbriteSchema,
    default: {},
  },
});

const User = db.model('User', UserSchema);

export default User;