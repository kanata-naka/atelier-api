import { Nullable, Restrict } from "../types";

export interface ArtGetResponse {
  id: string;
  title: string;
  tags: string[];
  images: ArtGetResponse.Image[];
  description: Nullable<string>;
  restrict: Restrict;
  createdAt: number;
  updatedAt: number;
}

export namespace ArtGetResponse {
  export interface Image {
    name: string;
    url: string;
    thumbnailUrl: {
      small: string;
      medium: string;
    };
  }
}

export default ArtGetResponse;
