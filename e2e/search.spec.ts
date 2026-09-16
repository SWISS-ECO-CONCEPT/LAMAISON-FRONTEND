import { test, expect } from '@playwright/test';

test.describe('Recherche (publique)', () => {
  test('filtrer par projet ne fait pas planter la page', async ({ page }) => {
    await page.goto('/fr/posts');

    await page.locator('select').first().selectOption('achat');
    await page.getByTestId('search-submit-button').click();

    // Après une recherche, la page doit atteindre un état stable :
    // soit des résultats, soit le message "aucun résultat" — jamais les deux
    // absents en même temps (ce qui indiquerait un plantage silencieux).
    const resultats = page.getByTestId('annonces-results');
    const aucunResultat = page.getByTestId('annonces-empty');

    await expect(resultats.or(aucunResultat)).toBeVisible({ timeout: 10000 });
  });
});