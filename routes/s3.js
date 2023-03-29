const dotenv = require("dotenv");
const aws = require("aws-sdk");
// TODO import { S3Client, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/index.html
const express = require("express");
const crypto = require("crypto");

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
  signatureVersion: 'v4'
});

// Expires value is very high but who knows if someone on bad network uploading a picture...TODO revisit and decrease? not a huge security concern
async function generatePresignedUrl() {
  const rawBytes = await crypto.randomBytes(16)
  const imageName = rawBytes.toString('hex');
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
  res.send({ url });
});

module.exports = s3Route;
