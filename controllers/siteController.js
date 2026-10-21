import sitService from "../services/site.service.js";

export const createSite = async (req, res, next) => {
  console.log(req.body);
  try {
    const site = await sitService.create(req.body);
    res.status(200).json(site);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getSites = async (req, res, next) => {
  try {
    const site = await sitService.get();
    res.status(200).json(site);
  } catch (error) {
    next(error);
  }
};
