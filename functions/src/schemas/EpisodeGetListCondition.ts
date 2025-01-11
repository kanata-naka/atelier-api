import { Restrict } from "../types";

export default interface EpisodeGetListCondition {
  restrict?: Restrict[];
  limit?: number;
}
