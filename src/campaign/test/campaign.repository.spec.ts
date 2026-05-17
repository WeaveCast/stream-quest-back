import { Test, TestingModule } from '@nestjs/testing';
import { CampaignRepository } from '../campaign.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { Campaign, CampaignStatus } from '../../generated/prisma/client';

describe('CampaignRepository', () => {
  let repository: CampaignRepository;
  let prismaService: PrismaService;

  const mockCampaign: Campaign = {
    id: 'campaign-123',
    title: 'Test Campaign',
    description: 'A test campaign',
    status: CampaignStatus.ACTIVE,
    conclusion: null,
    karmaValue: 0,
    chaosThreshold: 50,
    blessingThreshold: 100,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    gameMasterId: 'gm-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignRepository,
        {
          provide: PrismaService,
          useValue: {
            campaign: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get(CampaignRepository);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('getCampaign', () => {
    it('should return a campaign when found', async () => {
      jest
        .spyOn(prismaService.campaign, 'findFirst')
        .mockResolvedValue(mockCampaign);

      const result = await repository.getCampaign({ id: 'campaign-123' });

      expect(result).toEqual(mockCampaign);
      expect(prismaService.campaign.findFirst).toHaveBeenCalledWith({
        where: { id: 'campaign-123' },
        include: {
          _count: {
            select: {
              sessions: true,
              campaignEvents: true,
            },
          },
        },
      });
    });

    it('should return null when campaign not found', async () => {
      jest.spyOn(prismaService.campaign, 'findFirst').mockResolvedValue(null);

      const result = await repository.getCampaign({ id: 'not-found' });

      expect(result).toBeNull();
    });
  });

  describe('getCampaignList', () => {
    const mockCampaigns = [
      { ...mockCampaign, id: 'campaign-1', title: 'Campaign 1' },
      { ...mockCampaign, id: 'campaign-2', title: 'Campaign 2' },
    ];

    it('should return campaigns in forward direction', async () => {
      jest
        .spyOn(prismaService.campaign, 'findMany')
        .mockResolvedValue(mockCampaigns);

      const result = await repository.getCampaignList(
        { gameMasterId: 'gm-123' },
        { take: 10, direction: 'forward' },
      );

      expect(result).toEqual(mockCampaigns);
      expect(prismaService.campaign.findMany).toHaveBeenCalledWith({
        where: { gameMasterId: 'gm-123' },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              sessions: true,
              campaignEvents: true,
            },
          },
        },
      });
    });

    it('should return campaigns in backward direction (reversed)', async () => {
      jest
        .spyOn(prismaService.campaign, 'findMany')
        .mockResolvedValue([...mockCampaigns]);

      const result = await repository.getCampaignList(
        { gameMasterId: 'gm-123' },
        { take: 10, direction: 'backward', cursor: 'cursor-123' },
      );

      expect(result).toEqual([...mockCampaigns].reverse());
      expect(prismaService.campaign.findMany).toHaveBeenCalledWith({
        where: { gameMasterId: 'gm-123' },
        take: -10,
        skip: 1,
        cursor: { id: 'cursor-123' },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              sessions: true,
              campaignEvents: true,
            },
          },
        },
      });
    });

    it('should use default take value of 10', async () => {
      jest
        .spyOn(prismaService.campaign, 'findMany')
        .mockResolvedValue(mockCampaigns);

      await repository.getCampaignList({ gameMasterId: 'gm-123' });

      expect(prismaService.campaign.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });
  });

  describe('createCampaign', () => {
    it('should create and return a campaign', async () => {
      jest
        .spyOn(prismaService.campaign, 'create')
        .mockResolvedValue(mockCampaign);

      const createData = {
        title: 'New Campaign',
        chaosThreshold: 50,
        blessingThreshold: 100,
        gameMaster: { connect: { id: 'gm-123' } },
      };

      const result = await repository.createCampaign(createData);

      expect(result).toEqual(mockCampaign);
      expect(prismaService.campaign.create).toHaveBeenCalledWith({
        data: createData,
      });
    });
  });

  describe('updateCampaign', () => {
    it('should update and return a campaign', async () => {
      const updatedCampaign = { ...mockCampaign, title: 'Updated Title' };
      jest
        .spyOn(prismaService.campaign, 'update')
        .mockResolvedValue(updatedCampaign);

      const result = await repository.updateCampaign(
        { id: 'campaign-123' },
        { title: 'Updated Title' },
      );

      expect(result).toEqual(updatedCampaign);
      expect(prismaService.campaign.update).toHaveBeenCalledWith({
        where: { id: 'campaign-123' },
        data: { title: 'Updated Title' },
        include: {
          _count: {
            select: {
              sessions: true,
              campaignEvents: true,
            },
          },
        },
      });
    });
  });

  describe('deleteCampaign', () => {
    it('should delete and return a campaign', async () => {
      jest
        .spyOn(prismaService.campaign, 'delete')
        .mockResolvedValue(mockCampaign);

      const result = await repository.deleteCampaign({ id: 'campaign-123' });

      expect(result).toEqual(mockCampaign);
      expect(prismaService.campaign.delete).toHaveBeenCalledWith({
        where: { id: 'campaign-123' },
      });
    });
  });
});
