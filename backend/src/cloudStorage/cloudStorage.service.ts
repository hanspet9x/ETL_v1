import { Injectable } from "@nestjs/common";
import { ContainerClient } from "@azure/storage-blob";
import { IntegrationFileExtension, IntegrationSource } from "generated/prisma/client";

@Injectable()
export class CloudStorageService {

    mapping: Record<IntegrationFileExtension, string> = {
        [IntegrationFileExtension.XLSX]: '.xlsx',
        [IntegrationFileExtension.XLS]: '.xls',
        [IntegrationFileExtension.JSON]: '.json',
    }
    async getObject({ source, sourceUrl, sourceToken, sourceFileExtension, etag, lastModified, contentLength }:
        { source: IntegrationSource, sourceUrl: string, sourceToken: string, sourceFileExtension: IntegrationFileExtension, etag: string, lastModified: Date, contentLength: number }) {
        switch (source) {
            case IntegrationSource.AZURE:
                const url = `${sourceUrl}${sourceToken}`;
                return this.getAzureFile({ url, extension: sourceFileExtension, etag, lastModified, contentLength });
            default:
                throw new Error('Source not supported yet');

        }
    }

    async getAzureFile({ url, extension, etag, lastModified, contentLength }: { url: string, extension: IntegrationFileExtension, etag: string, lastModified: Date, contentLength: number }) {
        const containerClient = new ContainerClient(url);
        // get a list of blobs in the container
        const ext = this.mapping[extension];
        for await (const blob of containerClient.listBlobsFlat()) {
            if (!blob.name.endsWith(ext)) continue;
            // get the blob client
            const blobClient = containerClient.getBlobClient(blob.name);
            // get the blob properties
            const blobProperties = await blobClient.getProperties();
            console.log('blobProperties.etag', blobProperties.etag, 'etag', etag);
            console.log('blobProperties.lastModified', blobProperties.lastModified, 'lastModified', lastModified);
            console.log('blobProperties.contentLength', blobProperties.contentLength, 'contentLength', contentLength);
            // check if the blob properties match the etag and last modified
            if (
                (!etag || !lastModified || !contentLength) ||
                (!blobProperties.etag || !blobProperties.lastModified || !blobProperties.contentLength) ||
                (blobProperties.etag !== etag ||
                    (blobProperties.lastModified > lastModified) ||
                    (blobProperties.contentLength !== contentLength))) {
                //download the blob
                const blobDownloadStream = await blobClient.download();
                // read the blob
                const chunks: Buffer[] = [];
                if (blobDownloadStream.readableStreamBody) {
                    for await (const chunk of blobDownloadStream.readableStreamBody) {
                        chunks.push(chunk as Buffer);
                    }
                    return Buffer.concat(chunks);
                }
            }
        }
        return null;
    }
}
