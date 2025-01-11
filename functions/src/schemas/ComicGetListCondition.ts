import { Restrict } from "../types";

export default interface ComicGetListCondition {
  restrict?: Restrict[];
  limit?: number;
}
