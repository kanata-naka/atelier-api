import "reflect-metadata";
import * as config from "config";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { SUPPORTED_REGIONS } from "firebase-functions/lib/function-configuration";
import { container } from "tsyringe";
import TagInfoController from "./controllers/TagInfoController";
import ArtController from "./controllers/ArtController";
import WorkController from "./controllers/WorkController";
import TopImageController from "./controllers/TopImageController";
import BlogController from "./controllers/BlogController";

// Firebase Admin SDK を初期化する
admin.initializeApp({
  credential: admin.credential.cert(config.get("firebase.serviceAccount")),
  databaseURL: config.get("firebase.databaseURL"),
  storageBucket: config.get("firebase.storageBucket"),
});

/** リージョン */
const region: typeof SUPPORTED_REGIONS[number] = config.get("firebase.region");

// api
export const api = {
  topImages: (() => {
    const topImageController = container.resolve(TopImageController);
    return {
      get: functions.region(region).https.onCall(async () => {
        return await topImageController.get();
      }),
      getById: functions.region(region).https.onCall(async (data) => {
        return await topImageController.getById(data);
      }),
      create: functions.region(region).https.onCall(async (data) => {
        return await topImageController.create(data);
      }),
      bulkUpdate: functions.region(region).https.onCall(async (data) => {
        return await topImageController.bulkUpdate(data);
      }),
      deleteById: functions.region(region).https.onCall(async (data) => {
        return await topImageController.deleteById(data);
      }),
    };
  })(),
  blog: (() => {
    const blogController = container.resolve(BlogController);
    return {
      getArticles: functions.region(region).https.onCall(async (data) => {
        return await blogController.getArticles(data);
      }),
    };
  })(),
  tagInfo: (() => {
    const tagInfoController = container.resolve(TagInfoController);
    return {
      getById: functions.region(region).https.onCall(async (data) => {
        return await tagInfoController.getById(data);
      }),
    };
  })(),
  arts: (() => {
    const artController = container.resolve(ArtController);
    return {
      get: functions.region(region).https.onCall(async (data) => {
        return await artController.get(data);
      }),
      getById: functions.region(region).https.onCall(async (data) => {
        return await artController.getById(data);
      }),
      create: functions.region(region).https.onCall(async (data) => {
        return await artController.create(data);
      }),
      update: functions.region(region).https.onCall(async (data) => {
        return await artController.update(data);
      }),
      deleteById: functions.region(region).https.onCall(async (data) => {
        return await artController.deleteById(data);
      }),
    };
  })(),
  works: (() => {
    const workController = container.resolve(WorkController);
    return {
      get: functions.region(region).https.onCall(async (data) => {
        return await workController.get(data);
      }),
      getById: functions.region(region).https.onCall(async (data) => {
        return await workController.getById(data);
      }),
    };
  })(),
};
