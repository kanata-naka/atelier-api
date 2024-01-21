import { Nullable } from "../types";

export interface TopImageCreateRequest {
  id: string;
  image: TopImageCreateRequest.Image;
  thumbnailImage: TopImageCreateRequest.Image;
  description: Nullable<string>;
  order: number;
}

export namespace TopImageCreateRequest {
  export interface Image {
    name: string;
  }
}

export default TopImageCreateRequest;
