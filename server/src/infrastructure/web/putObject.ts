import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

exports.putObject = async (file: Buffer | Uint8Array | Blob | string, fileName: string) => {
   try {
     const params = {
         Bucket: process.env.AWS_S3_BUCKET_NAME,
         Key: fileName,
         Body: file,
         ContentType: "image/jpeg",
     }

     const s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
        accessKeyId: process.env.AWS_SECRET_kEY!,
        secretAccessKey: process.env.AWS_ACCESS_KEY!,
    },
     });
     const command = new PutObjectCommand(params);
     const data  = await s3Client.send(command);

     if( data.$metadata.httpStatusCode !== 200) {
         return;
     }

     let url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
     console.log("File uploaded successfully to S3:", url);
     return {url, key : params.Key};
   } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error("Failed to upload file to S3");
   }
}