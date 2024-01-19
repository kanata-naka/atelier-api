import { Restrict } from "../types";

export default interface ArtGetListCondition {
  tag?: string;
  restrict?: Restrict[];
  lastId?: string;
  limit?: number;
}
