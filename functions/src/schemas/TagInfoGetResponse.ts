export interface TagInfoGetResponse {
  info: TagInfoGetResponse.TagInfo[];
}

export namespace TagInfoGetResponse {
  export interface TagInfo {
    name: string;
    count: number;
  }
}

export default TagInfoGetResponse;
