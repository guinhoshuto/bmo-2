import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";

const stagehand = new Stagehand({env: "LOCAL"})

async function getPricing(url: string) {
    await stagehand.init();
    await stagehand.page.goto(url);
    const pricingActions = await stagehand.observe({ instruction: "look for pricing information" });
    console.log(pricingActions)
    await stagehand.act({action: 'click on pricing button'});
    await stagehand.page.waitForLoadState("domcontentloaded");
    const { pricing } = await stagehand.extract({
        instruction: "extract pricing information",
        schema: z.object({
            pricing: z.array(z.object({
                plan: z.string(),
                price: z.string(),
                currency: z.string(),
                description: z.string(),
            }))
        }),
    }); 
    return pricing
}

export { getPricing }