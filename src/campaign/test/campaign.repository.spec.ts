import { Test, TestingModule } from '@nestjs/testing';
import { CampaignRepository } from '../campaign.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { CampaignStatus } from '../../generated/prisma/client';
import { createMockCampaign } from './fixtures/campaign.fixture';
import { createMockPrismaService } from './mocks/campaign.prisma.mock';

describe('CampaignRepository', () => {
  let repository: CampaignRepository;
  let prismaService: PrismaService;

  const mockCampaign = createMockCampaign();
  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
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
      createMockCampaign({ id: 'campaign-1', title: 'Campaign 1' }),
      createMockCampaign({ id: 'campaign-2', title: 'Campaign 2' }),
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
      const updatedCampaign = createMockCampaign({ title: 'Updated Title' });
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

  describe('updateCampaignStatus', () => {
    it('should update campaign status', async () => {
      const updatedCampaign = createMockCampaign({
        status: CampaignStatus.PAUSED,
      });
      jest
        .spyOn(prismaService.campaign, 'update')
        .mockResolvedValue(updatedCampaign);

      const result = await repository.updateCampaignStatus(
        { id: 'campaign-123' },
        { status: CampaignStatus.PAUSED },
      );

      expect(result).toEqual(updatedCampaign);
    });
  });

  describe('updateCampaignKarma', () => {
    it('should update campaign karma', async () => {
      const updatedCampaign = createMockCampaign({ karmaValue: 10 });
      jest
        .spyOn(prismaService.campaign, 'update')
        .mockResolvedValue(updatedCampaign);

      const result = await repository.updateCampaignKarma(
        { id: 'campaign-123' },
        { karmaValue: 10 },
      );

      expect(result).toEqual(updatedCampaign);
    });
  });

  describe('softRemoveCampaign', () => {
    it('should soft remove a campaign', async () => {
      const deletedCampaign = createMockCampaign({ deletedAt: new Date() });
      jest
        .spyOn(prismaService.campaign, 'update')
        .mockResolvedValue(deletedCampaign);

      const result = await repository.softRemoveCampaign(
        { id: 'campaign-123' },
        { deletedAt: new Date() },
      );

      expect(result).toEqual(deletedCampaign);
    });
  });

  describe('restoreSoftRemovedCampaign', () => {
    it('should restore soft removed campaign', async () => {
      jest
        .spyOn(prismaService.campaign, 'update')
        .mockResolvedValue(mockCampaign);

      const result = await repository.restoreSoftRemovedCampaign(
        { id: 'campaign-123' },
        { deletedAt: null },
      );

      expect(result).toEqual(mockCampaign);
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
