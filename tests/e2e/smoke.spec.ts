import { test, expect } from '@playwright/test'

test('drill library renders and drill pages open', async ({ page }) => {
  await page.goto('/drills')
  await expect(page.getByRole('heading', { level: 1, name: 'Harjoitepankki' })).toBeVisible()

  const drillLinks = page.locator('main a[href^="/drills/"]')
  test.skip((await drillLinks.count()) === 0, 'no public drills in the database')

  await drillLinks.first().click()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('home lists sessions and session pages open', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Treenit' })).toBeVisible()

  const sessionLinks = page.locator('main a[href^="/sessions/"]')
  test.skip((await sessionLinks.count()) === 0, 'no public sessions in the database')

  await sessionLinks.first().click()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('sessions index renders', async ({ page }) => {
  await page.goto('/sessions')
  await expect(page.getByRole('heading', { level: 1, name: 'Treenit' })).toBeVisible()

  const sessionLinks = page.locator('main a[href^="/sessions/"]')
  if ((await sessionLinks.count()) === 0) {
    await expect(page.getByText('Treenejä ei ole vielä julkaistu.')).toBeVisible()
  }
})

test('unknown slug shows the Finnish 404 page', async ({ page }) => {
  await page.goto('/drills/tata-ei-ole-olemassa')
  await expect(page.getByRole('heading', { level: 1, name: 'Se meni ohi maalin' })).toBeVisible()
})
