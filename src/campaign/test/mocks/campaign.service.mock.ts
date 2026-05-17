export const createMockCampaignService = () => ({
  getCampaignList: jest.fn(),
  getCampaign: jest.fn(),
  createCampaign: jest.fn(),
  updateCampaign: jest.fn(),
  updateCampaignStatus: jest.fn(),
  updateCampaignKarma: jest.fn(),
  softRemoveCampaign: jest.fn(),
  restoreSoftRemovedCampaign: jest.fn(),
  deleteCampaign: jest.fn(),
});
