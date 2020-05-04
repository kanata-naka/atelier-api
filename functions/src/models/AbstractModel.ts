/**
 * モデルの基底クラス
 */
export default abstract class AbstractModel {
  /** ID */
  id?: string;
  /** 作成日時 */
  createdAt?: FirebaseFirestore.Timestamp;
  /** 更新日時 */
  updatedAt?: FirebaseFirestore.Timestamp;
}
