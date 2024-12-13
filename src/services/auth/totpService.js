import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export const generateTOTP = async () => {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(
    'user@example.com',
    'School Management System',
    secret
  );

  const qrCode = await QRCode.toDataURL(otpauth);

  return {
    base32: secret,
    qrCode
  };
};

export const verifyTOTP = async (secret, token) => {
  return authenticator.verify({
    token,
    secret
  });
};