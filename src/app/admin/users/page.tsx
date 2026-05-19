"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Users, ShieldCheck, ShieldOff, Mail } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/data-table";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate, initials } from "@/lib/format";
import type { Role } from "@/lib/types";

export default function AdminUsersPage() {
  const isAdmin = useAuth((s) => Boolean(s.token) && s.role === "admin");
  const qc = useQueryClient();
  const [role, setRole] = useState<Role | "all">("all");
  const [status, setStatus] = useState<"all" | "active" | "suspended">("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", role, status, debouncedSearch],
    queryFn: () =>
      adminApi.searchUsers({
        role: role === "all" ? undefined : role,
        is_active: status === "all" ? undefined : status === "active",
        q: debouncedSearch || undefined,
        len: 100,
      }),
    enabled: isAdmin,
  });

  const suspend = useMutation({
    mutationFn: (id: string) => adminApi.suspendUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User suspended");
    },
  });
  const reactivate = useMutation({
    mutationFn: (id: string) => adminApi.reactivateUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User reactivated");
    },
  });
  const resendApproval = useMutation({
    mutationFn: (id: string) => adminApi.resendApprovalEmail(id),
    onSuccess: () => toast.success("Approval email re-sent"),
    onError: (err: Error) =>
      toast.error("Couldn't re-send approval email", { description: err.message }),
  });

  const users = data?.rows ?? [];

  return (
    <>
      <PageHeader
        title="Users"
        description="Search and manage every account on the platform."
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/kyc">KYC queue</Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input placeholder="Email, name, business…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={role} onValueChange={(v) => setRole(v as Role | "all")}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Any role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="importer">Importers</SelectItem>
            <SelectItem value="exporter">Exporters</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={<Users />} title="No users match" description="Try a different filter or search." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>KYC</TableHead>
              <TableHead>2FA</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[120px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">
                        {initials(u.business_name || u.fullname)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-medium">{u.business_name || u.fullname || u.email}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="secondary" className="capitalize">{u.role}</Badge></TableCell>
                <TableCell>
                  {u.role === "exporter" ? (
                    <Badge variant={u.kyc_status === "approved" ? "success" : u.kyc_status === "rejected" ? "destructive" : "warning"}>
                      {u.kyc_status}
                    </Badge>
                  ) : (
                    // KYC doesn't apply to importers or admins - their
                    // kyc_status column stays at the default "pending"
                    // forever because no endpoint transitions it. Showing
                    // "pending" here gave admins the wrong impression that
                    // every importer was awaiting review. Render em-dash
                    // instead to signal "not applicable".
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {u.totp_enabled ? <Badge variant="success">on</Badge> : <Badge variant="outline">off</Badge>}
                </TableCell>
                <TableCell>
                  {u.is_active ? <Badge variant="success">active</Badge> : <Badge variant="destructive">suspended</Badge>}
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(u.time_created)}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {u.is_active ? (
                      <Button size="sm" variant="ghost" onClick={() => suspend.mutate(u.id)}>
                        <ShieldOff className="size-3.5" /> Suspend
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => reactivate.mutate(u.id)}>
                        <ShieldCheck className="size-3.5" /> Reactivate
                      </Button>
                    )}
                    {u.role === "exporter" && u.kyc_status === "approved" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => resendApproval.mutate(u.id)}
                        loading={resendApproval.isPending && resendApproval.variables === u.id}
                        title="Re-send the activation email (useful if the original send failed silently)"
                      >
                        <Mail className="size-3.5" /> Resend email
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
