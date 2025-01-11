import { ComicType, Nullable, Restrict } from "../types";

export interface ComicGetResponse {
  id: string;
  title: string;
  image: Nullable<ComicGetResponse.Image>;
  description: Nullable<string>;
  type: ComicType;
  completed: boolean;
  restrict: Restrict;
  episodes: Nullable<ComicGetResponse.Episode[]>;
  createdAt: number;
  updatedAt: number;
}

export namespace ComicGetResponse {
  export interface Image {
    name: string;
    url: string;
  }

  export interface Episode {
    id: string;
    no: number;
    title: string;
    image: Nullable<Image>;
    description: Nullable<string>;
    restrict: Restrict;
    pages: Nullable<Page[]>;
    createdAt: number;
    updatedAt: number;
  }

  export interface Page {
    id: string;
    no: number;
    image: Image;
    createdAt: number;
    updatedAt: number;
  }
}

export default ComicGetResponse;
