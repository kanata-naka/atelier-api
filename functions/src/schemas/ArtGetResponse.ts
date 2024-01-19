import { Restrict } from "../types";

export default interface ArtGetResponse {
  id: string;
  title: string;
  tags?: string[];
  images: {
    name: string;
    url: string;
    thumbnailUrl: {
      small: string;
      medium: string;
    };
  }[];
  description?: string;
  restrict: Restrict;
  createdAt: number;
  updatedAt: number;
}
