import { Restrict } from "../constants";

export type Restrict = typeof Restrict[keyof typeof Restrict];
