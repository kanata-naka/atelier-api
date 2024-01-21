import BaseModel from "./BaseModel";
import { Nullable, Restrict } from "../types";

export interface ArtModel extends BaseModel {
  title: string;
  tags: string[];
  images: ArtModel.Image[];
  description: Nullable<string>;
  restrict: Restrict;
}

export namespace ArtModel {
  export interface Image {
    name: string;
  }
}

export default ArtModel;
