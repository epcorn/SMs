import Site from "../models/siteModel.js";

const sitService = {
  add: async (data) => {
    const site = await Site.create(data);
    return { msg: `${site.name} has been created`, site };
  },
};

export default sitService;
