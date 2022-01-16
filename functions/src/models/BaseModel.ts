/**
 * モデルの基底クラス
 */
export default interface BaseModel {
  /** ID */
  id?: string;
  /** 作成日時 */
  createdAt?: FirebaseFirestore.Timestamp;
  /** 更新日時 */
  updatedAt?: FirebaseFirestore.Timestamp;
}
