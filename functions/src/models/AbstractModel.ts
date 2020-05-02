/**
 * モデルの基底クラス
 */
export default abstract class AbstractModel {
  /** ID */
  id?: string;
  /** 作成日時 */
  createdAt?: {
    /** UNIXタイムスタンプ(秒) */
    _seconds: number;
  };
  /** 更新日時 */
  updatedAt?: {
    /** UNIXタイムスタンプ(秒) */
    _seconds: number;
  };
}
