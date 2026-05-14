import { test, expect } from "@playwright/test";

/**
 * Critical path: importer signs in, adds a product, checks out, and lands on
 * the payment page.
 *
 * Assumes:
 *   - API is running at NEXT_PUBLIC_API_URL with seeded demo data
 *   - importer@jaratrade.com / importer123 has 2FA disabled (default seed)
 */

test.beforeEach(async ({ page, context }) => {
  // Reset cart between tests so quantities don't add up across runs
  await context.clearCookies();
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("importer can log in, add to cart, and reach the payment page", async ({ page }) => {
  // 1. Log in
  await page.goto("/auth/login/importer");
  await page.locator("#email").fill("importer@jaratrade.com");
  await page.locator("#password").fill("importer123");
  await page.getByRole("button", { name: /Log in/i }).click();
  await page.waitForURL(/\/importer\//, { timeout: 15_000 });

  // 2. Browse + add to cart
  await page.goto("/products");
  const firstProduct = page.locator('a[aria-label]').first();
  await firstProduct.click();
  await page.getByRole("button", { name: /Add to cart/i }).click();

  // Toast confirms add-to-cart; navigate to cart
  await page.goto("/importer/cart");
  await expect(page.getByRole("heading", { name: /Your cart/i })).toBeVisible();

  // 3. Proceed to checkout
  await page.getByRole("button", { name: /Proceed to checkout/i }).click();
  await page.waitForURL(/\/importer\/checkout/, { timeout: 10_000 });

  // 4. Fill the address fields
  await page.locator("#recipient_name").fill("Test Importer");
  await page.locator("#phone").fill("+447400000777");
  await page.locator("#address").fill("42 Brixton Road");
  await page.locator("#city").fill("London");
  await page.locator("#state").fill("Greater London");
  await page.locator("#postal_code").fill("SW9 6BJ");

  // Pick "Importer-arranged" so we don't need a logistics partner selected
  await page.getByText(/Importer-arranged/i).click();

  await page.getByRole("button", { name: /Place order/i }).click();

  // 5. Verify the redirect to the pay page (or confirmation)
  await page.waitForURL(/\/(pay|orders)/, { timeout: 15_000 });
  await expect(page.getByText(/(Complete payment|Order)/i).first()).toBeVisible();
});
