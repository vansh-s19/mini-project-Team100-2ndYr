# REST API Endpoints

The Node.js backend exposes several REST API endpoints used heavily by the frontend for off-chain processing.

### `POST /ocr/extract`
* **Purpose**: Accepts a PDF or image of a land registry document and extracts property details using Tesseract OCR.
* **Payload**: `multipart/form-data` with `file` field.
* **Response**:
```json
{
  "ownerName": "John Doe",
  "plotNumber": "A-123",
  "registryId": "REG-98765",
  "area": "1500 sqft",
  "address": "123 Main St, Springfield",
  "date": "2023-01-15"
}
```

### `POST /ipfs/upload`
* **Purpose**: Uploads the user's document to IPFS via Pinata. Returns an IPFS Content Identifier (CID).
* **Payload**: `multipart/form-data` with `file` field.
* **Response**:
```json
{
  "ipfsHash": "QmYourIpfsHashHere..."
}
```

### `GET /properties`
* **Purpose**: Fetches the formatted list of all properties registered in the system.

### `GET /property/:id`
* **Purpose**: Fetches details for a specific property ID.
