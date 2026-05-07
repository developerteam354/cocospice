import { S3Client } from '@aws-sdk/client-s3';

// Lazy singleton — initialized on first use, after dotenv has loaded
let _client: S3Client | null = null;

export const getS3Client = (): S3Client => {
  if (_client) return _client;

  const region          = process.env.AWS_REGION;
  const accessKeyId     = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error(
      `Missing AWS credentials — AWS_REGION=${region}, ` +
      `AWS_ACCESS_KEY_ID=${accessKeyId ? '✓' : '✗'}, ` +
      `AWS_SECRET_ACCESS_KEY=${secretAccessKey ? '✓' : '✗'}`
    );
  }

  _client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });

  return _client;
};

export const getS3Bucket = (): string => {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) throw new Error('Missing AWS_S3_BUCKET env variable');
  return bucket;
};
