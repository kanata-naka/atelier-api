import { Restrict } from "../types";

export default interface WorkGetListCondition {
  restrict?: Restrict[];
  limit?: number;
  sort?: {
    column?: "publishedDate" | "createdAt";
    order?: FirebaseFirestore.OrderByDirection;
  };
}
