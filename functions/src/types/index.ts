/** 公開範囲 */
export const Restrict = {
  /** 全体公開 */
  ALL: "0",
  /** サブページのみ */
  LIMITED: "1",
  /** 非公開 */
  PRIVATE: "2",
} as const;

export type Restrict = typeof Restrict[keyof typeof Restrict];
