import { Nullable, Restrict } from "../types";

export interface WorkCreateRequest {
  id: string;
  title: string;
  tags: string[];
  images: WorkCreateRequest.Image[];
  description: Nullable<string>;
  restrict: Restrict;
  createdAt?: number;
}

export namespace WorkCreateRequest {
  export interface Image {
    name: string;
  }
}

export default WorkCreateRequest;
