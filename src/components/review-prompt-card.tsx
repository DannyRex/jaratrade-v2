"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquare } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RatingStars } from "@/components/ui/rating-stars";
import { importerApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";

interface ReviewPromptCardProps {
  orderId: string;
  exporterId: string;
  exporterName?: string;
}

interface MyReview {
  id: string;
  exporter_id: string;
  order_id: string | null;
  rating: number;
  comment: string | null;
  time_created: string;
}

/**
 * Renders the post-delivery review flow on the order detail page.
 *
 * - If the importer has already reviewed this order, shows the review.
 * - Otherwise renders an interactive star + comment form.
 */
export function ReviewPromptCard({ orderId, exporterId, exporterName }: ReviewPromptCardProps) {
  const isAuthedImporter = useAuth((s) => Boolean(s.token) && s.role === "importer");
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const reviewsQuery = useQuery({
    queryKey: ["importer", "my-reviews"],
    queryFn: () => importerApi.reviews() as Promise<{ rows: MyReview[] }>,
    enabled: isAuthedImporter,
  });
  const existing = reviewsQuery.data?.rows.find((r) => r.order_id === orderId);

  const submit = useMutation({
    mutationFn: () =>
      importerApi.postReview({
        exporter_id: exporterId,
        rating,
        comment: comment.trim() || undefined,
        order_id: orderId,
      } as unknown as { exporter_id: string; rating: number; comment: string }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["importer", "my-reviews"] });
      toast.success("Thanks for your review");
      setRating(0);
      setComment("");
    },
  });

  if (existing) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-success" aria-hidden />
            <h3 className="text-sm font-semibold">Your review</h3>
          </div>
          <RatingStars rating={existing.rating} size="md" />
          {existing.comment ? <p className="text-sm text-muted-foreground">{existing.comment}</p> : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start gap-3">
          <div className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary">
            <MessageSquare className="size-4" aria-hidden />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Rate your experience</h3>
            <p className="text-sm text-muted-foreground">
              How was your order from {exporterName ?? "this exporter"}? Your review helps other
              importers find trustworthy partners.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (rating < 1) return;
            submit.mutate();
          }}
          className="space-y-3"
        >
          <RatingStars value={rating} onChange={setRating} size="lg" />
          <Textarea
            placeholder="What stood out about this exporter? (optional)"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
          />
          {submit.isError ? (
            <Alert variant="destructive">
              <AlertDescription>{(submit.error as Error).message}</AlertDescription>
            </Alert>
          ) : null}
          <div className="flex items-center justify-end gap-2">
            <Button
              type="submit"
              loading={submit.isPending}
              disabled={rating < 1}
            >
              Submit review
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
