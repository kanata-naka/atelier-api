import { Restrict } from "../types";
import BaseModel from "./BaseModel";

/**
 * アートのモデル
 */
export default interface ArtModel extends BaseModel {
  /** タイトル */
  title: string;
  /** タグ一覧 */
  tags?: Array<string>;
  /** 画像一覧 */
  images: Array<{
    /** ストレージ上のパス */
    name: string;
  }>;
  /** 説明 */
  description?: string;
  /** 公開範囲 */
  restrict: Restrict;
}
