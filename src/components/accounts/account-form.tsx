"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { Segmented } from "@/components/ui/segmented";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACCOUNT_COLORS, BROKERS, CURRENCIES } from "@/lib/constants";
import { createAccount, updateAccount } from "@/app/actions/accounts";
import { cn } from "@/lib/utils";
import type { Account } from "@/lib/types";

const schema = z.object({
  name: z.string().min(1, "Nama akun wajib diisi"),
  broker: z.string(),
  account_type: z.enum(["prop_firm", "broker", "personal", "demo"]),
  currency: z.enum(["USD", "USC", "IDR", "EUR", "GBP"]),
  initial_balance: z.string(),
  status: z.enum(["active", "breached", "passed", "archived"]),
  profit_target: z.string(),
  max_drawdown: z.string(),
  color: z.string(),
  notes: z.string(),
});

type FormValues = z.infer<typeof schema>;

export function AccountForm({
  account,
  onDone,
}: {
  account?: Account;
  onDone?: () => void;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const isEdit = Boolean(account);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: account?.name ?? "",
      broker: account?.broker ?? "",
      account_type: account?.account_type ?? "prop_firm",
      currency: account?.currency ?? "USD",
      initial_balance: account?.initial_balance?.toString() ?? "",
      status: account?.status ?? "active",
      profit_target: account?.profit_target?.toString() ?? "",
      max_drawdown: account?.max_drawdown?.toString() ?? "",
      color: account?.color ?? ACCOUNT_COLORS[0],
      notes: account?.notes ?? "",
    },
  });

  const { control, register, handleSubmit, watch, setValue, formState } = form;
  const color = watch("color");

  async function onSubmit(data: FormValues) {
    setSubmitting(true);
    try {
      const payload = {
        id: account?.id,
        name: data.name,
        broker: data.broker || null,
        account_type: data.account_type,
        currency: data.currency,
        initial_balance: data.initial_balance ? Number(data.initial_balance.replace(",", ".")) : 0,
        status: data.status,
        profit_target: data.profit_target ? Number(data.profit_target.replace(",", ".")) : null,
        max_drawdown: data.max_drawdown ? Number(data.max_drawdown.replace(",", ".")) : null,
        color: data.color,
        notes: data.notes || null,
      };

      const result = isEdit ? await updateAccount(payload) : await createAccount(payload);

      if (!result.ok) {
        toast.error(t("common.error"), { description: result.error });
        return;
      }

      toast.success(isEdit ? t("accounts.saved") : t("accounts.saved"));
      router.refresh();
      onDone?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="name">{t("accounts.name")} *</Label>
          <Input id="name" placeholder={t("accounts.namePlaceholder")} {...register("name")} autoFocus />
          {formState.errors.name && (
            <p className="text-[11px] text-loss">{formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="broker">{t("accounts.broker")}</Label>
          <Controller
            control={control}
            name="broker"
            render={({ field }) => (
              <Combobox
                id="broker"
                value={field.value}
                onChange={field.onChange}
                options={BROKERS}
                placeholder={t("accounts.brokerPlaceholder")}
                className="font-sans normal-case"
              />
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>{t("accounts.type")}</Label>
          <Controller
            control={control}
            name="account_type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prop_firm">{t("accounts.propFirm")}</SelectItem>
                  <SelectItem value="broker">{t("accounts.brokerType")}</SelectItem>
                  <SelectItem value="personal">{t("accounts.personal")}</SelectItem>
                  <SelectItem value="demo">{t("accounts.demo")}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="initial_balance">{t("accounts.initialBalance")}</Label>
          <div className="flex gap-2">
            <Input
              id="initial_balance"
              inputMode="decimal"
              placeholder="100000"
              {...register("initial_balance")}
              className="tabular font-mono"
            />
            <Controller
              control={control}
              name="currency"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{t("accounts.status")}</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Segmented
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "active", label: t("accounts.active") },
                  { value: "passed", label: t("accounts.passed") },
                  { value: "breached", label: t("accounts.breached") },
                ]}
              />
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profit_target">{t("accounts.profitTarget")}</Label>
          <Input
            id="profit_target"
            inputMode="decimal"
            placeholder="10000"
            {...register("profit_target")}
            className="tabular font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="max_drawdown">{t("accounts.maxDrawdown")}</Label>
          <Input
            id="max_drawdown"
            inputMode="decimal"
            placeholder="10000"
            {...register("max_drawdown")}
            className="tabular font-mono"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>{t("accounts.color") ?? "Warna"}</Label>
          <div className="flex flex-wrap gap-2">
            {ACCOUNT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setValue("color", c)}
                className={cn(
                  "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                  color === c ? "border-foreground" : "border-transparent",
                )}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="notes">{t("accounts.notes")}</Label>
          <Textarea id="notes" rows={2} {...register("notes")} />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-border/60 pt-3">
        {onDone && (
          <Button type="button" variant="outline" onClick={onDone}>
            {t("common.cancel")}
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? t("common.saving") : t("common.save")}
        </Button>
      </div>
    </form>
  );
}
