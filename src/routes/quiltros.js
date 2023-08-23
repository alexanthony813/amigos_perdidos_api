import express from "express";
import { Quiltro, User, RequestedItem } from "../models/index.js";
import PDFDocument from "pdfkit";
import { s3, bucketName } from "../index.js";
import fs from "fs";
import fetch from 'node-fetch'

const quiltrosRouter = express.Router();
const appUrl = "https://quiltro-44098.web.app";

// this should prob be it's own router before merge
const generatePDF = () => {
  // Create a document
  const doc = new PDFDocument();

  // Pipe it's output somewhere, like to a file or HTTP response
  doc.pipe(fs.createWriteStream("output.pdf"));
  doc.text("Whatever content goes here");
  console.dir(s3);
  return doc
};

quiltrosRouter.get("/quiltros/:quiltroId/pdf", async (req, res) => {
  try {
    const { quiltroId } = req.params;
    const quiltro = await Quiltro.findOne({ quiltroId });
    if (!quiltro) {
      return res.status(404).send();
    }
    const url = quiltro.photoUrl;
    let pdf = await generatePDF();

    const imageParams = {
      Key: "222991e199944b316717886fffa4f65e.jpg",
      Bucket: bucketName
    }
    const data = await s3.getObject(imageParams).promise() // TODO use this everywhere!!
    const img = Buffer.from(data.Body)
    pdf.image(img, 100, 100);
    // res.end(null, "binary");
    pdf.end()
    s3.getObject(imageParams, function (err, data) {
      // res.writeHead(200, { "Content-Type": "image/jpeg" });
      // pdf.addContent(data.Body, "base64");
      // pdf.image(data.Body.buffer.toString('base64'));


      var uploadParams = {
        Key: `${quiltroId}.pdf`,
        Body: pdf,
        Bucket: bucketName,
        ContentType: "application/pdf",
      };
      s3.upload(uploadParams, function (err, response) {
        console.dir(response);
      });
    });
    // const rawBase64 = imageUpload.base64
    // var buffer = Buffer.from(
    //   rawBase64.replace(/^data:image\/\w+;base64,/, ''),
    //   'base64'
    // )
    // const s3Result = await fetch(presignedUrl, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'image/jpeg',
    //     'Access-Control-Allow-Origin': '*',
    //     'Content-Encoding': 'base64',
    //   },
    //   body: buffer,
    // })

    //   var qrcode = QRCode.to("qrcode", {
    //     text: fullQRCodeUrl,
    //     width: 200,
    //     height: 200,
    //     colorDark : "#000000",
    //     colorLight : "#ffffff",
    //     // correctLevel : QRCode.CorrectLevel.H
    // });
    res.status(201).json(pdf);
  } catch (err) {
    console.dir(err);
    res.status(500).json(err);
  }
});

quiltrosRouter.post("/twilio-webhook", async (req, res) => {
  console.log("dirrr");
});

quiltrosRouter.post("/users", async (req, res) => {
  try {
    const newUserJson = await req.body;
    const { uid } = newUserJson;
    newUserJson.isAdmin =
      !newUserJson.isAnonymous && newUserJson.phoneNumber ? true : false;
    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      // not going to throw 409 because of flow with anon auth this is streamlined
      return res.status(201).json(existingUser);
    }
    const user = new User({ ...newUserJson, joinedOn: new Date() });
    await user.save();
    return res.status(201).json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
});

quiltrosRouter.patch("/users/:uid", async (req, res) => {
  try {
    const { uid } = await req.params;
    const updatedUserJson = await req.body;
    const existingUser = await User.findOne({ uid });
    if (!existingUser) {
      // not going to throw 409 because of flow with anon auth this is streamlined
      return res.status(404).send();
    }

    Object.assign(existingUser, updatedUserJson);
    await existingUser.save();
    return res.status(201).json(existingUser);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// subscribe user
quiltrosRouter.patch("/users/:uid/quiltros/:quiltroId", async (req, res) => {
  try {
    const { uid, quiltroId } = req.params;
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(400).send({ error: "Could not find user." });
    }
    user.quiltroIds = !user.quiltroIds
      ? [quiltroId]
      : user.quiltroIds.slice().concat([quiltroId]);
    await user.save();
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
});

quiltrosRouter.post(
  "/quiltros/:quiltroId/requested-items",
  async (req, res) => {
    try {
      const { quiltroId } = req.params;
      const quiltro = await Quiltro.findOne({ quiltroId });
      if (!quiltro) {
        return res.status(404).send();
      }
      const requestedItemsJson = req.body;
      const newRequestedItems = requestedItemsJson.map((item) => {
        const newRequestedItem = new RequestedItem(item);
        newRequestedItem.amountRaised = "0.00";
        newRequestedItem.quiltroId = quiltroId;
        newRequestedItem.save();
        return newRequestedItem;
      });
      return res.status(201).json(newRequestedItems);
    } catch (err) {
      return res.status(500).json(err);
    }
  }
);

quiltrosRouter.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (err) {
    return res.status(500).json(err);
  }
});

quiltrosRouter.post("/quiltros", async (req, res) => {
  try {
    const newQuiltroJson = await req.body;
    const { uid } = newQuiltroJson;
    const newQuiltro = new Quiltro(newQuiltroJson);
    newQuiltro.quiltroId = newQuiltro._id.toString();
    await newQuiltro.save();
    const user = await User.findOne({ uid });
    user.quiltroIds = !user.quiltroIds // TODO LET's USE POSTGRES THIS IS TOO MUCH, need join table
      ? [newQuiltro.quiltroId]
      : user.quiltroIds.slice().concat([newQuiltro.quiltroId]);
    await user.save();
    return res.status(201).json(newQuiltro);
  } catch (err) {
    return res.status(500).json(err);
  }
});

quiltrosRouter.get("/users/:uid/quiltros", async (req, res) => {
  const { uid } = req.params;
  if (!uid) {
    return res.status(400).send();
  }

  try {
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).send();
    }
    const { quiltroIds } = user;
    const quiltros = await Quiltro.find({ quiltroId: { $in: quiltroIds } });
    return res.json(quiltros.reverse());
  } catch (err) {
    return res.status(500).json(err);
  }
});

quiltrosRouter.get("/quiltros", async (req, res) => {
  try {
    const quiltros = await Quiltro.find();
    return res.json(quiltros.reverse());
  } catch (err) {
    res.status(500).json(err);
  }
});

quiltrosRouter.get("/quiltros/:quiltroId", async (req, res) => {
  const { quiltroId } = req.params;
  if (!quiltroId) {
    return res.status(400).send();
  }
  try {
    const quiltro = await Quiltro.findOne({ quiltroId });
    if (!quiltro) {
      return res.status(404).send();
    }
    const requestedItems = await RequestedItem.find({ quiltroId });
    quiltro.requestedItems = requestedItems;
    return res.json(quiltro);
  } catch (err) {
    return res.status(500).json(err);
  }
});

export default quiltrosRouter;
