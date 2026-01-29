// @TASK P8-S13-T1: Upsell 요청 목록 및 상태 관리
'use client';

import { useState } from 'react';
import { UpsellRequest, UpsellRequestStatus } from '@/types/upsell';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreVertical, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface UpsellRequestListProps {
  requests: (UpsellRequest & {
    upsell_items?: { name: string; price: number };
  })[];
  stats: {
    pending_requests: number;
    confirmed_requests: number;
    cancelled_requests: number;
  };
  guidebookId: string;
}

export function UpsellRequestList({
  requests: initialRequests,
  stats: initialStats,
  guidebookId,
}: UpsellRequestListProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [stats, setStats] = useState(initialStats);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (
    requestId: string,
    newStatus: UpsellRequestStatus
  ) => {
    setUpdatingId(requestId);

    try {
      const response = await fetch(
        `/api/guidebooks/${guidebookId}/upsell/requests/${requestId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error('상태 변경에 실패했습니다');
      }

      const result = await response.json();

      // 요청 목록 업데이트
      setRequests(
        requests.map((req) =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      );

      // 통계 업데이트
      const oldRequest = requests.find((r) => r.id === requestId);
      if (oldRequest) {
        setStats({
          pending_requests:
            stats.pending_requests +
            (newStatus === 'pending' ? 1 : 0) -
            (oldRequest.status === 'pending' ? 1 : 0),
          confirmed_requests:
            stats.confirmed_requests +
            (newStatus === 'confirmed' ? 1 : 0) -
            (oldRequest.status === 'confirmed' ? 1 : 0),
          cancelled_requests:
            stats.cancelled_requests +
            (newStatus === 'cancelled' ? 1 : 0) -
            (oldRequest.status === 'cancelled' ? 1 : 0),
        });
      }

      toast.success('상태가 변경되었습니다');
    } catch (error) {
      console.error('Status change error:', error);
      toast.error('상태 변경 중 오류가 발생했습니다');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: UpsellRequestStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            대기중
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge variant="default" className="gap-1 bg-success">
            <CheckCircle2 className="h-3 w-3" />
            확인됨
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            취소됨
          </Badge>
        );
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <Clock className="h-12 w-12 mx-auto text-text-secondary mb-4" />
        <h3 className="text-h4 text-text-primary mb-2">
          요청이 없습니다
        </h3>
        <p className="text-body text-text-secondary">
          게스트가 아이템을 요청하면 여기에 표시됩니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-small text-text-secondary font-normal">
              대기중
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-bold text-primary">
              {stats.pending_requests}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-small text-text-secondary font-normal">
              확인됨
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-bold text-success">
              {stats.confirmed_requests}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-small text-text-secondary font-normal">
              취소됨
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-bold text-text-secondary">
              {stats.cancelled_requests}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 요청 테이블 */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>아이템</TableHead>
              <TableHead>요청자</TableHead>
              <TableHead>연락처</TableHead>
              <TableHead>메시지</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>요청일</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {request.upsell_items?.name || '-'}
                    </div>
                    <div className="text-small text-text-secondary">
                      ₩{request.upsell_items?.price.toLocaleString() || 0}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {request.guest_name || <span className="text-text-secondary">-</span>}
                </TableCell>
                <TableCell>
                  {request.guest_contact || <span className="text-text-secondary">-</span>}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {request.message || <span className="text-text-secondary">-</span>}
                </TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell>
                  {format(new Date(request.created_at), 'PPp', { locale: ko })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={updatingId === request.id}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {request.status !== 'confirmed' && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(request.id, 'confirmed')
                          }
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          확인됨으로 변경
                        </DropdownMenuItem>
                      )}
                      {request.status !== 'cancelled' && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(request.id, 'cancelled')
                          }
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          취소됨으로 변경
                        </DropdownMenuItem>
                      )}
                      {request.status !== 'pending' && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(request.id, 'pending')
                          }
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          대기중으로 변경
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
