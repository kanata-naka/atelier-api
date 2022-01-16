import ArtCreateRequest from "./ArtCreateRequest";

export default interface ArtUpdateRequest extends ArtCreateRequest {
  /** ID */
  id: string;
}
