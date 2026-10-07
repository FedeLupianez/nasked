import { newUuidBuffer, toUuidBuffer, toUuidString, isUuid } from './uuid';
import { BadRequestException } from '@nestjs/common';
import { parse, stringify } from 'uuid';

describe('uuid helpers', () => {
  describe('toUuidBuffer', () => {
    it('converts a valid uuid to its 16 bytes', () => {
      const id = '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b';
      const buffer = toUuidBuffer(id);
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer).toHaveLength(16);
      expect(buffer.equals(Buffer.from(parse(id)))).toBe(true);
    });

    it.each([
      ['no es un uuid', 'not-a-uuid'],
      ['le sobra un caracter', '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5bc'],
      ['esta vacio', '']
    ])('rechaza %s', (_case, value) => {
      expect(() => toUuidBuffer(value)).toThrow(BadRequestException);
    });

    it('rechaza valores que no son string', () => {
      expect(() => toUuidBuffer(undefined as unknown as string)).toThrow(BadRequestException);
      expect(() => toUuidBuffer(42 as unknown as string)).toThrow(BadRequestException);
    });
  });

  describe('toUuidString', () => {
    it('round-trips a buffer back to the original uuid', () => {
      const id = '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b';
      expect(toUuidString(toUuidBuffer(id))).toBe(id);
    });

    it('passes strings through untouched', () => {
      const id = '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b';
      expect(toUuidString(id)).toBe(id);
    });

    it('rejects buffers that are not 16 bytes', () => {
      expect(() => toUuidString(Buffer.alloc(8))).toThrow(BadRequestException);
    });
  });

  describe('newUuidBuffer', () => {
    it('produces 16 bytes', () => {
      expect(newUuidBuffer()).toHaveLength(16);
    });

    it('produces a different id on every call', () => {
      expect(newUuidBuffer().equals(newUuidBuffer())).toBe(false);
    });

    it('produces something toUuidString can read back', () => {
      expect(isUuid(toUuidString(newUuidBuffer()))).toBe(true);
    });
  });

  describe('isUuid', () => {
    it('accepts a valid uuid and rejects anything else', () => {
      expect(isUuid(stringify(newUuidBuffer()))).toBe(true);
      expect(isUuid('nope')).toBe(false);
      expect(isUuid(null)).toBe(false);
    });
  });
});
