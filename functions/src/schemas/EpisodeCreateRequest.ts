import { Nullable, Restrict } from "../types";

export interface EpisodeCreateRequest {
  comicId: string;
  id: string;
  no: number;
  title: string;
  image: Nullable<EpisodeCreateRequest.Image>;
  description: Nullable<string>;
  restrict: Restrict;
  createdAt: number;
}

export namespace EpisodeCreateRequest {
  export interface Image {
    name: string;
  }
}

export default EpisodeCreateRequest;
