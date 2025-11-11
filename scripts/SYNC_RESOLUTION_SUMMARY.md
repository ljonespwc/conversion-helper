# File Search Sync Resolution Summary

## Problem
- Supabase had 21 records all marked as `synced_to_file_search = true`
- Google File Search list API was only returning 10 documents
- Actual total in File Search was 46 documents (with many duplicates/junk)
- Document IDs in Supabase were operation IDs, not document IDs

## Root Causes Discovered

### 1. SDK Pagination Bug
The `@google/genai` SDK's async iterator for listing documents stops after ~10 results, not properly handling pagination. This made it appear that only 10 documents existed when there were actually 46.

**Solution**: Used REST API with manual pagination (`pageSize=20`, `nextPageToken`) to list all documents.

### 2. Operation IDs vs Document IDs
The `uploadToFileSearchStore` method returns an operation object where `operation.name` is the operation ID (e.g., `.../upload/operations/xyz`), not the final document ID (`.../documents/xyz`).

**Solution**: Discovered that operation IDs and document IDs share the same unique identifier. Simply replaced `/upload/operations/` with `/documents/` in stored IDs.

### 3. Document Deletion Requires Force Flag
Documents with chunks cannot be deleted without `force: true` config option.

**Solution**: Used `ai.fileSearchStores.documents.delete({ name, config: { force: true } })` to delete documents and their chunks in one operation.

## Actions Taken

1. **Converted Operation IDs to Document IDs** (20 records)
   - Script: `convert-operation-to-document-ids.mjs`
   - Replaced `/upload/operations/` with `/documents/` in Supabase
   - All marked as `synced_to_file_search = true`

2. **Discovered Full Document Inventory** (46 total)
   - Script: `list-all-docs-rest-api.mjs`
   - Used REST API with pagination
   - Found 25 documents WITH metadata (4 old duplicates + 21 new)
   - Found 21 documents WITHOUT metadata (untitled junk)

3. **Cleaned Up File Search** (deleted 25 documents)
   - Script: `force-delete-with-sdk.mjs`
   - Deleted 4 old duplicate "PN Level 1 Nutrition Certification" docs
   - Deleted 21 untitled junk documents
   - Used `config: { force: true }` to handle chunks

4. **Verified Final State**
   - Google File Search: **21 documents** (all properly titled)
   - Supabase: **21 records** (all marked as synced)
   - Perfect 1:1 match

## Final State

### Google File Search
```
✅ 21 documents total
- 1 sales page: "PN Level 1 Nutrition Certification - Full Sales Page"
- 20 FAQ articles with unique titles
```

### Supabase `indexed_pages` Table
```
✅ 21 records total
- All have synced_to_file_search = true
- All have correct document IDs (not operation IDs)
- All match documents in File Search
```

## Key Learnings

1. **Always use REST API for listing** - The SDK's async iterator has pagination bugs
2. **Operation IDs ≠ Document IDs** - Extract document ID from operation.response.documentName
3. **Use force: true for deletion** - Required to delete documents with chunks
4. **PageSize max is 20** - API enforces this limit, need proper pagination handling

## Scripts Created

- `convert-operation-to-document-ids.mjs` - Fix operation → document ID mismatch
- `list-all-docs-rest-api.mjs` - Proper pagination for listing all documents
- `analyze-all-documents.mjs` - Categorize docs by metadata presence
- `force-delete-with-sdk.mjs` - Clean deletion with force flag
- `verify-supabase-sync-status.mjs` - Verify final sync state

## Status: ✅ RESOLVED

All 21 documents are now correctly synced between Supabase and Google File Search. The admin UI will now display accurate sync status with checkmarks for all documents.
