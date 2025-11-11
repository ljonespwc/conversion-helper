# Gemini File Search Integration Guide

## Overview

The Gemini API enables Retrieval Augmented Generation (RAG) through the **File Search** tool. File Search imports, chunks, and indexes your data to enable fast retrieval of relevant information based on a user's prompt. This information is then provided as context to the model, allowing the model to provide more accurate and relevant answers.

## How It Works

File Search uses **semantic search** to find information relevant to the user prompt. Unlike traditional keyword-based search, semantic search understands the meaning and context of your query.

### Process Flow

1. **Create a file search store**: A file search store contains the processed data from your files. It's the persistent container for the embeddings that the semantic search will operate on.

2. **Upload and import files**: Files are uploaded and imported into your file search store. The data is chunked, converted into embeddings using `gemini-embedding-001`, and indexed.

3. **Query with File Search**: Use the `FileSearch` tool in a `generateContent` call. The model performs a semantic search on the specified file search store to find relevant information to ground its response.

## Implementation Methods

There are two ways to add files to your file search store:

### Method 1: Direct Upload (Recommended)

Directly upload a file to your file search store in one step:

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function uploadAndQuery() {
  // Create the file search store with an optional display name
  const fileSearchStore = await ai.fileSearchStores.create({
    config: { displayName: 'conversion-helper-knowledge-base' }
  });

  // Upload and import a file into the file search store
  let operation = await ai.fileSearchStores.uploadToFileSearchStore({
    file: 'path/to/your/file.txt',
    fileSearchStoreName: fileSearchStore.name,
    config: {
      displayName: 'my-document-name',
    }
  });

  // Wait until import is complete
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.get({ operation });
  }

  // Ask a question about the file
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "What information is in this document?",
    config: {
      tools: [
        {
          fileSearch: {
            fileSearchStoreNames: [fileSearchStore.name]
          }
        }
      ]
    }
  });

  console.log(response.text);
}

uploadAndQuery();
```

### Method 2: Upload Then Import

Upload an existing file and then import it to your file store (useful if you want to reuse the same file across multiple stores):

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function uploadThenImport() {
  // Upload the file using the Files API
  const sampleFile = await ai.files.upload({
    file: 'path/to/your/file.txt',
    config: { name: 'my-document' }
  });

  // Create the file search store
  const fileSearchStore = await ai.fileSearchStores.create({
    config: { displayName: 'conversion-helper-knowledge-base' }
  });

  // Import the file into the file search store
  let operation = await ai.fileSearchStores.importFile({
    fileSearchStoreName: fileSearchStore.name,
    fileName: sampleFile.name
  });

  // Wait until import is complete
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.get({ operation: operation });
  }

  // Ask a question about the file
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "What information is in this document?",
    config: {
      tools: [
        {
          fileSearch: {
            fileSearchStoreNames: [fileSearchStore.name]
          }
        }
      ]
    }
  });

  console.log(response.text);
}

uploadThenImport();
```

## Custom Chunking Configuration

Control how documents are split into chunks for better search relevance:

```typescript
// Upload with custom chunking configuration
let operation = await ai.fileSearchStores.uploadToFileSearchStore({
  file: 'path/to/your/file.txt',
  fileSearchStoreName: fileSearchStore.name,
  config: {
    displayName: 'my-document',
    chunkingConfig: {
      whiteSpaceConfig: {
        maxTokensPerChunk: 200,    // Maximum tokens per chunk
        maxOverlapTokens: 20        // Overlap between chunks
      }
    }
  }
});
```

## Managing File Search Stores

```typescript
// Create a file search store
const fileSearchStore = await ai.fileSearchStores.create({
  config: { displayName: 'my-knowledge-base' }
});

// List all your file search stores
const fileSearchStores = await ai.fileSearchStores.list();
for await (const store of fileSearchStores) {
  console.log(store);
}

// Get a specific file search store by name
const myFileSearchStore = await ai.fileSearchStores.get({
  name: 'fileSearchStores/my-knowledge-base'
});

// Delete a file search store
await ai.fileSearchStores.delete({
  name: 'fileSearchStores/my-knowledge-base',
  config: { force: true }
});
```

## File Metadata

Add custom metadata to files for filtering and context:

```typescript
// Import file with custom metadata
let operation = await ai.fileSearchStores.importFile({
  fileSearchStoreName: fileSearchStore.name,
  fileName: sampleFile.name,
  config: {
    customMetadata: [
      { key: "category", stringValue: "conversion-tips" },
      { key: "priority", numericValue: 1 },
      { key: "author", stringValue: "Marketing Team" }
    ]
  }
});
```

### Filtering by Metadata

Search only within documents matching specific metadata:

```typescript
// Use metadata filter to search within a subset of documents
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: "What are the best conversion tips?",
  config: {
    tools: [
      {
        fileSearch: {
          fileSearchStoreNames: [fileSearchStore.name],
          metadataFilter: 'category="conversion-tips"',  // Filter by metadata
        }
      }
    ]
  }
});

console.log(response.text);
```

