import ArtGetResponse from "./ArtGetResponse";

export default interface ArtGetListResponse {
  result: ArtGetResponse[];
  fetchedAll: boolean;
}
