import { Test, TestingModule } from '@nestjs/testing';
import { StellarService } from './stellar.service';
import { MetricsService } from '../metrics/metrics.service';

describe('StellarService', () => {
  let service: StellarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StellarService,
        {
          provide: MetricsService,
          useValue: { incrementStellarRpcErrors: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<StellarService>(StellarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateAddress', () => {
    it('should return valid: true for a correct Stellar address', () => {
      // Real valid Stellar address
      const validAddress =
        'GC7OHFPWPSWXL4HMN6TXAG54MTZSMJIASWHO6KVRQNHNCXEAHWDSGGC3';
      const result = service.validateAddress(validAddress);
      expect(result.valid).toBe(true);
    });

    it('should return valid: false for an empty address', () => {
      const result = service.validateAddress('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Address is required');
    });

    it('should return valid: false for null input', () => {
      const result = service.validateAddress(null as unknown as string);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Address is required');
    });

    it('should return valid: false for an invalid format', () => {
      const result = service.validateAddress('invalid-address');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid Stellar address format');
    });

    it('should return valid: false for an invalid checksum', () => {
      // Changed the last character from '3' to '4' to break the checksum
      const invalidAddress =
        'GC7OHFPWPSWXL4HMN6TXAG54MTZSMJIASWHO6KVRQNHNCXEAHWDSGGC4';
      const result = service.validateAddress(invalidAddress);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid Stellar address format');
    });

    it('should return valid: false for an address that is not a public key', () => {
      const realSecretKey =
        'SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'; // Not necessarily valid format
      const result = service.validateAddress(realSecretKey);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid Stellar address format');
    });

    it('should return valid: false for non-ed25519 strings', () => {
      const result = service.validateAddress(
        'MZXW6YTBOI======',
      );
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid Stellar address format');
    });
  });
});
