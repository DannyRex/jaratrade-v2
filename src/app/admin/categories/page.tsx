"use client";

import { useState } from "react";
import { FolderTree } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminCrud } from "@/components/admin-crud";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAdminCategories, queryKeys } from "@/lib/queries";
import { adminApi } from "@/lib/api";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const query = useAdminCategories();
  return (
    <AdminCrud<Category>
      title="Categories"
      description="Used for taxonomy across the marketplace."
      query={query}
      queryKey={queryKeys.adminCategories}
      emptyTitle="No categories"
      icon={<FolderTree />}
      newLabel="Add category"
      columns={[
        { key: "name", label: "Name" },
        { key: "description", label: "Description" },
        { key: "cat_count", label: "Products", render: (c) => c.cat_count ?? 0 },
      ]}
      newDialog={(close) => <CategoryDialog onClose={close} />}
      editDialog={(cat, close) => <CategoryDialog category={cat} onClose={close} />}
      onDelete={(id) => adminApi.deleteCategory(id)}
    />
  );
}

function CategoryDialog({ category, onClose }: { category?: Category; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: category?.name ?? "",
    description: category?.description ?? "",
    parent_category: category?.parent_category ?? "",
  });

  const save = useMutation({
    mutationFn: () =>
      category ? adminApi.updateCategory(category.id, form) : adminApi.createCategory(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminCategories });
      toast.success(category ? "Category updated" : "Category added");
      onClose();
    },
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{category ? "Edit category" : "Add category"}</DialogTitle>
        <DialogDescription>Categories appear in marketplace filters and the categories page.</DialogDescription>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="space-y-3"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {category ? "Save changes" : "Add category"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
