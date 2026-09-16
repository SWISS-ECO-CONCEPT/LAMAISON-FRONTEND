import { test, expect } from '@playwright/test';

// Parcours public : pas besoin d'être connecté pour consulter des annonces.
// On commence par ça — l'authentification Clerk en E2E demande une config
// à part (comptes de test dédiés ou "testing tokens" Clerk), qu'on abordera
// séparément pour les parcours RDV/messagerie qui, eux, exigent d'être connecté.
test.describe('Parcours annonces (public)', () => {
  test("la page d'accueil affiche des annonces et permet d'ouvrir le détail", async ({ page }) => {
    await page.goto('/fr');

    const premiereAnnonce = page.getByTestId('annonce-card-link').first();
    await expect(premiereAnnonce).toBeVisible({ timeout: 10000 });

    await premiereAnnonce.click();

    await expect(page).toHaveURL(/\/post\/\d+/);
    await expect(page.getByTestId('annonce-detail-title')).toBeVisible();
  });
});