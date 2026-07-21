import { test, expect } from '@playwright/test'

test('public drill page renders', async ({ page }) => {
  await page.goto('/drills/rondo-4v2')
  await expect(page.getByRole('heading', { level: 1, name: 'Rondo 4v2' })).toBeVisible()
  await expect(page.getByText('Painopisteet')).toBeVisible()
})

test('public session page renders drills in order with notes', async ({ page }) => {
  await page.goto('/sessions/sample-session')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Sample Training Session' })
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Rondo 4v2' })).toBeVisible()
  await expect(page.getByText('weak foot only')).toBeVisible()
})

test('home page lists public sessions', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: /Sample Training Session/ })).toBeVisible()
})
