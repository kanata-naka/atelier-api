import { Restrict } from "../types";

export default interface WorkGetListCondition {
  tag?: string;
  restrict?: Restrict[];
  lastId?: string;
  limit?: number;
}
