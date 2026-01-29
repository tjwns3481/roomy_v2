import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SalesChart } from '@/components/admin/analytics/sales-chart';
import { OrdersChart } from '@/components/admin/analytics/orders-chart';
import { ProductsRanking } from '@/components/admin/analytics/products-ranking';
import { UserStats } from '@/components/admin/analytics/user-stats';

// Mock recharts to avoid rendering issues in tests
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

describe('Analytics Components', () => {
  describe('SalesChart', () => {
    it('should render sales chart with data', () => {
      const mockData = [
        { date: '월', revenue: 100000, orders: 5 },
        { date: '화', revenue: 150000, orders: 8 },
        { date: '수', revenue: 120000, orders: 6 },
      ];

      render(<SalesChart data={mockData} period="week" />);

      expect(screen.getByText('매출 추이')).toBeInTheDocument();
      expect(screen.getByText('이번 주 매출 및 주문 현황')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should display correct period label', () => {
      const mockData = [{ date: '00:00', revenue: 50000, orders: 2 }];

      const { rerender } = render(<SalesChart data={mockData} period="day" />);
      expect(screen.getByText('오늘 매출 및 주문 현황')).toBeInTheDocument();

      rerender(<SalesChart data={mockData} period="month" />);
      expect(screen.getByText('이번 달 매출 및 주문 현황')).toBeInTheDocument();
    });
  });

  describe('OrdersChart', () => {
    it('should render orders chart with data', () => {
      const mockData = {
        pending: 5,
        completed: 20,
        cancelled: 2,
        refunded: 1,
      };

      render(<OrdersChart data={mockData} />);

      expect(screen.getByText('주문 현황')).toBeInTheDocument();
      expect(screen.getByText('주문 상태별 분포')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('should show message when no data', () => {
      const mockData = {
        pending: 0,
        completed: 0,
        cancelled: 0,
        refunded: 0,
      };

      render(<OrdersChart data={mockData} />);

      expect(screen.getByText('주문 데이터가 없습니다.')).toBeInTheDocument();
    });
  });

  describe('ProductsRanking', () => {
    it('should render top products list', () => {
      const mockProducts = [
        { id: '1', name: '상품 A', quantity: 50, revenue: 1000000 },
        { id: '2', name: '상품 B', quantity: 30, revenue: 600000 },
        { id: '3', name: '상품 C', quantity: 20, revenue: 400000 },
      ];

      render(<ProductsRanking products={mockProducts} />);

      expect(screen.getByText('인기 상품 TOP 10')).toBeInTheDocument();
      expect(screen.getByText('매출액 기준 상위 상품')).toBeInTheDocument();
      expect(screen.getByText('상품 A')).toBeInTheDocument();
      expect(screen.getByText('상품 B')).toBeInTheDocument();
      expect(screen.getByText('상품 C')).toBeInTheDocument();
    });

    it('should display rank badges correctly', () => {
      const mockProducts = [
        { id: '1', name: '1위 상품', quantity: 100, revenue: 2000000 },
        { id: '2', name: '2위 상품', quantity: 50, revenue: 1000000 },
        { id: '3', name: '3위 상품', quantity: 30, revenue: 600000 },
      ];

      render(<ProductsRanking products={mockProducts} />);

      expect(screen.getByText('1위')).toBeInTheDocument();
      expect(screen.getByText('2위')).toBeInTheDocument();
      expect(screen.getByText('3위')).toBeInTheDocument();
    });

    it('should show message when no products', () => {
      render(<ProductsRanking products={[]} />);

      expect(screen.getByText('판매 데이터가 없습니다.')).toBeInTheDocument();
    });
  });

  describe('UserStats', () => {
    it('should render user statistics', () => {
      const mockStats = {
        total: 150,
        newThisPeriod: 15,
        admins: 3,
        customers: 147,
      };

      render(<UserStats stats={mockStats} />);

      expect(screen.getByText('사용자 통계')).toBeInTheDocument();
      expect(screen.getByText('사용자 현황 및 분포')).toBeInTheDocument();
      expect(screen.getByText('전체 사용자')).toBeInTheDocument();
      expect(screen.getByText('신규 사용자')).toBeInTheDocument();
      expect(screen.getByText('관리자')).toBeInTheDocument();
      expect(screen.getByText('고객')).toBeInTheDocument();
    });

    it('should display correct counts', () => {
      const mockStats = {
        total: 200,
        newThisPeriod: 25,
        admins: 5,
        customers: 195,
      };

      render(<UserStats stats={mockStats} />);

      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('195')).toBeInTheDocument();
    });
  });
});
