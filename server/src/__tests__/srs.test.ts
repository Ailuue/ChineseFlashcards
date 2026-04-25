import { describe, it, expect, beforeEach } from 'vitest'
import { nextReviewSchedule } from '../utils/srs'
import type { UserProgress } from '../db/schema'

const base: UserProgress = {
  id: 1,
  userId: 1,
  wordId: 1,
  repetitions: 0,
  easeFactor: 2.5,
  intervalDays: 1,
  correct: 0,
  incorrect: 0,
  lastReviewed: null,
  lastReviewCorrect: null,
  nextReview: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('nextReviewSchedule', () => {
  describe('correct answer', () => {
    it('first correct review sets interval to 1 day', () => {
      const result = nextReviewSchedule({ ...base, repetitions: 0 }, true)
      expect(result.intervalDays).toBe(1)
    })

    it('second correct review sets interval to 4 days', () => {
      const result = nextReviewSchedule({ ...base, repetitions: 1, intervalDays: 1 }, true)
      expect(result.intervalDays).toBe(4)
    })

    it('third correct review multiplies interval by easeFactor', () => {
      const result = nextReviewSchedule({ ...base, repetitions: 2, intervalDays: 4, easeFactor: 2.5 }, true)
      expect(result.intervalDays).toBe(Math.round(4 * 2.5))
    })

    it('increments repetitions', () => {
      const result = nextReviewSchedule({ ...base, repetitions: 2 }, true)
      expect(result.repetitions).toBe(3)
    })

    it('increases easeFactor by 0.1', () => {
      const result = nextReviewSchedule({ ...base, easeFactor: 2.5 }, true)
      expect(result.easeFactor).toBeCloseTo(2.6)
    })

    it('schedules nextReview in the future', () => {
      const before = Date.now()
      const result = nextReviewSchedule({ ...base, repetitions: 0 }, true)
      expect(result.nextReview.getTime()).toBeGreaterThanOrEqual(before)
    })
  })

  describe('incorrect answer', () => {
    it('resets interval to 1 day', () => {
      const result = nextReviewSchedule({ ...base, repetitions: 5, intervalDays: 30 }, false)
      expect(result.intervalDays).toBe(1)
    })

    it('resets repetitions to 0', () => {
      const result = nextReviewSchedule({ ...base, repetitions: 5 }, false)
      expect(result.repetitions).toBe(0)
    })

    it('decreases easeFactor by 0.2', () => {
      const result = nextReviewSchedule({ ...base, easeFactor: 2.5 }, false)
      expect(result.easeFactor).toBeCloseTo(2.3)
    })
  })

  describe('easeFactor floor', () => {
    it('easeFactor never drops below 1.3 on incorrect', () => {
      const result = nextReviewSchedule({ ...base, easeFactor: 1.3 }, false)
      expect(result.easeFactor).toBe(1.3)
    })

    it('easeFactor never drops below 1.3 even when deeply negative', () => {
      const result = nextReviewSchedule({ ...base, easeFactor: 1.1 }, false)
      expect(result.easeFactor).toBe(1.3)
    })

    it('easeFactor is clamped to 1.3 on correct when adding 0.1 would still leave it below 1.3', () => {
      const result = nextReviewSchedule({ ...base, easeFactor: 1.1 }, true)
      expect(result.easeFactor).toBe(1.3)
    })
  })

  describe('nextReview date', () => {
    it('nextReview is approximately intervalDays from now', () => {
      const result = nextReviewSchedule({ ...base, repetitions: 1 }, true)
      const expectedMs = Date.now() + 4 * 24 * 60 * 60 * 1000
      expect(result.nextReview.getTime()).toBeCloseTo(expectedMs, -3)
    })
  })
})
