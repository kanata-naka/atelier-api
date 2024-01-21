import { Nullable, Restrict } from "../types";

export interface ArtCreateRequest {
  id: string;
  title: string;
  tags: string[];
  images: ArtCreateRequest.Image[];
  description: Nullable<string>;
  restrict: Restrict;
  createdAt?: number;
}

export namespace ArtCreateRequest {
  export interface Image {
    name: string;
  }
}

export default ArtCreateRequest;
