import { ComicType, Nullable, Restrict } from "../types";

export interface ComicCreateRequest {
  id: string;
  title: string;
  image: Nullable<ComicCreateRequest.Image>;
  description: Nullable<string>;
  type: ComicType;
  completed: boolean;
  restrict: Restrict;
  createdAt: number;
}

export namespace ComicCreateRequest {
  export interface Image {
    name: string;
  }
}

export default ComicCreateRequest;
