import "reflect-metadata";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { container } from "tsyringe";
import { FIREBASE_REGION, UPLOAD_FILE_FUNCTION_MEMORY_AMOUNT } from "./constants";
import ArtController from "./controllers/ArtController";
import TagInfoController from "./controllers/TagInfoController";
import TopImageController from "./controllers/TopImageController";
import WorkController from "./controllers/WorkController";
import { withAuthentication } from "./helpers";

admin.initializeApp();

export const topImages = {
  get: functions.region(FIREBASE_REGION).https.onCall(async () => {
    return await container.resolve(TopImageController).get();
  }),
  getById: functions.region(FIREBASE_REGION).https.onCall(async (data) => {
    return await container.resolve(TopImageController).getById(data);
  }),
  create: functions.region(FIREBASE_REGION).https.onCall(async (data, context) => {
    await withAuthentication(context, () => container.resolve(TopImageController).create(data));
  }),
  bulkUpdate: functions.region(FIREBASE_REGION).https.onCall(async (data, context) => {
    await withAuthentication(context, () => container.resolve(TopImageController).bulkUpdate(data));
  }),
  onUpdate: functions
    .region(FIREBASE_REGION)
    .firestore.document("topImages/{id}")
    .onUpdate(async (change) => {
      await container.resolve(TopImageController).onUpdate(change);
    }),
  deleteById: functions.region(FIREBASE_REGION).https.onCall(async (data, context) => {
    await withAuthentication(context, () => container.resolve(TopImageController).deleteById(data));
  }),
  onDelete: functions
    .region(FIREBASE_REGION)
    .firestore.document("topImages/{id}")
    .onDelete(async (snapshot) => {
      await container.resolve(TopImageController).onDelete(snapshot);
    }),
};

export const tagInfo = {
  getById: functions.region(FIREBASE_REGION).https.onCall(async (data) => {
    return await container.resolve(TagInfoController).getById(data);
  }),
};

export const arts = {
  get: functions.region(FIREBASE_REGION).https.onCall(async (data) => {
    return await container.resolve(ArtController).get(data);
  }),
  getById: functions.region(FIREBASE_REGION).https.onCall(async (data) => {
    return await container.resolve(ArtController).getById(data);
  }),
  create: functions.region(FIREBASE_REGION).https.onCall(async (data, context) => {
    await withAuthentication(context, () => container.resolve(ArtController).create(data));
  }),
  update: functions.region(FIREBASE_REGION).https.onCall(async (data, context) => {
    await withAuthentication(context, () => container.resolve(ArtController).update(data));
  }),
  onUpdate: functions
    .region(FIREBASE_REGION)
    .firestore.document("arts/{id}")
    .onUpdate(async (change) => {
      await container.resolve(ArtController).onUpdate(change);
    }),
  deleteById: functions.region(FIREBASE_REGION).https.onCall(async (data, context) => {
    await withAuthentication(context, () => container.resolve(ArtController).deleteById(data));
  }),
  onDelete: functions
    .region(FIREBASE_REGION)
    .firestore.document("arts/{id}")
    .onDelete(async (snapshot) => {
      await container.resolve(ArtController).onDelete(snapshot);
    }),
};

export const works = {
  get: functions.region(FIREBASE_REGION).https.onCall(async (data) => {
    return await container.resolve(WorkController).get(data);
  }),
  getById: functions.region(FIREBASE_REGION).https.onCall(async (data) => {
    return await container.resolve(WorkController).getById(data);
  }),
  create: functions.region(FIREBASE_REGION).https.onCall(async (data, context) => {
    await withAuthentication(context, () => container.resolve(WorkController).create(data));
  }),
  update: functions.region(FIREBASE_REGION).https.onCall(async (data, context) => {
    await withAuthentication(context, () => container.resolve(WorkController).update(data));
  }),
  onUpdate: functions
    .region(FIREBASE_REGION)
    .firestore.document("works/{id}")
    .onUpdate(async (change) => {
      await container.resolve(WorkController).onUpdate(change);
    }),
  deleteById: functions.region(FIREBASE_REGION).https.onCall(async (data, context) => {
    await withAuthentication(context, () => container.resolve(WorkController).deleteById(data));
  }),
  onDelete: functions
    .region(FIREBASE_REGION)
    .firestore.document("works/{id}")
    .onDelete(async (snapshot) => {
      await container.resolve(WorkController).onDelete(snapshot);
    }),
};

export const adminUsers = {
  onCreate: functions
    .region(FIREBASE_REGION)
    .firestore.document("admin_users/{id}")
    .onCreate(async (snapshot) => {
      const adminUser = snapshot.data();
      if (adminUser) {
        await admin.auth().setCustomUserClaims(adminUser.uid, { admin: true });
      }
    }),
  onDelete: functions
    .region(FIREBASE_REGION)
    .firestore.document("admin_users/{id}")
    .onDelete(async (snapshot) => {
      const adminUser = snapshot.data();
      if (adminUser) {
        await admin.auth().setCustomUserClaims(adminUser.uid, { admin: false });
      }
    }),
};

export const storage = {
  onUploadFile: functions
    .runWith({ memory: UPLOAD_FILE_FUNCTION_MEMORY_AMOUNT })
    .region(FIREBASE_REGION)
    .storage.object()
    .onFinalize(async (object) => {
      if (object.name?.match(/topImages\/(.+?)\/image\/(.+)/g)) {
        await container.resolve(TopImageController).onUploadImageFile(object);
      } else if (object.name?.match(/topImages\/(.+?)\/thumbnailImage\/(.+)/g)) {
        await container.resolve(TopImageController).onUploadThumbnailImageFile(object);
      } else if (object.name?.match(/arts\/(.+?)\/images\/(.+)/g)) {
        await container.resolve(ArtController).onUploadImageFile(object);
      } else if (object.name?.match(/works\/(.+?)\/images\/(.+)/g)) {
        await container.resolve(WorkController).onUploadImageFile(object);
      }
    }),
};
