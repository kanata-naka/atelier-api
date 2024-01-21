import BaseModel from "./BaseModel";
import { Nullable } from "../types";

export interface TopImageModel extends BaseModel {
  image: TopImageModel.Image;
  thumbnailImage: TopImageModel.Image;
  description: Nullable<string>;
  order: number;
}

export namespace TopImageModel {
  export interface Image {
    name: string;
  }
}

export default TopImageModel;
