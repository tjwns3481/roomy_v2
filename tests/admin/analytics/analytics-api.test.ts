/**
 * @vitest-environment node
 * @vitest-setup-skip
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/admin/analytics/route';
import { NextRequest } from 'next/server';

// Set up environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => ({
        data: { user: { id: 'test-admin-id' } },
        error: null,
      })),
    },
    from: vi.fn((table: string) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { role: 'admin' },
            error: null,
          })),
          gte: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
        gte: vi.fn(() => ({
          data: [],
          error: null,
        })),
        in: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
    })),
  })),
}));

describe('Analytics API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    const { createServerClient } = await import('@/lib/supabase/server');
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn(() => ({
          data: { user: null },
          error: new Error('Not authenticated'),
        })),
      },
    } as any);

    const request = new NextRequest('http://localhost:3000/api/admin/analytics');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('should return 403 if user is not admin', async () => {
    const { createServerClient } = await import('@/lib/supabase/server');
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn(() => ({
          data: { user: { id: 'test-user-id' } },
          error: null,
        })),
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { role: 'customer' },
              error: null,
            })),
          })),
        })),
      })),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/admin/analytics');
    const response = await GET(request);

    expect(response.status).toBe(403);
  });

  it('should return analytics data for admin user', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        created_at: new Date().toISOString(),
        status: 'completed',
        total_amount: 50000,
      },
      {
        id: 'order-2',
        created_at: new Date().toISOString(),
        status: 'pending',
        total_amount: 30000,
      },
    ];

    const { createServerClient } = await import('@/lib/supabase/server');
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn(() => ({
          data: { user: { id: 'test-admin-id' } },
          error: null,
        })),
      },
      from: vi.fn((table: string) => ({
        select: vi.fn(() => {
          if (table === 'profiles') {
            return {
              eq: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: { role: 'admin' },
                  error: null,
                })),
              })),
              gte: vi.fn(() => ({
                data: [],
                error: null,
              })),
            };
          }
          if (table === 'orders') {
            return {
              eq: vi.fn(() => ({
                gte: vi.fn(() => ({
                  data: mockOrders,
                  error: null,
                })),
              })),
              gte: vi.fn(() => ({
                data: mockOrders,
                error: null,
              })),
            };
          }
          return {
            in: vi.fn(() => ({
              data: [],
              error: null,
            })),
          };
        }),
      })),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/admin/analytics?period=week');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty('summary');
    expect(data).toHaveProperty('salesData');
    expect(data).toHaveProperty('ordersByStatus');
    expect(data).toHaveProperty('topProducts');
    expect(data).toHaveProperty('userStats');
    expect(data.period).toBe('week');
  });

  it('should handle different period parameters', async () => {
    const periods = ['day', 'week', 'month'];

    for (const period of periods) {
      const request = new NextRequest(
        `http://localhost:3000/api/admin/analytics?period=${period}`
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.period).toBe(period);
    }
  });
});
