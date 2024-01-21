import { Restrict } from "../constants";

export type Nullable<T> = T | null;

export type Restrict = (typeof Restrict)[keyof typeof Restrict];
