// NPM's @types/validator is not up to date, so we need to create our own type definition file
declare module "validator" {
  export function isURL(str: string): boolean;
  export function isMobilePhone(str: string, locale?: string, options?: any): boolean;
  export function isInt(int: Number, options?: any): boolean;
}
