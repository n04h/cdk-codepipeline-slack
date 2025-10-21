import { MessageAttachment } from './slack-types';

export interface Message {
  ts?: string;
  text: string;
  attachments: MessageAttachment[];
}
