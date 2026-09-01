declare module "react" {
  export type ReactNode = any;
  export type Dispatch<T> = (value: T) => void;
  export type SetStateAction<T> = T | ((prev: T) => T);
  export interface CSSProperties { [key: string]: any }
  export type FormEvent = any;
  export type ChangeEvent<T = any> = { target: T & { value: string } };
  export type ButtonHTMLAttributes<T = any> = any;

  export function useState<T>(initial: T | (() => T)): [T, (value: SetStateAction<T>) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useCallback<T extends (...args: any[]) => any>(fn: T, deps: any[]): T;
  export interface Context<T> {
    __contextType?: T;
    Provider: any;
    Consumer: any;
  }
  export function useContext<T>(context: Context<T>): T;
  export function createContext<T>(defaultValue: T | null): Context<T>;
  export function useTransition(): [boolean, (callback: () => void | Promise<void>) => void];
  export function useRef<T>(initial: T | null): { current: T | null };

  const React: any;
  export default React;
}

declare namespace React {
  type ReactNode = any;
  type CSSProperties = { [key: string]: any };
  type FormEvent = any;
  type ChangeEvent<T = any> = { target: T & { value: string } };
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  interface ElementChildrenAttribute {
    children: {};
  }
  interface IntrinsicAttributes {
    key?: any;
  }
}

declare module "next/link" {
  const Link: any;
  export default Link;
}

declare module "next/navigation" {
  export function usePathname(): string;
  export function useRouter(): any;
  export function redirect(path: string): never;
  export function notFound(): never;
}

declare module "next/cache" {
  export function revalidatePath(path: string): void;
  export function revalidateTag(tag: string): void;
}

declare module "next/headers" {
  export function cookies(): Promise<any>;
}

declare module "next/server" {
  export class NextResponse {
    static next(init?: any): any;
    static redirect(url: any): any;
    cookies: any;
  }
  export interface NextRequest {
    nextUrl: any;
    cookies: any;
    headers: any;
  }
}

declare module "@supabase/ssr" {
  export interface CookieOptions { [key: string]: any }
  export function createBrowserClient<T = any>(url: string, key: string): any;
  export function createServerClient<T = any>(url: string, key: string, opts: any): any;
}

declare module "lucide-react" {
  export const Search: any;
  export const Heart: any;
  export const ShoppingBag: any;
  export const User: any;
  export const Menu: any;
  export const X: any;
}

declare const process: { env: { [key: string]: string | undefined } };
