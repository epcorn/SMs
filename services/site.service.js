import { createError } from "../middleware/errorMiddleware.js";
import Site from "../models/siteModel.js";

const sitService = {
  create: async (data) => {
    if (
      !data.name &&
      !data.contractNumber &&
      !data.address &&
      !data.location.coords
    )
      throw createError("No info provided", 400);
    const site = await Site.create(data);
    return { msg: `${site.name} has been created`, site };
  },
  get: async () => {
    const sites = await Site.find().lean();
    return sites;
  },
};

export default sitService;
