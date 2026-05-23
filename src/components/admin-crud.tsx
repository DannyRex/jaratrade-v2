"use client";

import * as React from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useMutation, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AdminCrudProps<T extends { id: string }> {
  title: string;
  description?: string;
  query: UseQueryResult<{ rows: T[] } | undefined>;
  queryKey: readonly unknown[];
  emptyTitle: string;
  columns: Array<{ key: keyof T | string; label: string; render?: (item: T) => React.ReactNode }>;
  newDialog: (close: () => void) => React.ReactNode;
  editDialog?: (item: T, close: () => void) => React.ReactNode;
  onDelete?: (id: string) => Promise<unknown>;
  newLabel?: string;
  icon?: React.ReactNode;
}

export function AdminCrud<T extends { id: string }>({
  title,
  description,
  query,
  queryKey,
  emptyTitle,
  columns,
  newDialog,
  editDialog,
  onDelete,
  newLabel = "New",
  icon,
}: AdminCrudProps<T>) {
  const qc = useQueryClient();
  const [openNew, setOpenNew] = React.useState(false);
  const [editing, setEditing] = React.useState<T | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<T | null>(null);

  const remove = useMutation({
    mutationFn: (id: string) => onDelete!(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success("Deleted");
      setConfirmDelete(null);
    },
  });

  const items = query.data?.rows ?? [];

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Dialog open={openNew} onOpenChange={setOpenNew}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> {newLabel}
              </Button>
            </DialogTrigger>
            {newDialog(() => setOpenNew(false))}
          </Dialog>
        }
      />

      {query.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={icon} title={emptyTitle} />
      ) : (
        <>
          {/* Mobile: each row becomes a label/value stack with edit + delete
              buttons at the bottom. The label/value layout reads naturally
              regardless of how many columns the admin page declares. */}
          <ul className="space-y-3 sm:hidden">
            {items.map((item) => (
              <li key={item.id} className="rounded-lg border bg-card p-4">
                <dl className="space-y-1.5">
                  {columns.map((col) => {
                    const v = col.render
                      ? col.render(item)
                      : ((item as Record<string, unknown>)[col.key as string] as React.ReactNode);
                    return (
                      <div key={String(col.key)} className="flex items-start justify-between gap-3 text-sm">
                        <dt className="shrink-0 text-xs uppercase tracking-wider text-muted-foreground">
                          {col.label}
                        </dt>
                        <dd className="min-w-0 text-right">{v ?? "-"}</dd>
                      </div>
                    );
                  })}
                </dl>
                {editDialog || onDelete ? (
                  <div className="mt-3 flex items-center justify-end gap-1 border-t pt-3">
                    {editDialog ? (
                      <Button variant="ghost" size="sm" onClick={() => setEditing(item)}>
                        <Edit2 className="size-3.5" /> Edit
                      </Button>
                    ) : null}
                    {onDelete ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDelete(item)}
                        aria-label="Delete"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
          {/* Tablet / desktop: full table. */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={String(col.key)}>{col.label}</TableHead>
                  ))}
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    {columns.map((col) => (
                      <TableCell key={String(col.key)}>
                        {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key as string] as React.ReactNode}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {editDialog ? (
                          <Button variant="ghost" size="icon-sm" onClick={() => setEditing(item)} aria-label="Edit">
                            <Edit2 className="size-3.5" />
                          </Button>
                        ) : null}
                        {onDelete ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setConfirmDelete(item)}
                            aria-label="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {editing && editDialog ? (
        <Dialog open onOpenChange={(o) => !o && setEditing(null)}>
          {editDialog(editing, () => setEditing(null))}
        </Dialog>
      ) : null}

      <Dialog open={Boolean(confirmDelete)} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm delete</DialogTitle>
            <DialogDescription>This action can&apos;t be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={remove.isPending}
              onClick={() => confirmDelete && remove.mutate(confirmDelete.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
