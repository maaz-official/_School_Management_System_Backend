import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET; // Ensure you have this environment variable set

export const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
}; 