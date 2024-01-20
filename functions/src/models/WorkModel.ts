import BaseModel from "./BaseModel";
import { Restrict } from "../types";

export default interface WorkModel extends BaseModel {
  title: string;
  publishedDate: FirebaseFirestore.Timestamp;
  images: {
    name: string;
  }[];
  description?: string;
  restrict: Restrict;
}
