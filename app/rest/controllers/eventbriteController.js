const TICKET_TYPE_SINGLE = 'single';
const TICKET_TYPE_COUPLE = 'couple';

const {
  APP_EVENTBRITE_TICKET_TYPE_SINGLE,
  APP_EVENTBRITE_TICKET_TYPE_COUPLE,
  APP_EVENTBRITE_ORGANIZATION_ID,
  APP_EVENTBRITE_EVENT_ID,
} = process.env;

export const generateAccessCode = () => async (req, res) => {
  if (!req.user) {
    return res.status(403).send(null);
  }

  if (req.user.eventbrite.accessCode) {
    return res.status(400).send(null);
  }

  const { ticketType } = req.params;

  let ticketId = null;
  switch (ticketType) {
    case TICKET_TYPE_COUPLE:
      ticketId = APP_EVENTBRITE_TICKET_TYPE_COUPLE;
      break;
    case TICKET_TYPE_SINGLE:
    default:
      ticketId = APP_EVENTBRITE_TICKET_TYPE_SINGLE;
      break;
  }

  const { code, id } = await req.Eventbrite
    .createAccessCode(APP_EVENTBRITE_ORGANIZATION_ID, APP_EVENTBRITE_EVENT_ID, [
      ticketId,
    ]);

  req.user.eventbrite.accessCode = code;
  req.user.eventbrite.accessCodeId = id;
  await req.user.save();

  return res.json({
    url: req.Eventbrite.getEventUrl(APP_EVENTBRITE_EVENT_ID, code, 'website'),
    code,
  });
};

export const webhookHandler = () => async (req, res) => {
  const { body } = req;
  const { webhook_id, action } = body.config;
  const { api_url } = body;

  // Check if webhook was already processed.
  let webhookLog = await req.db.WebhookLog.findOne({
    type: 'eventbrite',
    webhookId: webhook_id,
    body,
  });

  if (webhookLog) {
    return res.status(200).send(null);
  }

  webhookLog = await req.db.WebhookLog.create({
    type: 'eventbrite',
    webhookId: webhook_id,
    body,
  });

  webhookLog.additionalData = await req.Eventbrite.callApiUrl(api_url);
  await webhookLog.save();

  // Process
  switch (action) {
    case 'order.placed':
      const user = await req.db.User.findOne({ email: webhookLog.additionalData.email });
      if (user) {
        user.eventbrite.orderId = webhookLog.additionalData.id;
        user.eventbrite.purchased = true;
        await user.save();
        webhookLog.processed = true;
        await webhookLog.save();
      }
      break;
    default:
      break;
  }

  return res.status(200).send(null);
};