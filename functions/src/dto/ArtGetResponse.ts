import ArtGetByIdResponse from "./ArtGetByIdResponse";

export default class ArtGetResponse {
  /** 取得結果 */
  result!: Array<ArtGetByIdResponse>;
  /** 最後まで取得されたか */
  fetchedAll?: boolean;
}
