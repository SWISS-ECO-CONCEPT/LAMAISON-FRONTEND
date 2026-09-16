import { test, expect } from '@playwright/test';

test.describe('Favoris (visiteur non connecté)', () => {
  test('redirige vers signup quand on essaie d\'ajouter un favori sans être connecté', async ({ page }) => {
    await page.goto('/fr');

    const boutonFavori = page.getByRole('button', { name: 'Ajouter aux favoris' }).first();
    await expect(boutonFavori).toBeVisible({ timeout: 10000 });

    await boutonFavori.click();

    await expect(page).toHaveURL(/\/signup/);
  });
});