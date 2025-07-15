export type EmailSend = {
  subject: string;
  receivers: string[];
  content?: string;
  attachments?: any[];
  html?: string;
};

export interface IEmailService {
  send(email: EmailSend): Promise<void>;
}
