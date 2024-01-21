import { Nullable } from "../types";

export interface TopImageGetResponse {
  id: string;
  image: TopImageGetResponse.Image;
  thumbnailImage: TopImageGetResponse.Image;
  description: Nullable<string>;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export namespace TopImageGetResponse {
  export interface Image {
    name: string;
    url: string;
  }
}

export default TopImageGetResponse;
