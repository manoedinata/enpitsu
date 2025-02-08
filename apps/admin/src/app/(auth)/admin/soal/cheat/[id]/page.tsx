import { redirect } from "next/navigation";
import { auth } from "@enpitsu/auth";
import { eq } from "@enpitsu/db";
import { db } from "@enpitsu/db/client";
import * as schema from "@enpitsu/db/schema";

import { DataTable } from "~/_components/Soal/CheatedList/DataTable";

export default async function CheatedListPage({
  params,
}: {
  params: { id: string };
}) {
  const id = parseInt(params.id);

  if (isNaN(id)) return redirect("/admin/soal");

  const question = await db.query.questions.findFirst({
    where: eq(schema.questions.id, id),
    columns: {
      id: true,
      title: true,
    },
  });

  if (!question) return redirect("/admin/soal");

  const session = await auth();

  return (
    <div className="mt-5 flex flex-col gap-7 px-5 py-5 md:items-center">
      <div className="w-full md:w-[85%]">
        <div className="mb-5 space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">
            Daftar Kecurangan Peserta
          </h2>
          <p className="w-full text-muted-foreground md:w-[85%] lg:w-[75%]">
            Lihat siapa saja yang melakukan kecurangan dan menghapus status
            kecurangan pada halaman ini.
          </p>
        </div>

        <DataTable
          questionId={question.id}
          title={question.title}
          currUserRole={session!.user.role}
        />
      </div>
    </div>
  );
}
