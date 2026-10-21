"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { useData } from "@/components/providers/data-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JournalForm } from "@/components/journal/journal-form";

export function JournalNewView({ defaultTradeId }: { defaultTradeId?: string | null }) {
  const { t } = useI18n();
  const router = useRouter();
  const { emotions, trades } = useData();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={t("journal.new")}
        description={t("journal.subtitle")}
        actions={
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>
        }
      />
      <Card>
        <CardContent className="p-4 sm:p-5">
          <JournalForm
            emotions={emotions}
            trades={trades}
            defaultTradeId={defaultTradeId}
            onDone={() => router.push("/journal")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
