import BaseModel from "./BaseModel";
import EpisodeModel from "./EpisodeModel";
import { ComicType, Nullable, Restrict } from "../types";

export interface ComicModel extends BaseModel {
  title: string;
  image: Nullable<ComicModel.Image>;
  description: Nullable<string>;
  type: ComicType;
  completed: boolean;
  restrict: Restrict;
  episodes?: EpisodeModel[];
}

export namespace ComicModel {
  export interface Image {
    name: string;
  }
}

export default ComicModel;
