"use client";

import { Button } from "@enpitsu/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@enpitsu/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@enpitsu/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@enpitsu/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { api } from "~/trpc/react";

const FormSchema = z.object({
  role: z.enum(["user", "admin"], {
    required_error: "Dimohon untuk memilih tingkatan pengguna",
  }),
});

export const UpdateRole = ({
  isOpen,
  currRole,
  userId,
  toggleOpen,
}: {
  isOpen: boolean;
  currRole: "user" | "admin";
  userId: string;
  toggleOpen: () => void;
}) => {
  const utils = api.useUtils();
  const updateRoleMutation = api.admin.updateUserRole.useMutation({
    onSuccess() {
      toast.success("Berhasil memperbarui pengguna!", {
        description: "Status pengguna berhasil diperbarui.",
      });
      toggleOpen();
    },
    onError(error) {
      toast.error("Operasi Gagal", {
        description: `Terjadi kesalahan, Error: ${error.message}`,
      });
    },
    async onSettled() {
      await utils.admin.getAllRegisteredUser.invalidate();
    },
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      role: currRole,
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) =>
    updateRoleMutation.mutate({ id: userId, ...data });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        if (!updateRoleMutation.isPending) toggleOpen();
      }}
    >
      <DialogContent>
        <DialogHeader className="flex flex-col gap-2">
          <DialogTitle>Perbarui tingkatan pengguna</DialogTitle>
          <DialogDescription>
            Anda akan memperbarui tingkatan pengguna ini. Mohon pikirkan kembali
            dan cek apakah dia adalah orang yang benar dan pantas di ubah
            tingkatannya supaya tidak menimbulkan keributan.
          </DialogDescription>
          <DialogDescription className="text-start">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6"
              >
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tingkatan Pengguna</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tingkatan pengguna" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">Pengguna Biasa</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              disabled={updateRoleMutation.isPending}
            >
              Batal
            </Button>
          </DialogClose>
          <Button
            disabled={
              updateRoleMutation.isPending ||
              currRole === form.getValues("role")
            }
            onClick={form.handleSubmit(onSubmit)}
          >
            {updateRoleMutation.isPending ? (
              <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
            ) : null}
            Perbarui
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
