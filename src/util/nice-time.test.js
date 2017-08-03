/* eslint-env jest */

import niceTime from './nice-time'

describe('niceTime', () => {
    test('should return now for timeperiod of less than 90 seconds', () => {
        const date = new Date()
        expect(niceTime(date)).toBe('now')
    })

    test('should return minutes for timeperiod of less than 600 seconds', () => {
        const date = new Date()
        const now = new Date()
        now.setMinutes(date.getMinutes() + 20)
        expect(niceTime(date, {now})).toBe('20 minutes ago')
    })

    test('should return timeperiod stamp for timeperiod less than 24 hours', () => {
        const date = new Date()
        const now = new Date()
        now.setHours(date.getHours() + 5)
        expect(niceTime(date, {now})).toBe(`${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`)
    })

    test('should return the timeperiod stamp and the day for timeperiod less than 24 hours but not on the same day', () => {
        const date = new Date()
        const now = new Date()
        now.setHours(date.getHours() + 22)
        expect(niceTime(date, {now})).toBe(`Yesterday ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`)
    })

    test('should return the day and timestamp for timeperiod less than 3 days', () => {
        const date = new Date()
        date.setTime(1495346386856)
        const now = new Date(date)
        now.setHours(date.getHours() + 32)
        expect(niceTime(date, {now})).toBe(`Sun ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`)
    })

    test('should return the date and the month for timeperiod in the same year', () => {
        const date = new Date()
        date.setTime(1495346386856)
        const now = new Date()
        now.setMonth(date.getMonth() + 3)
        expect(niceTime(date, {now})).toBe('21 May')
    })

    test('should return the date, month and year for timeperiod not in the same year', () => {
        const date = new Date()
        date.setTime(1495346386856)
        const now = new Date()
        now.setFullYear(date.getFullYear() + 1)
        expect(niceTime(date, {now})).toBe(`${date.getDate()} May ${date.getFullYear()}`)
    })
})
