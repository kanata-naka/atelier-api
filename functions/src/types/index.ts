/** 公開範囲 */
export namespace Restrict {
  /** 公開範囲: 全体公開 */
  export const RESTRICT_ALL = "0";
  /** 公開範囲: サブページのみ */
  export const RESTRICT_LIMITED = "1";
  /** 公開範囲: 非公開 */
  export const RESTRICT_PRIVATE = "2";
}

const restrictList = [Restrict.RESTRICT_ALL, Restrict.RESTRICT_LIMITED, Restrict.RESTRICT_PRIVATE] as const;

export type Restrict = typeof restrictList[number];
