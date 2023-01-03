import { Agent } from "useragent";

// This file is used to extend the Express Request interface with custom properties
export {};

declare global {
  namespace Express {
    export interface Request {
      id?: string;
      body?: any;
      userAgent: Agent;
    }
  }
}
