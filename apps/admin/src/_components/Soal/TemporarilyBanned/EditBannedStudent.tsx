"use client";

import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfDay } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { api } from "~/utils/api";

const formSchema = z
  .object({
    studentName: z.string(),
    startedAt: z.date({
      required_error: "Diperlukan kapan waktu ujian dimulai!",
    }),
    endedAt: z.date({
      required_error: "Diperlukan kapan waktu ujian selesai!",
    }),
    reason: z
      .string()
      .min(3, { message: "Minimal alasan memiliki 3 karakter!" }),
  })
  .refine((data) => data.startedAt < data.endedAt, {
    path: ["endedAt"],
    message: "Waktu selesai tidak boleh kurang dari waktu mulai!",
  });

export function EditBannedStudent({
  id,
  reason,
  studentName,
  studentClassName,
  startedAt,
  endedAt,
  isDialogOpen,
  setDialogOpen,
}: {
  id: number;
  reason: string;
  studentName: string;
  studentClassName: string;
  startedAt: Date;
  endedAt: Date;
  isDialogOpen: boolean;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { toast } = useToast();

  const apiUtils = api.useUtils();

  const editBannedStudent = api.grade.editTemporaryBan.useMutation({
    async onSuccess() {
      await apiUtils.question.getStudentTempobans.invalidate();

      toast({
        title: "Pembaharuan Larangan Berhasil!",
        description: `Berhasil mengubah peserta!`,
      });

      setDialogOpen(false);
    },

    onError(error) {
      toast({
        variant: "destructive",
        title: "Operasi Gagal",
        description: `Terjadi kesalahan, Error: ${error.message}`,
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName,
      reason,
      startedAt,
      endedAt,
    },
  });

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={() => {
        if (editBannedStudent.isLoading) return;

        setDialogOpen((prev) => !prev);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Larangan Peserta</DialogTitle>
          <DialogDescription>
            Perbarui durasi dan alasan peserta ini.
          </DialogDescription>
        </DialogHeader>

        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((val) =>
                editBannedStudent.mutate({
                  id,
                  startedAt: val.startedAt,
                  endedAt: val.endedAt,
                  reason: val.reason,
                }),
              )}
              className="space-y-3"
            >
              <div className="flex flex-col gap-5 md:grid md:grid-cols-4">
                <div className="flex flex-col md:w-[150px]">
                  <FormLabel className="mb-2">Kelas</FormLabel>
                  <FormControl>
                    <Input disabled value={studentClassName} />
                  </FormControl>
                </div>

                <FormField
                  control={form.control}
                  name="studentName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel>Nama Peserta</FormLabel>
                      <FormControl>
                        <Input disabled value={field.value} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
                <FormField
                  control={form.control}
                  name="startedAt"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Waktu Mulai</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full"
                          type="datetime-local"
                          min={format(
                            startOfDay(new Date()),
                            "yyyy-MM-dd'T'HH:mm",
                          )}
                          value={
                            field.value
                              ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                              : ""
                          }
                          onChange={(e) =>
                            e.target.value === ""
                              ? field.onChange(undefined)
                              : field.onChange(new Date(e.target.value))
                          }
                          disabled={editBannedStudent.isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Tentukan kapan batas waktu awal peserta dibatasi
                        pengerjaannya.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endedAt"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Waktu Selesai</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          min={
                            form.getValues("startedAt")
                              ? format(
                                  form.getValues("startedAt"),
                                  "yyyy-MM-dd'T'HH:mm",
                                )
                              : ""
                          }
                          value={
                            field.value
                              ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                              : ""
                          }
                          onChange={(e) =>
                            e.target.value === ""
                              ? field.onChange(undefined)
                              : field.onChange(new Date(e.target.value))
                          }
                          disabled={
                            editBannedStudent.isLoading ||
                            !form.getValues("startedAt")
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Tentukan kapan batas waktu akhir peserta dibatasi
                        pengerjaannya.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alasan</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="off"
                        placeholder="Masukan alasan logis"
                        disabled={editBannedStudent.isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Masukan alasan yang akan diterima oleh peserta tersebut.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={editBannedStudent.isLoading}>
                Edit
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
