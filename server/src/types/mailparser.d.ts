declare module 'mailparser' {
  import { Stream } from 'stream';

  export interface ParsedMail {
    text?: string;
    html?: string;
    textAsHtml?: string;
    subject?: string;
    headers: Map<string, string>;
    attachments: any[];
    headerLines: any[];
  }

  export function simpleParser(stream: Stream): Promise<ParsedMail>;
} 