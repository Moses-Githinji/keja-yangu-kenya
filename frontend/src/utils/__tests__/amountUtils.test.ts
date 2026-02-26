import { describe, it, expect } from 'vitest';
import { formatCompactPrice, simpleForm, assignValue, firstChars, isMultiple } from '../amountUtils';

describe('amountUtils', () => {
  describe('firstChars', () => {
    it('extracts first characters of words', () => {
      expect(firstChars('John Doe')).toBe('JD');
      expect(firstChars('Keja Yangu Kenya')).toBe('KYK');
    });
  });

  describe('isMultiple', () => {
    it('returns s for plural or zero', () => {
      expect(isMultiple(0)).toBe('s');
      expect(isMultiple(1)).toBe('');
      expect(isMultiple(2)).toBe('s');
    });
  });

  describe('assignValue', () => {
    it('assigns unit suffix based on magnitude', () => {
      expect(assignValue(5000000)).toBe('M');
      expect(assignValue(30000)).toBe('K');
      expect(assignValue(500)).toBe('');
    });
  });

  describe('simpleForm', () => {
    it('reduces value to its unit scale', () => {
      expect(simpleForm(5000000)).toBe(5);
      expect(simpleForm(30000)).toBe(30);
      expect(simpleForm(2500)).toBe(2.5);
      expect(simpleForm(500)).toBe(500);
    });
  });

  describe('formatCompactPrice', () => {
    it('formats SALE prices correctly', () => {
      expect(formatCompactPrice(5000000, 'SALE')).toBe('Ksh 5M');
      expect(formatCompactPrice(8500000, 'SALE')).toBe('Ksh 8.5M');
      expect(formatCompactPrice(30000, 'SALE')).toBe('Ksh 30K');
    });

    it('formats RENT prices correctly', () => {
      expect(formatCompactPrice(30000, 'RENT')).toBe('Ksh 30K/month');
      expect(formatCompactPrice(25000, 'RENT')).toBe('Ksh 25K/month');
    });

    it('formats SHORT_TERM_RENT prices correctly', () => {
      expect(formatCompactPrice(2500, 'SHORT_TERM_RENT')).toBe('Ksh 2.5K/night');
      expect(formatCompactPrice(15000, 'SHORT_TERM_RENT')).toBe('Ksh 15K/night');
    });

    it('handles missing listing type', () => {
      expect(formatCompactPrice(5000000)).toBe('Ksh 5M');
    });
  });
});
