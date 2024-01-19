import { Restrict } from "../types";

export default interface ArtCreateRequest {
  title: string;
  tags?: string[];
  images: {
    name: string;
  }[];
  description?: string;
  restrict: Restrict;
  createdAt?: number;
}
