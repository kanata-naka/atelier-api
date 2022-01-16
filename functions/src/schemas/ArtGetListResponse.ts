import ArtGetResponse from "./ArtGetResponse";

export default class ArtGetListResponse {
  /** 取得結果 */
  result!: Array<ArtGetResponse>;
  /** 最後まで取得されたか */
  fetchedAll!: boolean;
}
