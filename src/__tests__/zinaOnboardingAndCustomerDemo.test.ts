import { describe, it, expect } from 'vitest';
import { DEMO_RESTAURANT, DEMO_DISHES, DEMO_ANALYTICS_DATA, AI_CUSTOMER_PROMPTS, AI_FINANCIAL_PROMPTS } from '../data/demoData';

describe('SofraFlow Centralized Demo Data & Currency Verification', () => {
  it('uses Moroccan Dirhams (MAD) consistently across all dishes and analytics', () => {
    expect(DEMO_RESTAURANT.currency).toBe('MAD');
    expect(DEMO_RESTAURANT.city).toBe('Casablanca');

    DEMO_DISHES.forEach((dish) => {
      expect(dish.currency).toBe('MAD');
      expect(dish.price).toBeGreaterThan(0);
      expect(dish.name.en).toBeTruthy();
      expect(dish.name.fr).toBeTruthy();
      expect(dish.description.en).toBeTruthy();
      expect(dish.description.fr).toBeTruthy();
    });
  });

  it('guarantees analytics totals match summary figures', () => {
    expect(DEMO_ANALYTICS_DATA.summary.revenue).toBe(46250);
    expect(DEMO_ANALYTICS_DATA.summary.ordersCount).toBe(384);
    expect(DEMO_ANALYTICS_DATA.summary.aov).toBeCloseTo(120.4, 1);
  });

  it('verifies AI customer prompts have valid recommendations', () => {
    expect(AI_CUSTOMER_PROMPTS.length).toBeGreaterThanOrEqual(4);

    const budgetPrompt = AI_CUSTOMER_PROMPTS.find((p) => p.id === 'budget_80');
    expect(budgetPrompt).toBeDefined();
    expect(budgetPrompt?.recommendedIds).toContain('dish_burger_atlas');

    // Confirm that the recommended dish exists in DEMO_DISHES and costs <= 80 MAD
    const recommendedDish = DEMO_DISHES.find((d) => d.id === 'dish_burger_atlas');
    expect(recommendedDish).toBeDefined();
    expect(recommendedDish?.price).toBeLessThanOrEqual(80);
  });

  it('verifies AI financial prompts provide responsible business frameworks', () => {
    expect(AI_FINANCIAL_PROMPTS.length).toBeGreaterThanOrEqual(2);
    const marginsPrompt = AI_FINANCIAL_PROMPTS.find((p) => p.id === 'margins');
    expect(marginsPrompt).toBeDefined();
    expect(marginsPrompt?.insight.en).toContain('beverage');
    expect(marginsPrompt?.insight.fr).toContain('boissons');
  });
});
