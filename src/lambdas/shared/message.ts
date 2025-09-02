import { AttachmentAction, Field } from './message-builder';

export interface MessageAttachment {
  title?: string;
  text?: string;
  callback_id?: string;
  fields?: Field[];
  footer?: string;
  actions?: AttachmentAction[];
}

export interface Message {
  ts?: string;
  text: string;
  attachments: MessageAttachment[];
}
