"use client";

import type { RouterOutputs } from "@enpitsu/api";
import type { ColumnDef } from "@tanstack/react-table";
import { createContext, useCallback, useContext, useState } from "react";
import { Space_Mono } from "next/font/google";
import Link from "next/link";
import { Badge, badgeVariants } from "@enpitsu/ui/badge";
import { Button } from "@enpitsu/ui/button";
import { Checkbox } from "@enpitsu/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@enpitsu/ui/dropdown-menu";
import { Input } from "@enpitsu/ui/input";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { MoreHorizontal, Trash2 } from "lucide-react";

import { ReusableDataTable } from "~/_components/data-table";
import { api } from "~/trpc/react";
import {
  DeleteManyCheatedStudent,
  DeleteSingleCheatedStudent,
} from "./DeleteCheatedStudent";
import { SpecificExcelBlockedDownload } from "./ExcelCheatedDownload";

type BlocklistByQuestion =
  RouterOutputs["question"]["getStudentBlocklistByQuestion"][number];

const MonoFont = Space_Mono({
  weight: "400",
  subsets: ["latin"],
});

const RoleContext = createContext("");

export const columns: ColumnDef<BlocklistByQuestion>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        disabled
        aria-label="Pilih semua"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select baris ini"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "studentName",
    accessorKey: "student.name",
    header: "Nama Peserta",
    cell: ({ row }) => <div>{row.original.student.name}</div>,
  },
  {
    accessorKey: "room",
    header: "Ruangan Peserta",
    cell: ({ row }) => (
      <pre className={MonoFont.className}>{row.original.student.room}</pre>
    ),
  },
  {
    accessorKey: "StudentClass",
    header: "Kelas Asal",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const currentUserRole = useContext(RoleContext);

      return (
        <>
          {currentUserRole === "admin" ? (
            <Link
              className={badgeVariants({ variant: "secondary" })}
              href={`/admin/angkatan/${row.original.student.subgrade.grade.id}/kelola/${row.original.student.subgrade.id}`}
            >
              {row.original.student.subgrade.grade.label}{" "}
              {row.original.student.subgrade.label}
            </Link>
          ) : (
            <Badge variant="secondary">
              {row.original.student.subgrade.grade.label}{" "}
              {row.original.student.subgrade.label}
            </Badge>
          )}
        </>
      );
    },
  },
  {
    accessorKey: "time",
    header: "Waktu Melakukan Kecurangan",
    cell: ({ row }) => (
      <pre className={MonoFont.className}>
        {format(row.getValue("time"), "dd MMMM yyyy, kk.mm", {
          locale: id,
        })}
      </pre>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const cheat = row.original;

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [openDelete, setOpenDelete] = useState(false);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const closeDialog = useCallback(() => setOpenDelete((prev) => !prev), []);

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer text-rose-500 hover:text-rose-700 focus:text-rose-700"
                onClick={() => setOpenDelete(true)}
              >
                <Trash2 className="mr-2 h-4 md:w-4" />
                Hapus Status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DeleteSingleCheatedStudent
            closeDialog={closeDialog}
            id={cheat.id}
            openDelete={openDelete}
            name={cheat.student.name}
          />
        </>
      );
    },
  },
];

export function DataTable({
  questionId,
  title,
  currUserRole,
}: {
  questionId: number;
  title: string;
  currUserRole: "admin" | "user";
}) {
  const specificQuestionBlocklistQuery =
    api.question.getStudentBlocklistByQuestion.useQuery({
      questionId,
    });

  return (
    <RoleContext.Provider value={currUserRole}>
      <div className="w-full">
        <p className="mb-2">Soal: {title}</p>

        <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center">
          <SpecificExcelBlockedDownload questionId={questionId} title={title} />
        </div>

        <ReusableDataTable
          columns={columns}
          data={specificQuestionBlocklistQuery.data ?? []}
          queryIsPending={specificQuestionBlocklistQuery.isPending}
          queryIsError={specificQuestionBlocklistQuery.isError}
          queryErrorMessage={specificQuestionBlocklistQuery.error?.message}
          showTableControl
          additionalControl={(table) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const resetSelection = useCallback(
              () => table.resetRowSelection(),
              [table],
            );

            return (
              <>
                <Input
                  placeholder="Filter berdasarkan nama peserta..."
                  value={
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    (table
                      .getColumn("studentName")
                      ?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) =>
                    table
                      .getColumn("studentName")
                      ?.setFilterValue(event.target.value)
                  }
                  className="w-full md:max-w-md"
                />

                {table.getFilteredSelectedRowModel().rows.length > 0 ? (
                  <div className="flex flex-col gap-2 pb-4 md:flex-row md:items-center">
                    <DeleteManyCheatedStudent
                      data={table
                        .getFilteredSelectedRowModel()
                        .rows.map((d) => d.original)}
                      questionTitle={title}
                      resetSelection={resetSelection}
                    />
                    <Button variant="outline" onClick={resetSelection}>
                      Batalkan semua pilihan
                    </Button>
                  </div>
                ) : null}
              </>
            );
          }}
        />
      </div>
    </RoleContext.Provider>
  );
}
