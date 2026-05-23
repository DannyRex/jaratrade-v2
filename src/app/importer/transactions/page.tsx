"use client";

import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/data-table";
import { useImporterTransactions } from "@/lib/queries";
import { formatDate, formatMoney, shortId } from "@/lib/format";

interface Tx {
  id: string;
  tx_ref: string;
  order_id: string;
  amount: string;
  currency: string;
  status: string;
  time_created: string;
}

export default function TransactionsPage() {
  const { data, isLoading } = useImporterTransactions();
  const txs: Tx[] = (data as { data?: Tx[] })?.data ?? [];

  return (
    <>
      <PageHeader title="Transactions" description="Every payment you've made on Jaratrade." />
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : txs.length === 0 ? (
        <EmptyState icon={<Wallet />} title="No transactions yet" description="Your payment history will show here." />
      ) : (
        <>
          {/* Mobile: card list - 5-col tables overflow on phones. */}
          <ul className="space-y-3 sm:hidden">
            {txs.map((tx) => (
              <li key={tx.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-mono text-xs">{tx.tx_ref}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(tx.time_created)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Order {shortId(tx.order_id)}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <Badge
                    variant={
                      tx.status === "successful"
                        ? "success"
                        : tx.status === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {tx.status}
                  </Badge>
                  <span className="text-base font-bold tabular-nums">
                    {formatMoney(tx.amount, tx.currency)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          {/* Tablet / desktop: table. */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txs.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-xs">{tx.tx_ref}</TableCell>
                    <TableCell>{shortId(tx.order_id)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(tx.time_created)}</TableCell>
                    <TableCell>
                      <Badge variant={tx.status === "successful" ? "success" : tx.status === "failed" ? "destructive" : "secondary"}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(tx.amount, tx.currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </>
  );
}
