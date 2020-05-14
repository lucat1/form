import { useState, useEffect, useCallback } from "react";

export type Handler<T extends Object> = (data: T) => void;
export type HTMLHandler = (event: React.FormEvent<HTMLFormElement>) => void;

export type CheckResult = boolean | string;
export interface CheckData {
  required?: CheckResult;
  match?: RegExp | ((data: string) => CheckResult);
}

export type Register = (input?: HTMLInputElement) => void;

export type Errors<T extends Object = any> = {
  [Key in keyof T]?: string;
};

export interface HookResult<T extends Object = any> {
  handle: (handler: Handler<T>) => HTMLHandler;
  register: (data: CheckData) => Register;

  errors: Errors<T>;
}

export interface HookOptions {
  on: "submit" | "blur" | "change";
}

function invariant(res: CheckResult, fallback: string) {
  return res ? (typeof res == "string" ? res : fallback) : null;
}

function check(value: string, data: CheckData): string | null {
  if (data.match) {
    return typeof data.match == "function"
      ? invariant(data.match(value), "Invalid")
      : data.match.test(value)
      ? null
      : "Invalid";
  }

  if (!value) {
    return invariant(data.required, "Required");
  }

  return null;
}

function useForm<T extends Object = any>(
  { on }: HookOptions = { on: "submit" }
): HookResult<T> {
  const [errors, error] = useState<Errors<T>>({});
  const registered: [HTMLInputElement, (e: Event) => void][] = [];
  const checkers = {} as { [Key in keyof T]: CheckData };
  const data = {} as T;

  const update = useCallback(() => {}, [registered]);

  useEffect(() => {
    for (let i = 0; i < registered.length; i++) {
      const [element, handler] = registered[i];
      element.addEventListener("change", handler);

      if (on == "blur") {
        element.addEventListener("blur", update);
      }
    }

    return () => {
      // unregister all listeners
      for (let i = 0; i < registered.length; i++) {
        const [element, handler] = registered[i];
        element.removeEventListener("change", handler);

        if (on == "blur") {
          element.removeEventListener("blur", update);
        }
      }
    };
  }, [registered]);

  return {
    handle(fn) {
      return (e) => {
        e.preventDefault();
        const errors: Errors<T> = {};
        let err = false;

        for (const key in data) {
          const e = check(data[key] as any, checkers[key]);
          if (e) {
            err = true;
            errors[key] = e;
          }
        }

        if (err) {
          error(errors);
          return;
        }

        fn(data);
      };
    },
    register(check) {
      return (ele) => {
        // ignore null / name-less inputs
        if (!ele || !ele.name) return;

        // setup initial value and save checks for later
        data[ele.name] = ele.value;
        checkers[ele.name] = check;

        registered.push([
          ele,
          () => {
            data[ele.name] = ele.value;

            if (on == "change") {
              update();
            }
          },
        ]);
      };
    },

    errors,
  };
}

export default useForm;
