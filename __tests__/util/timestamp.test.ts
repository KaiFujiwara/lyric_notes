import { normalizeTimestamp } from '@/src/util/timestamp';

describe('normalizeTimestamp', () => {
  describe('UNIX秒（10桁）の変換', () => {
    it('UNIX秒をミリ秒に変換する', () => {
      // 2024-01-01 00:00:00 UTC
      const unixSeconds = 1704067200;
      const expected = 1704067200000;

      expect(normalizeTimestamp(unixSeconds)).toBe(expected);
    });

    it('最小のUNIX秒（1970-01-01 00:00:01）を変換する', () => {
      const unixSeconds = 1;
      const expected = 1000;

      expect(normalizeTimestamp(unixSeconds)).toBe(expected);
    });

    it('境界値直前（9999999999秒 = 2286-11-20）を変換する', () => {
      const unixSeconds = 9999999999;
      const expected = 9999999999000;

      expect(normalizeTimestamp(unixSeconds)).toBe(expected);
    });
  });

  describe('ミリ秒（13桁以上）はそのまま返す', () => {
    it('ミリ秒タイムスタンプをそのまま返す', () => {
      // 2024-01-01 00:00:00.000 UTC
      const milliseconds = 1704067200000;

      expect(normalizeTimestamp(milliseconds)).toBe(milliseconds);
    });

    it('境界値（10000000000ミリ秒 = 1970-04-26）をそのまま返す', () => {
      const milliseconds = 10000000000;

      expect(normalizeTimestamp(milliseconds)).toBe(milliseconds);
    });

    it('現在時刻（ミリ秒）をそのまま返す', () => {
      const now = Date.now();

      expect(normalizeTimestamp(now)).toBe(now);
    });

    it('未来の日付（ミリ秒）をそのまま返す', () => {
      // 2030-01-01 00:00:00.000 UTC
      const futureMilliseconds = 1893456000000;

      expect(normalizeTimestamp(futureMilliseconds)).toBe(futureMilliseconds);
    });
  });

  describe('エッジケース', () => {
    it('ゼロはゼロを返す', () => {
      expect(normalizeTimestamp(0)).toBe(0);
    });

    it('小数点以下は切り捨てられる（秒として扱われる）', () => {
      const unixSecondsWithDecimal = 1704067200.5;
      const expected = 1704067200500;

      expect(normalizeTimestamp(unixSecondsWithDecimal)).toBe(expected);
    });
  });

  describe('実際のユースケース', () => {
    it('DBから取得した秒タイムスタンプをDate()で使える形式に変換', () => {
      const dbTimestamp = 1704067200; // 2024-01-01 00:00:00 UTC
      const normalized = normalizeTimestamp(dbTimestamp);
      const date = new Date(normalized);

      expect(date.getUTCFullYear()).toBe(2024);
      expect(date.getUTCMonth()).toBe(0); // January
      expect(date.getUTCDate()).toBe(1);
      expect(date.getUTCHours()).toBe(0);
      expect(date.getUTCMinutes()).toBe(0);
      expect(date.getUTCSeconds()).toBe(0);
    });

    it('DBから取得したミリ秒タイムスタンプをそのままDate()で使える', () => {
      const dbTimestamp = 1704067200000; // 2024-01-01 00:00:00.000 UTC
      const normalized = normalizeTimestamp(dbTimestamp);
      const date = new Date(normalized);

      expect(date.getUTCFullYear()).toBe(2024);
      expect(date.getUTCMonth()).toBe(0);
      expect(date.getUTCDate()).toBe(1);
    });
  });
});
