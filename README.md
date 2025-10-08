# File Transformation

### Transformation Rules
- Not every uploaded file should be transformed. We need a set of transformation rules to determine which files are eligible.
- Create transform_rules table.
```
CREATE TABLE transform_rules (
  id SERIAL PRIMARY KEY,
  topic_patterns TEXT[] DEFAULT NULL,
  category_ids INT[] DEFAULT NULL,
  mime_type_ids INT[] DEFAULT NULL,
  transform_config JSONB NOT NULL,
  output_path TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
- Example transform_config
```
{
  "property":
    {
     "width": 200,
     "height": 200,
     "object-fit": "cover"
    },
  "replace_original": false
}   
```
#### Notes
 - topic_patterns: list of topic patterns to match.
 - category_ids and mime_type_ids: may be null or [] if the rule applies to all types.
 - transform_config: stores the JSON configuration for transformations (resize, optimize, chaining, etc.).


### Migration 
- Add transform_rules data
```
INSERT INTO transform_rules (
  topic_patterns,
  category_ids,
  mime_type_ids,
  transform_config,
  output_path
)
VALUES
(
  ARRAY['bec/projects/*', 'bec/products/*'],
  ARRAY[1],
  ARRAY[14, 15, 16, 17, 18, 26],
  '{
     "property":
        {
         "width": 200,
         "height": 200,
         "object-fit": "cover"
        },
      "replace_original": false
  }'::jsonb,
  "thumbnail/"
);

```

### Create Queue service using Cloud Tasks
- Create a task for the endpoint "file/transform" (endpoint of Cloud Run to handle transform img)

- Payload structure example
```
{
  "bucket": "file-service-bucket", // Bucket in file service
  "filePath": "/files/final/UkLWZg9D/UkLWZg9D.png",
  "download": "https://storage.googleapis.com/local-datnt-upload/files/final/UkLWZg9D/UkLWZg9D.png",
  "transform_config": {
     "property":
        {
         "width": 200,
         "height": 200,
         "object-fit": "cover"
        },
      "replace_original": false
  },
  "output_path": "thumbnail/",
  "created_at": "2025-10-07T12:00:00Z"
}

```

### Cloud Run transform
- Purpose

    - Receive messages from Pub/Sub.
    
    - Perform file transformations based on transform_config.
    
    - Save the transformed results back into the bucket in the appropriate folders.

- Trigger

    - Cloud Run is configured to receive HTTP push notifications from the file-transform Pub/Sub topic.


### Output file structure

| Type          | Folder       | File Naming Example                          |
| ------------- | ------------ | -------------------------------------------- |
| **Original**  | (unchanged)  | `admin/users/123/photo/avatar.png`           |
| **Thumbnail** | `thumbnail/` | `thumbnail/admin/users/123/photo/avatar.png` |
| **Rounded**   | `rounded/`   | `rounded/admin/users/123/photo/avatar.png`   |


### Backfill old data plan
- 
