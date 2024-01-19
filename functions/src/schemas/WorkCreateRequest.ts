import { Restrict } from "../types";

export default interface WorkCreateRequest {
  title: string;
  publishedDate: number;
  images: {
    name: string;
  }[];
  description?: string;
  restrict: Restrict;
}
