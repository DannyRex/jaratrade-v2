import { test, expect } from "@playwright/test";

/**
 * Public marketplace smoke: no auth required.
 * Verifies that the home page renders, the product listing pulls real
 * products from the backend, and the product detail page renders details.
 */
test("home -> products -> product detail renders real data", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Source authentic Nigerian goods/i })).toBeVisible();

  await page.goto("/products");
  await expect(page.getByRole("heading", { name: /Marketplace/i }).first()).toBeVisible();

  // Wait for at least one product card rendered (uses anchor labelled with the name).
  const firstProductLink = page.locator('a[aria-label]').first();
  await expect(firstProductLink).toBeVisible();

  // Click into the first product
  await firstProductLink.click();

  // Detail page: price + add to cart button visible
  await expect(page.getByRole("heading").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Add to cart/i })).toBeVisible();
});
