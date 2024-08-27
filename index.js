const { BedrockClient, CreateKnowledgeBaseCommand } = require("@aws-sdk/client-bedrock");
const AWS = require("aws-sdk");

const s3 = new AWS.S3();  // You can use the built-in aws-sdk v2 for S3 if needed
const bedrockClient = new BedrockClient();

exports.handler = async function (event, context) {
    const bucketName = process.env.BUCKET_NAME;

    try {
        const listParams = {
            Bucket: bucketName,
        };

        const s3Objects = await s3.listObjectsV2(listParams).promise();
        const documentPaths = s3Objects.Contents.map(obj => `s3://${bucketName}/${obj.Key}`);

        const createKnowledgeBaseParams = {
            KnowledgeBaseName: "MyKnowledgeBase",
            SourceUris: documentPaths,
            // Additional parameters as needed
        };

        const command = new CreateKnowledgeBaseCommand(createKnowledgeBaseParams);
        const response = await bedrockClient.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                KnowledgeBaseId: response.KnowledgeBaseId,
            }),
        };
    } catch (error) {
        console.error("Error creating knowledge base:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to create knowledge base",
                error: error.message,
            }),
        };
    }
};
