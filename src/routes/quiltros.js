import express from "express";
import { Quiltro, User, RequestedItem } from "../models/index.js";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import { subscribeUserToQuiltro } from "../utils/index.js";

const quiltrosRouter = express.Router();
const appUrl = "https://quiltro-44098.web.app";
async function generateQRCodeDataUrl(qrData) {
  try {
    const qrDataURL = await QRCode.toDataURL(qrData);
    return qrDataURL;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
}

quiltrosRouter.get("/quiltros/:quiltroId/flyer", async (req, res, next) => {
  try {
    const { quiltroId } = req.params;
    const quiltro = await Quiltro.findOne({ quiltroId });
    if (!quiltro) {
      return res.status(404).send();
    }
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const relativePath = "./routes/sample.html";
    const fullPath = path.resolve(relativePath);
    const html = fs.readFileSync(fullPath, "utf-8");
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const qrDataURL = await generateQRCodeDataUrl(
      `${appUrl}/${quiltro.quiltroId}`
    );
    await page.evaluate(
      ({ quiltro, qrDataURL }) => {
        document.getElementById(
          "quiltroName"
        ).innerHTML = `¡Hola! Soy ${quiltro.name}`;
        const imgElement = document.querySelector("#profileImage");
        if (imgElement) {
          imgElement.src = quiltro.photoUrl;
        }
        const qrcodeContainer = document.querySelector("#qrcode-container");
        const qrImage = document.createElement("img");
        qrImage.src = qrDataURL;
        qrImage.height = 300;
        qrImage.width = 300;
        qrcodeContainer.appendChild(qrImage);
      },
      { quiltro, qrDataURL }
    );
    await page.waitForSelector(`[src="${quiltro.photoUrl}"]`);
    await page.waitForTimeout(3000); // this is so annoying but no clean wait for image loaded
    const pdf = await page.pdf({
      margin: { top: "100px", right: "50px", bottom: "100px", left: "50px" },
      printBackground: true,
      format: "A4",
    });
    await page.close();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=result.pdf");
    res.send(pdf);
  } catch (error) {
    return next(error);
  }
});

quiltrosRouter.post("/users", async (req, res, next) => {
  try {
    const newUserJson = await req.body;
    const { uid } = newUserJson;
    // TODO clean up duck typing here, requires front end work
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
  } catch (error) {
    return next(error);
  }
});

quiltrosRouter.patch("/users/:uid", async (req, res, next) => {
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
  } catch (error) {
    return next(error);
  }
});

// subscribe user
quiltrosRouter.patch(
  "/users/:uid/quiltros/:quiltroId",
  async (req, res, next) => {
    try {
      const { uid, quiltroId } = req.params;
      const user = await User.findOne({ uid });
      if (!user) {
        return res.status(400).send({ error: "Could not find user." });
      }
      await subscribeUserToQuiltro(user, quiltroId);
      return res.status(200).json(user);
    } catch (error) {
      return next(error);
    }
  }
);

quiltrosRouter.post(
  "/quiltros/:quiltroId/requested-items",
  async (req, res, next) => {
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
    } catch (error) {
      return next(error);
    }
  }
);

quiltrosRouter.get("/users", async (req, res, next) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (error) {
    return next(error);
  }
});

quiltrosRouter.post("/quiltros", async (req, res, next) => {
  try {
    const newQuiltroJson = await req.body;
    const { uid } = newQuiltroJson;
    const newQuiltro = new Quiltro(newQuiltroJson);
    newQuiltro.quiltroId = newQuiltro._id.toString();
    await newQuiltro.save();
    const user = await User.findOne({ uid });
    await subscribeUserToQuiltro(user, newQuiltro.quiltroId);
    return res.status(201).json(newQuiltro);
  } catch (error) {
    return next(error);
  }
});

quiltrosRouter.get("/users/:uid/quiltros", async (req, res, next) => {
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
  } catch (error) {
    return next(error);
  }
});

quiltrosRouter.get("/quiltros", async (req, res, next) => {
  try {
    const quiltros = await Quiltro.find();
    return res.json(quiltros.reverse());
  } catch (error) {
    return next(error);
  }
});

quiltrosRouter.get("/quiltros/:quiltroId", async (req, res, next) => {
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
  } catch (error) {
    return next(error);
  }
});

export default quiltrosRouter;