**Metadata filter syntax follows [google.aip.dev/160](https://google.aip.dev/160) list filter standard.**

## Citations

Access citation information to see which documents were used:

```typescript
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: "What are the conversion strategies?",
  config: {
    tools: [
      {
        fileSearch: {
          fileSearchStoreNames: [fileSearchStore.name]
        }
      }
    ]
  }
});

// Access grounding metadata with citations
console.log(JSON.stringify(response.candidates?.[0]?.groundingMetadata, null, 2));
```

## Integration with Our Stack

### Next.js API Route Example

```typescript
// src/app/api/knowledge-search/route.ts
import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const { question, storeNames } = await request.json();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: question,
      config: {
        tools: [
          {
            fileSearch: {
              fileSearchStoreNames: storeNames
            }
          }
        ]
      }
    });

    return NextResponse.json({
      answer: response.text,
      citations: response.candidates?.[0]?.groundingMetadata
    });
  } catch (error) {
    console.error('Knowledge search error:', error);
    return NextResponse.json(
      { error: 'Failed to search knowledge base' },
      { status: 500 }
    );
  }
}
```

### Library Helper Function

```typescript
// src/lib/gemini-file-search.ts
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

export interface UploadConfig {
  filePath: string;
  displayName?: string;
  metadata?: Array<{ key: string; stringValue?: string; numericValue?: number }>;
  chunkingConfig?: {
    maxTokensPerChunk?: number;
    maxOverlapTokens?: number;
  };
}

export async function createKnowledgeBase(name: string) {
  return await ai.fileSearchStores.create({
    config: { displayName: name }
  });
}

export async function uploadDocument(
  storeId: string,
  config: UploadConfig
) {
  const operation = await ai.fileSearchStores.uploadToFileSearchStore({
    file: config.filePath,
    fileSearchStoreName: storeId,
    config: {
      displayName: config.displayName,
      customMetadata: config.metadata,
      chunkingConfig: config.chunkingConfig ? {
        whiteSpaceConfig: {
          maxTokensPerChunk: config.chunkingConfig.maxTokensPerChunk || 200,
          maxOverlapTokens: config.chunkingConfig.maxOverlapTokens || 20
        }
      } : undefined
    }
  });

  // Wait for completion
  let result = operation;
  while (!result.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    result = await ai.operations.get({ operation: result });
  }

  return result;
}

export async function searchKnowledge(
  question: string,
  storeNames: string[],
  metadataFilter?: string
) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: question,
    config: {
      tools: [
        {
          fileSearch: {
            fileSearchStoreNames: storeNames,
            metadataFilter
          }
        }
      ]
    }
  });

  return {
    answer: response.text,
    citations: response.candidates?.[0]?.groundingMetadata
  };
}
```

## Supported Models

- `gemini-2.5-pro`
- `gemini-2.5-flash` (recommended for speed)

## Supported File Types

### Application Files
- PDF (`application/pdf`)
- Microsoft Word (`.doc`, `.docx`)
- Microsoft Excel (`.xls`, `.xlsx`)
- Microsoft PowerPoint (`.ppt`, `.pptx`)
- JSON (`application/json`)
- TypeScript/JavaScript files
- And many more (see full list in original docs)

### Text Files
- Plain text (`.txt`)
- Markdown (`.md`)
- HTML (`.html`)
- CSV (`.csv`)
- Code files (`.ts`, `.js`, `.jsx`, `.tsx`, `.py`, `.java`, etc.)
- And many more (see full list in original docs)

## Rate Limits

- **Maximum file size**: 100 MB per document
- **Total storage** (based on tier):
  - **Free**: 1 GB
  - **Tier 1**: 10 GB
  - **Tier 2**: 100 GB
  - **Tier 3**: 1 TB
- **Recommendation**: Keep each file search store under 20 GB for optimal retrieval latency

## Pricing

- **Indexing**: $0.15 per 1M tokens (embeddings pricing)
- **Storage**: Free
- **Query embeddings**: Free
- **Retrieved document tokens**: Charged as regular context tokens

## Important Notes

1. **File Persistence**:
   - Raw files uploaded via Files API are deleted after 48 hours
   - Data imported into file search stores is stored indefinitely until manually deleted

2. **Store Names**:
   - File search store names are globally scoped
   - Use descriptive names for easy reference

3. **Best Practices**:
   - Use metadata for organizing and filtering documents
   - Configure chunking based on your document structure
   - Always check citations for fact verification
   - Monitor your storage usage across tiers

## Use Cases for Conversion Helper

1. **Customer Support Knowledge Base**: Upload FAQs, product docs, troubleshooting guides
2. **Marketing Content Repository**: Store conversion tips, case studies, best practices
3. **Legal/Compliance Documents**: Terms, policies, compliance guidelines
4. **Training Materials**: Onboarding docs, how-to guides, training videos (transcripts)
5. **Product Information**: Specifications, features, pricing details

## Next Steps

- Review the [File Search Stores API Reference](https://ai.google.dev/api/file-search/file-search-stores)
- Review the [File Search Documents API Reference](https://ai.google.dev/api/file-search/documents)
- Start building your knowledge base with File Search!
