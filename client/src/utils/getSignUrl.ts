import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: import.meta.env.VITE_AWS_REGION!,
    credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY!,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_KEY!,
    },
});


export const generateSignedUrl = async (fileKey: string): Promise<string> => {
    const command = new GetObjectCommand({
        Bucket: import.meta.env.VITE_AWS_BUCKET_NAME!,
        Key: fileKey,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 86400 }); // 24 hours

    return url;
};
