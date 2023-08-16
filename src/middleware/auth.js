import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).send({ error: "Access denied. No token provided." });

  try {
    const payload = jwt.verify(token, "jwtPrivateKey"); // TODO remove and add real key
    req.user = payload;
    return next();
  } catch (err) {
    return next(err)
  }
};

export default auth;