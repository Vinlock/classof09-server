import { Schema } from 'mongoose';
import db from '../db';

const WebhookLogSchema = new Schema({
  webhookId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  body: {
    type: Schema.Types.Mixed,
    default: null,
  },
  metadata: {
    type: Object,
    default: {},
  },
  additionalData: {
    type: Schema.Types.Mixed,
    default: null,
  },
  processed: {
    type: Boolean,
    default: false,
  },
});

const WebhookLog = db.model('WebhookLog', WebhookLogSchema);

export default WebhookLog;
