import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CampaignService } from '../campaign.service';
import { CampaignRepository } from '../campaign.repository';
import { CampaignStatus } from '../../generated/prisma/client';
import { CampaignFilterStatus } from '../dto/campaign-query.dto';
import {
  createMockCampaign,
  createMockUser,
} from './fixtures/campaign.fixture';
import { createMockCampaignRepository } from './mocks/campaign.repository.mock';

describe('CampaignService', () => {
  let service: CampaignService;
  let repository: CampaignRepository;

  const mockUser = createMockUser();
  const mockCampaign = createMockCampaign();
  const mockRepository = createMockCampaignRepository();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignService,
        {
          provide: CampaignRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get(CampaignService);
    repository = module.get(CampaignRepository);

    jest.clearAllMocks();
  });

  describe('getCampaignList', () => {
    it('should return paginated campaign list with active filter', async () => {
      const mockCampaigns = [
        createMockCampaign({ id: 'campaign-1' }),
        createMockCampaign({ id: 'campaign-2' }),
      ];
      jest
        .spyOn(repository, 'getCampaignList')
        .mockResolvedValue(mockCampaigns);

      const result = await service.getCampaignList(mockUser, {
        status: CampaignFilterStatus.ACTIVE,
        limit: 10,
      });

      expect(result.data).toEqual(mockCampaigns);
      expect(result.count).toBe(2);
      expect(result.hasMore).toBe(false);
      expect(repository.getCampaignList).toHaveBeenCalledWith(
        { gameMasterId: 'user-123', deletedAt: null },
        expect.objectContaining({ take: 11 }),
      );
    });

    it('should return paginated list with deleted filter', async () => {
      jest.spyOn(repository, 'getCampaignList').mockResolvedValue([]);

      await service.getCampaignList(mockUser, {
        status: CampaignFilterStatus.DELETED,
        limit: 10,
      });

      expect(repository.getCampaignList).toHaveBeenCalledWith(
        { gameMasterId: 'user-123', deletedAt: { not: null } },
        expect.anything(),
      );
    });

    it('should detect hasMore when results exceed limit', async () => {
      const mockCampaigns = Array.from({ length: 11 }, (_, i) =>
        createMockCampaign({ id: `campaign-${i}` }),
      );
      jest
        .spyOn(repository, 'getCampaignList')
        .mockResolvedValue(mockCampaigns);

      const result = await service.getCampaignList(mockUser, { limit: 10 });

      expect(result.data.length).toBe(10);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('campaign-9');
    });

    it('should set hasPrevious when cursor is present', async () => {
      jest
        .spyOn(repository, 'getCampaignList')
        .mockResolvedValue([mockCampaign]);

      const result = await service.getCampaignList(mockUser, {
        cursor: 'some-cursor',
        limit: 10,
      });

      expect(result.hasPrevious).toBe(true);
    });
  });

  describe('getCampaign', () => {
    it('should return a campaign when found', async () => {
      jest.spyOn(repository, 'getCampaign').mockResolvedValue(mockCampaign);

      const result = await service.getCampaign('campaign-123', mockUser);

      expect(result).toEqual(mockCampaign);
      expect(repository.getCampaign).toHaveBeenCalledWith({
        id: 'campaign-123',
        gameMasterId: 'user-123',
      });
    });

    it('should throw NotFoundException when campaign not found', async () => {
      jest.spyOn(repository, 'getCampaign').mockResolvedValue(null);

      await expect(service.getCampaign('not-found', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when id is missing', async () => {
      await expect(service.getCampaign('', mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createCampaign', () => {
    it('should create a campaign with valid thresholds', async () => {
      jest.spyOn(repository, 'createCampaign').mockResolvedValue(mockCampaign);

      const dto = {
        title: 'New Campaign',
        chaosThreshold: 50,
        blessingThreshold: 100,
      };

      const result = await service.createCampaign(dto, mockUser);

      expect(result).toEqual(mockCampaign);
      expect(repository.createCampaign).toHaveBeenCalledWith({
        gameMaster: { connect: { id: 'user-123' } },
        ...dto,
      });
    });

    it('should throw BadRequestException when chaos >= blessing', async () => {
      const dto = {
        title: 'Invalid Campaign',
        chaosThreshold: 100,
        blessingThreshold: 50,
      };

      await expect(service.createCampaign(dto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createCampaign(dto, mockUser)).rejects.toThrow(
        'Chaos threshold must be less than Blessing threshold',
      );
    });

    it('should throw BadRequestException when thresholds are equal', async () => {
      const dto = {
        title: 'Invalid Campaign',
        chaosThreshold: 100,
        blessingThreshold: 100,
      };

      await expect(service.createCampaign(dto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateCampaign', () => {
    it('should update campaign with valid thresholds', async () => {
      const updatedCampaign = createMockCampaign({ title: 'Updated Title' });
      jest
        .spyOn(repository, 'updateCampaign')
        .mockResolvedValue(updatedCampaign);

      const dto = { title: 'Updated Title' };

      const result = await service.updateCampaign(dto, mockCampaign);

      expect(result).toEqual(updatedCampaign);
      expect(repository.updateCampaign).toHaveBeenCalledWith(
        { id: 'campaign-123' },
        dto,
      );
    });

    it('should validate thresholds using existing values when not provided', async () => {
      jest.spyOn(repository, 'updateCampaign').mockResolvedValue(mockCampaign);

      const dto = { title: 'Updated Title' };

      await service.updateCampaign(dto, mockCampaign);

      expect(repository.updateCampaign).toHaveBeenCalled();
    });

    it('should throw when updating chaosThreshold >= blessingThreshold', async () => {
      const dto = { chaosThreshold: 150 };

      await expect(service.updateCampaign(dto, mockCampaign)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should validate merged thresholds correctly', async () => {
      jest.spyOn(repository, 'updateCampaign').mockResolvedValue(mockCampaign);

      const dto = { chaosThreshold: 30 };

      await service.updateCampaign(dto, mockCampaign);

      expect(repository.updateCampaign).toHaveBeenCalled();
    });
  });

  describe('updateCampaignStatus', () => {
    it('should update campaign status', async () => {
      const updatedCampaign = createMockCampaign({
        status: CampaignStatus.PAUSED,
      });
      jest
        .spyOn(repository, 'updateCampaignStatus')
        .mockResolvedValue(updatedCampaign);

      const dto = {
        status: CampaignStatus.PAUSED,
      };

      const result = await service.updateCampaignStatus(dto, mockCampaign);

      expect(result).toEqual(updatedCampaign);
      expect(repository.updateCampaignStatus).toHaveBeenCalledWith(
        { id: 'campaign-123' },
        dto,
      );
    });
  });

  describe('updateCampaignKarma', () => {
    it('should update campaign karma', async () => {
      const updatedCampaign = createMockCampaign({ karmaValue: 10 });
      jest
        .spyOn(repository, 'updateCampaignKarma')
        .mockResolvedValue(updatedCampaign);

      const dto = { karmaValue: 10 };

      const result = await service.updateCampaignKarma(dto, mockCampaign);

      expect(result).toEqual(updatedCampaign);
      expect(repository.updateCampaignKarma).toHaveBeenCalledWith(
        { id: 'campaign-123' },
        dto,
      );
    });
  });

  describe('softRemoveCampaign', () => {
    it('should soft delete a campaign', async () => {
      const deletedCampaign = createMockCampaign({ deletedAt: new Date() });
      jest
        .spyOn(repository, 'softRemoveCampaign')
        .mockResolvedValue(deletedCampaign);

      const result = await service.softRemoveCampaign(mockCampaign);

      expect(result).toEqual(deletedCampaign);
      expect(repository.softRemoveCampaign).toHaveBeenCalledWith(
        { id: 'campaign-123' },
        expect.objectContaining({ deletedAt: expect.any(Date) }),
      );
    });
  });

  describe('restoreSoftRemovedCampaign', () => {
    it('should restore a soft deleted campaign', async () => {
      const deletedCampaign = createMockCampaign({ deletedAt: new Date() });
      jest
        .spyOn(repository, 'restoreSoftRemovedCampaign')
        .mockResolvedValue(mockCampaign);

      const result = await service.restoreSoftRemovedCampaign(deletedCampaign);

      expect(result).toEqual(mockCampaign);
      expect(repository.restoreSoftRemovedCampaign).toHaveBeenCalledWith(
        { id: 'campaign-123' },
        { deletedAt: null },
      );
    });

    it('should throw BadRequestException if campaign not soft deleted', async () => {
      await expect(
        service.restoreSoftRemovedCampaign(mockCampaign),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.restoreSoftRemovedCampaign(mockCampaign),
      ).rejects.toThrow('Campaign must be soft-deleted first');
    });
  });

  describe('deleteCampaign', () => {
    it('should permanently delete a soft deleted campaign', async () => {
      const deletedCampaign = createMockCampaign({ deletedAt: new Date() });
      jest
        .spyOn(repository, 'deleteCampaign')
        .mockResolvedValue(deletedCampaign);

      const result = await service.deleteCampaign(deletedCampaign);

      expect(result).toEqual(deletedCampaign);
      expect(repository.deleteCampaign).toHaveBeenCalledWith({
        id: 'campaign-123',
      });
    });

    it('should throw BadRequestException if campaign not soft deleted', async () => {
      await expect(service.deleteCampaign(mockCampaign)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.deleteCampaign(mockCampaign)).rejects.toThrow(
        'Campaign must be soft-deleted first',
      );
    });
  });
});
