import WorkCreateRequest from "./WorkCreateRequest";

export default interface WorkUpdateRequest extends WorkCreateRequest {
  /** ID */
  id: string;
}
