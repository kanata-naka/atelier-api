import BaseModel from "./BaseModel";
import { Restrict } from "../types";

export default interface ArtModel extends BaseModel {
  title: string;
  tags?: string[];
  images: {
    name: string;
  }[];
  description?: string;
  restrict: Restrict;
}
