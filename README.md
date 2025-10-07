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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
- Example transform_config
```
{
  "thumbnail": { "width": 200, "height": 200 },
  "rounded": { "radius": "50%" }
}
```
#### Notes
 - topic_patterns: list of topic patterns to match.
 - category_ids and mime_type_ids: may be empty if the rule applies to all types.
 - transform_config: stores the JSON configuration for transformations (resize, optimize, chaining, etc.).


### Migration 
- Add transform_rules data
```
INSERT INTO transform_rules (
  topic_patterns,
  category_ids,
  mime_type_ids,
  transform_config
)
VALUES
(
  ARRAY['admin/users/%/photo'],
  ARRAY[1],
  ARRAY[1, 2],
  '{
    "thumbnail": { "width": 200, "height": 200 },
    "optimize": true
  }'::jsonb
);

```

### Create Queue service
- Acts as the bridge between the backend and Cloud Run.

The backend publishes a message to Pub/Sub after identifying a file that matches a transformation rule.

- Pub/Sub Topic: **file-transform**

- Message structure
```
{
  "bucket": "boueki-cloud-files",
  "file_path": "admin/users/123/photo/avatar.png",
  "mime_type": "image/png",
  "transform_config": {
    "thumbnail": { "width": 200, "height": 200 },
    "optimize": true
  },
  "output_path": {
    "thumbnail": "thumbnail/",
    "rounded": "rounded/"
  },
  "requested_by": "backend",
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


### Backfill old data
