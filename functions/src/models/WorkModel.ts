import BaseModel from "./BaseModel";
import { Nullable, Restrict } from "../types";

export interface WorkModel extends BaseModel {
  title: string;
  publishedDate: FirebaseFirestore.Timestamp;
  images: WorkModel.Image[];
  description: Nullable<string>;
  restrict: Restrict;
}

export namespace WorkModel {
  export interface Image {
    name: string;
  }
}

export default WorkModel;
