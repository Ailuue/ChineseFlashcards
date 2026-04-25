import type { UserProgress } from '../db/schema'

export interface ReviewSchedule {
  easeFactor: number
  intervalDays: number
  repetitions: number
  nextReview: Date
}

export function nextReviewSchedule(current: UserProgress, isCorrect: boolean): ReviewSchedule {
  let { easeFactor, intervalDays, repetitions } = current

  if (isCorrect) {
    if (repetitions === 0) intervalDays = 1
    else if (repetitions === 1) intervalDays = 4
    else intervalDays = Math.round(intervalDays * easeFactor)

    easeFactor = Math.max(1.3, easeFactor + 0.1)
    repetitions += 1
  } else {
    intervalDays = 1
    easeFactor = Math.max(1.3, easeFactor - 0.2)
    repetitions = 0
  }

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + intervalDays)

  return { easeFactor, intervalDays, repetitions, nextReview }
}
