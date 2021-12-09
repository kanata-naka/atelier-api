import "reflect-metadata";
import * as config from "config";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { SUPPORTED_REGIONS } from "firebase-functions/lib/function-configuration";
import { HttpsError } from "firebase-functions/lib/providers/https";
import { container } from "tsyringe";
import TopImageController from "./controllers/TopImageController";
import BlogController from "./controllers/BlogController";
import TagInfoController from "./controllers/TagInfoController";
import ArtController from "./controllers/ArtController";
import WorkController from "./controllers/WorkController";

// Firebase Admin SDK を初期化する
admin.initializeApp({
  credential: admin.credential.cert(config.get("firebase.serviceAccount")),
  databaseURL: config.get("firebase.databaseURL"),
  storageBucket: config.get("firebase.storageBucket"),
});

const region: typeof SUPPORTED_REGIONS[number] = config.get("firebase.region");

/**
 * 管理者権限を持っているかを判定する
 * @param context
 * @returns
 */
const hasAdminUserClaim = async (context: functions.https.CallableContext) => {
  if (!context.auth) {
    return false;
  }
  const user = await admin.auth().getUser(context.auth.uid);
  return user.customClaims && (user.customClaims as { admin: boolean }).admin;
};

export const topImages = {
  get: functions.region(region).https.onCall(async () => {
    return await container.resolve(TopImageController).get();
  }),
  getById: functions.region(region).https.onCall(async (data) => {
    return await container.resolve(TopImageController).getById(data);
  }),
  create: functions.region(region).https.onCall(async (data, context) => {
    if (!(await hasAdminUserClaim(context))) {
      throw new HttpsError("unauthenticated", "");
    }
    await container.resolve(TopImageController).create(data);
  }),
  bulkUpdate: functions.region(region).https.onCall(async (data, context) => {
    if (!(await hasAdminUserClaim(context))) {
      throw new HttpsError("unauthenticated", "");
    }
    await container.resolve(TopImageController).bulkUpdate(data);
  }),
  onUpdate: functions
    .region(region)
    .firestore.document("topImages/{id}")
    .onUpdate(async (change) => {
      await container.resolve(TopImageController).onUpdate(change);
    }),
  deleteById: functions.region(region).https.onCall(async (data, context) => {
    if (!(await hasAdminUserClaim(context))) {
      throw new HttpsError("unauthenticated", "");
    }
    await container.resolve(TopImageController).deleteById(data);
  }),
  onDelete: functions
    .region(region)
    .firestore.document("topImages/{id}")
    .onDelete(async (snapshot) => {
      await container.resolve(TopImageController).onDelete(snapshot);
    }),
};

export const blog = {
  getArticles: functions.region(region).https.onCall(async (data) => {
    return await container.resolve(BlogController).getArticles(data);
  }),
};

export const tagInfo = {
  getById: functions.region(region).https.onCall(async (data) => {
    return await container.resolve(TagInfoController).getById(data);
  }),
};

export const arts = {
  get: functions.region(region).https.onCall(async (data) => {
    return await container.resolve(ArtController).get(data);
  }),
  getById: functions.region(region).https.onCall(async (data) => {
    return await container.resolve(ArtController).getById(data);
  }),
  create: functions.region(region).https.onCall(async (data, context) => {
    if (!(await hasAdminUserClaim(context))) {
      throw new HttpsError("unauthenticated", "");
    }
    await container.resolve(ArtController).create(data);
  }),
  update: functions.region(region).https.onCall(async (data, context) => {
    if (!(await hasAdminUserClaim(context))) {
      throw new HttpsError("unauthenticated", "");
    }
    await container.resolve(ArtController).update(data);
  }),
  onUpdate: functions
    .region(region)
    .firestore.document("arts/{id}")
    .onUpdate(async (change) => {
      await container.resolve(ArtController).onUpdate(change);
    }),
  deleteById: functions.region(region).https.onCall(async (data, context) => {
    if (!(await hasAdminUserClaim(context))) {
      throw new HttpsError("unauthenticated", "");
    }
    await container.resolve(ArtController).deleteById(data);
  }),
  onDelete: functions
    .region(region)
    .firestore.document("arts/{id}")
    .onDelete(async (snapshot) => {
      await container.resolve(ArtController).onDelete(snapshot);
    }),
};

export const works = {
  get: functions.region(region).https.onCall(async (data) => {
    return await container.resolve(WorkController).get(data);
  }),
  getById: functions.region(region).https.onCall(async (data) => {
    return await container.resolve(WorkController).getById(data);
  }),
  create: functions.region(region).https.onCall(async (data, context) => {
    if (!(await hasAdminUserClaim(context))) {
      throw new HttpsError("unauthenticated", "");
    }
    await container.resolve(WorkController).create(data);
  }),
  update: functions.region(region).https.onCall(async (data, context) => {
    if (!(await hasAdminUserClaim(context))) {
      throw new HttpsError("unauthenticated", "");
    }
    await container.resolve(WorkController).update(data);
  }),
  onUpdate: functions
    .region(region)
    .firestore.document("works/{id}")
    .onUpdate(async (change) => {
      await container.resolve(WorkController).onUpdate(change);
    }),
  deleteById: functions.region(region).https.onCall(async (data, context) => {
    if (!(await hasAdminUserClaim(context))) {
      throw new HttpsError("unauthenticated", "");
    }
    await container.resolve(WorkController).deleteById(data);
  }),
  onDelete: functions
    .region(region)
    .firestore.document("works/{id}")
    .onDelete(async (snapshot) => {
      await container.resolve(WorkController).onDelete(snapshot);
    }),
};

export const adminUsers = {
  onCreate: functions
    .region(region)
    .firestore.document("admin_users/{id}")
    .onCreate(async (snapshot) => {
      const adminUser = snapshot.data();
      if (adminUser) {
        await admin.auth().setCustomUserClaims(adminUser.uid, { admin: true });
      }
    }),
  onDelete: functions
    .region(region)
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
    .runWith({ memory: "512MB" })
    .region(region)
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
