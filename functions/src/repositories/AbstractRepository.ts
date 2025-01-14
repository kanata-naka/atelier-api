import * as admin from "firebase-admin";
import { Timestamp, UpdateData } from "firebase-admin/firestore";
import BaseModel from "../models/BaseModel";

export default abstract class AbstractRepository<T extends BaseModel> {
  protected collectionRef: FirebaseFirestore.CollectionReference;

  constructor(collectionPath: string[]) {
    this.collectionRef = admin.firestore().collection(collectionPath[0]);
    if (collectionPath.length > 1) {
      for (let i = 1; i < collectionPath.length; i += 2) {
        this.collectionRef = this.collectionRef.doc(collectionPath[i]).collection(collectionPath[i + 1]);
      }
    }
  }

  public async getById(id: string): Promise<T> {
    const snapshot = await this.collectionRef.doc(id).get();
    if (!snapshot.exists) {
      throw new Error(`Document not found. id=[${id}]`);
    }
    const result = snapshot.data() as T;
    result.id = snapshot.id;
    return result;
  }

  public async create(model: T): Promise<void> {
    const documentRef = this.collectionRef.doc(model.id!);
    delete model.id;
    await documentRef.set({
      createdAt: this.now,
      updatedAt: this.now,
      ...model,
    });
  }

  public async update(model: T): Promise<void> {
    const documentRef = this.collectionRef.doc(model.id!);
    delete model.id;
    await documentRef.update({
      updatedAt: this.now,
      ...model,
    } as UpdateData<T>);
  }

  public async bulkUpdate(models: Array<T>): Promise<void> {
    let batch = admin.firestore().batch();
    const snapshot = await this.collectionRef.get();
    let count = 0;
    await Promise.all(
      snapshot.docs.map(async (documentSnapshot) => {
        const model = models.find((_model) => documentSnapshot.id === _model.id);
        if (!model) {
          return;
        }
        delete model.id;
        if (count === 500) {
          // 500件ごとにコミットしてインスタンスを初期化する
          await batch.commit();
          batch = admin.firestore().batch();
          count = 0;
        }
        batch.update(documentSnapshot.ref, {
          updatedAt: this.now,
          ...model,
        } as UpdateData<T>);
        count++;
      }),
    );
    await batch.commit();
  }

  public async deleteById(id: string): Promise<void> {
    await this.collectionRef.doc(id).delete();
  }

  public async bulkDelete(ids: Array<string>): Promise<void> {
    let batch = admin.firestore().batch();
    const snapshot = await this.collectionRef.get();
    let count = 0;
    await Promise.all(
      snapshot.docs.map(async (documentSnapshot) => {
        if (!ids.find((id) => documentSnapshot.id === id)) {
          return;
        }
        if (count === 500) {
          // 500件ごとにコミットしてインスタンスを初期化する
          await batch.commit();
          batch = admin.firestore().batch();
          count = 0;
        }
        batch.delete(documentSnapshot.ref);
        count++;
      }),
    );
    await batch.commit();
  }

  public get now(): Timestamp {
    return Timestamp.now();
  }

  public createTimestamp(seconds: number): Timestamp {
    return Timestamp.fromMillis(seconds * 1000);
  }
}
