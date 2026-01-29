import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnalyticsPage from '@/app/admin/analytics/page';

// Mock SWR with default success state
const mockSWRData = {
  data: {
    period: 'week',
    summary: {
      totalRevenue: 5000000,
      revenueChange: 15.5,
      totalOrders: 50,
      ordersChange: 10.2,
      avgOrderValue: 100000,
      newUsers: 12,
      usersChange: 5.0,
    },
    salesData: [
      { date: '월', revenue: 500000, orders: 5 },
      { date: '화', revenue: 750000, orders: 8 },
    ],
    ordersByStatus: {
      pending: 5,
      completed: 40,
      cancelled: 3,
      refunded: 2,
    },
    topProducts: [
      { id: '1', name: '프리미엄 디지털 앨범', quantity: 25, revenue: 1250000 },
    ],
    userStats: {
      total: 150,
      newThisPeriod: 12,
      admins: 3,
      customers: 147,
    },
  },
  error: null,
  isLoading: false,
};

vi.mock('swr', () => ({
  default: vi.fn(() => mockSWRData),
}));

// Mock recharts
vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

describe('Analytics Page Integration', () => {
  it('should render analytics page with header and tabs', () => {
    render(<AnalyticsPage />);

    // Check header
    expect(screen.getByText('통계 대시보드')).toBeInTheDocument();
    expect(
      screen.getByText('매출, 주문, 상품, 사용자 통계를 한눈에 확인하세요.')
    ).toBeInTheDocument();

    // Check period tabs
    expect(screen.getByRole('tab', { name: /오늘/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /이번 주/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /이번 달/i })).toBeInTheDocument();
  });

  it('should render summary cards', () => {
    render(<AnalyticsPage />);

    // Check all four summary cards
    expect(screen.getByText('총 매출')).toBeInTheDocument();
    expect(screen.getByText('총 주문')).toBeInTheDocument();
    expect(screen.getByText('평균 주문 금액')).toBeInTheDocument();
    expect(screen.getAllByText('신규 사용자')[0]).toBeInTheDocument();
  });

  it('should render chart sections', () => {
    render(<AnalyticsPage />);

    // Check all chart titles
    expect(screen.getByText('매출 추이')).toBeInTheDocument();
    expect(screen.getByText('주문 현황')).toBeInTheDocument();
    expect(screen.getByText('인기 상품 TOP 10')).toBeInTheDocument();
    expect(screen.getByText('사용자 통계')).toBeInTheDocument();
  });

  it('should render chart components', () => {
    render(<AnalyticsPage />);

    // Check charts are rendered
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('should display product data', () => {
    render(<AnalyticsPage />);

    // Check product name is displayed
    expect(screen.getByText('프리미엄 디지털 앨범')).toBeInTheDocument();
  });
});
