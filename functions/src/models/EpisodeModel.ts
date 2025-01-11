import BaseModel from "./BaseModel";
import PageModel from "./PageModel";
import { Nullable, Restrict } from "../types";

export interface EpisodeModel extends BaseModel {
  no: number;
  title: string;
  image: Nullable<EpisodeModel.Image>;
  description: Nullable<string>;
  restrict: Restrict;
  pages?: PageModel[];
}

export namespace EpisodeModel {
  export interface Image {
    name: string;
  }
}

export default EpisodeModel;
