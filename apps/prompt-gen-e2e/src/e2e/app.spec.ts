import { test, expect } from '@playwright/test';

test.describe('Prompt Generation App', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the API call
    await page.route('**/api/generate-prompt', async route => {
      const requestBody = JSON.parse(route.request().postData() || '{}');
      const topic = requestBody.topic;
      let prompt;

      if (topic.length <= 7) {
        prompt = `This is a simple prompt for: ${topic}`;
      } else {
        prompt = `This is a complex prompt for: ${topic}\n\n1. Consider the following aspects...\n2. Analyze the implications...\n3. Explore the relationships between...`;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ prompt })
      });
    });

    await page.goto('/');
  });

  test('should display the prompt form', async ({ page }) => {
    await expect(page.locator('form[role="form"]')).toBeVisible();
    await expect(page.locator('input#topic')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText('Generate Prompt');
  });

  test('should show an error message for invalid input', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();

    // Submit the form without entering any text
    await submitButton.click();

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toHaveText('Please enter a valid topic (1-200 characters).');
  });

  test('should generate a prompt successfully for a simple topic', async ({ page }) => {
    const testTopic = 'Test Topic';

    await page.locator('input#topic').fill(testTopic);
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.mt-6')).toBeVisible();
    await expect(page.locator('.mt-6')).toContainText('Generated Prompt');
    await expect(page.locator('[data-testid="generated-prompt"]')).toContainText(`This is a simple prompt for: ${testTopic}`);
  });

  test('should generate a prompt successfully for a complex topic', async ({ page }) => {
    const complexTopic = 'The impact of climate change on global agriculture and its implications for international trade policies';

    await page.locator('input#topic').fill(complexTopic);
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.mt-6')).toBeVisible();
    await expect(page.locator('.mt-6')).toContainText('Generated Prompt');
    await expect(page.locator('[data-testid="generated-prompt"]')).toContainText(`This is a complex prompt for: ${complexTopic}`);
    await expect(page.locator('[data-testid="generated-prompt"]')).toContainText('Consider the following aspects');
    await expect(page.locator('[data-testid="generated-prompt"]')).toContainText('Analyze the implications');
    await expect(page.locator('[data-testid="generated-prompt"]')).toContainText('Explore the relationships between');
  });
});
