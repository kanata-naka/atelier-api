import { Restrict } from "../types";
import BaseModel from "./BaseModel";

export default interface ArtModel extends BaseModel {
  title: string;
  tags?: string[];
  images: {
    name: string;
  }[];
  description?: string;
  restrict: Restrict;
}
