import { Restrict } from "../types";

export default interface WorkGetResponse {
  id: string;
  title: string;
  publishedDate: number;
  images?: {
    name: string;
    url: string;
    thumbnailUrl: {
      small: string;
    };
  }[];
  description?: string;
  restrict: Restrict;
  createdAt: number;
  updatedAt: number;
}
