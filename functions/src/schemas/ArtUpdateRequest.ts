import ArtCreateRequest from "./ArtCreateRequest";

export default interface ArtUpdateRequest extends ArtCreateRequest {
  id: string;
}
