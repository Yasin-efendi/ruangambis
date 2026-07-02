## Table `profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `username` | `text` |  Unique |
| `full_name` | `text` |  Nullable |
| `role` | `text` |  |
| `school_name` | `text` |  Nullable |
| `status` | `text` |  |
| `invited_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `invitations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `email` | `text` |  |
| `token` | `text` |  Unique |
| `created_by` | `uuid` |  |
| `expires_at` | `timestamptz` |  |
| `used_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `packages`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `duration_min` | `int4` |  |
| `is_active` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `subtests`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `package_id` | `uuid` |  |
| `title` | `text` |  |
| `order_index` | `int4` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `questions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `subtest_id` | `uuid` |  |
| `content` | `text` |  |
| `image_url` | `text` |  Nullable |
| `order_index` | `int4` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `options`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `question_id` | `uuid` |  |
| `label` | `bpchar` |  |
| `content` | `text` |  |
| `is_correct` | `bool` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `try_out_sessions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `package_id` | `uuid` |  |
| `status` | `text` |  |
| `started_at` | `timestamptz` |  Nullable |
| `submitted_at` | `timestamptz` |  Nullable |
| `time_remaining` | `int4` |  Nullable |
| `last_synced_at` | `timestamptz` |  Nullable |
| `score` | `numeric` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `session_answers`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `session_id` | `uuid` |  |
| `question_id` | `uuid` |  |
| `option_id` | `uuid` |  Nullable |
| `is_flagged` | `bool` |  Nullable |
| `answered_at` | `timestamptz` |  Nullable |

## Table `session_subtest_scores`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `session_id` | `uuid` |  |
| `subtest_id` | `uuid` |  |
| `total_questions` | `int4` |  |
| `correct_count` | `int4` |  |
| `score` | `numeric` |  |

## Table `forum_posts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `title` | `text` |  |
| `content` | `text` |  |
| `subtest_id` | `uuid` |  Nullable |
| `is_pinned` | `bool` |  |
| `is_locked` | `bool` |  |
| `is_answered` | `bool` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `forum_comments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `post_id` | `uuid` |  |
| `user_id` | `uuid` |  |
| `content` | `text` |  |
| `created_at` | `timestamptz` |  Nullable |

