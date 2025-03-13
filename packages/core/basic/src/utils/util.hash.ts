import crypto, { BinaryToTextEncoding } from 'crypto';

function md5(data: string, digest: BinaryToTextEncoding = 'hex') {
  return crypto.createHash('md5').update(data).digest(digest);
}
function sha256(data: string, digest: BinaryToTextEncoding = 'hex') {
  return crypto.createHash('sha256').update(data).digest(digest);
}

function HmacSha256(data: string, key: string, digest: BinaryToTextEncoding = 'base64') {
  return crypto.createHmac('sha256', Buffer.from(key, 'base64')).update(data).digest(digest);
}

function base64(data: string) {
  return Buffer.from(data).toString('base64');
}
export const hashUtils = {
  md5,
  sha256,
  base64,
  HmacSha256,
};
