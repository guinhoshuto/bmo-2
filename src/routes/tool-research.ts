import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import { getPricing } from "../services/stagehand";

const stagehand = new Stagehand({
    env: "LOCAL",
})

const ToolResearchRoute: FastifyPluginAsync = async (server: FastifyInstance, options: FastifyPluginOptions) => {
    server.get('/tool-research', async (request, reply) => {
        const querySchema = z.object({
            product: z.string(),
        });

        const queryParams = querySchema.safeParse(request.query);

        if (!queryParams.success) {
            return reply.code(400).send({ error: "Invalid query parameters" });
        }

        const { product } = queryParams.data;
        await stagehand.init();
        await stagehand.page.goto(`https://www.ycombinator.com/companies?query=${product}`);
        await stagehand.page.waitForLoadState("networkidle");
        const products = await stagehand.page.$$eval('._results_86jzd_326>a', (elements) => {
            return elements.map(element => (element as HTMLAnchorElement).href);
        });
        const results: any[] = []
        const firstProducts = products.slice(0, 2);

        for (const productPage of firstProducts) {
            await stagehand.page.goto(productPage);
            await stagehand.page.waitForLoadState("networkidle");
            const product = await stagehand.extract({
                instruction: "explain the product in few words",
                schema: z.object({
                    desc: z.string()
                })
            })
            const productData = await stagehand.page.$$eval('body>div', (elements) => {
                const dataPage = elements.map(element => (element as HTMLDivElement).getAttribute("data-page"))[0];
                if(dataPage){
                    const { props } = JSON.parse(dataPage);
                    return { 
                        url: props.company.website,
                        name: props.company.name,
                        status: props.company.ycdc_status
                    }
                }
            })

            let pricing: any[] = [];
            if(productData!.status !== "Inactive"){
                pricing = await getPricing(productData!.url);
            }

            results.push({
                product: productData!.name, 
                url: productData!.url,
                desc: product.desc,
                status: productData!.status,
                pricing: pricing
            });
            
        }
        return reply.send(results);
    })
}

export default ToolResearchRoute