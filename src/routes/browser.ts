import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify"
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";

const stagehand = new Stagehand({
  env: "LOCAL",
});

const BrowserRoute: FastifyPluginAsync = async (server: FastifyInstance, options: FastifyPluginOptions) => {
    server.get('/card', async (request, reply) => {
        // if(!request.query.name) return reply.code(400).send({ error: "name query parameter is required" });
        // const name = request.query.name;
        const card = "Gecko Moria"
        await stagehand.init();
        await stagehand.page.goto("https://ligaonepiece.com");
        await stagehand.act({ action: "close popup" });
        await stagehand.act({ action: `search for ${card} and hit enter` });
        const cards = await stagehand.extract({
            instruction: "extract the cards from the page",
            schema: z.object({
                cards: z.array(z.object({
                    name: z.string(),
                    subtitle: z.string(),
                    imageUrl: z.string(),
                    lowerPrice: z.string(),
                    higherPrice: z.string(),
                }))
            }),
        });
        console.log(`Found ${cards.cards.length} cards`);
        return reply.send({ cards: cards.cards });
    })
}

export default BrowserRoute