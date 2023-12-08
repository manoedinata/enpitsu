import {
  // desc, eq,
  schema,
} from "@enpitsu/db";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const gradeRouter = createTRPCRouter({
  all: protectedProcedure.query(({ ctx }) =>
    ctx.db.query.grades.findMany({
      with: {
        subgrades: {
          columns: {
            id: true,
            label: true,
          },
        },
      },
    }),
  ),

  createGrade: protectedProcedure
    .input(z.string())
    .mutation(({ ctx, input: label }) => {
      return ctx.db.insert(schema.grades).values({ label });
    }),

  createSubGrade: protectedProcedure
    .input(
      z.object({
        gradeId: z.number(),
        label: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(schema.subGrades).values(input);
    }),
});

// export const postRouter = createTRPCRouter({
//   all: publicProcedure.query(({ ctx }) => {
//     // return ctx.db.select().from(schema.post).orderBy(desc(schema.post.id));
//     return ctx.db.query.post.findMany({ orderBy: desc(schema.post.id) });
//   }),

//   byId: publicProcedure
//     .input(z.object({ id: z.number() }))
//     .query(({ ctx, input }) => {
//       // return ctx.db
//       //   .select()
//       //   .from(schema.post)
//       //   .where(eq(schema.post.id, input.id));

//       return ctx.db.query.post.findFirst({
//         where: eq(schema.post.id, input.id),
//       });
//     }),

//   create: protectedProcedure
//     .input(
//       z.object({
//         title: z.string().min(1),
//         content: z.string().min(1),
//       }),
//     )
//     .mutation(({ ctx, input }) => {
//       return ctx.db.insert(schema.post).values(input);
//     }),

//   delete: protectedProcedure.input(z.number()).mutation(({ ctx, input }) => {
//     return ctx.db.delete(schema.post).where(eq(schema.post.id, input));
//   }),
// });