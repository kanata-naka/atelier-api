import GetByIdRequest from "./GetByIdRequest";

export default interface ComicGetByEpisodeIdRequest extends GetByIdRequest {
  episodeId: string;
}
