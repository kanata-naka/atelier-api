import { Restrict } from "../types";
import BaseModel from "./BaseModel";

export default interface WorkModel extends BaseModel {
  title: string;
  publishedDate: FirebaseFirestore.Timestamp;
  images: {
    name: string;
  }[];
  description?: string;
  restrict: Restrict;
}
