    // src/modules/posts/posts.schema.js
    import { z } from "zod";

    export const createPostSchema = z.object({
    content: z.string().min(1, "Post content cannot be empty"),
    post_type: z.enum(["GENERAL", "ANNOUNCEMENT", "QUESTION"]).optional(),
    is_pinned: z.boolean().optional(),
    visibility: z.enum(["PUBLIC", "FOLLOWERS"]).optional(),
    });


    export const commentSchema = z.object({
    comment: z.string().min(1, "Comment cannot be empty"),
    });

    export const reactionSchema = z.object({
    emoji: z.string().min(1).max(10),
    });

    /* =========================
   PIN / UNPIN POST
    ========================= */
    export const pinPostSchema = z.object({
    pinned: z.boolean().optional()
    });