import dotenv from "dotenv";
import aws from "aws-sdk";
import express from "express";
import crypto from "crypto";

dotenv.config();

const s3Route = express.Router();

const region = "sa-east-1";
const bucketName = "amigosperdidos";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new aws.S3({
  region,
  bucketName,
  accessKeyId,
  secretAccessKey,
  signatureVersion: "v4",
});

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
