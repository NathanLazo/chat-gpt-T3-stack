import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const gptProcedures = createTRPCRouter({
  getChats: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.chat.findMany({
        where: {
          userId: input.id,
        },
      });
    }),
  createChat: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.chat.create({
        data: {
          userId: input.userId,
        },
      });
    }),
  getPrompts: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.prompt.findMany({
        where: {
          chatId: input.id,
        },
      });
    }),
  createChatPrompt: publicProcedure
    .input(
      z.object({
        prompt: z.string(),
        type: z.string(),
        chatId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.prompt.create({
        data: {
          prompt: input.prompt,
          type: input.type,
          userId: input.userId,
          chatId: input.chatId,
        },
      });
    }),
  deleteChat: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.chat.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
