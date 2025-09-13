import { Nullable, Restrict } from "../types";

export interface WorkGetResponse {
  id: string;
  title: string;
  tags: string[];
  images: WorkGetResponse.Image[];
  description: Nullable<string>;
  restrict: Restrict;
  createdAt: number;
  updatedAt: number;
}

export namespace WorkGetResponse {
  export interface Image {
    name: string;
    url: string;
    thumbnailUrl: {
      small: string;
    };
  }
}

export default WorkGetResponse;
