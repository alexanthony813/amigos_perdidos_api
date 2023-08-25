import dotenv from "dotenv";
import express from "express";
import crypto from "crypto";
import { s3, bucketName } from "../index.js";

dotenv.config();

const s3Route = express.Router();

async function generatePresignedUrl() {
  const rawBytes = await crypto.randomBytes(16);
  const imageName = `${rawBytes.toString("hex")}.jpg`;
  const params = {
    Bucket: bucketName,
    Key: imageName,
    Expires: 600,
  };

  const presignedUrl = await s3.getSignedUrlPromise("putObject", params);
  return presignedUrl;
}

s3Route.get("/", async (req, res) => {
  const url = await generatePresignedUrl();
  return res.send({ url });
});

export default s3Route;
