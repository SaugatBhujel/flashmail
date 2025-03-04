declare module 'smtp-server' {
  import { Server } from 'net';
  import { Stream } from 'stream';

  export interface SMTPServerAddress {
    address: string;
    args: any;
  }

  export interface SMTPServerSession {
    id: string;
    remoteAddress: string;
    envelope: {
      mailFrom: SMTPServerAddress;
      rcptTo: SMTPServerAddress[];
    };
    transmissionType: string;
  }

  export interface SMTPServerOptions {
    secure?: boolean;
    authOptional?: boolean;
    disabledCommands?: string[];
    onData?: (stream: Stream, session: SMTPServerSession, callback: (err?: Error | null) => void) => void;
    onMailFrom?: (address: SMTPServerAddress, session: SMTPServerSession, callback: (err?: Error | null) => void) => void;
    onRcptTo?: (address: SMTPServerAddress, session: SMTPServerSession, callback: (err?: Error | null) => void) => void;
  }

  export class SMTPServer extends Server {
    constructor(options: SMTPServerOptions);
    close(callback?: () => void): void;
  }
} 