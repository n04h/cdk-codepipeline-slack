// Legacy Slack message attachment types
// These types are deprecated by Slack but still supported for backwards compatibility
// Consider migrating to Block Kit in the future

export interface AttachmentAction {
  name?: string;
  text?: string;
  type?: string;
  style?: string;
  value?: string;
}

export interface MessageAttachment {
  title?: string;
  text?: string;
  callback_id?: string;
  fields?: Array<{
    title: string;
    value: string;
    short?: boolean;
  }>;
  footer?: string;
  actions?: AttachmentAction[];
  ts?: string;
}
