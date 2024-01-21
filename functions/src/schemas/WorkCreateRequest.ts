import { Nullable, Restrict } from "../types";

export interface WorkCreateRequest {
  id: string;
  title: string;
  publishedDate: number;
  images: WorkCreateRequest.Image[];
  description: Nullable<string>;
  restrict: Restrict;
}

export namespace WorkCreateRequest {
  export interface Image {
    name: string;
  }
}

export default WorkCreateRequest;
